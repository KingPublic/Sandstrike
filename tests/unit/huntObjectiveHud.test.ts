import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { HuntHudModel } from "../../src/game/ui/hud/HuntHudModel";

it("shows the remaining climb and rooftop RPG objective before pickup", () => {
  const snapshot = new RunFactory("objective").create({ seed: 1, mode: "hunt" }).snapshot();
  const hud = HuntHudModel.fromSnapshot(snapshot);
  expect(hud.boss).toBe("Reach the rooftop");
  expect(hud.rpg).toBeUndefined();
});
