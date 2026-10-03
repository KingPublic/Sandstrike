import { describe, expect, it } from "vitest";
import { ThreatDirector } from "../../src/game/domain/spawning/ThreatDirector";

describe("bounded response band", () => {
  it("cannot react to events from a future simulation boundary", () => {
    expect(() => new ThreatDirector().step({ tick: 1, basePoints: 0 }, [{ type: "worm-breached", tick: 2, position: { x: 0, y: 0 } }])).toThrow();
  });
  it.each([{ tick: 2700, basePoints: 0 }, { tick: 30, basePoints: 1000 }])("warns for 120 ticks before activation: %o", (trigger) => {
    const director = new ThreatDirector();
    expect(director.step({ tick: trigger.tick - 1, basePoints: 0 }, []).band).toBe(0);
    expect(director.step(trigger, []).warningTicksRemaining).toBe(120);
    expect(director.step({ ...trigger, tick: trigger.tick + 119 }, []).band).toBe(0);
    expect(director.step({ ...trigger, tick: trigger.tick + 120 }, []).band).toBe(1);
    expect(director.step({ tick: 1_000_000, basePoints: 1_000_000 }, []).band).toBe(1);
  });
});
