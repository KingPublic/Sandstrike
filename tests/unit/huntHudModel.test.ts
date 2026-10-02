import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { HuntHudModel } from "../../src/game/ui/hud/HuntHudModel";
it("shows role health, ammo, relay and readable tracking in legacy relay runs", () => {
  const model = HuntHudModel.fromSnapshot(new RunFactory().create({ seed: 1, mode: "hunt", fixtureId: "hunt-relay" }).snapshot());
  expect(model.health).toBe("Ranger 100 / 100"); expect(model.relay).toBe("Relay 200 / 200"); expect(model.ammo).toContain("6 / 6"); expect(model.tracking).toContain("DEEP");
});
it("shows ascent health, height, stage and hazard instead of relay fields", () => {
  const model = HuntHudModel.fromSnapshot(new RunFactory().create({ seed: 1, mode: "hunt" }).snapshot());
  expect(model.health).toBe("Hunter 100 / 100"); expect(model.relay).toBeUndefined(); expect(model.stage).toBe("Ascent stage"); expect(model.height).toBe("Height 16"); expect(model.danger).toBe("Sand gap 200");
});
