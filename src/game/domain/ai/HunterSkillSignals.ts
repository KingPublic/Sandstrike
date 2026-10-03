import type { SkillFrame } from "../abilities/CharacterSkills";
import type { Vec2 } from "../math/Vector2";

export interface HunterSkillSignals {
  readonly shieldUntilTick: number;
  readonly markedUntilTick: number;
  readonly noise?: Readonly<{ kind: "grapple" | "heal"; position: Vec2 }>;
}

/** Primary and one-use skills publish the same sensory cues to the predator. */
export function hunterSkillSignals(frames: readonly (SkillFrame | undefined)[]): HunterSkillSignals {
  let shieldUntilTick = 0, markedUntilTick = 0;
  let noise: HunterSkillSignals["noise"];
  for (const frame of frames) {
    if (!frame) continue;
    if (frame.ability.id === "skill.shield" && frame.ability.active) shieldUntilTick = Math.max(shieldUntilTick, frame.ability.activeUntilTick);
    markedUntilTick = Math.max(markedUntilTick, frame.markUntilTick);
    if (frame.activated && frame.grapple) noise = { kind: "grapple", position: frame.grapple };
    if (frame.activated && frame.ability.id === "skill.field-heal" && frame.origin) noise = { kind: "heal", position: frame.origin };
  }
  return { shieldUntilTick, markedUntilTick, ...(noise ? { noise } : {}) };
}
