import { freezeRecord } from "../domain/actors/Actor";
import type { RampageRunResult, HuntRunResult } from "../domain/modes/RunResult";
import { defaultPresentationSettings, type PresentationSettings } from "../rendering/FeedbackController";

export interface SaveData {
  readonly schemaVersion: 2; readonly appVersion: string;
  readonly rampage: Readonly<{ bestScore: number; bestRun: RampageRunResult | null }>;
  readonly hunt: Readonly<{ bestScore: number; bestRun: HuntRunResult | null; bestVictory: HuntRunResult | null }>;
  readonly settings: PresentationSettings;
  readonly onboarding: Readonly<{ rampageSeen: boolean; huntSeen: boolean }>;
}
export function defaultSaveData(): SaveData {
  return freezeRecord({ schemaVersion: 2, appVersion: "0.0.0", rampage: { bestScore: 0, bestRun: null }, hunt: { bestScore: 0, bestRun: null, bestVictory: null }, settings: defaultPresentationSettings, onboarding: { rampageSeen: false, huntSeen: false } });
}
