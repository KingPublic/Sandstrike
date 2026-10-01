import Phaser from "phaser";

import type { Vec2 } from "../domain/math/Vector2";
import type { WormMotionSnapshot } from "../domain/movement/WormMovementTypes";

interface RenderPose {
  readonly position: Vec2;
  readonly tangent: Vec2;
}

export class WormView {
  private readonly body: Phaser.GameObjects.Graphics;
  private previous: WormMotionSnapshot | undefined;
  private current: WormMotionSnapshot | undefined;

  constructor(
    scene: Phaser.Scene,
    private readonly debug: boolean,
  ) {
    this.body = scene.add.graphics().setDepth(30);
  }

  render(snapshot: WormMotionSnapshot, alpha: number): void {
    if (this.current?.tick !== snapshot.tick) {
      this.previous = this.current ?? snapshot;
      this.current = snapshot;
    }
    const previous = this.previous ?? snapshot;
    const current = this.current;
    const interpolation = Phaser.Math.Clamp(alpha, 0, 1);
    const previousPoses = [previous.head, ...previous.followers];
    const currentPoses = [current.head, ...current.followers];
    const poses = currentPoses.map((pose, index) =>
      interpolatePose(previousPoses[index] ?? pose, pose, interpolation),
    );

    this.body.clear();
    this.drawShadow(poses);
    this.drawBody(poses, current);
    if (this.debug) {
      this.drawDebug(poses);
    }
  }

  destroy(): void {
    this.body.destroy();
  }

  private drawShadow(poses: readonly RenderPose[]): void {
    this.body.fillStyle(0x120b16, 0.3);
    for (let index = poses.length - 1; index >= 0; index -= 1) {
      const pose = poses[index];
      if (!pose) {
        continue;
      }
      const radius = segmentRadius(index, poses.length);
      this.body.fillEllipse(
        pose.position.x + 8,
        pose.position.y + 13,
        radius * 2.15,
        radius * 1.48,
      );
    }
  }

  private drawBody(
    poses: readonly RenderPose[],
    snapshot: WormMotionSnapshot,
  ): void {
    for (let index = poses.length - 1; index >= 1; index -= 1) {
      const pose = poses[index];
      const next = poses[index - 1];
      if (!pose || !next) {
        continue;
      }
      this.drawConnector(
        pose,
        next,
        segmentRadius(index, poses.length),
        segmentRadius(index - 1, poses.length),
      );
    }

    for (let index = poses.length - 1; index >= 1; index -= 1) {
      const pose = poses[index];
      if (!pose) {
        continue;
      }
      const radius = segmentRadius(index, poses.length);
      const heat = 0.78 + Math.sin(snapshot.tick * 0.11 - index * 0.72) * 0.08;
      this.body.fillStyle(0x4a1f27, 1);
      this.body.fillCircle(pose.position.x, pose.position.y, radius + 2.5);
      this.body.fillStyle(0xc85b38, heat);
      this.body.fillCircle(pose.position.x, pose.position.y, radius);
      this.body.fillStyle(0xffbb66, 0.34);
      this.body.fillEllipse(
        pose.position.x - pose.tangent.y * radius * 0.35,
        pose.position.y + pose.tangent.x * radius * 0.35,
        radius * 0.85,
        radius * 0.42,
      );
      this.drawDorsalPlate(pose, radius, index);
    }

    const head = poses[0];
    if (head) {
      this.drawHead(head, snapshot.phase);
    }
  }

  private drawConnector(
    pose: RenderPose,
    next: RenderPose,
    radius: number,
    nextRadius: number,
  ): void {
    const normal = { x: -pose.tangent.y, y: pose.tangent.x };
    const nextNormal = { x: -next.tangent.y, y: next.tangent.x };
    const outline = [
      new Phaser.Math.Vector2(
        pose.position.x + normal.x * (radius + 2),
        pose.position.y + normal.y * (radius + 2),
      ),
      new Phaser.Math.Vector2(
        next.position.x + nextNormal.x * (nextRadius + 2),
        next.position.y + nextNormal.y * (nextRadius + 2),
      ),
      new Phaser.Math.Vector2(
        next.position.x - nextNormal.x * (nextRadius + 2),
        next.position.y - nextNormal.y * (nextRadius + 2),
      ),
      new Phaser.Math.Vector2(
        pose.position.x - normal.x * (radius + 2),
        pose.position.y - normal.y * (radius + 2),
      ),
    ];
    this.body.fillStyle(0x4a1f27, 1);
    this.body.fillPoints(outline, true);
  }

  private drawDorsalPlate(
    pose: RenderPose,
    radius: number,
    index: number,
  ): void {
    if (index % 2 === 0) {
      return;
    }
    const normal = { x: -pose.tangent.y, y: pose.tangent.x };
    const baseX = pose.position.x - normal.x * radius * 0.35;
    const baseY = pose.position.y - normal.y * radius * 0.35;
    const points = [
      new Phaser.Math.Vector2(
        baseX - pose.tangent.x * radius * 0.45,
        baseY - pose.tangent.y * radius * 0.45,
      ),
      new Phaser.Math.Vector2(
        pose.position.x - normal.x * radius * 1.15,
        pose.position.y - normal.y * radius * 1.15,
      ),
      new Phaser.Math.Vector2(
        baseX + pose.tangent.x * radius * 0.45,
        baseY + pose.tangent.y * radius * 0.45,
      ),
    ];
    this.body.fillStyle(0x6a2930, 0.9);
    this.body.fillPoints(points, true);
  }

  private drawHead(pose: RenderPose, phase: string): void {
    const normal = { x: -pose.tangent.y, y: pose.tangent.x };
    const tipX = pose.position.x + pose.tangent.x * 10;
    const tipY = pose.position.y + pose.tangent.y * 10;
    this.body.fillStyle(0x431a24, 1);
    this.body.fillEllipse(tipX, tipY, 62, 52);
    this.body.fillStyle(phase === "airborne" ? 0xf3783f : 0xd75e38, 1);
    this.body.fillEllipse(tipX, tipY, 56, 46);
    this.body.fillStyle(0xffc36e, 0.42);
    this.body.fillEllipse(
      tipX - normal.x * 7,
      tipY - normal.y * 7,
      27,
      13,
    );

    for (const side of [-1, 1]) {
      const eyeX = tipX + pose.tangent.x * 10 + normal.x * side * 13;
      const eyeY = tipY + pose.tangent.y * 10 + normal.y * side * 13;
      this.body.fillStyle(0xffdf83, 1);
      this.body.fillCircle(eyeX, eyeY, 4.7);
      this.body.fillStyle(0x170d16, 1);
      this.body.fillCircle(
        eyeX + pose.tangent.x * 1.5,
        eyeY + pose.tangent.y * 1.5,
        2.2,
      );
    }

    const jawStartX = tipX + pose.tangent.x * 21;
    const jawStartY = tipY + pose.tangent.y * 21;
    this.body.lineStyle(4, 0x32151e, 0.95);
    this.body.lineBetween(
      jawStartX + normal.x * 12,
      jawStartY + normal.y * 12,
      jawStartX - normal.x * 12,
      jawStartY - normal.y * 12,
    );
  }

  private drawDebug(poses: readonly RenderPose[]): void {
    this.body.lineStyle(1, 0x5ffff2, 0.55);
    poses.forEach((pose, index) => {
      const radius = segmentRadius(index, poses.length);
      this.body.strokeCircle(pose.position.x, pose.position.y, radius);
      this.body.lineBetween(
        pose.position.x,
        pose.position.y,
        pose.position.x + pose.tangent.x * radius * 1.5,
        pose.position.y + pose.tangent.y * radius * 1.5,
      );
    });
  }
}

function interpolatePose(
  previous: RenderPose,
  current: RenderPose,
  alpha: number,
): RenderPose {
  const tangentX = Phaser.Math.Linear(previous.tangent.x, current.tangent.x, alpha);
  const tangentY = Phaser.Math.Linear(previous.tangent.y, current.tangent.y, alpha);
  const magnitude = Math.hypot(tangentX, tangentY) || 1;
  return {
    position: {
      x: Phaser.Math.Linear(previous.position.x, current.position.x, alpha),
      y: Phaser.Math.Linear(previous.position.y, current.position.y, alpha),
    },
    tangent: { x: tangentX / magnitude, y: tangentY / magnitude },
  };
}

function segmentRadius(index: number, count: number): number {
  const progress = index / Math.max(1, count - 1);
  return Phaser.Math.Linear(23, 9, progress ** 1.35);
}
