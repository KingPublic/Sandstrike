import { freezeRecord } from "../domain/actors/Actor";
import { defaultSaveData, type SaveData, type SaveDataV2 } from "./SaveData";
import { characterForRole } from "../data/characters";
import { isThemeId } from "../data/themes";
import { record, keys, nonnegative } from "./SaveFields";
import { upgradeV1 } from "./SaveV1";
import { validateRunResult } from "./RunResultValidation";
export { validateRunResult } from "./RunResultValidation";
export function parseSave(raw: string | null): SaveData { return raw === null ? defaultSaveData() : validateSave(JSON.parse(raw) as unknown); }
function validateLegacySave(value: unknown): SaveDataV2 {
  let data = record(value);
  if (data.schemaVersion === 1) data = record(upgradeV1(data));
  keys(data, ["schemaVersion", "appVersion", "rampage", "hunt", "settings", "onboarding"]);
  if (data.schemaVersion !== 2) throw new Error("Unsupported save schema.");
  if (typeof data.appVersion !== "string" || !data.appVersion || data.appVersion.length > 64) throw new Error("Invalid app version.");
  const defaults = defaultSaveData(), settings = data.settings === undefined ? {} : record(data.settings); keys(settings, Object.keys(defaults.settings));
  for (const [key, setting] of Object.entries(settings)) {
    const standard = defaults.settings[key as keyof typeof defaults.settings];
    if (typeof standard === "boolean" ? typeof setting !== "boolean" : typeof setting !== "number" || !Number.isFinite(setting) || setting < (key === "touchOpacity" ? .25 : 0) || setting > 1) throw new Error("Invalid preference.");
  }
  const rampage = record(data.rampage ?? defaults.rampage); keys(rampage, ["bestScore", "bestRun"]);
  const rampageRun = rampage.bestRun === null ? null : validateRunResult(rampage.bestRun);
  if (rampageRun && rampageRun.mode !== "rampage") throw new Error("Wrong record mode.");
  const hunt = record(data.hunt ?? defaults.hunt); keys(hunt, ["bestScore", "bestRun", "bestVictory"]);
  const huntRun = hunt.bestRun === null ? null : validateRunResult(hunt.bestRun);
  const victory = hunt.bestVictory === null ? null : validateRunResult(hunt.bestVictory);
  if (huntRun && (huntRun.mode !== "hunt" || !huntRun.eligibleForRecords) || victory && (victory.mode !== "hunt" || victory.reason !== "victory" || !victory.eligibleForRecords)) throw new Error("Invalid Hunt record.");
  for (const [summary, run] of [[rampage, rampageRun], [hunt, huntRun]] as const) {
    const score = nonnegative(summary.bestScore);
    if (!Number.isSafeInteger(score) || (run?.score ?? 0) !== score) throw new Error("Inconsistent record summary.");
  }
  const onboarding = record(data.onboarding ?? defaults.onboarding); keys(onboarding, ["rampageSeen", "huntSeen"]);
  if (typeof onboarding.rampageSeen !== "boolean" || typeof onboarding.huntSeen !== "boolean") throw new Error("Invalid onboarding.");
  return freezeRecord({ schemaVersion: 2, appVersion: data.appVersion, rampage: { bestScore: rampage.bestScore, bestRun: rampageRun }, hunt: { bestScore: hunt.bestScore, bestRun: huntRun, bestVictory: victory }, settings: { ...defaults.settings, ...settings }, onboarding }) as unknown as SaveDataV2;
}

export function validateSave(value: unknown): SaveData {
  const data = record(value), defaults = defaultSaveData();
  if (data.schemaVersion === 1 || data.schemaVersion === 2) {
    const legacy = validateLegacySave(data);
    return freezeRecord({ ...defaults, appVersion: legacy.appVersion, settings: legacy.settings, onboarding: legacy.onboarding, legacyRecords: { rampage: legacy.rampage, hunt: legacy.hunt } });
  }
  keys(data, ["schemaVersion", "appVersion", "rampage", "hunt", "settings", "onboarding", "selection", "legacyRecords"]);
  if (data.schemaVersion !== 3) throw new Error("Unsupported save schema.");
  const base = validateLegacySave({ schemaVersion: 2, appVersion: data.appVersion, rampage: data.rampage, hunt: data.hunt, settings: data.settings, onboarding: data.onboarding });
  const old = record(data.legacyRecords); keys(old, ["rampage", "hunt"]);
  const legacy = validateLegacySave({ schemaVersion: 2, appVersion: data.appVersion, rampage: old.rampage, hunt: old.hunt, settings: base.settings, onboarding: base.onboarding });
  const selection = record(data.selection); keys(selection, ["themeId", "wormId", "hunterId"]);
  if (typeof selection.themeId !== "string" || !isThemeId(selection.themeId) || typeof selection.wormId !== "string" || !characterForRole("rampage", selection.wormId) || typeof selection.hunterId !== "string" || !characterForRole("hunt", selection.hunterId)) throw new Error("Invalid character selection.");
  for (const run of [base.rampage.bestRun, base.hunt.bestRun, base.hunt.bestVictory]) if (run && run.gameplayVersion !== 3) throw new Error("Legacy result in revised records.");
  return freezeRecord({ ...base, schemaVersion: 3, selection, legacyRecords: { rampage: legacy.rampage, hunt: legacy.hunt } }) as unknown as SaveData;
}
