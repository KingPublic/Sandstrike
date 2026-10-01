import type Phaser from "phaser";

import { createGame } from "../game/createGame";

export class AppShell {
  private root: HTMLElement | undefined;
  private host: HTMLElement | undefined;
  private status: HTMLElement | undefined;
  private startButton: HTMLButtonElement | undefined;
  private game: Phaser.Game | undefined;

  private readonly handleStart = (): void => {
    this.startPreview();
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
              This first scene verifies the renderer, scaling, lifecycle, and
              static-host pipeline before movement enters the arena.
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
    this.startButton.addEventListener("click", this.handleStart);
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
    this.destroyGame();
    this.root?.replaceChildren();
    this.root = undefined;
    this.host = undefined;
    this.status = undefined;
    this.startButton = undefined;
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

    try {
      this.game = createGame(this.host, {
        onReady: () => {
          this.handleReady();
        },
        onFatalError: () => {
          this.handleFatalError();
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
    canvas.focus();
  }

  private destroyGame(): void {
    const game = this.game;
    this.game = undefined;
    game?.destroy(true);
    this.host?.replaceChildren();
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
