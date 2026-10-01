import type { SaveRepository } from "./SaveRepository";
export class MemorySaveRepository implements SaveRepository {
  private readonly values = new Map<string, string>();
  load(key: string): string | null { return this.values.get(key) ?? null; }
  replace(key: string, value: string): void { this.values.set(key, value); }
}
