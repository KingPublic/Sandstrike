import type { Vec2 } from "../domain/math/Vector2";
import { nextInputActivitySequence, type InputSource, type PartialActionFrame } from "./InputSource";
export class PointerInput implements InputSource {
  readonly id = "pointer";
  private client: Vec2 | undefined; private pointerId: number | undefined; private held = false; private sequence = 0;
  private readonly move = (event: Event): void => {
    const e = event as PointerEvent;
    if (e.pointerType === "touch" || this.pointerId !== undefined && e.pointerId !== this.pointerId) return;
    this.client = { x: e.clientX, y: e.clientY }; this.sequence = nextInputActivitySequence();
  };
  private readonly down = (event: Event): void => {
    const e = event as PointerEvent;
    if (e.pointerType === "touch" || e.button !== 0 || this.pointerId !== undefined) return;
    e.preventDefault(); this.move(e); this.pointerId = e.pointerId; this.held = true;
    try { this.canvas.setPointerCapture(e.pointerId); } catch { /* Synthetic pointer. */ }
  };
  private readonly up = (event: Event): void => {
    if ((event as PointerEvent).pointerId !== this.pointerId) return;
    this.held = false; this.pointerId = undefined;
  };
  private readonly cancel = (): void => { this.clear(); };
  constructor(private readonly canvas: HTMLCanvasElement, private readonly project: (clientX: number, clientY: number) => Vec2) {
    canvas.addEventListener("pointermove", this.move); canvas.addEventListener("pointerdown", this.down); canvas.addEventListener("pointerup", this.up); canvas.addEventListener("pointercancel", this.cancel); canvas.addEventListener("lostpointercapture", this.cancel);
  }
  sample(): PartialActionFrame {
    const aimWorld = this.client ? this.project(this.client.x, this.client.y) : undefined;
    return Object.freeze({ buttons: Object.freeze({ primary: this.held }), analogSequence: this.sequence, ...(aimWorld && Number.isFinite(aimWorld.x + aimWorld.y) ? { aimWorld } : {}) });
  }
  clear(): void { const id = this.pointerId; this.pointerId = undefined; this.client = undefined; this.held = false; if (id !== undefined) try { this.canvas.releasePointerCapture(id); } catch { /* Already released. */ } }
  destroy(): void { this.clear(); this.canvas.removeEventListener("pointermove", this.move); this.canvas.removeEventListener("pointerdown", this.down); this.canvas.removeEventListener("pointerup", this.up); this.canvas.removeEventListener("pointercancel", this.cancel); this.canvas.removeEventListener("lostpointercapture", this.cancel); }
}
