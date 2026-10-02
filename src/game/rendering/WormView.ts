import Phaser from "phaser";
import { characterForRole, type CharacterId } from "../data/characters";

import type { Vec2 } from "../domain/math/Vector2";
import type { WormMotionSnapshot } from "../domain/movement/WormMovementTypes";
import { clipAboveSurface, clippedCircle } from "./SurfaceClip";

interface RenderPose {
  readonly position: Vec2;
  readonly tangent: Vec2;
}

export class WormView {
  private readonly body: Phaser.GameObjects.Graphics;
  private previous: WormMotionSnapshot | undefined;
  private current: WormMotionSnapshot | undefined;
  private radiusScale = 1;
  private renderTick = 0;
  private readonly visual;

  /** Logical hitboxes stay exact; only the drawn presence changes for the boss. */
  private radius(index: number, count: number): number { return segmentRadius(index, count) * this.radiusScale; }

  constructor(
    scene: Phaser.Scene,
    private readonly debug: boolean,
    characterId?: CharacterId,
  ) {
    const character = characterForRole("rampage", characterId);
    if (!character) throw new RangeError("Invalid worm visual.");
    this.visual = character.visual;
    this.body = scene.add.graphics().setDepth(30);
  }

  render(snapshot: WormMotionSnapshot, alpha: number, surfaceOnly = false, shielded = false, visible = true, boss = false, surfaceY = 0): void {
    this.radiusScale = boss ? 1.35 : this.visual.silhouette === "armor" ? 1.15 : this.visual.silhouette === "fins" ? .87 : 1;
    this.renderTick = snapshot.tick - 1 + alpha;
    if (!visible) {
      this.body.clear();
      this.previous = undefined;
      this.current = undefined;
      return;
    }
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
    if (surfaceOnly) {
      this.drawSurfaceBody(poses, current, surfaceY);
      if (shielded) for (const [index, pose] of poses.entries()) {
        const points = clippedCircle(pose.position, this.radius(index, poses.length) + 7, surfaceY);
        if (points.length >= 3) this.body.lineStyle(3, 0x9beaf0, .85).strokePoints(points.map(p => new Phaser.Math.Vector2(p.x, p.y)), true);
      }
      return;
    }
    this.drawShadow(poses);
    this.drawBody(poses, current);
    if (shielded) {
      this.body.lineStyle(2.5, 0x9beaf0, .85);
      for (const [index, pose] of poses.entries()) this.body.strokeCircle(pose.position.x, pose.position.y, this.radius(index, poses.length) + 7);
    }
    if (this.debug) {
      this.drawDebug(poses);
    }
  }

  destroy(): void {
    this.body.destroy();
  }

  private drawSurfaceBody(poses: readonly RenderPose[], snapshot: WormMotionSnapshot, surfaceY: number): void {
    for (let index = poses.length - 1; index >= 0; index--) {
      const pose = poses[index]; if (!pose) continue;
      const radius = this.radius(index, poses.length), next = poses[index - 1];
      if (next) {
        const n = { x: -pose.tangent.y * radius, y: pose.tangent.x * radius }, nr = this.radius(index - 1, poses.length), m = { x: -next.tangent.y * nr, y: next.tangent.x * nr };
        const points = clipAboveSurface([{ x: pose.position.x + n.x, y: pose.position.y + n.y }, { x: next.position.x + m.x, y: next.position.y + m.y }, { x: next.position.x - m.x, y: next.position.y - m.y }, { x: pose.position.x - n.x, y: pose.position.y - n.y }], surfaceY);
        if (points.length >= 3) this.body.fillStyle(0x4a1f27).fillPoints(points.map(p => new Phaser.Math.Vector2(p.x, p.y)), true);
      }
      for (const [r, color] of [[radius + 2.5, 0x4a1f27], [radius, this.visual.body]] as const) {
        const points = clippedCircle(pose.position, r, surfaceY);
        if (points.length >= 3) this.body.fillStyle(color).fillPoints(points.map(p => new Phaser.Math.Vector2(p.x, p.y)), true);
      }
      if (index === 0 && pose.position.y < surfaceY - 42) this.drawHead(pose, snapshot.phase);
      else if (index > 0 && pose.position.y < surfaceY - radius * 1.2) this.drawDorsalPlate(pose, radius, index);
    }
  }

  private drawShadow(poses: readonly RenderPose[]): void {
    this.body.fillStyle(0x120b16, 0.3);
    for (let index = poses.length - 1; index >= 0; index -= 1) {
      const pose = poses[index];
      if (!pose) {
        continue;
      }
      const radius = this.radius(index, poses.length);
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
        this.radius(index, poses.length),
        this.radius(index - 1, poses.length),
      );
    }

    for (let index = poses.length - 1; index >= 1; index -= 1) {
      const pose = poses[index];
      if (!pose) {
        continue;
      }
      const radius = this.radius(index, poses.length);
      const heat = 0.78 + Math.sin(snapshot.tick * 0.11 - index * 0.72) * 0.08;
      this.body.fillStyle(0x4a1f27, 1);
      this.body.fillCircle(pose.position.x, pose.position.y, radius + 2.5);
      this.body.fillStyle(this.visual.body, heat);
      this.body.fillCircle(pose.position.x, pose.position.y, radius);
      this.body.fillStyle(this.visual.light, 0.34);
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
    this.body.fillStyle(this.visual.plate, 0.9);
    this.body.fillPoints(points, true);
    if (this.visual.silhouette === "fins") {
      this.body.fillStyle(this.visual.light, .55);
      this.body.fillTriangle(baseX, baseY, pose.position.x + normal.x * radius * 1.9, pose.position.y + normal.y * radius * 1.9, baseX + pose.tangent.x * radius, baseY + pose.tangent.y * radius);
    }
    if (this.visual.silhouette === "armor") this.body.lineStyle(4, this.visual.light, .55).lineBetween(pose.position.x - normal.x * radius, pose.position.y - normal.y * radius, pose.position.x + normal.x * radius, pose.position.y + normal.y * radius);
  }

  private drawHead(pose: RenderPose, phase: string): void {
    const normal = { x: -pose.tangent.y, y: pose.tangent.x };
    const tipX = pose.position.x + pose.tangent.x * 10;
    const tipY = pose.position.y + pose.tangent.y * 10;
    this.body.fillStyle(0x431a24, 1);
    this.body.fillEllipse(tipX, tipY, 62, 52);
    this.body.fillStyle(this.visual.body, 1);
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

    if (this.visual.silhouette === "horns" || this.visual.silhouette === "fangs") for (const side of [-1, 1]) {
      this.body.fillStyle(this.visual.light).fillTriangle(tipX + normal.x * side * 20, tipY + normal.y * side * 20, tipX + pose.tangent.x * (this.visual.silhouette === "horns" ? -28 : 36) + normal.x * side * 25, tipY + pose.tangent.y * (this.visual.silhouette === "horns" ? -28 : 36) + normal.y * side * 25, tipX + normal.x * side * 10, tipY + normal.y * side * 10);
    }
    if (this.visual.silhouette === "armor") this.body.lineStyle(5, this.visual.plate).strokeEllipse(tipX, tipY, 66, 58);
    const jawOpening = (phase === "airborne" || phase === "breaching" ? 4 : 1) + Math.sin(this.renderTick * .15) * 2;
    const jawStartX = tipX + pose.tangent.x * 21;
    const jawStartY = tipY + pose.tangent.y * 21;
    this.body.lineStyle(4, 0x32151e, 0.95);
    this.body.lineBetween(
      jawStartX + normal.x * (12 + jawOpening),
      jawStartY + normal.y * (12 + Math.sin(this.renderTick * .15) * 3),
      jawStartX - normal.x * 12,
      jawStartY - normal.y * 12,
    );
  }

  private drawDebug(poses: readonly RenderPose[]): void {
    this.body.lineStyle(1, 0x5ffff2, 0.55);
    poses.forEach((pose, index) => {
      const radius = this.radius(index, poses.length);
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
