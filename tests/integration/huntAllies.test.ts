import { expect, it } from "vitest";

import { RunFactory } from "../../src/game/application/RunFactory";
import { allies as allyBalance } from "../../src/game/data/allies";
import { ascentArena } from "../../src/game/data/ascentArena";
import { AlliedHunterController } from "../../src/game/domain/ai/AlliedHunterController";
import { SupportHelicopterController } from "../../src/game/domain/ai/SupportHelicopterController";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

const groundController = new AlliedHunterController();
const airController = new SupportHelicopterController();

const anchor = (x: number, y: number, platformId?: string) => ({ position: { x, y }, ...(platformId ? { platformId } : {}) });

it("never fires while the ally or the worm is buried", () => {
  const platforms = ascentArena.platforms;
  const buried = groundController.step({ self: { x: 120, y: 40 }, grounded: true, platformId: "base", surfaceY: 0, platforms, hunter: anchor(140, -16, "base"), worm: { position: { x: 130, y: -20 }, exposed: true } });
  expect(buried.fire).toBe(false);
  expect(["regroup", "climb"]).toContain(buried.state);
  const deepWorm = groundController.step({ self: { x: 120, y: -106 }, grounded: true, platformId: "ledge.0", surfaceY: 200, platforms, hunter: anchor(140, -106, "ledge.0"), worm: { position: { x: 130, y: 400 }, exposed: false } });
  expect(deepWorm.fire).toBe(false);
  const exposed = groundController.step({ self: { x: 120, y: -106 }, grounded: true, platformId: "ledge.0", surfaceY: 200, platforms, hunter: anchor(140, -106, "ledge.0"), worm: { position: { x: 130, y: -20 }, exposed: true } });
  expect(exposed).toMatchObject({ fire: true, state: "engage", moveX: -1 });
});

it("escorts the Hunter, regroups when lagging and the helicopter holds altitude", () => {
  // Same platform, close by: the ally holds escort station instead of wandering off.
  const escort = groundController.step({ self: { x: 60, y: -106 }, grounded: true, platformId: "ledge.0", surfaceY: 200, platforms: ascentArena.platforms, hunter: anchor(140, -106, "ledge.0"), worm: undefined });
  expect(escort).toMatchObject({ state: "escort", moveX: 0, jump: false, fire: false });
  // Far behind and below: the ally closes the gap toward the Hunter.
  const regroup = groundController.step({ self: { x: -900, y: -16 }, grounded: true, platformId: "base", surfaceY: 200, platforms: ascentArena.platforms, hunter: anchor(140, -286, "ledge.2"), worm: undefined });
  expect(regroup.state).toBe("regroup");
  expect(regroup.moveX).toBe(1);
  expect(regroup.aim.x).toBeGreaterThan(-900);
  const left = groundController.step({ self: { x: 900, y: -16 }, grounded: true, platformId: "base", surfaceY: 200, platforms: ascentArena.platforms, hunter: anchor(-140, -16, "base"), worm: undefined });
  expect(left).toMatchObject({ state: "regroup", moveX: -1 });
  const air = airController.step({ self: { x: 0, y: -120 }, surfaceY: 200, bounds: ascentArena.bounds, hunter: { x: 0, y: -16 }, worm: undefined });
  expect(air.moveY).toBe(0);
  const low = airController.step({ self: { x: 0, y: 100 }, surfaceY: 200, bounds: ascentArena.bounds, hunter: { x: 0, y: -16 }, worm: undefined });
  expect(low.moveY).toBe(-1);
  // The helicopter patrols around the Hunter rather than the world origin.
  const patrol = airController.step({ self: { x: 1500, y: -120 }, surfaceY: 200, bounds: ascentArena.bounds, hunter: { x: 1400, y: -16 }, worm: undefined });
  expect(Math.abs(patrol.moveX)).toBe(1);
});

it("keeps a capped support population that damages exposed worms but never the player", () => {
  const run = new RunFactory("allies").create({ seed: 21, mode: "hunt" });
  const allyIds = new Set<string>();
  let allyHits = 0;
  let friendlyFire = 0;
  for (let tick = 1; tick <= 5400; tick += 1) {
    const frame = run.step(neutralActionFrame(tick));
    for (const event of frame.events) {
      if (event.type !== "damage-applied" || !event.sourceId.startsWith("ally.")) continue;
      if (event.targetId === "hunter") friendlyFire += 1;
      else if (event.targetId === "worm" && event.amount > 0) allyHits += 1;
    }
    const snapshot = frame.snapshot;
    for (const unit of snapshot.hunt?.allies ?? []) allyIds.add(unit.id);
    const ground = snapshot.actors.filter(actor => actor.tags.includes("ally") && !actor.tags.includes("ally-air") && actor.lifecycle === "active").length;
    const air = snapshot.actors.filter(actor => actor.tags.includes("ally-air") && actor.lifecycle === "active").length;
    expect(ground).toBeLessThanOrEqual(allyBalance.groundCap);
    expect(air).toBeLessThanOrEqual(allyBalance.airCap);
    if (snapshot.wormLife?.phase === "absent") expect(snapshot.hunt?.allies.every(unit => !unit.firing)).toBe(true);
  }
  expect(friendlyFire).toBe(0);
  expect(allyHits).toBeGreaterThan(0);
  expect(allyIds.size).toBeGreaterThan(0);
  expect(allyIds.size).toBeLessThan(20);
}, 30_000);

it("creates independent support actors for a retried run", () => {
  const factory = new RunFactory("retry");
  const first = factory.create({ seed: 4, mode: "hunt" });
  for (let tick = 1; tick <= 120; tick += 1) first.step(neutralActionFrame(tick));
  const second = factory.create({ seed: 4, mode: "hunt" });
  for (let tick = 1; tick <= 120; tick += 1) second.step(neutralActionFrame(tick));
  for (const session of [first, second]) {
    const ids = session.snapshot().actors.map(actor => actor.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter(id => id.startsWith("ally.")).length).toBeLessThanOrEqual(allyBalance.groundCap + allyBalance.airCap);
  }
  expect(first.snapshot().sessionId).not.toBe(second.snapshot().sessionId);
});
