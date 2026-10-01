import type Phaser from "phaser";

import type { DomainEvent } from "../domain/events/DomainEvent";
import type { StepReport } from "../domain/session/FixedStepRunner";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import type { CameraDebugBounds } from "../rendering/CameraController";

export interface DebugOverlayFrame {
  readonly snapshot: SessionSnapshot;
  readonly report: StepReport;
  readonly fps: number;
  readonly frameMs: number;
  readonly totalDroppedMs: number;
  readonly activeInputSource: string;
  readonly pauseReasons: readonly string[];
  readonly camera: CameraDebugBounds;
  readonly recentEvents: readonly DomainEvent[];
  readonly particles: number;
}

export class DebugOverlay {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, visible: boolean) {
    this.text = scene.add
      .text(18, 18, "", {
        color: "#eafcff",
        fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
        fontSize: "14px",
        lineSpacing: 3,
        backgroundColor: "rgba(13, 10, 20, 0.76)",
        padding: { x: 12, y: 10 },
      })
      .setScrollFactor(0)
      .setDepth(500)
      .setVisible(visible);
  }

  update(frame: DebugOverlayFrame): void {
    if (!this.text.visible) {
      return;
    }
    const worm = frame.snapshot.worm;
    const camera = frame.camera;
    const recent = frame.recentEvents
      .slice(-4)
      .map((event) => `${String(event.tick)}:${event.type}`)
      .join("  ");
    this.text.setText([
      `tick ${String(frame.snapshot.tick)}  seed ${String(frame.snapshot.seed)}`,
      `phase ${worm.phase}  speed ${worm.speed.toFixed(1)}  burst ${worm.burstCooldownSeconds.toFixed(2)}s`,
      `fps ${frame.fps.toFixed(0)}  frame ${frame.frameMs.toFixed(2)}ms  steps ${String(frame.report.steps)}  alpha ${frame.report.alpha.toFixed(2)}`,
      `dropped ${frame.totalDroppedMs.toFixed(2)}ms  input ${frame.activeInputSource}`,
      `actors ${String(frame.snapshot.actors.length)}  shapes ${String(frame.snapshot.actors.length)}  projectiles ${String(frame.snapshot.diagnostics.projectileCount)}  particles ${String(frame.particles)}`,
      `pause ${frame.pauseReasons.join(",") || "none"}`,
      `camera ${camera.left.toFixed(0)},${camera.top.toFixed(0)} -> ${camera.right.toFixed(0)},${camera.bottom.toFixed(0)}`,
      `events ${recent || "none"}`,
    ]);
  }

  destroy(): void {
    this.text.destroy();
  }
}
