import { expect, it } from "vitest";
import valid from "../fixtures/save/v1-valid.json";
import { migrateSave } from "../../src/game/save/SaveMigrations";
import { SaveCoordinator, saveKeys } from "../../src/game/application/SaveCoordinator";
import { MemorySaveRepository } from "../../src/game/infrastructure/storage/MemorySaveRepository";
import { RunFactory } from "../../src/game/application/RunFactory";
it("migrates genuine v1 and retains original bytes as the first backup", () => {
  const raw = JSON.stringify(valid), repo = new MemorySaveRepository(), keys = saveKeys("test");
  repo.replace(keys.primary, raw); const saves = new SaveCoordinator(repo, "test");
  expect(saves.load().data.schemaVersion).toBe(2);
  expect(migrateSave(valid).settings.aimAssist).toBe(.35);
  saves.updateSettings({ shake: .5 });
  expect(repo.load(keys.backup)).toBe(raw);
  expect(migrateSave(JSON.parse(repo.load(keys.primary) ?? "null") as unknown).schemaVersion).toBe(2);
});
it("excludes debug results from records, onboarding and writes", () => {
  const run = new RunFactory().create({ seed: 1, mode: "hunt", debugAI: true });
  run.queueCommand({ type: "RequestEnd", reason: "player-ended", requestedTick: 0 }); const result = run.flushControlCommands().result;
  const repo = new MemorySaveRepository(), saves = new SaveCoordinator(repo, "test"); saves.load();
  if (!result) throw new Error("Missing result");
  expect(saves.acceptRunResult(result).newRecord).toBe(false);
  expect(saves.snapshot().onboarding.huntSeen).toBe(false);
  expect(repo.load(saveKeys("test").primary)).toBeNull();
});
