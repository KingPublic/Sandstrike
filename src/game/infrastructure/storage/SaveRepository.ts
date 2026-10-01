export interface SaveRepository { load(key: string): string | null; replace(key: string, value: string): void }
