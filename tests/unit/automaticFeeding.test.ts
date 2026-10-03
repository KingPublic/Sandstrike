import { expect, it } from "vitest";
import { spawnActor } from "../../src/game/data/actors";
import { automaticMouthCommands } from "../../src/game/domain/combat/AutomaticFeeding";
import { CombatSystem } from "../../src/game/domain/combat/CombatSystem";
import { ActorRegistry } from "../../src/game/domain/actors/ActorRegistry";

it("sweeps a fast mouth across prey and overlapping impact pays only once", () => {
  const worm = { ...spawnActor("worm", "actor.worm", { x: -100, y: -10 }), health: 50 };
  const food = spawnActor("food", "actor.prey", { x: 0, y: -10 });
  const current = [{ ...worm, position: { x: 100, y: -10 } }, food];
  const commands = automaticMouthCommands([worm, food], current, 1);
  expect(commands).toHaveLength(1);
  const registry = new ActorRegistry(current);
  const command = commands[0];
  if (!command) throw new Error("Missing mouth contact.");
  const events = new CombatSystem().resolve(registry, [...commands, { ...command, abilityId: "ability.impact", tags: ["impact"], priority: 2 }]);
  expect(events.filter(e => e.type === "target-consumed")).toHaveLength(1);
  expect(registry.get("worm")?.health).toBe(58);
});
