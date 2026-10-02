import { describe, expect, it } from "vitest";
import { RampageHudModel } from "../../src/game/ui/hud/RampageHudModel";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { spawnActor } from "../../src/game/data/actors";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

describe("semantic Rampage HUD model", () => {
  it("exposes health, score, cooldown and non-color-only warning labels", () => {
    const session = new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0), playerHealth: 20 });
    const action = neutralActionFrame(1);
    const snapshot = session.step({ ...action, primary: { pressed: true, held: true, released: false }, boost: { pressed: true, held: true, released: false } }).snapshot;
    const model = RampageHudModel.fromSnapshot(snapshot, true);
    expect(model.health).toBe(20);
    expect(model.score).toBe(0);
    expect(model.biteLabel).toContain("0.4");
    expect(model.burstLabel).toContain("1.8");
    expect(model.healthFraction).toBeCloseTo(0.2, 8);
    expect(model.burstReadiness).toBe(0);
    expect(model.status).toContain("Low health");
    expect(model.motionLabel).toBe("Reduced motion");
  });
  it("makes decay and incoming response readable as text", () => {    const session = new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0) });
    const original = session.snapshot();
    const model = RampageHudModel.fromSnapshot({ ...original, combo: { ...original.combo, chain: 3, multiplier: 2, phase: "decay", decayTicksRemaining: 30 }, threat: { band: 0, warningStartedTick: 1, warningTicksRemaining: 90 } });
    expect(model.comboLabel).toContain("Fading");
    expect(model.threatLabel).toContain("Incoming");
    expect(model.threatLabel).toContain("1.5");
  });
  it("advertises the leap while an air target is on the field", () => {
    const session = new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0) });
    const original = session.snapshot();
    const withAerial = { ...original, actors: [...original.actors, spawnActor("air", "actor.aerial", { x: 0, y: -220 })] };
    expect(RampageHudModel.fromSnapshot(original).burstLabel).toBe("Burst · ready");
    expect(RampageHudModel.fromSnapshot(withAerial).burstLabel).toContain("hold up to leap");
    expect(RampageHudModel.fromSnapshot({ ...withAerial, worm: { ...original.worm, burstCooldownSeconds: 1.2 } }).burstLabel).toContain("1.2");
  });
});
