import { expect, it } from "vitest";
import { HuntRules } from "../../src/game/domain/modes/HuntRules";
import { RunFactory } from "../../src/game/application/RunFactory";
it("prioritizes Hunter defeat over relay loss and victory", () => {
  const snapshot = new RunFactory().create({ seed: 1, mode: "hunt", fixtureId: "hunt-relay" }).snapshot();
  const dead = { ...snapshot, actors: snapshot.actors.map(a => ({ ...a, health: 0 })) };
  const result = new HuntRules().observe(dead, [], []).result;
  expect(result?.reason).toBe("hunter-defeated");
  const relay = { ...snapshot, actors: snapshot.actors.map(a => ({ ...a, health: a.id === "hunter" ? 100 : 0 })) };
  expect(new HuntRules().observe(relay, [], []).result?.reason).toBe("relay-destroyed");
  const win = { ...snapshot, actors: snapshot.actors.map(a => ({ ...a, health: a.id === "worm" ? 0 : a.health })) };
  expect(new HuntRules().observe(win, [], []).result?.reason).toBe("victory");
});
