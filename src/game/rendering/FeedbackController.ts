import type { DomainEvent } from "../domain/events/DomainEvent";
import type { Vec2 } from "../domain/math/Vector2";

export interface PresentationSettings {
  readonly aimAssist: number;
  readonly masterVolume: number; readonly musicVolume: number; readonly effectsVolume: number;
  readonly shake: number; readonly reducedMotion: boolean; readonly reducedFlashes: boolean;
  readonly highContrast: boolean; readonly leftHanded: boolean; readonly touchOpacity: number; readonly haptics: boolean;
}
export const defaultPresentationSettings: PresentationSettings = Object.freeze({ aimAssist: 0.35, masterVolume: 0.7, musicVolume: 0.5, effectsVolume: 0.7, shake: 0.5, reducedMotion: false, reducedFlashes: false, highContrast: false, leftHanded: false, touchOpacity: 0.85, haptics: false });
export interface FeedbackCommand {
  readonly label: string; readonly shape: "ring" | "cross" | "shield" | "diamond";
  readonly position: Vec2 | undefined; readonly color: number;
  readonly particles: number; readonly shake: number; readonly flash: boolean;
  readonly tone: number | undefined; readonly haptic: boolean;
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
      if (!cue || commands.length >= 32) continue;
      const particles = settings.reducedMotion ? 0 : Math.min(remainingParticles, cue.label === "Heal" ? 3 : 8);
      remainingParticles -= particles;
      commands.push(Object.freeze({ ...cue, position: "position" in event ? event.position : undefined, particles, shake: settings.reducedMotion ? 0 : settings.shake * (cue.label === "Impact" ? 0.005 : 0.002), flash: !settings.reducedFlashes && !settings.reducedMotion, tone: audioReady && settings.masterVolume * settings.effectsVolume > 0 ? cue.tone : undefined, haptic: settings.haptics && !settings.reducedMotion }));
    }
    return Object.freeze(commands);
  }
}

function cueFor(event: DomainEvent): Pick<FeedbackCommand, "label" | "shape" | "color" | "tone"> | undefined {
  switch (event.type) {
    case "damage-applied":
      if (event.blocked === "armor") return { label: "Armored", shape: "shield", color: 0xdce8f1, tone: 170 };
      if (event.blocked) return { label: "Protected", shape: "shield", color: 0xdce8f1, tone: 220 };
      if (event.targetId === "worm") return { label: "Damage", shape: "cross", color: 0xff756b, tone: 100 };
      return event.abilityId === "ability.impact" ? { label: "Impact", shape: "diamond", color: 0xffc774, tone: 135 } : { label: "Bite", shape: "ring", color: 0xffe4a1, tone: 260 };
    case "actor-healed": return event.amount > 0 ? { label: "Heal", shape: "cross", color: 0x98f5c1, tone: 620 } : undefined;
    case "infantry-telegraph": return { label: "Aim locked", shape: "diamond", color: 0xffbb77, tone: 440 };
    case "worm-breached": return { label: "Breach", shape: "ring", color: 0xffd59b, tone: 180 };
    case "worm-reentered": return { label: "Burrow", shape: "ring", color: 0xc98961, tone: 130 };
    case "response-warning": return { label: "Infantry incoming", shape: "diamond", color: 0xffbd78, tone: 330 };
    case "response-band-changed": return { label: "Response 1 active", shape: "shield", color: 0xffbd78, tone: 390 };
    case "worm-defeated": return { label: "Defeated", shape: "cross", color: 0xff756b, tone: 80 };
    case "low-health-warning": return { label: "Low health · consume prey", shape: "cross", color: 0xff756b, tone: 120 };
    default: return undefined;
  }
}
