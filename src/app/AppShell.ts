import type Phaser from "phaser";
import { RampageHud } from "../game/ui/hud/RampageHud";
import { SettingsPanel } from "../game/ui/hud/SettingsPanel";
import { defaultPresentationSettings, type PresentationSettings } from "../game/rendering/FeedbackController";
import { PhaserAudioAdapter } from "../game/infrastructure/phaser/PhaserAudioAdapter";

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
  private hud: RampageHud | undefined;
  private settingsPanel: SettingsPanel | undefined;
  private settings: PresentationSettings = defaultPresentationSettings;
  private readonly audio = new PhaserAudioAdapter();
  private readonly pause = new PauseCoordinator((paused, reasons) => {
    this.applyPauseState(paused, reasons);
  });

  private readonly handleStart = (): void => {
    this.startPreview();
  };

  private readonly handleResume = (): void => {
    this.resumeWhenSafe();
  };

  private readonly handleVisibility = (): void => {
    if (document.visibilityState !== "visible") {
      this.pause.add("visibility");
    }
    this.refreshPauseOverlay();
  };

  private readonly handleWindowBlur = (): void => {
    this.pause.add("focus");
  };

  private readonly handleWindowFocus = (): void => {
    this.refreshPauseOverlay();
  };

  private readonly handleResize = (): void => {
    this.refreshLayout();
  };

  mount(root: HTMLElement): void {
    this.destroy();
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
          <div class="preview__copy">
            <p class="preview__kicker">Phase B systems check</p>
            <h2 id="preview-title">Worm movement laboratory</h2>
            <p>
              Shape underground momentum, breach the surface, and test the same
              action layer with keyboard, touch, or gamepad.
            </p>
            <button class="primary-action" type="button">
              Start vertical slice
            </button>
            <div class="boot-status" role="status" aria-live="polite">
              Ready to initialize the movement preview.
            </div>
          </div>
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
                <button class="resume-action" type="button">Resume movement</button>
              </div>
            </div>
          </div>
        </section>
        <footer class="shell-footer">
          <span>Original browser-first action</span>
          <span>Keyboard / touch / gamepad</span>
        </footer>
      </main>
    `;

    this.host = this.requireElement("[data-game-host]");
    this.status = this.requireElement(".boot-status");
    this.startButton = this.requireButton(".primary-action");
    this.gameFrame = this.requireElement(".game-frame");
    this.pauseOverlay = this.requireElement(".pause-overlay");
    this.pauseTitle = this.requireElement("#pause-title");
    this.pauseMessage = this.requireElement("#pause-message");
    this.resumeButton = this.requireButton(".resume-action");
    this.startButton.addEventListener("click", this.handleStart);
    this.resumeButton.addEventListener("click", this.handleResume);
    document.addEventListener("visibilitychange", this.handleVisibility);
    window.addEventListener("blur", this.handleWindowBlur);
    window.addEventListener("focus", this.handleWindowFocus);
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleResize);
    queueMicrotask(() => this.startButton?.focus());
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
    this.startButton?.removeEventListener("click", this.handleStart);
    this.resumeButton?.removeEventListener("click", this.handleResume);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    window.removeEventListener("blur", this.handleWindowBlur);
    window.removeEventListener("focus", this.handleWindowFocus);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("orientationchange", this.handleResize);
    this.destroyGame();
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
    if (!this.host || !this.status || !this.startButton) {
      return;
    }

    if (this.game) {
      this.focusCanvas();
      return;
    }

    this.status.setAttribute("role", "status");
    this.status.classList.remove("boot-status--error");
    this.status.textContent = "Preparing the arena...";
    this.startButton.disabled = true;
    this.audio.unlock();
    if (this.gameFrame) {
      this.hud = new RampageHud(this.gameFrame, () => { this.pause.add("user"); }, () => { this.pause.add("user"); this.settingsPanel?.open(); });
      this.settingsPanel = new SettingsPanel(this.gameFrame, (settings) => { this.settings = settings; this.root?.classList.toggle("high-contrast", settings.highContrast); this.root?.classList.toggle("reduced-motion", settings.reducedMotion); this.refreshLayout(); }, () => { this.resumeButton?.focus(); }, this.settings);
    }

    try {
      this.game = createGame(this.host, {
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
    if (!this.status || !this.startButton || !this.game) {
      return;
    }

    this.status.textContent = "Movement preview ready.";
    this.startButton.disabled = false;
    this.startButton.textContent = "Focus game";
    this.root?.classList.add("sandstrike-playing");
    this.refreshLayout();
    this.focusCanvas();
  }

  private handleFatalError(): void {
    this.destroyGame();
    this.showError("The movement preview could not start. Your menu is still safe.", () => {
      this.startPreview();
    });
  }

  private focusCanvas(): void {
    const canvas = this.game?.canvas;
    if (!canvas) {
      return;
    }

    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", "Sandstrike movement preview");
    canvas.focus({ preventScroll: true });
  }

  private destroyGame(): void {
    this.hud?.destroy(); this.hud = undefined;
    this.settingsPanel?.destroy(); this.settingsPanel = undefined;
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
      role: "worm",
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
    this.gameFrame?.setAttribute("data-pause-reasons", reasons.join(" "));
    this.gameFrame?.classList.toggle("game-frame--paused", paused);
    this.controls?.clear();
    this.controls?.resetTiming();
    this.touchControls?.clearPointers();

    if (paused) {
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
    if (this.pauseOverlay) {
      this.pauseOverlay.hidden = true;
    }
    queueMicrotask(() => {
      this.focusCanvas();
    });
  }

  private refreshPauseOverlay(): void {
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
      this.pauseTitle.textContent = "Movement paused";
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
