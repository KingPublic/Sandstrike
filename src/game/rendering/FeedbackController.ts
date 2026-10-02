import type { DomainEvent } from "../domain/events/DomainEvent";
import type { Vec2 } from "../domain/math/Vector2";

export interface PresentationSettings {
  readonly aimAssist: number;
  readonly masterVolume: number; readonly musicVolume: number; readonly effectsVolume: number;
  readonly shake: number; readonly reducedMotion: boolean; readonly reducedFlashes: boolean;
  readonly highContrast: boolean; readonly leftHanded: boolean; readonly touchOpacity: number; readonly haptics: boolean;
}
export const defaultPresentationSettings: PresentationSettings = Object.freeze({ aimAssist: 0.35, masterVolume: 0.7, musicVolume: 0.5, effectsVolume: 0.7, shake: 0.5, reducedMotion: false, reducedFlashes: false, highContrast: false, leftHanded: false, touchOpacity: 0.85, haptics: false });
/** Distinct procedural voices so every weapon, skill and ally reads differently. */
export type SoundVoice =
  | "rifle" | "carbine" | "smg" | "burst" | "sidearm" | "rpg" | "ally"
  | "shield" | "heal" | "mark" | "grapple" | "decoy"
  | "fire" | "venom" | "shock" | "surge" | "boss" | "impact" | "hit" | "warning" | "neutral";
export interface FeedbackCommand {
  readonly label: string; readonly shape: "ring" | "cross" | "shield" | "diamond";
  readonly position: Vec2 | undefined; readonly color: number;
  readonly particles: number; readonly shake: number; readonly flash: boolean;
  readonly tone: number | undefined; readonly haptic: boolean;
  readonly voice: SoundVoice;
}
export class FeedbackController {
  private readonly seen = new Set<string>();
  consume(events: readonly DomainEvent[], settings: PresentationSettings, audioReady = false): readonly FeedbackCommand[] {
    const commands: FeedbackCommand[] = [];
    let remainingParticles = 48;
    for (const event of events) {
      const identity = `${event.type}:${String(event.tick)}:${"targetId" in event ? event.targetId : "actorId" in event ? event.actorId : ""}:${"sourceId" in event ? event.sourceId : ""}:${"abilityId" in event ? event.abilityId : ""}`;
      if (this.seen.has(identity)) continue;
      this.seen.add(identity);
      if (this.seen.size > 4096) { const oldest = this.seen.values().next().value; if (oldest !== undefined) this.seen.delete(oldest); }
      const cue = cueFor(event);
      if (!cue || commands.length >= 40) continue;
      const quiet = cue.voice === "ally";
      const particles = settings.reducedMotion ? 0 : Math.min(remainingParticles, quiet ? 0 : cue.label === "Heal" ? 3 : 8);
      remainingParticles -= particles;
      commands.push(Object.freeze({ ...cue, position: "position" in event ? event.position : undefined, particles, shake: settings.reducedMotion || quiet ? 0 : settings.shake * (cue.label === "Impact" ? 0.005 : 0.002), flash: !settings.reducedFlashes && !settings.reducedMotion, tone: audioReady && settings.masterVolume * settings.effectsVolume > 0 ? cue.tone : undefined, haptic: settings.haptics && !settings.reducedMotion && !quiet }));
    }
    return Object.freeze(commands);
  }
}

type Cue = Pick<FeedbackCommand, "label" | "shape" | "color" | "tone" | "voice">;

const WEAPON_VOICES: Readonly<Record<string, SoundVoice>> = Object.freeze({ rifle: "rifle", carbine: "carbine", smg: "smg", "burst-rifle": "burst", sidearm: "sidearm" });
const SKILL_VOICES: Readonly<Record<string, SoundVoice>> = Object.freeze({
  "skill.sandguard": "shield", "skill.shield": "shield",
  "skill.field-heal": "heal", "skill.target-mark": "mark",
  "skill.grapple": "grapple", "skill.decoy": "decoy",
  "skill.fire-fan": "fire", "skill.venom-volley": "venom",
  "skill.shock-breach": "shock", "skill.sky-surge": "surge",
});

function cueFor(event: DomainEvent): Cue | undefined {
  switch (event.type) {
    case "rifle-fired": return { label: "Shot", shape: "diamond", color: 0xfff0c4, tone: 520, voice: WEAPON_VOICES[event.weaponId ?? "rifle"] ?? "rifle" };
    case "rpg-fired": return { label: "RPG", shape: "diamond", color: 0xffc46b, tone: 300, voice: "rpg" };
    case "ally-fired": return { label: "Ally fire", shape: "diamond", color: 0xbfe8dd, tone: 430, voice: "ally" };
    case "ability-activated":
      return { label: "Skill", shape: "ring", color: 0xa8f0d8, tone: 560, voice: SKILL_VOICES[event.abilityId] ?? "neutral" };
    case "damage-applied":
      if (event.blocked === "armor") return { label: "Armored", shape: "shield", color: 0xdce8f1, tone: 170, voice: "impact" };
      if (event.blocked) return { label: "Protected", shape: "shield", color: 0xdce8f1, tone: 220, voice: "impact" };
      if (event.targetId === "worm") return { label: "Damage", shape: "cross", color: 0xff756b, tone: 100, voice: "hit" };
      return event.abilityId === "ability.impact" ? { label: "Impact", shape: "diamond", color: 0xffc774, tone: 135, voice: "impact" } : { label: "Bite", shape: "ring", color: 0xffe4a1, tone: 260, voice: "impact" };
    case "actor-healed": return event.amount > 0 ? { label: "Heal", shape: "cross", color: 0x98f5c1, tone: 620, voice: "heal" } : undefined;
    case "infantry-telegraph": return { label: "Aim locked", shape: "diamond", color: 0xffbb77, tone: 440, voice: "warning" };
    case "worm-breached": return { label: "Breach", shape: "ring", color: 0xffd59b, tone: 180, voice: "impact" };
    case "worm-reentered": return { label: "Burrow", shape: "ring", color: 0xc98961, tone: 130, voice: "impact" };
    case "response-warning": return { label: `Response ${String(event.band)} incoming`, shape: "diamond", color: 0xffbd78, tone: 330, voice: "warning" };
    case "response-band-changed": return { label: `Response ${String(event.band)} active`, shape: "shield", color: 0xffbd78, tone: 390, voice: "warning" };
    case "boss-entrance": return { label: "Boss incoming", shape: "shield", color: 0xff9d6b, tone: 160, voice: "boss" };
    case "worm-defeated": return { label: "Defeated", shape: "cross", color: 0xff756b, tone: 80, voice: "boss" };
    case "low-health-warning": return { label: "Low health · consume prey", shape: "cross", color: 0xff756b, tone: 120, voice: "warning" };
    default: return undefined;
  }
}
