import { characterForRole } from "../../data/characters";
import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";

export const RampageHudModel = {
  fromSnapshot(snapshot: SessionSnapshot, reducedMotion = false) {
    const health = snapshot.actors.find((actor) => actor.id === "worm")?.health ?? 0;
    const bite = (snapshot.abilities[0]?.cooldownTicksRemaining ?? 0) / 60;
    const combo = snapshot.combo;
    const skillName = characterForRole("rampage", snapshot.characterId)?.skill.name ?? "Sandguard";
    return Object.freeze({ health, score: snapshot.score.points,
      comboLabel: `${String(combo.multiplier)}x · ${String(combo.chain)} chain${combo.phase === "decay" ? " · Fading" : ""}`,
      comboProgress: combo.phase === "decay" ? combo.decayTicksRemaining / 45 : combo.graceTicksRemaining / 180,
      threatLabel: snapshot.threat.warningTicksRemaining > 0 ? `Incoming · ${(snapshot.threat.warningTicksRemaining / 60).toFixed(1)}s` : `Response ${String(snapshot.threat.band)}`,
      biteLabel: snapshot.arcade ? snapshot.abilities[0]?.active ? `${skillName} · active ${((snapshot.abilities[0].activeUntilTick - snapshot.tick) / 60).toFixed(1)}s` : bite > 0 ? `${skillName} · ${bite.toFixed(1)}s` : `${skillName} · ready` : bite > 0 ? `Bite · ${bite.toFixed(1)}s` : "Bite · ready",
      burstLabel: snapshot.worm.burstCooldownSeconds > 0 ? `Burst · ${snapshot.worm.burstCooldownSeconds.toFixed(1)}s` : snapshot.actors.some((actor) => actor.lifecycle === "active" && actor.tags.includes("aerial")) ? "Burst · hold up to leap" : "Burst · ready",
      status: health <= 25 ? "Low health · consume prey" : "Burrow. Breach. Chain.",
      motionLabel: reducedMotion ? "Reduced motion" : "Full motion",
    });
  }
};
