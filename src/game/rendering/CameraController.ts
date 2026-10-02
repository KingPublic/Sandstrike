import Phaser from "phaser";

import type { WormMovementConfig } from "../domain/movement/WormMovementTypes";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import { computeCameraFraming } from "./CameraFraming";
import { huntCameraTarget } from "./HuntPresentation";

export interface CameraDebugBounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

export class CameraController {
  private centerX: number;
  private centerY: number;
  private zoom: number;

  constructor(
    private readonly camera: Phaser.Cameras.Scene2D.Camera,
    private readonly config: WormMovementConfig,
  ) {
    this.centerX = camera.midPoint.x;
    this.centerY = camera.midPoint.y;
    this.zoom = camera.zoom;
    camera.setBounds(-20_000, -1_200, 40_000, 4_400);
  }

  snap(snapshot: SessionSnapshot): void {
    const target = this.targetFor(snapshot);
    this.centerX = target.centerX;
    this.centerY = target.centerY;
    this.zoom = target.zoom;
    this.camera.setZoom(this.zoom);
    this.camera.centerOn(this.centerX, this.centerY);
  }

  update(snapshot: SessionSnapshot, deltaSeconds: number): void {
    const target = this.targetFor(snapshot);
    const safeDelta = Number.isFinite(deltaSeconds)
      ? Phaser.Math.Clamp(deltaSeconds, 0, 0.25)
      : 0;
    const smoothing =
      1 - Math.pow(2, -safeDelta / this.config.cameraSmoothingHalfLife);
    this.centerX = Phaser.Math.Linear(this.centerX, target.centerX, smoothing);
    this.centerY = Phaser.Math.Linear(this.centerY, target.centerY, smoothing);
    this.zoom = Phaser.Math.Linear(this.zoom, target.zoom, smoothing);
    this.camera.setZoom(this.zoom);
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

  private targetFor(snapshot: SessionSnapshot) {
    if (snapshot.mode === "hunt") return huntCameraTarget(snapshot, this.camera.width, this.camera.height);
    return computeCameraFraming(
      snapshot.worm.head,
      this.camera.height,
      this.config,
    );
  }
}
