import { expect, it } from "vitest";
import { WormController } from "../../src/game/domain/ai/WormController";
import { WormPerception } from "../../src/game/domain/ai/WormPerception";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { movementBalance } from "../../src/game/data/movementBalance";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

const terrain = new FlatTerrainProfile(0);
const anchor = { position: { x: 150, y: -16 }, velocity: { x: 180, y: 0 } };
const relay = { x: 0, y: -30 };

it("a beacon beats a fresh sighting and leads a real warned breach to the beacon", () => {
  const config = { ...movementBalance, initialPosition: { x: -160, y: 650 }, initialDirection: { x: 0, y: -1 }, initialSpeed: 180 };
  const motion = new WormLocomotion(config), controller = new WormController(config, terrain, 0, false), perception = new WormPerception();
  const random = new RandomSource(82).stream("worm");
  const beacon = { x: -250, y: -16 };
  perception.observe({ ...motion.snapshot(), head: { ...motion.snapshot().head, position: { x: 0, y: 20 } } }, anchor, relay, undefined, 0);
  let attacked = false;
  for (let tick = 1; tick <= 700; tick++) {
    const sensed = perception.observe(motion.snapshot(), anchor, relay, undefined, tick, 0, tick <= 300 ? beacon : undefined);
    const decision = controller.step(sensed, tick, random);
    if (tick === 25) { expect(decision.target).toEqual(beacon); expect(decision.reason).toContain("beacon"); }
    const events = motion.step(decision.action, 1 / 60, terrain);
    if (events.some(e => e.type === "phase-changed" && e.to === "breaching")) {
      expect(decision.target).toEqual(beacon);
      expect(tick - (decision.breachPrediction?.warningTick ?? tick)).toBeGreaterThanOrEqual(60);
      expect(Math.abs(motion.snapshot().head.position.x - beacon.x)).toBeLessThan(260);
      attacked = true; break;
    }
  }
  expect(attacked).toBe(true);
});

it("primary Engineer skill reaches the Maw controller through the real Hunt session", () => {
  const run = new RunFactory("beacon").create({ mode: "hunt", seed: 8, characterId: "engineer", debugAI: true });
  run.step({ ...neutralActionFrame(1), ability: { held: true, pressed: true, released: false } });
  const beacon = run.snapshot().skill?.decoy;
  for (let tick = 2; tick <= 25; tick++) run.step(neutralActionFrame(tick));
  expect(run.snapshot().hunt?.decision?.target).toEqual(beacon);
  expect(run.snapshot().hunt?.decision?.reason).toContain("beacon attack");
  let closest = Infinity;
  let nearest: unknown;
  if (!beacon) throw new Error("Missing beacon");
  for (let tick = 26; tick <= 350; tick++) {
    run.step(neutralActionFrame(tick));
    const head = run.snapshot().worm.head.position;
    const distance = Math.hypot(head.x - beacon.x, head.y - beacon.y);
    if (distance < closest) { closest = distance; nearest = { head, decision: run.snapshot().hunt?.decision }; }
  }
  expect(closest, JSON.stringify(nearest)).toBeLessThan(140);
});

it("grapple and healing noise immediately update the bearing and expire", () => {
  const perception = new WormPerception(), worm = new WormLocomotion(movementBalance).snapshot();
  const landing = { x: 480, y: -196 };
  const jump = perception.observe(worm, anchor, relay, undefined, 1, 0, undefined, { shieldUntilTick: 0, markedUntilTick: 0, noise: { kind: "grapple", position: landing } });
  expect(jump.noise?.position).toEqual(landing); expect(jump.seismic?.x).toBe(480); expect(jump.hunterVelocity?.x).toBe(0);
  const heal = perception.observe(worm, anchor, relay, undefined, 2, 0, undefined, { shieldUntilTick: 0, markedUntilTick: 0, noise: { kind: "heal", position: anchor.position } });
  expect(heal.noise?.kind).toBe("heal");
  expect(perception.observe(worm, anchor, relay, undefined, 92).noise).toBeUndefined();
});

it("Maw flanks a shield without committing an early charge, and responds to marking", () => {
  const motion = new WormLocomotion({ ...movementBalance, initialPosition: { x: 0, y: 900 } }).snapshot();
  const controller = new WormController(movementBalance, terrain, 0, false), random = new RandomSource(8).stream("worm");
  const perception = new WormPerception();
  let result;
  for (let tick = 1; tick <= 60; tick++) result = controller.step(perception.observe(motion, anchor, relay, undefined, tick, 0, undefined, { shieldUntilTick: 180, markedUntilTick: 0 }), tick, random);
  expect(result?.reason).toContain("shield flank"); expect(result?.breachPrediction).toBeUndefined();
  const marked = controller.step(perception.observe(motion, anchor, relay, undefined, 61, 0, undefined, { shieldUntilTick: 0, markedUntilTick: 200 }), 61, random);
  expect(marked.reason).toContain("marked retaliation");
});
