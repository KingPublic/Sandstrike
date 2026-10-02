import { freezeRecord } from "../domain/actors/Actor";
import type { RampageRunResult, HuntRunResult } from "../domain/modes/RunResult";
import { defaultPresentationSettings, type PresentationSettings } from "../rendering/FeedbackController";
import type { HunterId, WormId } from "../data/characters";
import type { ThemeId } from "../data/themes";

export interface SaveDataV2 {
  readonly schemaVersion: 2; readonly appVersion: string;
  readonly rampage: Readonly<{ bestScore: number; bestRun: RampageRunResult | null }>;
  readonly hunt: Readonly<{ bestScore: number; bestRun: HuntRunResult | null; bestVictory: HuntRunResult | null }>;
  readonly settings: PresentationSettings;
  readonly onboarding: Readonly<{ rampageSeen: boolean; huntSeen: boolean }>;
}
export interface SaveData extends Omit<SaveDataV2, "schemaVersion"> {
  readonly schemaVersion: 3;
  readonly selection: Readonly<{ themeId: ThemeId; wormId: WormId; hunterId: HunterId }>;
  readonly legacyRecords: Readonly<Pick<SaveDataV2, "rampage" | "hunt">>;
}
export function defaultSaveData(): SaveData {
  return freezeRecord({ schemaVersion: 3, appVersion: "0.0.0", rampage: { bestScore: 0, bestRun: null }, hunt: { bestScore: 0, bestRun: null, bestVictory: null }, settings: defaultPresentationSettings, onboarding: { rampageSeen: false, huntSeen: false }, selection: { themeId: "desert", wormId: "dune-maw", hunterId: "ranger" }, legacyRecords: { rampage: { bestScore: 0, bestRun: null }, hunt: { bestScore: 0, bestRun: null, bestVictory: null } } });
}
