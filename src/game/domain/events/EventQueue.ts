import { freezeRecord } from "../actors/Actor";
import type { DomainEvent } from "./DomainEvent";

export class EventQueue {
  private events: DomainEvent[] = [];
  private overflow = 0;

  constructor(private readonly capacity = 256) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError("Event capacity must be positive.");
  }

  get overflowCount(): number { return this.overflow; }

  publish(event: DomainEvent): boolean {
    if (this.events.length >= this.capacity) { this.overflow += 1; return false; }
    this.events.push(freezeRecord(event));
    return true;
  }

  drain(): readonly DomainEvent[] {
    const events = this.events;
    this.events = [];
    return Object.freeze(events);
  }
}
