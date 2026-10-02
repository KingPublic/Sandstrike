import type { Vec2 } from "../domain/math/Vector2";
import { nextInputActivitySequence, type InputSource, type PartialActionFrame } from "./InputSource";

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

/**
 * Mouse aim and fire for the Hunter, plus Boost/Dodge on the right button so the
 * mouse alone can steer, shoot and burst without reaching for Shift.
 */
export class PointerInput implements InputSource {
  readonly id = "pointer";
  private client: Vec2 | undefined;
  private pointerId: number | undefined;
  private primaryHeld = false;
  private boostHeld = false;
  private pendingPrimary = false;
  private pendingBoost = false;
  private lastPrimary = false;
  private lastBoost = false;
  private sequence = 0;
  private readonly move = (event: Event): void => {
    const e = event as PointerEvent;
    if (e.pointerType === "touch" || (this.pointerId !== undefined && e.pointerId !== this.pointerId)) return;
    this.client = { x: e.clientX, y: e.clientY }; this.sequence = nextInputActivitySequence();
  };
  private readonly down = (event: Event): void => {
    const e = event as PointerEvent;
    if (e.pointerType === "touch" || (e.button !== LEFT_BUTTON && e.button !== RIGHT_BUTTON)) return;
    e.preventDefault();
    if (e.button === LEFT_BUTTON) {
      this.move(e);
      if (this.pointerId === undefined) {
        this.pointerId = e.pointerId;
        try { this.canvas.setPointerCapture(e.pointerId); } catch { /* Synthetic pointer. */ }
      }
      this.primaryHeld = true;
      this.pendingPrimary = true;
    } else {
      this.boostHeld = true;
      this.pendingBoost = true;
    }
    this.sequence = nextInputActivitySequence();
  };
  private readonly up = (event: Event): void => {
    const e = event as PointerEvent;
    if (e.button === RIGHT_BUTTON) { this.boostHeld = false; this.sequence = nextInputActivitySequence(); return; }
    if (e.pointerId !== this.pointerId) return;
    this.primaryHeld = false; this.pointerId = undefined;
  };
  private readonly cancel = (): void => { this.clear(); };
  private readonly suppressMenu = (event: Event): void => { event.preventDefault(); };
  constructor(private readonly canvas: HTMLCanvasElement, private readonly project: (clientX: number, clientY: number) => Vec2) {
    canvas.addEventListener("pointermove", this.move); canvas.addEventListener("pointerdown", this.down); canvas.addEventListener("pointerup", this.up); canvas.addEventListener("pointercancel", this.cancel); canvas.addEventListener("lostpointercapture", this.cancel); canvas.addEventListener("contextmenu", this.suppressMenu);
  }
  sample(): PartialActionFrame {
    // A fast click can start and end between two samples, so a press always
    // registers for at least one frame instead of being dropped.
    const primary = this.primaryHeld || this.pendingPrimary;
    const boost = this.boostHeld || this.pendingBoost;
    this.pendingPrimary = false;
    this.pendingBoost = false;
    this.sequence = primary !== this.lastPrimary || boost !== this.lastBoost ? nextInputActivitySequence() : this.sequence;
    this.lastPrimary = primary;
    this.lastBoost = boost;
    const aimWorld = this.client ? this.project(this.client.x, this.client.y) : undefined;
    return Object.freeze({ buttons: Object.freeze({ primary, boost }), analogSequence: this.sequence, ...(aimWorld && Number.isFinite(aimWorld.x + aimWorld.y) ? { aimWorld } : {}) });
  }
  clear(): void { const id = this.pointerId; this.pointerId = undefined; this.client = undefined; this.primaryHeld = false; this.boostHeld = false; this.pendingPrimary = false; this.pendingBoost = false; this.lastPrimary = false; this.lastBoost = false; if (id !== undefined) try { this.canvas.releasePointerCapture(id); } catch { /* Already released. */ } }
  destroy(): void { this.clear(); this.canvas.removeEventListener("pointermove", this.move); this.canvas.removeEventListener("pointerdown", this.down); this.canvas.removeEventListener("pointerup", this.up); this.canvas.removeEventListener("pointercancel", this.cancel); this.canvas.removeEventListener("lostpointercapture", this.cancel); this.canvas.removeEventListener("contextmenu", this.suppressMenu); }
}
