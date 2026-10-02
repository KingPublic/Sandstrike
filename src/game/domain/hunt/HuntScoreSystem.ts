import type { DomainEvent } from "../events/DomainEvent";
export class HuntScoreSystem {
  private points = 0;
  observe(events: readonly DomainEvent[]): void {
    for (const e of events) {
      if (e.type === "damage-applied" && e.sourceId === "hunter" && e.targetId === "worm") this.points += Math.floor(e.amount * 10);
      if (e.type === "snare-triggered") this.points += 100;
    }
  }
  interrupt(): void { this.points += 150; }
  get score(): number { return this.points; }
}
