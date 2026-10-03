import type Phaser from "phaser";
import { characterForRole, type CharacterId } from "../data/characters";
import type { ActorState } from "../domain/actors/Actor";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";

export function drawHunterCharacter(g: Phaser.GameObjects.Graphics, actor: ActorState, snapshot: SessionSnapshot, tick: number, characterId: CharacterId | undefined = snapshot.characterId): void {
  const kit = characterForRole("hunt", characterId);
  if (!kit) return;
  const h = snapshot.hunt, v = kit.visual, airborne = h?.hunter.grounded === false;
  const speed = Math.min(1, Math.abs(actor.velocity.x) / 180), stride = Math.sin(tick * .25) * 5 * speed;
  const bob = airborne ? -1 : Math.abs(Math.sin(tick * .25)) * speed;
  if ((actor.invulnerableUntilTick ?? 0) > snapshot.tick) g.lineStyle(2, 0xa4f4dc, .65).strokeEllipse(0, -2, 32, 48);
  g.fillStyle(0x111b27, .22).fillEllipse(0, 17, 28, 7);
  const crouch = airborne ? 3 : 0;
  g.lineStyle(5, v.plate).lineBetween(-4, 4 + bob, -5 - stride * .55, 10 - crouch).lineBetween(-5 - stride * .55, 10 - crouch, -5 - stride, airborne ? 11 : 15).lineBetween(4, 4 + bob, 5 + stride * .55, 10 - crouch).lineBetween(5 + stride * .55, 10 - crouch, 5 + stride, airborne ? 9 : 16);
  g.lineStyle(2, v.body).lineBetween(-4, 4 + bob, -5 - stride * .55, 9 - crouch).lineBetween(4, 4 + bob, 5 + stride * .55, 9 - crouch);
  g.fillStyle(0x18212c).fillRoundedRect(-9 - stride, airborne ? 9 : 13, 10, 4, 1).fillRoundedRect(3 + stride, airborne ? 7 : 14, 10, 4, 1);
  g.fillStyle(v.body).fillRoundedRect(-8, -9 + bob, 16, 19, 4);
  g.fillStyle(v.light, .28).fillRect(-6, -7 + bob, 5, 13);
  g.fillStyle(v.plate, .6).fillRoundedRect(-6, -5 + bob, 12, 9, 2);
  g.fillStyle(0x1b211d, .55).fillRect(-6, -1 + bob, 12, 3);
  for (const x of [-5, 0, 5]) { g.lineStyle(1, v.light, .25).lineBetween(x, -4 + bob, x, 3 + bob); g.fillStyle(v.plate).fillRect(x - 2, 1 + bob, 4, 5); }
  g.lineStyle(1, 0x202a23, .8).lineBetween(-6, -9 + bob, -4, 7 + bob).lineBetween(6, -9 + bob, 4, 7 + bob);
  g.fillStyle(0x252c24).fillEllipse(-5 - stride * .55, 10 - crouch, 5, 4).fillEllipse(5 + stride * .55, 10 - crouch, 5, 4);
  g.lineStyle(2, v.light, .4).lineBetween(-5, -3 + bob, 5, -3 + bob);
  g.fillStyle(0x152330).fillRect(-8, 6 + bob, 16, 3);
  for (const x of [-5, 2]) g.fillStyle(v.body).fillRoundedRect(x, 4 + bob, 4, 5, 1);
  g.fillStyle(0xf0c89e).fillCircle(0, -14 + bob, 5.5);
  g.fillStyle(0xa48270, .5).fillEllipse(3, -12 + bob, 4, 7);
  if (v.silhouette === "hood") g.lineStyle(4, v.plate).strokeCircle(0, -14 + bob, 7).lineBetween(-7, -12, -10, 3);
  else if (v.silhouette === "visor") { g.fillStyle(v.plate).fillRoundedRect(-8, -21 + bob, 16, 14, 4); g.fillStyle(0x141e20).fillRect(-5, -17 + bob, 12, 3); g.lineStyle(1, v.light, .5).lineBetween(-4, -17 + bob, 4, -17 + bob); g.fillStyle(v.plate).fillRoundedRect(-12, -8 + bob, 24, 9, 3); }
  else { g.fillStyle(v.plate).fillRoundedRect(-7, -22 + bob, 14, 7, 2); if (v.silhouette === "cap") g.fillRect(2, -18 + bob, 8, 3); }
  if (v.silhouette === "pack") { g.fillStyle(v.plate).fillRoundedRect(-12, -8, 7, 18, 2); g.lineStyle(2, v.light).lineBetween(-10, -8, -10, -29); g.fillStyle(v.light).fillCircle(-10, -30, 2); }
  if (v.silhouette === "medic") g.fillStyle(0xd84a56).fillRect(-1.5, -6 + bob, 3, 10).fillRect(-5, -2 + bob, 10, 3);
  const rival = snapshot.rivals?.units.find(unit => unit.id === actor.id);
  const aim = rival?.aim ? { x: rival.aim.x - actor.position.x, y: rival.aim.y - actor.position.y } : h?.aim ?? { x: actor.direction.x || 1, y: 0 };
  const reloading = (h?.rifle.reloadUntilTick ?? 0) > snapshot.tick;
  const angle = reloading ? Math.atan2(aim.y, aim.x) + Math.sin(tick * .1) * .3 : Math.atan2(aim.y, aim.x);
  const heavy = rival?.armed === true || h?.rpg.owned === true && !h.rpg.reloading;
  const dx = Math.cos(angle), dy = Math.sin(angle), length = heavy ? 30 : kit.id === "field-medic" ? 13 : kit.id === "siegebreaker" ? 26 : 20;
  const recoil = h?.shot || rival?.firing ? 4 : 0;
  const elbow = { x: dx * 3 - dy * 5, y: -1 + bob + dy * 3 + dx * 5 };
  g.lineStyle(4, v.body).lineBetween(-dx * 3, -5 + bob, elbow.x, elbow.y).lineBetween(elbow.x, elbow.y, dx * 12, dy * 12 - 4 + bob);
  g.fillStyle(0x292c23).fillCircle(dx * 12, dy * 12 - 4 + bob, 2.4);
  g.lineStyle(3, v.body).lineBetween(0, -5 + bob, dx * 4 - dy * 4, dy * 4 + dx * 4 - 4 + bob);
  g.lineStyle(heavy ? 7 : 4, v.plate).lineBetween(dx * (4 - recoil * .4), dy * (4 - recoil * .4) - 4 + bob, dx * (length - recoil), dy * (length - recoil) - 4 + bob);
  g.lineStyle(1.5, v.light, .45).lineBetween(dx * 6, dy * 6 - 5 + bob, dx * (length - recoil), dy * (length - recoil) - 5 + bob);
  g.lineStyle(3, 0x242b26).lineBetween(-dx * 5, -dy * 5 - 4 + bob, dx * 4, dy * 4 - 4 + bob);
  g.lineStyle(3, 0x151b19).lineBetween(dx * 8 - dy * 4, dy * 8 + dx * 4 - 4 + bob, dx * 8, dy * 8 - 4 + bob);
  if (heavy) g.lineStyle(9, 0x324d43).lineBetween(dx * 15, dy * 15 - 4 + bob, dx * (25 - recoil), dy * (25 - recoil) - 4 + bob);
  if (h?.shot) {
    // Tracer follows the real shot path from the drawn muzzle to the actual hit point.
    const muzzle = { x: dx * (length - recoil), y: dy * (length - recoil) - 4 + bob };
    const to = { x: h.shot.to.x - actor.position.x, y: h.shot.to.y - actor.position.y };
    g.lineStyle(heavy ? 3 : 1.6, heavy ? 0xffc46b : 0xfff3cf, heavy ? .95 : .8).lineBetween(muzzle.x, muzzle.y, to.x, to.y);
    g.fillStyle(0xffeec2, .95).fillCircle(muzzle.x, muzzle.y, heavy ? 5 : 3);
    g.fillStyle(0xffd79a, .8).fillTriangle(muzzle.x, muzzle.y, muzzle.x - dy * (heavy ? 9 : 5), muzzle.y + dx * (heavy ? 9 : 5), muzzle.x + dy * (heavy ? 9 : 5), muzzle.y - dx * (heavy ? 9 : 5));
  }
  if (rival?.firing) g.fillStyle(0xffe8ad, .9).fillCircle(dx * (length - recoil), dy * (length - recoil) - 4 + bob, heavy ? 5 : 3);
}
