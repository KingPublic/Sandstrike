import { describe, expect, it } from "vitest";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
import { HunterLocomotion } from "../../src/game/domain/hunt/HunterLocomotion";
import { RifleSystem } from "../../src/game/domain/hunt/RifleSystem";
import { SeismicSnare } from "../../src/game/domain/hunt/SeismicSnare";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";

const press = Object.freeze({ held: true, pressed: true, released: false });
describe("Ranger kit", () => {
  it("moves 180 pixels per second on the surface and clamps dodge", () => {
    const mover = new HunterLocomotion(new FlatTerrainProfile(0), { left: -300, right: 300 }, { x: 0, y: -16 });
    for (let tick = 1; tick <= 60; tick++) mover.step({ ...neutralActionFrame(tick), moveX: 1, moveY: 1 }, tick);
    expect(mover.snapshot().position).toEqual({ x: 180, y: -16 });
    for (let tick = 61; tick <= 90; tick++) mover.step({ ...neutralActionFrame(tick), moveX: 1, boost: tick === 61 ? press : neutralActionFrame(tick).boost }, tick);
    expect(mover.snapshot().position.x).toBe(300);
    expect(mover.snapshot().dodgeReadyTick).toBe(181);
  });
  it("fires at ticks 1 and 31, spends misses and reloads while held", () => {
    const rifle = new RifleSystem();
    const shots: number[] = [];
    for (let tick = 1; tick <= 300; tick++) {
      const result = rifle.step({ ...neutralActionFrame(tick), aimX: 1, primary: press }, { position: { x: 0, y: -16 }, regions: [] }, tick);
      if (result.shot) shots.push(tick);
      expect(result.commands).toHaveLength(0);
    }
    expect(shots.slice(0, 6)).toEqual([1, 31, 61, 91, 121, 151]);
    expect(shots[6]).toBe(241);
  });
  it("rejects missing and invalid aim without spending ammunition", () => {
    const rifle = new RifleSystem();
    for (const aimX of [0, NaN, Infinity]) rifle.step({ ...neutralActionFrame(1), primary: press, aimX }, { position: { x: 0, y: -16 }, regions: [] }, 1);
    expect(rifle.snapshot().ammo).toBe(6);
  });
  it("arms at the deadline, triggers once without damage, expires and recovers", () => {
    const snare = new SeismicSnare();
    const hunter = { x: 0, y: -16 };
    snare.step({ ...neutralActionFrame(0), ability: press }, hunter, { x: 0, y: 400 }, 0);
    expect(snare.step(neutralActionFrame(41), hunter, { x: 0, y: 40 }, 41).events).toHaveLength(0);
    const triggered = snare.step(neutralActionFrame(42), hunter, { x: 0, y: 40 }, 42);
    expect(triggered.events.map(e => e.type)).toEqual(["snare-triggered"]);
    expect(triggered.effects?.liftAcceleration).toBe(1200);
    expect(snare.step(neutralActionFrame(90), hunter, { x: 0, y: 40 }, 90).effects).toBeUndefined();
    expect(snare.step(neutralActionFrame(162), hunter, { x: 0, y: 40 }, 162).state.phase).toBe("none");
    expect(snare.step({ ...neutralActionFrame(600), ability: press }, hunter, { x: 0, y: 400 }, 600).state.phase).toBe("arming");
    expect(snare.step({ ...neutralActionFrame(601), ability: press }, hunter, { x: 0, y: 400 }, 601).state.phase).toBe("none");
    expect(snare.snapshot().readyTick).toBe(1200);
    snare.step({ ...neutralActionFrame(1200), ability: press }, hunter, { x: 0, y: 400 }, 1200);
    expect(snare.step(neutralActionFrame(2100), hunter, { x: 0, y: 400 }, 2100).state.phase).toBe("none");
  });
});
