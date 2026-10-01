import { describe, expect, it } from "vitest";
import { EventQueue } from "../../src/game/domain/events/EventQueue";
import type { DomainEvent } from "../../src/game/domain/events/DomainEvent";

describe("EventQueue", () => {
  it("drains FIFO immutable copies without recursive delivery", () => {
    const queue = new EventQueue(2);
    const event = { type: "worm-breached", tick: 1, position: { x: 2, y: 3 } } satisfies DomainEvent;
    queue.publish(event);
    event.position.x = 99;
    queue.publish({ ...event, tick: 2 });
    const drained = queue.drain();
    expect(drained.map((value) => value.tick)).toEqual([1, 2]);
    expect(drained[0]).toMatchObject({ position: { x: 2 } });
    expect(Object.isFrozen(drained)).toBe(true);
    expect(Object.isFrozen(drained[0])).toBe(true);
    expect(Object.isFrozen((drained[0] as typeof event).position)).toBe(true);
    queue.publish({ ...event, tick: 3 });
    expect(drained).toHaveLength(2);
    expect(queue.drain()).toHaveLength(1);
  });

  it("bounds each boundary and records overflow outside the event queue", () => {
    const queue = new EventQueue(1);
    const event = { type: "worm-breached", tick: 1, position: { x: 0, y: 0 } } as const;
    expect(queue.publish(event)).toBe(true);
    expect(queue.publish(event)).toBe(false);
    expect(queue.overflowCount).toBe(1);
    expect(queue.drain()).toHaveLength(1);
    expect(queue.publish(event)).toBe(true);
    expect(() => new EventQueue(0)).toThrow(RangeError);
  });
});
