import { freezeRecord } from "../domain/actors/Actor";
import type { RunResult } from "../domain/modes/RunResult";
import { record, keys, nonnegative } from "./SaveFields";
import { characterForRole } from "../data/characters";
import { isThemeId } from "../data/themes";
export function validateRunResult(value: unknown, maximumBand = 3): RunResult {
  const source = record(value);
  const result = source.mode === "rampage" ? { vehiclesDestroyed: 0, aerialDestroyed: 0, ...(source.ascentRampage === true ? { huntersDefeated: 0, huntersTotal: 0 } : {}), ...source } : source;
  const common = ["sessionId", "seed", "mode", "reason", "score", "durationSeconds", "maximumCombo", "gameplayVersion", "characterId", "themeId"];
  const rampage = ["preyConsumed", "infantryDestroyed", "highestBand", "healthRecovered", "vehiclesDestroyed", "aerialDestroyed"];
  const ascentRampage = ["ascentRampage", "huntersDefeated", "huntersTotal"];
  const hunt = ["trapTriggers", "breachInterruptions", "shotsFired", "shotsHit", "exposureWindowsUsed", "hunterHealth", "relayIntegrity", "eligibleForRecords", "bossDefeated"];
  if (typeof result.sessionId !== "string" || !result.sessionId || result.sessionId.length > 128 || !Number.isSafeInteger(result.seed)) throw new Error("Invalid run envelope.");
  if (result.mode !== "rampage" && result.mode !== "hunt") throw new Error("Invalid run mode.");
  if (result.gameplayVersion !== undefined || result.characterId !== undefined || result.themeId !== undefined) {
    if (result.gameplayVersion !== 3 || typeof result.characterId !== "string" || !characterForRole(result.mode, result.characterId) || typeof result.themeId !== "string" || !isThemeId(result.themeId)) throw new Error("Invalid run ownership.");
  }
  keys(result, [...common, ...(result.mode === "rampage" ? [...rampage, ...ascentRampage] : hunt)]);
  const reasons = result.mode === "rampage" ? ["defeated", "player-ended", "all-hunters-defeated"] : ["victory", "hunter-defeated", "hunter-buried", "relay-destroyed", "player-ended"];
  if (!reasons.includes(String(result.reason))) throw new Error("Invalid run reason.");
  if (result.ascentRampage !== undefined && result.ascentRampage !== true) throw new Error("Invalid rampage variant.");
  const huntBooleans = ["eligibleForRecords", "bossDefeated"];
  for (const key of ["score", "durationSeconds", "maximumCombo", ...(result.mode === "rampage" ? rampage : hunt.filter(key => !huntBooleans.includes(key)))]) nonnegative(result[key]);
  for (const key of ["score", ...(result.mode === "rampage" ? rampage : hunt.filter(key => !["hunterHealth", "relayIntegrity", ...huntBooleans].includes(key)))]) if (!Number.isSafeInteger(result[key])) throw new Error("Invalid run count.");
  if (result.mode === "rampage" && Number(result.highestBand) > maximumBand) throw new Error("Unsupported response band.");
  if (result.ascentRampage === true) {
    const defeated = Number(result.huntersDefeated);
    const total = Number(result.huntersTotal);
    if (!Number.isSafeInteger(defeated) || defeated < 0 || !Number.isSafeInteger(total) || total < defeated) throw new Error("Invalid ascent rampage statistics.");
  }
  if (result.mode === "hunt" && (typeof result.eligibleForRecords !== "boolean" || Number(result.shotsHit) > Number(result.shotsFired) || Number(result.hunterHealth) > 100 || Number(result.relayIntegrity) > 200)) throw new Error("Invalid Hunt statistics.");
  return freezeRecord(result) as unknown as RunResult;
}
