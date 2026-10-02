import { freezeRecord } from "../actors/Actor";
import { bossBalance } from "../../data/bossBalance";
import type { DomainEvent } from "../events/DomainEvent";
import type { SessionCommand } from "../session/SessionCommand";
import type { SessionSnapshot } from "../session/SessionSnapshot";
import type { ModeRules, ModeUpdate } from "./ModeRules";
import type { HuntRunResult } from "./RunResult";
const BURIAL_DEATH_DEPTH = 1200;

export class HuntRules implements ModeRules {
  private ended = false;
  observe(snapshot: SessionSnapshot, _events: readonly DomainEvent[], commands: readonly SessionCommand[]): ModeUpdate {
    const hunt = snapshot.hunt;
    if (!hunt) throw new Error("Hunt snapshot missing.");
    if (this.ended) return { result: undefined, events: [] };
    const hp = (id: string) => snapshot.actors.find(a => a.id === id)?.health ?? 0;
    const world = snapshot.world;
    const hunter = snapshot.actors.find(a => a.id === "hunter");
    const buried = world !== undefined && hunter !== undefined && hunter.position.y > world.surfaceY + BURIAL_DEATH_DEPTH;
    const bossDefeated = world !== undefined && hunt.boss.stage === "boss" && hp("worm") <= 0;
    // Lethal Hunter damage keeps priority over a simultaneous boss defeat.
    const reason = hp("hunter") <= 0 ? "hunter-defeated"
      : world ? (buried ? "hunter-buried" : bossDefeated ? "victory" : commands.length ? "player-ended" : undefined)
        : hp("relay") <= 0 ? "relay-destroyed" : hp("worm") <= 0 ? "victory" : commands.length ? "player-ended" : undefined;
    if (!reason) return { result: undefined, events: [] };
    this.ended = true;
    const durationSeconds = snapshot.tick / 60;
    const bonus = reason !== "victory" ? 0
      : world ? bossBalance.victoryBonus + Math.floor(hp("hunter") * 2)
        : Math.floor(hp("relay") * 5 + hp("hunter") * 2 + Math.max(0, 1800 - Math.floor(durationSeconds * 5)));
    const result: HuntRunResult = freezeRecord({ sessionId: snapshot.sessionId, seed: snapshot.seed, mode: "hunt", reason, score: hunt.score + bonus, durationSeconds, maximumCombo: 0, trapTriggers: hunt.trapTriggers, breachInterruptions: hunt.breachInterruptions, shotsFired: hunt.shotsFired, shotsHit: hunt.shotsHit, exposureWindowsUsed: hunt.exposureWindowsUsed, hunterHealth: hp("hunter"), relayIntegrity: hp("relay"), eligibleForRecords: hunt.eligibleForRecords, ...(world ? { bossDefeated: bossDefeated && reason === "victory" } : {}) });
    return freezeRecord({ result, events: [{ type: "run-ended", tick: snapshot.tick, result }] });
  }
}
