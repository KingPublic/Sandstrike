import { describe, expect, it } from "vitest";
import { parseSave, validateSave } from "../../src/game/save/SaveValidation";
import { defaultSaveData } from "../../src/game/save/SaveData";
import valid from "../fixtures/save/v1-valid.json";
import future from "../fixtures/save/future.json";

describe("strict v1 save boundary", () => {
  it("loads empty defaults and merges known missing preferences", () => {
    expect(parseSave(null)).toEqual(defaultSaveData());
    const loaded = validateSave(valid);
    expect(loaded.settings.shake).toBe(0); expect(loaded.settings.masterVolume).toBe(0.7);
    expect(Object.isFrozen(loaded.settings)).toBe(true);
  });
  it("rejects malformed, future, unknown keys and unsafe values at every boundary", () => {
    expect(() => parseSave("{broken")).toThrow(); expect(() => validateSave(future)).toThrow();
    const base = defaultSaveData();
    for (const data of [{ ...base, unlocks: {} }, { ...base, settings: { ...base.settings, currency: 10 } }, { ...base, settings: { ...base.settings, shake: 2 } }, { ...base, rampage: { bestScore: -1, bestRun: null } }, { ...base, onboarding: { rampageSeen: "yes" } }, { ...base, appVersion: 4 }]) expect(() => validateSave(data)).toThrow();
  });
});
