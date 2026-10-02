import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { HuntHudModel } from "../../src/game/ui/hud/HuntHudModel";
it("shows role health, ammo, relay and readable tracking in legacy relay runs", () => {
  const model = HuntHudModel.fromSnapshot(new RunFactory().create({ seed: 1, mode: "hunt", fixtureId: "hunt-relay" }).snapshot());
  expect(model.health).toBe("Ranger 100 / 100"); expect(model.relay).toBe("Relay 200 / 200"); expect(model.ammo).toContain("6 / 6"); expect(model.tracking).toContain("DEEP");
});
it("shows height, stage and hazard in explicit debug mode", () => {
  const model = HuntHudModel.fromSnapshot(new RunFactory().create({ seed: 1, mode: "hunt" }).snapshot(), true);
  expect(model.health).toBe("Hunter 100 / 100"); expect(model.relay).toBeUndefined(); expect(model.stage).toBe("Ascent stage"); expect(model.height).toBe("Height 16"); expect(model.danger).toBe("Sand gap 200");
});

it("keeps ordinary gameplay free of technical counters and tracking text", () => {
  const model = HuntHudModel.fromSnapshot(new RunFactory().create({ seed: 1, mode: "hunt" }).snapshot());
  for (const key of ["height", "stage", "danger", "support", "tracking", "worm", "score"]) expect(model[key]).toBeUndefined();
  expect(model.boss).toBe("Reach the rooftop");
  expect(model.route).not.toContain("px");
  expect(model.ammo).toContain("Ammo");
});
