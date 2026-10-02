import { describe, expect, it } from "vitest";
import { FeedbackController, defaultPresentationSettings } from "../../src/game/rendering/FeedbackController";
import type { DomainEvent } from "../../src/game/domain/events/DomainEvent";

const hit = (tick: number, abilityId = "ability.bite", blocked?: "armor"): Extract<DomainEvent, { type: "damage-applied" }> => ({ type: "damage-applied", tick, sourceId: "worm", targetId: "prey", abilityId, amount: blocked ? 0 : 15, ...(blocked ? { blocked } : {}), tags: [], position: { x: 0, y: 0 } });
describe("bounded accessible feedback", () => {
  it("preserves separate simultaneous projectile hit and protection cues", () => {
    const commands = new FeedbackController().consume([{ ...hit(1), sourceId: "projectile.1", targetId: "worm" }, { ...hit(1), sourceId: "projectile.2", targetId: "worm", blocked: "invulnerable", amount: 0 }], defaultPresentationSettings);
    expect(commands.map((command) => command.label)).toEqual(["Damage", "Protected"]);
  });
  it("distinguishes Bite, impact, damage, armor, heal, warning and failure with text and shapes", () => {
    const events: DomainEvent[] = [hit(1), hit(2, "ability.impact"), { ...hit(3), sourceId: "projectile.1", targetId: "worm" }, hit(4, "ability.bite", "armor"), { type: "actor-healed", tick: 5, actorId: "worm", amount: 8, position: { x: 0, y: 0 } }, { type: "response-warning", tick: 6, band: 1 }, { type: "worm-defeated", tick: 7, position: { x: 0, y: 0 } }, { type: "low-health-warning", tick: 8, position: { x: 0, y: 0 } }];
    const commands = new FeedbackController().consume(events, defaultPresentationSettings);
    expect(new Set(commands.map((cue) => cue.label)).size).toBe(8);
    expect(commands.every((cue) => cue.label.length > 0 && cue.shape.length > 0)).toBe(true);
    expect(commands.every((cue) => cue.tone === undefined)).toBe(true);
  });
  it("deduplicates events, caps particles and obeys reduced motion/flashes/shake", () => {
    const controller = new FeedbackController();
    const events = Array.from({ length: 80 }, (_, tick) => hit(tick));
    const commands = controller.consume(events, defaultPresentationSettings, true);
    expect(commands.length).toBeLessThanOrEqual(40);
    expect(commands.reduce((sum, cue) => sum + cue.particles, 0)).toBeLessThanOrEqual(48);
    expect(controller.consume(events, defaultPresentationSettings, true)).toHaveLength(0);
    const reduced = new FeedbackController().consume([hit(1)], { ...defaultPresentationSettings, reducedMotion: true, reducedFlashes: true, shake: 0 }, true);
    expect(reduced[0]).toMatchObject({ particles: 0, shake: 0, flash: false });
    expect(reduced[0]?.label).toBe("Bite");
  });
});
