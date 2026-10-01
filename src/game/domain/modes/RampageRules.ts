import { freezeRecord } from "../actors/Actor";
import type { DomainEvent } from "../events/DomainEvent";
import type { SessionCommand } from "../session/SessionCommand";
import type { SessionSnapshot } from "../session/SessionSnapshot";
import type { ModeRules, ModeUpdate } from "./ModeRules";
import type { RunResult } from "./RunResult";

export class RampageRules implements ModeRules {
  private ended = false;
  private healed = 0;
  private highestBand = 0;
  constructor(private readonly stepSeconds = 1 / 60) {}
  observe(snapshot: SessionSnapshot, events: readonly DomainEvent[], commands: readonly SessionCommand[]): ModeUpdate {
    if (this.ended) return Object.freeze({ result: undefined, events: Object.freeze([]) });
    for (const event of events) if (event.type === "actor-healed" && event.actorId === "worm") this.healed += event.amount;
    this.highestBand = Math.max(this.highestBand, snapshot.threat.band);
    const defeated = (snapshot.actors.find((actor) => actor.id === "worm")?.health ?? 0) <= 0;
    if (!defeated && commands.length === 0) return Object.freeze({ result: undefined, events: Object.freeze([]) });
    this.ended = true;
    const result: RunResult = freezeRecord({ sessionId: snapshot.sessionId, seed: snapshot.seed, mode: "rampage", reason: defeated ? "defeated" : "player-ended", score: snapshot.score.points, durationSeconds: snapshot.tick * this.stepSeconds, maximumCombo: snapshot.combo.maximumChain, preyConsumed: snapshot.score.preyConsumed, infantryDestroyed: snapshot.score.infantryDestroyed, highestBand: this.highestBand, healthRecovered: this.healed });
    return freezeRecord({ result, events: [{ type: "run-ended", tick: snapshot.tick, result }] });
  }
}
