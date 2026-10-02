import type Phaser from "phaser";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import type { ActorState } from "../domain/actors/Actor";

export class ActorViews {
  private readonly views = new Map<string, Phaser.GameObjects.Graphics>();
  private readonly pool: Phaser.GameObjects.Graphics[] = [];
  private previous: SessionSnapshot | undefined;
  private current: SessionSnapshot | undefined;
  constructor(private readonly scene: Phaser.Scene) {}
  sync(snapshot: SessionSnapshot, alpha = 1, highContrast = false): void {
    if (this.current?.tick !== snapshot.tick || this.current.seed !== snapshot.seed) { this.previous = this.current ?? snapshot; this.current = snapshot; }
    const ids = new Set(snapshot.actors.filter((actor) => actor.id !== "worm").map((actor) => actor.id));
    for (const [id, view] of this.views) if (!ids.has(id)) { view.clear().setVisible(false); this.pool.push(view); this.views.delete(id); }
    for (const actor of snapshot.actors) {
      if (actor.id === "worm") continue;
      let view = this.views.get(actor.id);
      if (!view) { view = this.pool.pop() ?? this.scene.add.graphics().setDepth(20); this.views.set(actor.id, view); }
      const previous = this.previous?.actors.find((value) => value.id === actor.id) ?? actor;
      const blend = Math.max(0, Math.min(1, alpha));
      view.setVisible(true).setPosition(previous.position.x + (actor.position.x - previous.position.x) * blend, previous.position.y + (actor.position.y - previous.position.y) * blend).clear();
      const decision = snapshot.ai.find((item) => item.actorId === actor.id)?.decision;
      this.draw(view, actor, snapshot.tick - 1 + blend, highContrast, decision?.state === "telegraph", decision?.aimPoint?.x);
    }
  }
  actorIds(): readonly string[] { return Object.freeze([...this.views.keys()].sort()); }
  reset(): void { for (const view of this.views.values()) { view.clear().setVisible(false); this.pool.push(view); } this.views.clear(); this.current = undefined; this.previous = undefined; }
  destroy(): void { for (const view of [...this.views.values(), ...this.pool]) view.destroy(); this.views.clear(); this.pool.length = 0; }
  private draw(view: Phaser.GameObjects.Graphics, actor: ActorState, tick: number, contrast: boolean, telegraph: boolean, aimX?: number): void {
    if (actor.tags.includes("relay")) {
      view.fillStyle(0x252e3f).fillRoundedRect(-26, -30, 52, 60, 6);
      view.lineStyle(3, 0x8af1db).strokeRoundedRect(-26, -30, 52, 60, 6);
      view.lineStyle(3, 0x9bc9c6).lineBetween(0, -30, 0, -74);
      view.lineStyle(2, 0x8af1db, .4 + Math.sin(tick * .08) * .2).strokeCircle(0, -74, 15);
      view.fillStyle(0x8af1db).fillRect(-18, -19, 36 * actor.health / actor.maxHealth, 5); return;
    }
    if (actor.tags.includes("projectile")) {
      view.lineStyle(3, 0xffe5a4, 0.9).lineBetween(-actor.direction.x * 14, -actor.direction.y * 14, 0, 0);
      view.fillStyle(0xffffff).fillCircle(0, 0, 3); return;
    }
    const stride = Math.sin(tick * 0.19) * (Math.abs(actor.velocity.x) > 0 ? 4 : 0.6);
    const hunter = actor.tags.includes("hunter");
    const soldier = actor.tags.includes("infantry") || hunter;
    view.fillStyle(0x100d18, 0.28).fillEllipse(1, soldier ? 17 : 10, 29, 7);
    view.lineStyle(3, soldier ? 0x384550 : 0x704c43).lineBetween(-3, 3, -4 - stride, soldier ? 16 : 9).lineBetween(4, 3, 5 + stride, soldier ? 16 : 9);
    view.fillStyle(hunter ? 0x8af1db : soldier ? (contrast ? 0xe4f3ff : 0x76999c) : (contrast ? 0xffe9b6 : 0xe3b583)).fillRoundedRect(-7, -7, 14, 15, 3);
    view.fillStyle(0xf7d2a2).fillCircle(0, -12, 5);
    if (soldier) {
      view.fillStyle(0x334b58).fillRoundedRect(-7, -18, 14, 6, 2);
      const sign = aimX === undefined ? actor.direction.x || 1 : Math.sign(aimX - actor.position.x) || 1;
      view.lineStyle(4, 0x1b2734).lineBetween(sign * 2, -5, sign * 20, -5);
      if (telegraph) {
        view.lineStyle(2, 0xffdfa0).strokeCircle(0, -5, 23);
        view.lineStyle(3, 0xffdfa0).lineBetween(0, -43, 0, -33);
        view.fillStyle(0xffdfa0).fillCircle(0, -28, 2);
      }
    } else {
      view.lineStyle(2, 0x7d4f3c).lineBetween(-7, -1, -12, 5).lineBetween(7, -1, 12, 5);
      view.fillStyle(0xffe2b1).fillTriangle(-6, -14, 0, -21, 6, -14);
    }
  }
}
