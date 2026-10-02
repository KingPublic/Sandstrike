import type { TouchInput } from "../input/TouchInput";
import type { ViewportLayoutResult } from "./ViewportLayout";

export class TouchControls {
  private readonly root: HTMLDivElement;
  private readonly joystick: HTMLDivElement;
  private readonly joystickKnob: HTMLSpanElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly boostButton: HTMLButtonElement;
  private readonly abilityButton: HTMLButtonElement;
  private abilityPointerId: number | undefined;
  private joystickPointerId: number | undefined;
  private primaryPointerId: number | undefined;
  private boostPointerId: number | undefined;

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
    this.primaryButton = this.createButton("primary", role === "hunter" ? "Fire / Aim" : arcade ? "Sandguard" : "Bite");
    this.abilityButton = this.createButton("ability", "Snare"); this.abilityButton.hidden = role !== "hunter";
    this.root.append(this.joystick, this.boostButton, this.primaryButton, this.abilityButton);
    container.append(this.root);

    this.joystick.addEventListener("pointerdown", this.handleJoystickDown);
    this.joystick.addEventListener("pointermove", this.handleJoystickMove);
    this.joystick.addEventListener("pointerup", this.handleJoystickEnd);
    this.joystick.addEventListener("pointercancel", this.handleJoystickEnd);
    this.joystick.addEventListener("lostpointercapture", this.handleJoystickEnd);
    this.bindButton(this.primaryButton, arcade && role === "worm" ? "ability" : "primary");
    this.bindButton(this.boostButton, "boost");
    this.bindButton(this.abilityButton, "ability");
    this.primaryButton.addEventListener("pointermove", event => { if (this.role === "hunter" && event.pointerId === this.primaryPointerId) this.updateAim(event); });
  }

  applyLayout(layout: ViewportLayoutResult): void {
    this.root.hidden = !layout.touchControlsVisible;
    place(this.joystick, layout.joystick);
    place(this.primaryButton, layout.primaryButton);
    place(this.boostButton, layout.boostButton);
    place(this.abilityButton, layout.abilityButton);
    this.root.style.setProperty("--touch-target", `${String(layout.targetSize)}px`);
    if (!layout.touchControlsVisible) {
      this.clearPointers();
    }
  }

  clearPointers(): void {
    for (const [element, id] of [[this.joystick, this.joystickPointerId], [this.primaryButton, this.primaryPointerId], [this.boostButton, this.boostPointerId], [this.abilityButton, this.abilityPointerId]] as const) if (id !== undefined) try { element.releasePointerCapture(id); } catch { /* Already released. */ }
    this.joystickPointerId = undefined;
    this.primaryPointerId = undefined;
    this.boostPointerId = undefined;
    this.abilityPointerId = undefined; this.input.setButton("ability", false); this.input.setAim(0, 0);
    this.input.setMove(0, 0);
    this.input.setButton("primary", false);
    this.input.setButton("boost", false);
    this.joystickKnob.style.translate = "0 0";
    this.primaryButton.classList.remove("touch-action--held");
    this.boostButton.classList.remove("touch-action--held");
    this.abilityButton.classList.remove("touch-action--held");
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
    action: "primary" | "boost" | "ability",
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
    action: "primary" | "boost" | "ability",
  ): void {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const activePointer =
        action === "primary" ? this.primaryPointerId : action === "boost" ? this.boostPointerId : this.abilityPointerId;
      if (activePointer !== undefined) {
        return;
      }
      if (action === "primary") {
        this.primaryPointerId = event.pointerId;
      } else if (action === "boost") {
        this.boostPointerId = event.pointerId;
      } else this.abilityPointerId = event.pointerId;
      capturePointer(button, event.pointerId);
      this.input.setButton(action, true);
      if (action === "primary" && this.role === "hunter") this.updateAim(event);
      button.classList.add("touch-action--held");
    });
    const release = (event: PointerEvent): void => {
      const activePointer =
        action === "primary" ? this.primaryPointerId : action === "boost" ? this.boostPointerId : this.abilityPointerId;
      if (event.pointerId !== activePointer) {
        return;
      }
      event.preventDefault();
      if (action === "primary") {
        this.primaryPointerId = undefined;
      } else if (action === "boost") {
        this.boostPointerId = undefined;
      } else this.abilityPointerId = undefined;
      if (action === "primary" && this.role === "hunter") this.input.setAim(0, 0);
      this.input.setButton(action, false);
      button.classList.remove("touch-action--held");
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
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
