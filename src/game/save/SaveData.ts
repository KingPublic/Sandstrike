import { freezeRecord } from "../domain/actors/Actor";
import type { RunResult } from "../domain/modes/RunResult";
import { defaultPresentationSettings, type PresentationSettings } from "../rendering/FeedbackController";

export interface SaveData {
  readonly schemaVersion: 1; readonly appVersion: string;
  readonly rampage: Readonly<{ bestScore: number; bestRun: RunResult | null }>;
  readonly settings: PresentationSettings;
  readonly onboarding: Readonly<{ rampageSeen: boolean }>;
}
export function defaultSaveData(): SaveData {
  return freezeRecord({ schemaVersion: 1, appVersion: "0.0.0", rampage: { bestScore: 0, bestRun: null }, settings: defaultPresentationSettings, onboarding: { rampageSeen: false } });
}
