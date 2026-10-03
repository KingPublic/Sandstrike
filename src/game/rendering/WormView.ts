import Phaser from "phaser";
import { characterForRole, type CharacterId } from "../data/characters";

import type { Vec2 } from "../domain/math/Vector2";
import type { WormMotionSnapshot } from "../domain/movement/WormMovementTypes";
import { clipAboveSurface, clippedCircle } from "./SurfaceClip";
import { WormSkinView } from "./WormSkinView";

interface RenderPose {
  readonly position: Vec2;
  readonly tangent: Vec2;
}

export class WormView {
  private readonly body: Phaser.GameObjects.Graphics;
  private readonly skin: WormSkinView;
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
    const tint = character.id === "cinder-wyrm" ? 0xffa681 : character.id === "iron-burrower" ? 0xb8c9cb : character.id === "storm-serpent" ? 0xaac3dc : character.id === "rift-spitter" ? 0xc1afd1 : 0xffffff;
    this.skin = new WormSkinView(scene, tint);
  }

  render(snapshot: WormMotionSnapshot, alpha: number, surfaceOnly = false, shielded = false, visible = true, boss = false, surfaceY = 0): void {
    this.radiusScale = boss ? 1.35 : this.visual.silhouette === "armor" ? 1.15 : this.visual.silhouette === "fins" ? .87 : 1;
    this.renderTick = snapshot.tick - 1 + alpha;
    if (!visible) {
      this.skin.hide();
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
    if (this.skin.available) {
      this.skin.render(poses, poses.map((_, index) => this.radius(index, poses.length)), surfaceOnly, surfaceY);
      if (!surfaceOnly) this.drawShadow(poses);
      if (shielded) for (const [index, pose] of poses.entries()) {
        const points = surfaceOnly ? clippedCircle(pose.position, this.radius(index, poses.length) + 7, surfaceY) : [];
        this.body.lineStyle(2.5, 0xb5cbd0, .85);
        if (surfaceOnly && points.length >= 3) this.body.strokePoints(points.map(p => new Phaser.Math.Vector2(p.x, p.y)), true);
        else if (!surfaceOnly) this.body.strokeCircle(pose.position.x, pose.position.y, this.radius(index, poses.length) + 7);
      }
      if (this.debug) this.drawDebug(poses);
      return;
    }
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
    this.skin.destroy();
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
      if (index === 0 && pose.position.y < surfaceY - 70) this.drawHead(pose, snapshot.phase);
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
      this.body.fillStyle(this.visual.plate, .3).fillEllipse(pose.position.x + 4, pose.position.y + radius * .32, radius * 1.5, radius * .7);
      const normal = { x: -pose.tangent.y, y: pose.tangent.x };
      for (const side of [-1, 1]) {
        const x = pose.position.x + normal.x * side * radius * .6, y = pose.position.y + normal.y * side * radius * .6;
        this.body.lineStyle(1.5, this.visual.light, .24).lineBetween(x - pose.tangent.x * radius * .3, y - pose.tangent.y * radius * .3, x + pose.tangent.x * radius * .1, y + pose.tangent.y * radius * .1);
      }
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
    const point = (forward: number, side: number) => new Phaser.Math.Vector2(pose.position.x + pose.tangent.x * forward + normal.x * side, pose.position.y + pose.tangent.y * forward + normal.y * side);
    const polygon = (coordinates: readonly (readonly [number, number])[], color: number, alpha = 1): void => { this.body.fillStyle(color, alpha).fillPoints(coordinates.map(([f, n]) => point(f, n)), true); };
    const open = (phase === "airborne" || phase === "breaching" ? 9 : 4) + Math.sin(this.renderTick * .15) * 2;
    polygon([[-26,-15],[-14,-27],[15,-26],[37,-16],[45,0],[37,16],[15,26],[-14,27],[-26,15]], 0x231722);
    polygon([[-23,-14],[-12,-23],[14,-22],[32,-13],[40,0],[32,13],[14,22],[-12,23],[-23,14]], this.visual.body);
    polygon([[-18,-16],[-8,-22],[19,-19],[31,-10],[4,-7]], this.visual.light, .35);
    polygon([[-22,12],[-6,23],[19,21],[34,10],[4,12]], this.visual.plate, .65);
    polygon([[-23,-12],[-17,-20],[-2,-22],[4,-9],[-7,0]], this.visual.plate, .85);
    polygon([[-23,12],[-17,20],[-2,22],[4,9],[-7,0]], this.visual.plate, .75);
    polygon([[18,-open],[42,-open*.6],[50,0],[42,open*.6],[18,open],[25,0]], 0x100d17);
    polygon([[26,0],[46,0],[34,4]], 0x953e4a, .7);
    for (const side of [-1,1]) {
      polygon([[8,side*15],[23,side*13],[14,side*18]], 0x100c16);
      polygon([[12,side*15],[23,side*13],[17,side*16]], this.visual.light);
      for (let tooth=0;tooth<3;tooth++) {
        const forward=23+tooth*7;
        polygon([[forward,side*open],[forward+6,side*(open-1)],[forward+4,side*Math.max(0,open-7)]], 0xf5dfb3);
      }
      const browA=point(4,side*20), browB=point(26,side*18);
      this.body.lineStyle(3,this.visual.plate).lineBetween(browA.x,browA.y,browB.x,browB.y);
      if (this.visual.silhouette === "horns") polygon([[-12,side*20],[-38,side*36],[8,side*24]], this.visual.plate);
      if (this.visual.silhouette === "fangs") polygon([[26,side*18],[55,side*25],[32,side*9]], this.visual.light);
    }
    if (this.visual.silhouette === "armor") {
      polygon([[-18,-21],[-5,-27],[15,-25],[18,-15],[-3,-12]], this.visual.plate);
      const a=point(-8,-20),b=point(13,-21);this.body.lineStyle(3,this.visual.light,.5).lineBetween(a.x,a.y,b.x,b.y);
    }
    if (this.visual.silhouette === "fins") polygon([[-18,0],[-42,-10],[-30,7]], this.visual.light,.7);
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
