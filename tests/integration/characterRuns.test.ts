import { expect, it } from "vitest";
import { characters } from "../../src/game/data/characters";
import { RunFactory } from "../../src/game/application/RunFactory";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

it("every selected kit runs through the shared simulation with its actual skill", () => {
  for (const character of characters) {
    const mode = character.role === "worm" ? "rampage" : "hunt";
    const run = new RunFactory("kit").create({ mode, seed: 123, characterId: character.id, themeId: "ruins" });
    expect(run.snapshot().characterId).toBe(character.id);
    const frame = run.step({ ...neutralActionFrame(1), ability: { held: true, pressed: true, released: false } });
    expect(frame.snapshot.abilities[0]?.id).toBe(character.skill.id);
    expect(frame.snapshot.abilities[0]?.active).toBe(true);
    for (let tick = 2; tick <= 100; tick++) run.step(neutralActionFrame(tick));
    expect(run.snapshot().characterId).toBe(character.id);
  }
});
it("rejects a Hunter in Rampage and a worm in Hunt", () => {
  const factory = new RunFactory("invalid");
  expect(() => factory.create({ mode: "hunt", seed: 1, characterId: "dune-maw" })).toThrow();
  expect(() => factory.create({ mode: "rampage", seed: 1, characterId: "ranger" })).toThrow();
});
