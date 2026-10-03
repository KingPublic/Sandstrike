import type { SaveRepository } from "../infrastructure/storage/SaveRepository";
import { MemorySaveRepository } from "../infrastructure/storage/MemorySaveRepository";
import { defaultSaveData, type SaveData } from "../save/SaveData";
import { validateRunResult, validateSave } from "../save/SaveValidation";
import { migrateSave } from "../save/SaveMigrations";
import type { RunResult } from "../domain/modes/RunResult";
import type { PresentationSettings } from "../rendering/FeedbackController";

export function saveKeys(environment: string) { return Object.freeze({ primary: `sandstrike.${environment}.save.v1`, backup: `sandstrike.${environment}.save.v1.backup` }); }
export interface SaveStatus { readonly memoryOnly: boolean; readonly diagnostics: readonly string[] }
export interface LoadResult extends SaveStatus { readonly data: SaveData }
export class SaveCoordinator {
  private data = defaultSaveData();
  private readonly diagnostics: string[] = [];
  private memoryOnly = false;
  private previousValid: string | undefined;
  private readonly accepted = new Set<string>();
  private readonly keys: ReturnType<typeof saveKeys>;
  private readonly persistentRepository: SaveRepository;
  constructor(private repository: SaveRepository, environment: string) { this.keys = saveKeys(environment); this.persistentRepository = repository; }
  snapshot(): SaveData { return this.data; }
  status(): SaveStatus { return Object.freeze({ memoryOnly: this.memoryOnly, diagnostics: Object.freeze([...this.diagnostics]) }); }
  load(): LoadResult {
    let protectFuture = false;
    let loaded: SaveData | undefined;
    let validRaw: string | undefined;
    try {
      const primary = this.repository.load(this.keys.primary);
      if (primary !== null) {
        try { const parsed: unknown = JSON.parse(primary); protectFuture = isFuture(parsed); loaded = migrateSave(parsed); validRaw = primary; }
        catch { this.diagnostics.push(protectFuture ? "Newer save kept intact; this session uses temporary data." : "Primary save could not be read."); }
      }
      if (!loaded) {
        const backup = this.repository.load(this.keys.backup);
        if (backup !== null) { try { loaded = migrateSave(JSON.parse(backup) as unknown); validRaw = backup; this.diagnostics.push("Save recovered from backup."); } catch { this.diagnostics.push("Backup unavailable; default settings loaded."); } }
      }
      this.data = loaded ?? defaultSaveData();
      this.previousValid = validRaw;
      if (protectFuture) this.fallback();
    } catch { this.data = loaded ?? defaultSaveData(); this.diagnostics.push("Saving unavailable. Changes are kept for this session."); this.fallback(); }
    return Object.freeze({ ...this.status(), data: this.data });
  }
  updateSelection(patch: Partial<SaveData["selection"]>): void { this.persist(validateSave({ ...this.data, selection: { ...this.data.selection, ...patch } })); }
  updateSettings(patch: Partial<PresentationSettings>): void { this.persist(validateSave({ ...this.data, settings: { ...this.data.settings, ...patch } })); }
  acceptRunResult(value: RunResult): Readonly<{ accepted: boolean; newRecord: boolean }> {
    const result = validateRunResult(value);
    if (this.accepted.has(result.sessionId)) return Object.freeze({ accepted: false, newRecord: false });
    this.accepted.add(result.sessionId);
    const legacy = result.gameplayVersion !== 3;
    const records = legacy ? this.data.legacyRecords : this.data;
    const persistRecords = (patch: Partial<Pick<SaveData, "rampage" | "hunt">>, mode: "rampage" | "hunt") => { this.persist(validateSave({ ...this.data, ...(legacy ? { legacyRecords: { ...this.data.legacyRecords, ...patch } } : patch), onboarding: { ...this.data.onboarding, [`${mode}Seen`]: true } })); };
    if (result.mode === "hunt") {
      if (!result.eligibleForRecords) return Object.freeze({ accepted: true, newRecord: false });
      const newRecord = result.score > records.hunt.bestScore;
      const previousVictory = records.hunt.bestVictory;
      const victory = result.reason === "victory" && (!previousVictory || result.score > previousVictory.score || result.score === previousVictory.score && result.durationSeconds < previousVictory.durationSeconds) ? result : previousVictory;
      persistRecords({ hunt: { bestScore: newRecord ? result.score : records.hunt.bestScore, bestRun: newRecord ? result : records.hunt.bestRun, bestVictory: victory } }, "hunt");
      return Object.freeze({ accepted: true, newRecord });
    }
    const newRecord = result.score > records.rampage.bestScore;
    persistRecords({ rampage: newRecord ? { bestScore: result.score, bestRun: result } : records.rampage }, "rampage");
    return Object.freeze({ accepted: true, newRecord });
  }
  resetConfirmed(confirmed = false): boolean { if (!confirmed) return false; this.accepted.clear(); this.diagnostics.length = 0; this.repository = this.persistentRepository; this.memoryOnly = false; this.persist(defaultSaveData(), true); return true; }
  private persist(next: SaveData, reset = false): void {
    const serialized = JSON.stringify(next);
    if (!reset && serialized === JSON.stringify(this.data)) return;
    this.data = next;
    try {
      if (reset) this.repository.replace(this.keys.backup, serialized);
      else if (this.previousValid !== undefined) this.repository.replace(this.keys.backup, this.previousValid);
      this.repository.replace(this.keys.primary, serialized);
      this.previousValid = serialized;
    } catch {
      this.diagnostics.push("Saving unavailable. Changes are kept for this session."); this.fallback();
      this.repository.replace(this.keys.primary, serialized); this.previousValid = serialized;
    }
  }
  private fallback(): void { this.memoryOnly = true; const memory = new MemorySaveRepository(); memory.replace(this.keys.primary, JSON.stringify(this.data)); this.repository = memory; }
}
function isFuture(value: unknown): boolean { return value !== null && typeof value === "object" && "schemaVersion" in value && typeof value.schemaVersion === "number" && value.schemaVersion > 3; }
