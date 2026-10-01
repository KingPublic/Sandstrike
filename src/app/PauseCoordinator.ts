export const PAUSE_REASONS = Object.freeze([
  "user",
  "visibility",
  "focus",
  "orientation",
  "system",
] as const);

export type PauseReason = (typeof PAUSE_REASONS)[number];
export type PauseChangeHandler = (
  paused: boolean,
  reasons: readonly PauseReason[],
) => void;

export class PauseCoordinator {
  private readonly active = new Set<PauseReason>();

  constructor(private readonly onChange?: PauseChangeHandler) {}

  get reasons(): readonly PauseReason[] {
    return Object.freeze(
      PAUSE_REASONS.filter((reason) => this.active.has(reason)),
    );
  }

  get paused(): boolean {
    return this.active.size > 0;
  }

  add(reason: PauseReason): void {
    this.assertReason(reason);
    const sizeBefore = this.active.size;
    this.active.add(reason);
    if (this.active.size !== sizeBefore) {
      this.notify();
    }
  }

  remove(reason: PauseReason): void {
    this.assertReason(reason);
    if (this.active.delete(reason)) {
      this.notify();
    }
  }

  has(reason: PauseReason): boolean {
    this.assertReason(reason);
    return this.active.has(reason);
  }

  clear(): void {
    if (this.active.size === 0) {
      return;
    }
    this.active.clear();
    this.notify();
  }

  private notify(): void {
    this.onChange?.(this.paused, this.reasons);
  }

  private assertReason(reason: PauseReason): void {
    if (!(PAUSE_REASONS as readonly string[]).includes(reason)) {
      throw new RangeError(`Unsupported pause reason: ${reason}`);
    }
  }
}
