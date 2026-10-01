import type { TouchInput } from "../input/TouchInput";
import type { ViewportLayoutResult } from "./ViewportLayout";

export class TouchControls {
  private readonly root: HTMLDivElement;
  private readonly joystick: HTMLDivElement;
  private readonly joystickKnob: HTMLSpanElement;
  private readonly primaryButton: HTMLButtonElement;
  private readonly boostButton: HTMLButtonElement;
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

    this.boostButton = this.createButton("boost", "Burst");
    this.primaryButton = this.createButton("primary", "Bite");
    this.root.append(this.joystick, this.boostButton, this.primaryButton);
    container.append(this.root);

    this.joystick.addEventListener("pointerdown", this.handleJoystickDown);
    this.joystick.addEventListener("pointermove", this.handleJoystickMove);
    this.joystick.addEventListener("pointerup", this.handleJoystickEnd);
    this.joystick.addEventListener("pointercancel", this.handleJoystickEnd);
    this.bindButton(this.primaryButton, "primary");
    this.bindButton(this.boostButton, "boost");
  }

  applyLayout(layout: ViewportLayoutResult): void {
    this.root.hidden = !layout.touchControlsVisible;
    place(this.joystick, layout.joystick);
    place(this.primaryButton, layout.primaryButton);
    place(this.boostButton, layout.boostButton);
    this.root.style.setProperty("--touch-target", `${String(layout.targetSize)}px`);
    if (!layout.touchControlsVisible) {
      this.clearPointers();
    }
  }

  clearPointers(): void {
    this.joystickPointerId = undefined;
    this.primaryPointerId = undefined;
    this.boostPointerId = undefined;
    this.input.setMove(0, 0);
    this.input.setButton("primary", false);
    this.input.setButton("boost", false);
    this.joystickKnob.style.translate = "0 0";
    this.primaryButton.classList.remove("touch-action--held");
    this.boostButton.classList.remove("touch-action--held");
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
    action: "primary" | "boost",
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
    action: "primary" | "boost",
  ): void {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const activePointer =
        action === "primary" ? this.primaryPointerId : this.boostPointerId;
      if (activePointer !== undefined) {
        return;
      }
      if (action === "primary") {
        this.primaryPointerId = event.pointerId;
      } else {
        this.boostPointerId = event.pointerId;
      }
      capturePointer(button, event.pointerId);
      this.input.setButton(action, true);
      button.classList.add("touch-action--held");
    });
    const release = (event: PointerEvent): void => {
      const activePointer =
        action === "primary" ? this.primaryPointerId : this.boostPointerId;
      if (event.pointerId !== activePointer) {
        return;
      }
      event.preventDefault();
      if (action === "primary") {
        this.primaryPointerId = undefined;
      } else {
        this.boostPointerId = undefined;
      }
      this.input.setButton(action, false);
      button.classList.remove("touch-action--held");
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
  }

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
