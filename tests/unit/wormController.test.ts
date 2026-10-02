import { expect, it } from "vitest";
import { WormController } from "../../src/game/domain/ai/WormController";
import { WormPerception } from "../../src/game/domain/ai/WormPerception";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { movementBalance } from "../../src/game/data/movementBalance";
import { RandomSource } from "../../src/game/domain/random/RandomSource";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";
function replay(seed = 881, hunterX = 1600) {
  const edge = Math.abs(hunterX) > 1800;
  const movement = { ...movementBalance, ...(edge ? { initialPosition: { x: hunterX - Math.sign(hunterX) * 300, y: 30 }, initialDirection: { x: 0, y: 1 } } : {}), worldBounds: { left: -2382, right: 2382, top: -1182, bottom: 3182 } };
  const terrain = new FlatTerrainProfile(0), controller = new WormController(movement, terrain), perception = new WormPerception();
  const motion = new WormLocomotion(movement);
  const random = new RandomSource(seed).stream("ai.worm");
  const trace: unknown[] = []; let lastWarningTick = -1, crossings = 0;
  for (let tick = 1; tick <= 5400; tick++) {
    const p = perception.observe(motion.snapshot(), hunterAnchor(hunterX), { x: 0, y: -30 }, undefined, tick);
    const decision = controller.step(p, tick, random);
    const events = motion.step(decision.action, 1 / 60, terrain);
    if (events.some(e => e.type === "phase-changed" && e.to === "breaching")) {
      const warning = decision.breachPrediction;
      expect(warning, `unwarned crossing at tick ${String(tick)}`).toBeDefined();
      expect(tick - (warning?.warningTick ?? tick)).toBeGreaterThanOrEqual(60);
      expect(warning?.warningTick).not.toBe(lastWarningTick);
      expect(Math.abs(motion.snapshot().head.position.x - (warning?.x ?? Infinity))).toBeLessThanOrEqual(120);
      // Seismic tracking must put the crossing on the sensed Hunter, not at random.
      expect(Math.abs(motion.snapshot().head.position.x - hunterX)).toBeLessThanOrEqual(420);
      lastWarningTick = warning?.warningTick ?? -1;
      crossings++;
    }
    const head = motion.snapshot().head.position;
    expect(Number.isFinite(head.x + head.y)).toBe(true);
    expect(Math.abs(head.x)).toBeLessThanOrEqual(2382);
    trace.push([head, decision.state, decision.target]);
  }
  // Faster cycles than the old 10-second idle, and never an un-warned crossing.
  expect(crossings).toBeGreaterThanOrEqual(3);
  return trace;
}
it("replays finite relay-pressure attacks with warning before crossing", () => { expect(replay()).toEqual(replay()); });
it.each([-180, -2300, 2300])("warns every natural crossing for the start seed with Hunter at %s", hunterX => { replay(376940, hunterX); });
it("expires precise sightings but keeps an approximate seismic track", () => {
  const sensing = new WormPerception(); const worm = new WormLocomotion(movementBalance).snapshot();
  const shallow = { ...worm, head: { ...worm.head, position: { x: 0, y: 30 } } };
  expect(sensing.observe(shallow, hunterAnchor(20), { x: 0, y: -30 }, undefined, 1).hunter).toBeDefined();
  const deep = sensing.observe(worm, hunterAnchor(999, 1), { x: 0, y: -30 }, undefined, 122);
  expect(deep.hunter).toBeUndefined();
  // Seismic bearing is coarse (80px cells), refreshed on a 20-tick cadence and
  // reported together with the Hunter's travel for leading the crossing.
  expect(deep.seismic?.x).toBe(0);
  expect(sensing.observe(worm, hunterAnchor(999, 1), { x: 0, y: -30 }, undefined, 140).seismic?.x).toBe(960);
  expect(deep.hunterVelocity?.x).toBe(1);
});

function hunterAnchor(x: number, velocityX = 0) { return { position: { x, y: -16 }, velocity: { x: velocityX, y: 0 } }; }
it("default effects preserve trajectories and lift is bounded", () => {
  const a = new WormLocomotion(movementBalance), b = new WormLocomotion(movementBalance), terrain = new FlatTerrainProfile(0);
  for (let tick = 1; tick < 120; tick++) { const action = { ...neutralActionFrame(tick), moveX: 1 }; a.step(action, 1 / 60, terrain); b.step(action, 1 / 60, terrain, { turnScale: 1, liftAcceleration: 0 }); }
  expect(a.snapshot()).toEqual(b.snapshot());
  for (let tick = 120; tick < 168; tick++) b.step(neutralActionFrame(tick), 1 / 60, terrain, { turnScale: .25, liftAcceleration: 1200 });
  expect(b.snapshot().head.position.y).toBeLessThan(0);
  expect(b.snapshot().speed).toBeLessThanOrEqual(movementBalance.burstSpeedCap);
});
