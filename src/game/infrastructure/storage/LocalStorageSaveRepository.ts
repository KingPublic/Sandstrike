import type { SaveRepository } from "./SaveRepository";
export class LocalStorageSaveRepository implements SaveRepository {
  load(key: string): string | null { return window.localStorage.getItem(key); }
  replace(key: string, value: string): void { window.localStorage.setItem(key, value); }
}
