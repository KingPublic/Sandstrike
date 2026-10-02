import type { TouchInput } from "../input/TouchInput";
import type { ControlReadiness } from "./ControlReadiness";
import type { ViewportLayoutResult } from "./ViewportLayout";

type TouchAction = "primary" | "boost" | "ability" | "jump";

export class TouchControls {
  private readonly root: HTMLDivElement;
  private readonly joystick: HTMLDivElement;
  private readonly joystickKnob: HTMLSpanElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly boostButton: HTMLButtonElement;
  private readonly abilityButton: HTMLButtonElement;
  private readonly jumpButton: HTMLButtonElement;
  private abilityPointerId: number | undefined;
  private jumpPointerId: number | undefined;
  private joystickPointerId: number | undefined;
  private primaryPointerId: number | undefined;
  private boostPointerId: number | undefined;
  private readonly readiness: Record<TouchAction, number> = { primary: 1, boost: 1, ability: 1, jump: 1 };
  private readonly primaryBinding: "primary" | "ability";

  private readonly handleJoystickDown = (event: PointerEvent): void => {
    if (this.joystickPointerId !== undefined) {
      return;
    }
    event.preventDefault();
    this.joystickPointerId = event.pointerId;
    capturePointer(this.joystick, event.pointerId);
    this.updateJoystick(event);
  };

  private readonly handleJoystickMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.joystickPointerId) {
      return;
    }
    event.preventDefault();
    this.updateJoystick(event);
  };

  private readonly handleJoystickEnd = (event: PointerEvent): void => {
    if (event.pointerId !== this.joystickPointerId) {
      return;
    }
    event.preventDefault();
    this.joystickPointerId = undefined;
    this.input.setMove(0, 0);
    this.joystickKnob.style.translate = "0 0";
  };

  constructor(
    container: HTMLElement,
    private readonly input: TouchInput,
    private readonly role: "worm" | "hunter" = "worm",
    arcade = false,
    ascent = false,
    skillName = "Sandguard",
  ) {
    this.root = document.createElement("div");
    this.root.className = "touch-controls";
    this.root.dataset.touchControls = "true";
    this.root.hidden = true;

    this.joystick = document.createElement("div");
    this.joystick.className = "touch-joystick";
    this.joystick.dataset.touchControl = "joystick";
    this.joystick.setAttribute("role", "group");
    this.joystick.setAttribute("aria-label", "Movement joystick");
    this.joystickKnob = document.createElement("span");
    this.joystickKnob.className = "touch-joystick__knob";
    this.joystick.append(this.joystickKnob);

    this.boostButton = this.createButton("boost", role === "hunter" ? "Dodge" : "Burst");
    this.primaryButton = this.createButton("primary", role === "hunter" ? "Fire / Aim" : arcade ? skillName : "Bite");
    this.abilityButton = this.createButton("ability", ascent ? skillName : "Snare"); this.abilityButton.hidden = role !== "hunter";
    this.jumpButton = this.createButton("jump", "Jump"); this.jumpButton.hidden = role !== "hunter" || !ascent;
    this.root.append(this.joystick, this.boostButton, this.primaryButton, this.abilityButton, this.jumpButton);
    container.append(this.root);

    this.primaryBinding = arcade && role === "worm" ? "ability" : "primary";
    this.boostButton.dataset.gauge = "true";
    this.abilityButton.dataset.gauge = "true";
    if (role === "hunter") this.primaryButton.dataset.gauge = "true";

    this.joystick.addEventListener("pointerdown", this.handleJoystickDown);
    this.joystick.addEventListener("pointermove", this.handleJoystickMove);
    this.joystick.addEventListener("pointerup", this.handleJoystickEnd);
    this.joystick.addEventListener("pointercancel", this.handleJoystickEnd);
    this.joystick.addEventListener("lostpointercapture", this.handleJoystickEnd);
    this.bindButton(this.primaryButton, this.primaryBinding);
    this.bindButton(this.boostButton, "boost");
    this.bindButton(this.abilityButton, "ability");
    this.bindButton(this.jumpButton, "jump");
    this.primaryButton.addEventListener("pointermove", event => { if (this.role === "hunter" && event.pointerId === this.primaryPointerId) this.updateAim(event); });
  }

  applyLayout(layout: ViewportLayoutResult): void {
    this.root.hidden = !layout.touchControlsVisible;
    place(this.joystick, layout.joystick);
    place(this.primaryButton, layout.primaryButton);
    place(this.boostButton, layout.boostButton);
    place(this.abilityButton, layout.abilityButton);
    place(this.jumpButton, layout.jumpButton);
    this.root.style.setProperty("--touch-target", `${String(layout.targetSize)}px`);
    if (!layout.touchControlsVisible) {
      this.clearPointers();
    }
  }

  /** Draws how much of each action's wait is left, so a tap never feels ignored. */
  setReadiness(readiness: ControlReadiness): void {
    this.applyReadiness("boost", readiness.boost);
    this.applyReadiness(this.primaryBinding, readiness[this.primaryBinding]);
    this.applyReadiness("ability", readiness.ability);
  }

  private applyReadiness(action: TouchAction, readiness: number): void {
    const value = Number.isFinite(readiness) ? Math.min(1, Math.max(0, readiness)) : 1;
    const button = this.buttonFor(action);
    if (this.readiness[action] === value) {
      return;
    }
    this.readiness[action] = value;
    button.style.setProperty("--ready", value.toFixed(3));
    button.dataset.ready = value >= 1 ? "true" : "false";
  }

  private buttonFor(action: TouchAction): HTMLButtonElement {
    return action === "primary" ? this.primaryButton : action === "boost" ? this.boostButton : action === "ability" ? this.abilityButton : this.jumpButton;
  }

  clearPointers(): void {
    for (const [element, id] of [[this.joystick, this.joystickPointerId], [this.primaryButton, this.primaryPointerId], [this.boostButton, this.boostPointerId], [this.abilityButton, this.abilityPointerId], [this.jumpButton, this.jumpPointerId]] as const) if (id !== undefined) try { element.releasePointerCapture(id); } catch { /* Already released. */ }
    this.joystickPointerId = undefined;
    this.primaryPointerId = undefined;
    this.boostPointerId = undefined;
    this.abilityPointerId = undefined;
    this.jumpPointerId = undefined;
    this.input.setButton("ability", false); this.input.setAim(0, 0);
    this.input.setMove(0, 0);
    this.input.setButton("primary", false);
    this.input.setButton("boost", false);
    this.input.setButton("jump", false);
    this.joystickKnob.style.translate = "0 0";
    this.primaryButton.classList.remove("touch-action--held");
    this.boostButton.classList.remove("touch-action--held");
    this.abilityButton.classList.remove("touch-action--held");
    this.jumpButton.classList.remove("touch-action--held");
    this.input.clear();
  }

  destroy(): void {
    this.clearPointers();
    this.joystick.removeEventListener("pointerdown", this.handleJoystickDown);
    this.joystick.removeEventListener("pointermove", this.handleJoystickMove);
    this.joystick.removeEventListener("pointerup", this.handleJoystickEnd);
    this.joystick.removeEventListener("pointercancel", this.handleJoystickEnd);
    this.root.remove();
  }

  private createButton(
    action: TouchAction,
    label: string,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `touch-action touch-action--${action}`;
    button.dataset.touchControl = action;
    button.textContent = label;
    button.setAttribute("aria-label", `${label} action`);
    return button;
  }

  private bindButton(
    button: HTMLButtonElement,
    action: TouchAction,
  ): void {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const activePointer = this.pointerFor(action);
      if (activePointer !== undefined) {
        return;
      }
      this.setPointer(action, event.pointerId);
      capturePointer(button, event.pointerId);
      this.input.setButton(action, true);
      if (action === "primary" && this.role === "hunter") this.updateAim(event);
      button.classList.add("touch-action--held");
    });
    const release = (event: PointerEvent): void => {
      if (event.pointerId !== this.pointerFor(action)) {
        return;
      }
      event.preventDefault();
      this.setPointer(action, undefined);
      if (action === "primary" && this.role === "hunter") this.input.setAim(0, 0);
      this.input.setButton(action, false);
      button.classList.remove("touch-action--held");
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }

  private pointerFor(action: TouchAction): number | undefined {
    return action === "primary" ? this.primaryPointerId : action === "boost" ? this.boostPointerId : action === "ability" ? this.abilityPointerId : this.jumpPointerId;
  }

  private setPointer(action: TouchAction, id: number | undefined): void {
    if (action === "primary") this.primaryPointerId = id;
    else if (action === "boost") this.boostPointerId = id;
    else if (action === "ability") this.abilityPointerId = id;
    else this.jumpPointerId = id;
  }

  private updateAim(event: PointerEvent): void { const box = this.primaryButton.getBoundingClientRect(); const x = (event.clientX - box.left - box.width / 2) / (box.width / 2), y = (event.clientY - box.top - box.height / 2) / (box.height / 2); const length = Math.hypot(x, y); this.input.setAim(length < .15 ? 0 : x / length, length < .15 ? -1 : y / length); }

  private updateJoystick(event: PointerEvent): void {
    const bounds = this.joystick.getBoundingClientRect();
    const radius = Math.min(bounds.width, bounds.height) / 2;
    const rawX = event.clientX - (bounds.left + bounds.width / 2);
    const rawY = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > radius && distance > 0 ? radius / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;
    this.input.setMove(x / radius, y / radius);
    this.joystickKnob.style.translate = `${String(x * 0.55)}px ${String(y * 0.55)}px`;
  }
}

function place(
  element: HTMLElement,
  rectangle: Readonly<{ x: number; y: number; width: number; height: number }>,
): void {
  element.style.left = `${String(rectangle.x)}px`;
  element.style.top = `${String(rectangle.y)}px`;
  element.style.width = `${String(rectangle.width)}px`;
  element.style.height = `${String(rectangle.height)}px`;
}

function capturePointer(element: HTMLElement, pointerId: number): void {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Synthetic test events may not register a native active pointer.
  }
}
