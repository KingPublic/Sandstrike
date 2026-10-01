import { describe, expect, it } from "vitest";
import { SaveCoordinator, saveKeys } from "../../src/game/application/SaveCoordinator";
import { MemorySaveRepository } from "../../src/game/infrastructure/storage/MemorySaveRepository";
import type { SaveRepository } from "../../src/game/infrastructure/storage/SaveRepository";
import { defaultSaveData } from "../../src/game/save/SaveData";
import { parseSave } from "../../src/game/save/SaveValidation";

class CountingRepository extends MemorySaveRepository {
  readonly writes: string[] = [];
  override replace(key: string, value: string): void { this.writes.push(key); super.replace(key, value); }
}
describe("save replacement and recovery", () => {
  it("preserves previous valid primary as backup and skips unchanged settings", () => {
    const repo = new CountingRepository(); const keys = saveKeys("test"); const save = new SaveCoordinator(repo, "test");
    save.load(); save.updateSettings({ shake: 0 }); save.updateSettings({ reducedMotion: true });
    expect(parseSave(repo.load(keys.backup)).settings.shake).toBe(0);
    expect(parseSave(repo.load(keys.primary)).settings.reducedMotion).toBe(true);
    const writes = repo.writes.length; save.updateSettings({ reducedMotion: true }); expect(repo.writes).toHaveLength(writes);
    expect(new SaveCoordinator(repo, "test").load().data.settings).toEqual(save.snapshot().settings);
  });
  it("recovers a valid backup or defaults without overwriting corrupt input on load", () => {
    const repo = new CountingRepository(); const keys = saveKeys("test");
    repo.replace(keys.primary, "{broken"); repo.replace(keys.backup, JSON.stringify({ ...defaultSaveData(), settings: { ...defaultSaveData().settings, shake: 0 } }));
    const before = repo.writes.length; const loaded = new SaveCoordinator(repo, "test").load();
    expect(loaded.data.settings.shake).toBe(0); expect(loaded.diagnostics.length).toBeGreaterThan(0); expect(repo.writes).toHaveLength(before);
    repo.replace(keys.backup, "[]"); expect(new SaveCoordinator(repo, "test").load().data).toEqual(defaultSaveData());
  });
  it("uses memory on read/write failure and retains in-session changes", () => {
    for (const repository of [{ load: () => { throw new Error("SecurityError"); }, replace: () => { throw new Error("SecurityError"); } }, { load: () => null, replace: () => { throw new Error("QuotaExceededError"); } }] satisfies SaveRepository[]) {
      const save = new SaveCoordinator(repository, "test"); save.load(); save.updateSettings({ shake: 0 });
      expect(save.snapshot().settings.shake).toBe(0); expect(save.status().memoryOnly).toBe(true); expect(save.status().diagnostics.length).toBeGreaterThan(0);
    }
  });
  it("protects future-version data and requires explicit reset confirmation", () => {
    const repo = new CountingRepository(); const keys = saveKeys("test"); repo.replace(keys.primary, '{"schemaVersion":99}');
    const save = new SaveCoordinator(repo, "test"); save.load(); save.updateSettings({ shake: 0 });
    expect(repo.load(keys.primary)).toBe('{"schemaVersion":99}'); expect(save.resetConfirmed(false)).toBe(false);
    expect(save.resetConfirmed(true)).toBe(true); expect(save.snapshot()).toEqual(defaultSaveData());
    expect(parseSave(repo.load(keys.primary))).toEqual(defaultSaveData());
    expect(parseSave(repo.load(keys.backup))).toEqual(defaultSaveData());
    expect(save.status()).toEqual({ memoryOnly: false, diagnostics: [] });
  });
});
