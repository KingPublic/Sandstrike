import Phaser from "phaser";

import type { WormMovementConfig } from "../domain/movement/WormMovementTypes";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";

export interface CameraDebugBounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export class CameraController {
  private centerX: number;
  private centerY: number;

  constructor(
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    private readonly config: WormMovementConfig,
  ) {
    this.centerX = camera.midPoint.x;
    this.centerY = camera.midPoint.y;
    camera.setBounds(-20_000, -1_200, 40_000, 3_200);
  }

  snap(snapshot: SessionSnapshot): void {
    const target = this.targetFor(snapshot);
    this.centerX = target.x;
    this.centerY = target.y;
    this.camera.centerOn(this.centerX, this.centerY);
  }

  update(snapshot: SessionSnapshot, deltaSeconds: number): void {
    const target = this.targetFor(snapshot);
    const safeDelta = Number.isFinite(deltaSeconds)
      ? Phaser.Math.Clamp(deltaSeconds, 0, 0.25)
      : 0;
    const smoothing =
      1 - Math.pow(2, -safeDelta / this.config.cameraSmoothingHalfLife);
    this.centerX = Phaser.Math.Linear(this.centerX, target.x, smoothing);
    this.centerY = Phaser.Math.Linear(this.centerY, target.y, smoothing);
    this.camera.centerOn(this.centerX, this.centerY);
  }

  debugBounds(): CameraDebugBounds {
    return Object.freeze({
      left: this.camera.worldView.left,
      top: this.camera.worldView.top,
      right: this.camera.worldView.right,
      bottom: this.camera.worldView.bottom,
    });
  }

  private targetFor(snapshot: SessionSnapshot): { x: number; y: number } {
    const head = snapshot.worm.head;
    const lookX = Phaser.Math.Clamp(
      head.velocity.x * 0.38,
      -this.config.cameraLookAheadX,
      this.config.cameraLookAheadX,
    );
    const lookY = Phaser.Math.Clamp(
      head.velocity.y * 0.28,
      -this.config.cameraLookAheadY,
      this.config.cameraLookAheadY,
    );
    return {
      x: head.position.x + lookX,
      y: Phaser.Math.Clamp(head.position.y + lookY, -210, 330),
    };
  }
}
