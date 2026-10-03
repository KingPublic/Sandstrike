import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";

it.each(["desert", "ruins", "frozen"] as const)("captures %s in the session without changing simulation", themeId => {
  const run = new RunFactory("theme").create({ seed: 71, mode: "rampage", themeId });
  expect(run.snapshot().themeId).toBe(themeId);
  expect(run.snapshot().tick).toBe(0);
  expect(run.snapshot().actors.find(a => a.id === "worm")?.health).toBe(100);
});
it("defaults existing configurations to the desert", () => {
  expect(new RunFactory().create({ seed: 1 }).snapshot().themeId).toBe("desert");
});
