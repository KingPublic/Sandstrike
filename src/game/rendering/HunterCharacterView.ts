import type Phaser from "phaser";
import { characterForRole } from "../data/characters";
import type { ActorState } from "../domain/actors/Actor";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";

export function drawHunterCharacter(g: Phaser.GameObjects.Graphics, actor: ActorState, snapshot: SessionSnapshot, tick: number): void {
  const kit = characterForRole("hunt", snapshot.characterId);
  if (!kit) return;
  const h = snapshot.hunt, v = kit.visual, airborne = h?.hunter.grounded === false;
  const speed = Math.min(1, Math.abs(actor.velocity.x) / 180), stride = Math.sin(tick * .25) * 5 * speed;
  const bob = airborne ? -1 : Math.abs(Math.sin(tick * .25)) * speed;
  g.fillStyle(0x111b27, .22).fillEllipse(0, 17, 28, 7);
  g.lineStyle(4, v.plate).lineBetween(-4, 4 + bob, -5 - stride, airborne ? 11 : 15).lineBetween(4, 4 + bob, 5 + stride, airborne ? 9 : 16);
  g.fillStyle(v.body).fillRoundedRect(-8, -9 + bob, 16, 19, 4);
  g.fillStyle(v.light, .28).fillRect(-6, -7 + bob, 5, 13);
  g.fillStyle(0xf0c89e).fillCircle(0, -14 + bob, 5.5);
  if (v.silhouette === "hood") g.lineStyle(4, v.plate).strokeCircle(0, -14 + bob, 7).lineBetween(-7, -12, -10, 3);
  else if (v.silhouette === "visor") { g.fillStyle(v.plate).fillRoundedRect(-8, -21 + bob, 16, 14, 4); g.fillStyle(v.light).fillRect(-5, -17 + bob, 12, 3); g.fillStyle(v.plate).fillRoundedRect(-12, -8 + bob, 24, 9, 3); }
  else { g.fillStyle(v.plate).fillRoundedRect(-7, -22 + bob, 14, 7, 2); if (v.silhouette === "cap") g.fillRect(2, -18 + bob, 8, 3); }
  if (v.silhouette === "pack") { g.fillStyle(v.plate).fillRoundedRect(-12, -8, 7, 18, 2); g.lineStyle(2, v.light).lineBetween(-10, -8, -10, -29); g.fillStyle(v.light).fillCircle(-10, -30, 2); }
  if (v.silhouette === "medic") g.fillStyle(0xd84a56).fillRect(-1.5, -6 + bob, 3, 10).fillRect(-5, -2 + bob, 10, 3);
  const aim = h?.aim ?? { x: actor.direction.x || 1, y: 0 };
  const reloading = (h?.rifle.reloadUntilTick ?? 0) > snapshot.tick;
  const angle = reloading ? Math.atan2(aim.y, aim.x) + Math.sin(tick * .1) * .3 : Math.atan2(aim.y, aim.x);
  const dx = Math.cos(angle), dy = Math.sin(angle), length = (h?.rpg.owned && !h.rpg.reloading) ? 30 : kit.id === "field-medic" ? 13 : kit.id === "siegebreaker" ? 26 : 20;
  g.lineStyle(3, 0xf0c89e).lineBetween(0, -4 + bob, dx * 10, dy * 10 - 4 + bob);
  g.lineStyle((h?.rpg.owned && !h.rpg.reloading) ? 7 : 4, v.plate).lineBetween(dx * 4, dy * 4 - 4 + bob, dx * length, dy * length - 4 + bob);
  if (h?.shot) g.fillStyle(v.light).fillTriangle(dx * length, dy * length - 4, dx * (length + 11) - dy * 4, dy * (length + 11) + dx * 4 - 4, dx * (length + 11) + dy * 4, dy * (length + 11) - dx * 4 - 4);
}
