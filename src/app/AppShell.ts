import type Phaser from "phaser";
import { RampageHud } from "../game/ui/hud/RampageHud";
import { HuntHud } from "../game/ui/hud/HuntHud";
import type { HudPort } from "../game/ui/hud/HudPort";
import { SettingsPanel } from "../game/ui/hud/SettingsPanel";
import { defaultPresentationSettings, type PresentationSettings } from "../game/rendering/FeedbackController";
import { PhaserAudioAdapter } from "../game/infrastructure/phaser/PhaserAudioAdapter";
import { SessionController } from "../game/application/SessionController";
import { NavigationCoordinator } from "./NavigationCoordinator";
import { MenuView } from "../game/ui/MenuView";
import { ResultsView } from "../game/ui/ResultsView";
import { installE2EDebugBridge, type NextRunConfiguration } from "../game/debug/E2EDebugBridge";
import type { RunResult } from "../game/domain/modes/RunResult";
import { SaveCoordinator } from "../game/application/SaveCoordinator";
import { LocalStorageSaveRepository } from "../game/infrastructure/storage/LocalStorageSaveRepository";

import {
  createGame,
  type GameplayControlPort,
} from "../game/createGame";
import { TouchControls } from "../game/ui/TouchControls";
import {
  computeViewportLayout,
  type SafeAreaInsets,
} from "../game/ui/ViewportLayout";
import {
  PauseCoordinator,
  type PauseReason,
} from "./PauseCoordinator";

export class AppShell {
  private root: HTMLElement | undefined;
  private host: HTMLElement | undefined;
  private status: HTMLElement | undefined;
  private startButton: HTMLButtonElement | undefined;
  private gameFrame: HTMLElement | undefined;
  private pauseOverlay: HTMLElement | undefined;
  private pauseTitle: HTMLElement | undefined;
  private pauseMessage: HTMLElement | undefined;
  private resumeButton: HTMLButtonElement | undefined;
  private controls: GameplayControlPort | undefined;
  private touchControls: TouchControls | undefined;
  private game: Phaser.Game | undefined;
  private hud: HudPort | undefined;
  private selectedMode: "rampage" | "hunt" = "rampage";
  private settingsPanel: SettingsPanel | undefined;
  private settings: PresentationSettings = defaultPresentationSettings;
  private readonly audio = new PhaserAudioAdapter();
  private readonly controller = new SessionController();
  private navigation = new NavigationCoordinator();
  private menu: MenuView | undefined;
  private results: ResultsView | undefined;
  private nextConfiguration: NextRunConfiguration | undefined;
  private lastConfiguration: NextRunConfiguration = { seed: 0x5a17d };
  private removeTestBridge: (() => void) | undefined;
  private onboardingShown = false;
  private readonly saves = new SaveCoordinator(new LocalStorageSaveRepository(), __SANDSTRIKE_E2E__ ? "e2e" : import.meta.env.DEV ? "development" : "production");
  private readonly pause = new PauseCoordinator((paused, reasons) => {
    this.applyPauseState(paused, reasons);
  });

  private readonly handleResume = (): void => {
    this.resumeWhenSafe();
  };

  private readonly handleVisibility = (): void => {
    if (!this.controller.active) return;
    if (document.visibilityState !== "visible") {
      this.pause.add("visibility");
    }
    this.refreshPauseOverlay();
  };

  private readonly handleWindowBlur = (): void => {
    if (!this.controller.active) return;
    this.pause.add("focus");
  };

  private readonly handleWindowFocus = (): void => {
    this.refreshPauseOverlay();
  };

  private readonly handleResize = (): void => {
    this.refreshLayout();
  };
  private readonly handleBack = (): void => {
    if (this.controller.active) { this.pause.add("user"); history.pushState({ sandstrike: true }, "", location.href); }
  };

  mount(root: HTMLElement): void {
    this.destroy();
    const loaded = this.saves.load(); this.settings = loaded.data.settings; this.onboardingShown = loaded.data.onboarding.rampageSeen;
    this.root = root;
    root.innerHTML = `
      <main class="sandstrike-shell">
        <div class="atmosphere" aria-hidden="true">
          <span class="atmosphere__sun"></span>
          <span class="atmosphere__dust atmosphere__dust--one"></span>
          <span class="atmosphere__dust atmosphere__dust--two"></span>
        </div>
        <header class="hero">
          <p class="hero__eyebrow">Two sides. One desert.</p>
          <h1>Sandstrike</h1>
          <p class="hero__lede">
            Shape momentum below the dunes, break the surface, and own the arc.
          </p>
        </header>
        <section class="preview" aria-labelledby="preview-title">
          <div class="preview__copy" data-menu-view></div>
          <div class="game-frame">
            <div class="game-surface" data-game-host></div>
            <div class="game-frame__edge" aria-hidden="true"></div>
            <div class="safe-area-probe" aria-hidden="true"></div>
            <div
              class="pause-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pause-title"
              aria-describedby="pause-message"
              hidden
            >
              <div class="pause-card">
                <p class="preview__kicker">Simulation secured</p>
                <h2 id="pause-title">Paused</h2>
                <p id="pause-message">Resume when you are ready.</p>
                <button class="resume-action" type="button">Resume run</button>
                <button class="pause-restart" type="button">Restart run</button>
                <button class="pause-end" type="button">End run</button>
                <div class="confirm-actions" hidden><p data-confirm-message></p><button type="button" data-confirm>Confirm end run</button><button type="button" data-cancel>Cancel</button></div>
              </div>
            </div>
          </div>
        </section>
        <div class="boot-status" role="status" aria-live="polite">Ready for Rampage.</div>
        <p class="save-notice" data-save-notice aria-live="polite" hidden></p>
        <footer class="shell-footer">
          <span>Original browser-first action</span>
          <span>Keyboard / touch / gamepad</span>
        </footer>
      </main>
    `;

    this.host = this.requireElement("[data-game-host]");
    this.status = this.requireElement(".boot-status");
    this.menu = new MenuView(this.requireElement("[data-menu-view]"), (action) => { this.handleMenuAction(action); });
    this.navigation = new NavigationCoordinator(); this.renderMenu();
    this.gameFrame = this.requireElement(".game-frame");
    this.pauseOverlay = this.requireElement(".pause-overlay");
    this.pauseTitle = this.requireElement("#pause-title");
    this.pauseMessage = this.requireElement("#pause-message");
    this.resumeButton = this.requireButton(".resume-action");
    this.resumeButton.addEventListener("click", this.handleResume);
    this.requireElement(".pause-restart").addEventListener("click", () => { this.requestConfirmation("restart"); });
    this.requireElement(".pause-end").addEventListener("click", () => { this.requestConfirmation("quit"); });
    this.requireElement("[data-cancel]").addEventListener("click", () => { this.navigation.cancel(); this.requireElement(".confirm-actions").hidden = true; this.resumeButton?.focus(); });
    this.requireElement("[data-confirm]").addEventListener("click", () => { const state = this.navigation.confirm(); this.requireElement(".confirm-actions").hidden = true; if (state === "run") this.retryRun(); else { const result = this.controller.requestEnd().result; if (result) this.showResults(result); } });
    this.pauseOverlay.addEventListener("keydown", (event) => { if (event.key !== "Tab") return; const items = [...(this.pauseOverlay?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])].filter((button) => button.getClientRects().length > 0); const first = items[0]; const last = items.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } });
    this.settingsPanel = new SettingsPanel(this.requireElement(".sandstrike-shell"), (settings) => { this.settings = settings; this.saves.updateSettings(settings); this.refreshSaveNotice(); this.root?.classList.toggle("high-contrast", settings.highContrast); this.root?.classList.toggle("reduced-motion", settings.reducedMotion); this.refreshLayout(); }, () => { if (this.navigation.state === "settings") { this.navigation.close(); this.renderMenu(); } if (this.controller.active) this.resumeButton?.focus(); }, this.settings, () => { this.saves.resetConfirmed(true); this.onboardingShown = false; this.refreshSaveNotice(); return this.saves.snapshot().settings; });
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("focus", this.handleWindowFocus);
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleResize);
    window.addEventListener("popstate", this.handleBack);
    this.root.classList.toggle("high-contrast", this.settings.highContrast); this.root.classList.toggle("reduced-motion", this.settings.reducedMotion); this.refreshSaveNotice();
    if (__SANDSTRIKE_E2E__) this.removeTestBridge = installE2EDebugBridge({ snapshot: () => this.controller.snapshot(), presentation: () => { const metrics = this.controls?.metrics(); return Object.freeze({ actorIds: this.controls?.actorIds() ?? Object.freeze([]), ...(metrics ? { metrics } : {}) }); }, configureNextRun: (configuration) => { if (this.controller.active) throw new Error("Configure the next run before starting."); this.nextConfiguration = Object.freeze({ ...configuration }); }, enqueueActions: (frames) => { this.controls?.enqueueActions(frames); } });
  }

  showError(message: string, retry: () => void): void {
    if (!this.status) {
      return;
    }

    this.status.setAttribute("role", "alert");
    this.status.classList.add("boot-status--error");

    const copy = document.createElement("p");
    copy.textContent = message;
    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "retry-action";
    retryButton.textContent = "Retry preview";
    retryButton.addEventListener(
      "click",
      () => {
        this.status?.setAttribute("role", "status");
        this.status?.classList.remove("boot-status--error");
        retry();
      },
      { once: true },
    );

    this.status.replaceChildren(copy, retryButton);
    retryButton.focus();
  }

  destroy(): void {
    this.removeTestBridge?.(); this.removeTestBridge = undefined;
    this.settingsPanel?.destroy(); this.settingsPanel = undefined;
    this.results?.destroy(); this.results = undefined;
    this.audio.destroy();
    this.resumeButton?.removeEventListener("click", this.handleResume);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("blur", this.handleWindowBlur);
    window.removeEventListener("focus", this.handleWindowFocus);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("orientationchange", this.handleResize);
    window.removeEventListener("popstate", this.handleBack);
    this.destroyGame();
    this.controller.destroy();
    this.root?.classList.remove("sandstrike-playing");
    this.root?.replaceChildren();
    this.root = undefined;
    this.host = undefined;
    this.status = undefined;
    this.startButton = undefined;
    this.gameFrame = undefined;
    this.pauseOverlay = undefined;
    this.pauseTitle = undefined;
    this.pauseMessage = undefined;
    this.resumeButton = undefined;
  }

  private startPreview(): void {
    if (!this.host || !this.status) {
      return;
    }

    if (this.game) {
      this.focusCanvas();
      return;
    }

    this.status.setAttribute("role", "status");
    this.status.classList.remove("boot-status--error");
    this.status.textContent = "Preparing the arena...";
    if (this.startButton) this.startButton.disabled = true;
    this.audio.unlock();
    const configuration = this.nextConfiguration ?? { ...this.lastConfiguration, mode: this.selectedMode, aimAssist: this.settings.aimAssist, debugAI: this.root?.querySelector<HTMLInputElement>("[data-ai-debug]")?.checked ?? this.lastConfiguration.debugAI ?? false, seed: this.lastConfiguration.seed + 7919 };
    this.selectedMode = configuration.mode ?? "rampage";
    this.nextConfiguration = undefined; this.lastConfiguration = configuration;
    this.controller.start(configuration);
    if (this.navigation.state !== "run") this.navigation.go("run");
    history.pushState({ sandstrike: true }, "", location.href);
    if (this.gameFrame) {
      const Hud = this.selectedMode === "hunt" ? HuntHud : RampageHud;
      this.hud = new Hud(this.gameFrame, () => { this.pause.add("user"); }, () => { this.pause.add("user"); this.settingsPanel?.open(); });
    }

    try {
      this.game = createGame(this.host, {
        controller: this.controller,
        onResult: (result) => { this.showResults(result); },
        onSnapshot: (snapshot) => this.hud?.update(snapshot, this.settings.reducedMotion),
        settings: () => this.settings,
        audio: this.audio,
        onReady: () => {
          this.handleReady();
        },
        onFatalError: () => {
          this.handleFatalError();
        },
        onControlsReady: (controls) => {
          this.handleControlsReady(controls);
        },
        onPauseRequested: () => {
          this.pause.add("user");
        },
      });
    } catch {
      this.handleFatalError();
    }
  }

  private handleReady(): void {
    if (!this.status || !this.game) {
      return;
    }

    this.status.textContent = this.selectedMode === "hunt" ? "Hunt ready." : "Rampage ready.";
    if (this.startButton) this.startButton.disabled = false;
    this.root?.classList.add("sandstrike-playing");
    this.game.scale.getParentBounds();
    this.game.scale.refresh();
    this.refreshLayout();
    this.focusCanvas();
    if (!this.onboardingShown && this.gameFrame) { this.onboardingShown = true; const prompt = document.createElement("p"); prompt.className = "context-prompt"; prompt.textContent = this.selectedMode === "hunt" ? "Read tremors · Q Snare · Click Fire · Shift Dodge" : "Steer upward to breach · Space to Bite · Shift to Burst"; this.gameFrame.append(prompt); window.setTimeout(() => { prompt.remove(); }, 7000); }
  }

  private handleFatalError(): void {
    this.destroyGame();
    this.controller.destroy();
    this.showError("Rampage could not start. Your menu is still safe.", () => {
      this.startPreview();
    });
  }

  private focusCanvas(): void {
    const canvas = this.game?.canvas;
    if (!canvas) {
      return;
    }

    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", `Sandstrike ${this.selectedMode === "hunt" ? "Hunt" : "Rampage"} playfield`);
    canvas.focus({ preventScroll: true });
  }

  private destroyGame(): void {
    this.hud?.destroy(); this.hud = undefined;
    this.results?.destroy(); this.results = undefined;
    this.touchControls?.destroy();
    this.touchControls = undefined;
    this.controls?.clear();
    this.controls = undefined;
    this.pause.clear();
    this.root?.classList.remove("sandstrike-playing");
    const game = this.game;
    this.game = undefined;
    game?.destroy(true);
    this.host?.replaceChildren();
  }

  private handleControlsReady(controls: GameplayControlPort): void {
    if (!this.gameFrame) {
      return;
    }
    this.touchControls?.destroy();
    this.controls = controls;
    this.touchControls = new TouchControls(
      this.gameFrame,
      controls.touchInput,
      this.selectedMode === "hunt" ? "hunter" : "worm",
    );
    this.refreshLayout();
  }

  private refreshLayout(): void {
    if (!this.gameFrame || !this.touchControls) {
      return;
    }
    const bounds = this.gameFrame.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }
    const orientation =
      window.innerWidth >= window.innerHeight ? "landscape" : "portrait";
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const touchCapable = navigator.maxTouchPoints > 0 || coarsePointer;
    const layout = computeViewportLayout({
      cssWidth: bounds.width,
      cssHeight: bounds.height,
      devicePixelRatio: window.devicePixelRatio,
      safeArea: this.readSafeArea(),
      orientation,
      coarsePointer,
      touchCapable,
      role: this.selectedMode === "hunt" ? "hunter" : "worm",
      leftHanded: this.settings.leftHanded,
    });
    this.touchControls.applyLayout(layout);
    this.gameFrame.style.setProperty("--touch-opacity", String(this.settings.touchOpacity));

    if (layout.portraitBlocked && this.game) {
      this.pause.add("orientation");
    }
    this.refreshPauseOverlay();
  }

  private applyPauseState(
    paused: boolean,
    reasons: readonly PauseReason[],
  ): void {
    if (!this.controller.active) { if (this.pauseOverlay) this.pauseOverlay.hidden = true; return; }
    this.gameFrame?.setAttribute("data-pause-reasons", reasons.join(" "));
    this.gameFrame?.classList.toggle("game-frame--paused", paused);
    this.controls?.clear();
    this.controls?.resetTiming();
    this.touchControls?.clearPointers();

    if (paused) {
      this.controller.pause();
      if (this.navigation.state === "run") this.navigation.go("pause");
      if (this.game?.scene.isActive("Gameplay")) {
        this.game.scene.pause("Gameplay");
      }
      this.refreshPauseOverlay();
      this.resumeButton?.focus({ preventScroll: true });
      return;
    }

    if (this.game?.scene.isPaused("Gameplay")) {
      this.game.scene.resume("Gameplay");
    }
    this.controller.resume();
    if (this.navigation.state === "pause") this.navigation.go("run");
    if (this.pauseOverlay) {
      this.pauseOverlay.hidden = true;
    }
    queueMicrotask(() => {
      this.focusCanvas();
    });
  }

  private refreshPauseOverlay(): void {
    if (!this.controller.active) { if (this.pauseOverlay) this.pauseOverlay.hidden = true; return; }
    if (
      !this.pause.paused ||
      !this.pauseOverlay ||
      !this.pauseTitle ||
      !this.pauseMessage ||
      !this.resumeButton
    ) {
      return;
    }

    const portrait = window.innerHeight > window.innerWidth;
    const hidden = document.visibilityState !== "visible";
    this.pauseOverlay.hidden = false;
    this.resumeButton.disabled = portrait || hidden;

    if (portrait) {
      this.pauseTitle.textContent = "Rotate to landscape";
      this.pauseMessage.textContent =
        "Sandstrike pauses in portrait so the playfield and controls stay readable.";
    } else if (hidden || this.pause.has("visibility")) {
      this.pauseTitle.textContent = "Session protected";
      this.pauseMessage.textContent =
        "The simulation stopped while the page was hidden. Resume deliberately when ready.";
    } else if (this.pause.has("focus")) {
      this.pauseTitle.textContent = "Focus interrupted";
      this.pauseMessage.textContent =
        "Input was cleared to prevent a stuck direction or Burst.";
    } else {
      this.pauseTitle.textContent = "Run paused";
      this.pauseMessage.textContent =
        "The worm is frozen and all held actions have been cleared.";
    }
  }

  private resumeWhenSafe(): void {
    if (
      document.visibilityState !== "visible" ||
      window.innerHeight > window.innerWidth
    ) {
      this.refreshPauseOverlay();
      return;
    }
    this.pause.clear();
    this.audio.unlock();
    this.refreshLayout();
  }

  private renderMenu(): void { this.menu?.render(this.navigation.state, this.selectedMode); }
  private handleMenuAction(action: string): void {
    switch (action) {
      case "enter": this.navigation.go("menu"); break;
      case "play": this.navigation.go("selection"); break;
      case "choose": this.selectedMode = "rampage"; this.navigation.go("preview"); break;
      case "choose-hunt": this.selectedMode = "hunt"; this.onboardingShown = this.saves.snapshot().onboarding.huntSeen; this.navigation.go("preview"); break;
      case "selection": this.navigation.go("selection"); break;
      case "menu": this.navigation.go("menu"); break;
      case "help": this.navigation.open("how-to-play"); break;
      case "credits": this.navigation.open("credits"); break;
      case "close": this.navigation.close(); break;
      case "settings": this.navigation.open("settings"); this.settingsPanel?.open(); return;
      case "start": this.startButton = this.root?.querySelector<HTMLButtonElement>('[data-menu-action="start"]') ?? undefined; this.startPreview(); return;
      default: return;
    }
    this.renderMenu();
  }
  private requestConfirmation(action: "quit" | "restart"): void {
    this.navigation.request(action); this.requireElement(".confirm-actions").hidden = false;
    this.requireElement("[data-confirm-message]").textContent = action === "quit" ? "End this run and view Results?" : "Restart and discard this run?";
    const confirm = this.requireButton("[data-confirm]"); confirm.textContent = action === "quit" ? "Confirm end run" : "Confirm restart"; confirm.focus();
  }
  private showResults(result: RunResult): void {
    if (this.results || !this.gameFrame) return;
    if (this.navigation.state !== "results") this.navigation.go("results");
    this.controller.pause(); this.controls?.clear(); this.touchControls?.clearPointers(); this.game?.scene.pause("Gameplay");
    if (this.pauseOverlay) this.pauseOverlay.hidden = true;
    const acceptance = this.saves.acceptRunResult(result); this.refreshSaveNotice();
    const record = result.mode === "hunt" && !result.eligibleForRecords ? "Practice run · AI inspection · no record" : acceptance.newRecord ? "New local record" : `Local best · ${this.saves.snapshot()[result.mode].bestScore.toLocaleString("en-US")}`;
    this.results = new ResultsView(this.gameFrame, result, { retry: () => { this.retryRun(); }, changeMode: () => { this.returnToMenu(true); }, menu: () => { this.returnToMenu(false); } }, record);
  }
  private refreshSaveNotice(): void { const notice = this.root?.querySelector<HTMLElement>("[data-save-notice]"); if (!notice) return; const status = this.saves.status(); notice.hidden = status.diagnostics.length === 0; notice.textContent = status.memoryOnly ? "Saving unavailable. Progress and settings are kept for this session." : status.diagnostics.at(-1) ?? ""; }
  private retryRun(): void { this.destroyGame(); this.startPreview(); }
  private returnToMenu(selection: boolean): void { this.destroyGame(); this.controller.destroy(); this.navigation.go(selection ? "selection" : "menu"); this.renderMenu(); }

  private readSafeArea(): SafeAreaInsets {
    const probe = this.root?.querySelector(".safe-area-probe");
    if (!(probe instanceof HTMLElement)) {
      return Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 });
    }
    const style = getComputedStyle(probe);
    return Object.freeze({
      top: parsePixels(style.paddingTop),
      right: parsePixels(style.paddingRight),
      bottom: parsePixels(style.paddingBottom),
      left: parsePixels(style.paddingLeft),
    });
  }

  private requireElement(selector: string): HTMLElement {
    const element = this.root?.querySelector(selector);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`AppShell element is missing: ${selector}`);
    }
    return element;
  }

  private requireButton(selector: string): HTMLButtonElement {
    const element = this.root?.querySelector(selector);
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error(`AppShell button is missing: ${selector}`);
    }
    return element;
  }
}

function parsePixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
