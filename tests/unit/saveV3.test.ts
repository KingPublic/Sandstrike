import { expect, it } from "vitest";
import validV1 from "../fixtures/save/v1-valid.json";
import { defaultSaveData } from "../../src/game/save/SaveData";
import { migrateSave } from "../../src/game/save/SaveMigrations";
import { validateSave } from "../../src/game/save/SaveValidation";
import { SaveCoordinator, saveKeys } from "../../src/game/application/SaveCoordinator";
import { MemorySaveRepository } from "../../src/game/infrastructure/storage/MemorySaveRepository";
import { RunFactory } from "../../src/game/application/RunFactory";

it("v1 and v2 records survive in legacy buckets without mixing revised scores", () => {
  const v2 = { schemaVersion: 2, appVersion: "0.0.0", rampage: validV1.rampage, hunt: { bestScore: 0, bestRun: null, bestVictory: null }, settings: defaultSaveData().settings, onboarding: { rampageSeen: true, huntSeen: false } };
  for (const old of [validV1, v2]) {
    const migrated = migrateSave(old);
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.legacyRecords.rampage.bestScore).toBe(validV1.rampage.bestScore);
    expect(migrated.rampage.bestScore).toBe(0);
  }
});
it("selection round trips and rejects wrong role ids", () => {
  const saves = new SaveCoordinator(new MemorySaveRepository(), "v3"); saves.load();
  saves.updateSelection({ wormId: "rift-spitter", hunterId: "scout", themeId: "frozen" });
  expect(validateSave(saves.snapshot()).selection).toEqual({ wormId: "rift-spitter", hunterId: "scout", themeId: "frozen" });
  expect(() => validateSave({ ...defaultSaveData(), selection: { wormId: "ranger", hunterId: "scout", themeId: "desert" } })).toThrow();
});
it("revised results retain kit/theme ownership and write once, future data remains untouched", () => {
  const repo = new MemorySaveRepository(), keys = saveKeys("v3");
  const saves = new SaveCoordinator(repo, "v3"); saves.load();
  const run = new RunFactory("save-kit").create({ mode: "rampage", seed: 1, characterId: "cinder-wyrm", themeId: "ruins" });
  run.queueCommand({ type: "RequestEnd", requestedTick: 0, reason: "player-ended" });
  const result = run.flushControlCommands().result; if (!result) throw new Error("Missing result.");
  expect(result).toMatchObject({ gameplayVersion: 3, characterId: "cinder-wyrm", themeId: "ruins" });
  expect(saves.acceptRunResult({ ...result, score: 321 }).newRecord).toBe(true);
  expect(saves.acceptRunResult({ ...result, score: 999 }).accepted).toBe(false);
  expect(saves.snapshot().rampage.bestScore).toBe(321);
  expect(saves.snapshot().legacyRecords.rampage.bestScore).toBe(0);
  repo.replace(keys.primary, '{"schemaVersion":99}');
  const future = new SaveCoordinator(repo, "v3"); future.load(); future.updateSelection({ wormId: "iron-burrower" });
  expect(repo.load(keys.primary)).toBe('{"schemaVersion":99}');
});
