import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { HuntHudModel } from "../../src/game/ui/hud/HuntHudModel";
it("shows role health, ammo, relay and readable tracking", () => {
  const model = HuntHudModel.fromSnapshot(new RunFactory().create({ seed: 1, mode: "hunt" }).snapshot());
  expect(model.health).toBe("Ranger 100 / 100"); expect(model.relay).toBe("Relay 200 / 200"); expect(model.ammo).toContain("6 / 6"); expect(model.tracking).toContain("DEEP");
});
