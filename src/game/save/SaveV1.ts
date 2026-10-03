import { defaultPresentationSettings } from "../rendering/FeedbackController";
import { defaultSaveData, type SaveDataV2 } from "./SaveData";
import { record, keys, nonnegative } from "./SaveFields";
import { validateRunResult } from "./RunResultValidation";
export function upgradeV1(value: unknown): SaveDataV2 {
  const data = record(value); keys(data, ["schemaVersion", "appVersion", "rampage", "settings", "onboarding"]);
  if (data.schemaVersion !== 1 || typeof data.appVersion !== "string" || !data.appVersion || data.appVersion.length > 64) throw new Error("Invalid v1 envelope.");
  const defaults = defaultSaveData();
  const settings = data.settings === undefined ? {} : record(data.settings);
  keys(settings, Object.keys(defaultPresentationSettings).filter(key => key !== "aimAssist"));
  for (const [key, setting] of Object.entries(settings)) {
    const standard = defaultPresentationSettings[key as keyof typeof defaultPresentationSettings];
    if (typeof standard === "boolean" ? typeof setting !== "boolean" : typeof setting !== "number" || !Number.isFinite(setting) || setting < (key === "touchOpacity" ? .25 : 0) || setting > 1) throw new Error("Invalid v1 preference.");
  }
  const rampage = data.rampage === undefined ? defaults.rampage : record(data.rampage); keys(rampage, ["bestScore", "bestRun"]);
  if (rampage.bestRun !== null && rampage.bestRun !== undefined) keys(record(rampage.bestRun), ["sessionId", "seed", "mode", "reason", "score", "durationSeconds", "maximumCombo", "preyConsumed", "infantryDestroyed", "highestBand", "healthRecovered"]);
  const bestScore = nonnegative(rampage.bestScore), bestRun = rampage.bestRun === null ? null : validateRunResult(rampage.bestRun, 1);
  if (!Number.isSafeInteger(bestScore) || bestRun && bestRun.mode !== "rampage" || (bestRun?.score ?? 0) !== bestScore) throw new Error("Invalid v1 record.");
  const onboarding = data.onboarding === undefined ? { rampageSeen: false } : record(data.onboarding); keys(onboarding, ["rampageSeen"]);
  if (typeof onboarding.rampageSeen !== "boolean") throw new Error("Invalid v1 onboarding.");
  return { schemaVersion: 2, appVersion: data.appVersion, rampage: { bestScore, bestRun: bestRun }, hunt: defaults.hunt, settings: { ...defaults.settings, ...settings }, onboarding: { rampageSeen: onboarding.rampageSeen, huntSeen: false } };
}
