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
    try {
      const primary = this.repository.load(this.keys.primary);
      if (primary !== null) {
        try { const parsed: unknown = JSON.parse(primary); protectFuture = isFuture(parsed); loaded = migrateSave(parsed); }
        catch { this.diagnostics.push(protectFuture ? "Newer save kept intact; this session uses temporary data." : "Primary save could not be read."); }
      }
      if (!loaded) {
        const backup = this.repository.load(this.keys.backup);
        if (backup !== null) { try { loaded = migrateSave(JSON.parse(backup) as unknown); this.diagnostics.push("Save recovered from backup."); } catch { this.diagnostics.push("Backup unavailable; default settings loaded."); } }
      }
      this.data = loaded ?? defaultSaveData();
      this.previousValid = loaded ? JSON.stringify(loaded) : undefined;
      if (protectFuture) this.fallback();
    } catch { this.data = loaded ?? defaultSaveData(); this.diagnostics.push("Saving unavailable. Changes are kept for this session."); this.fallback(); }
    return Object.freeze({ ...this.status(), data: this.data });
  }
  updateSettings(patch: Partial<PresentationSettings>): void { this.persist(validateSave({ ...this.data, settings: { ...this.data.settings, ...patch } })); }
  acceptRunResult(value: RunResult): Readonly<{ accepted: boolean; newRecord: boolean }> {
    const result = validateRunResult(value);
    if (this.accepted.has(result.sessionId)) return Object.freeze({ accepted: false, newRecord: false });
    this.accepted.add(result.sessionId);
    const newRecord = result.score > this.data.rampage.bestScore;
    this.persist(validateSave({ ...this.data, rampage: newRecord ? { bestScore: result.score, bestRun: result } : this.data.rampage, onboarding: { rampageSeen: true } }));
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
function isFuture(value: unknown): boolean { return value !== null && typeof value === "object" && "schemaVersion" in value && typeof value.schemaVersion === "number" && value.schemaVersion > 1; }
