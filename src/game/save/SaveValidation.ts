import { freezeRecord } from "../domain/actors/Actor";
import type { RunResult } from "../domain/modes/RunResult";
import { defaultSaveData, type SaveData } from "./SaveData";

export function parseSave(raw: string | null): SaveData { return raw === null ? defaultSaveData() : validateSave(JSON.parse(raw) as unknown); }
export function validateSave(value: unknown): SaveData {
  const data = record(value); keys(data, ["schemaVersion", "appVersion", "rampage", "settings", "onboarding"]);
  if (data.schemaVersion !== 1) throw new Error("Unsupported save schema.");
  if (typeof data.appVersion !== "string" || data.appVersion.length === 0 || data.appVersion.length > 64) throw new Error("Invalid app version.");
  const defaults = defaultSaveData();
  const settings = data.settings === undefined ? {} : record(data.settings); keys(settings, Object.keys(defaults.settings));
  for (const [key, setting] of Object.entries(settings)) {
    const standard = defaults.settings[key as keyof typeof defaults.settings];
    if (typeof standard === "boolean") { if (typeof setting !== "boolean") throw new Error("Invalid preference."); }
    else if (typeof setting !== "number" || !Number.isFinite(setting) || setting < (key === "touchOpacity" ? 0.25 : 0) || setting > 1) throw new Error("Invalid preference range.");
  }
  const rampage = data.rampage === undefined ? defaults.rampage : record(data.rampage); keys(rampage, ["bestScore", "bestRun"]);
  const bestScore = nonnegative(rampage.bestScore);
  if (!Number.isSafeInteger(bestScore)) throw new Error("Invalid record score.");
  const bestRun = rampage.bestRun === null ? null : validateRunResult(rampage.bestRun);
  if ((bestRun === null && bestScore !== 0) || (bestRun !== null && bestRun.score !== bestScore)) throw new Error("Inconsistent record summary.");
  const onboarding = data.onboarding === undefined ? defaults.onboarding : record(data.onboarding); keys(onboarding, ["rampageSeen"]);
  if (typeof onboarding.rampageSeen !== "boolean") throw new Error("Invalid onboarding.");
  return freezeRecord({ schemaVersion: 1, appVersion: data.appVersion, rampage: { bestScore, bestRun }, settings: { ...defaults.settings, ...settings }, onboarding: { rampageSeen: onboarding.rampageSeen } });
}
export function validateRunResult(value: unknown): RunResult {
  const result = record(value); keys(result, ["sessionId", "seed", "mode", "reason", "score", "durationSeconds", "maximumCombo", "preyConsumed", "infantryDestroyed", "highestBand", "healthRecovered"]);
  if (typeof result.sessionId !== "string" || result.sessionId.length === 0 || result.sessionId.length > 128 || !Number.isSafeInteger(result.seed) || result.mode !== "rampage" || (result.reason !== "defeated" && result.reason !== "player-ended")) throw new Error("Invalid run envelope.");
  for (const key of ["score", "durationSeconds", "maximumCombo", "preyConsumed", "infantryDestroyed", "highestBand", "healthRecovered"]) nonnegative(result[key]);
  for (const key of ["score", "preyConsumed", "infantryDestroyed", "highestBand", "healthRecovered"]) if (!Number.isSafeInteger(result[key])) throw new Error("Invalid run count.");
  if (Number(result.highestBand) > 1) throw new Error("Unsupported response band.");
  return freezeRecord(result) as unknown as RunResult;
}
function record(value: unknown): Record<string, unknown> { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected save object."); return value as Record<string, unknown>; }
function keys(value: object, allowed: readonly string[]): void { if (Object.keys(value).some((key) => !allowed.includes(key))) throw new Error("Unknown save field."); }
function nonnegative(value: unknown): number { if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) throw new Error("Invalid save number."); return value; }
