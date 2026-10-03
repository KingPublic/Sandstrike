import { expect, it } from "vitest";
import { synthesizeSound } from "../../src/game/infrastructure/phaser/SoundSynthesis";
import type { SoundVoice } from "../../src/game/rendering/FeedbackController";

it("renders finite bounded samples with distinct gun bodies and a longer heavy blast", () => {
  const voices: SoundVoice[] = ["rifle", "carbine", "smg", "burst", "sidearm", "rpg", "ally", "shield", "heal", "mark", "grapple", "decoy", "fire", "venom", "shock", "surge", "leap", "boss", "impact", "hit", "warning", "neutral", "pickup", "reload", "step", "wind", "rotor"];
  for (const voice of voices) {
    const samples = synthesizeSound(voice, 24000);
    expect(samples.every(value => Number.isFinite(value) && Math.abs(value) <= .951)).toBe(true);
    expect(samples.reduce((sum, value) => sum + value * value, 0)).toBeGreaterThan(.1);
    expect(Math.abs(samples.at(-1) ?? 0)).toBeLessThan(.02);
  }
  expect(synthesizeSound("rpg", 24000).length).toBeGreaterThan(synthesizeSound("rifle", 24000).length * 2);
  expect(synthesizeSound("rifle", 24000).slice(0, 100)).not.toEqual(synthesizeSound("sidearm", 24000).slice(0, 100));
});
