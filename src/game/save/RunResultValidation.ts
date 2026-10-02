import { freezeRecord } from "../domain/actors/Actor";
import type { RunResult } from "../domain/modes/RunResult";
import { record, keys, nonnegative } from "./SaveFields";
export function validateRunResult(value: unknown, maximumBand = 1): RunResult {
  const result = record(value);
  const common = ["sessionId", "seed", "mode", "reason", "score", "durationSeconds", "maximumCombo"];
  const rampage = ["preyConsumed", "infantryDestroyed", "highestBand", "healthRecovered"];
  const hunt = ["trapTriggers", "breachInterruptions", "shotsFired", "shotsHit", "exposureWindowsUsed", "hunterHealth", "relayIntegrity", "eligibleForRecords"];
  if (typeof result.sessionId !== "string" || !result.sessionId || result.sessionId.length > 128 || !Number.isSafeInteger(result.seed)) throw new Error("Invalid run envelope.");
  if (result.mode !== "rampage" && result.mode !== "hunt") throw new Error("Invalid run mode.");
  keys(result, [...common, ...(result.mode === "rampage" ? rampage : hunt)]);
  const reasons = result.mode === "rampage" ? ["defeated", "player-ended"] : ["victory", "hunter-defeated", "relay-destroyed", "player-ended"];
  if (!reasons.includes(String(result.reason))) throw new Error("Invalid run reason.");
  for (const key of ["score", "durationSeconds", "maximumCombo", ...(result.mode === "rampage" ? rampage : hunt.filter(key => key !== "eligibleForRecords"))]) nonnegative(result[key]);
  for (const key of ["score", ...(result.mode === "rampage" ? rampage : hunt.filter(key => !["hunterHealth", "relayIntegrity", "eligibleForRecords"].includes(key)))]) if (!Number.isSafeInteger(result[key])) throw new Error("Invalid run count.");
  if (result.mode === "rampage" && Number(result.highestBand) > maximumBand) throw new Error("Unsupported response band.");
  if (result.mode === "hunt" && (typeof result.eligibleForRecords !== "boolean" || Number(result.shotsHit) > Number(result.shotsFired) || Number(result.hunterHealth) > 100 || Number(result.relayIntegrity) > 200)) throw new Error("Invalid Hunt statistics.");
  return freezeRecord(result) as unknown as RunResult;
}
