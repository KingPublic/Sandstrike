import { FixedStepRunner } from "../domain/session/FixedStepRunner";
import type { GameSession } from "../domain/session/GameSession";
import type { MovementFrameResult } from "../domain/session/MovementPipeline";
import type { SessionStepResult } from "../domain/session/SessionStepResult";
import type { DomainEvent } from "../domain/events/DomainEvent";
import type { RunResult } from "../domain/modes/RunResult";
import { neutralActionFrame, type ActionFrame } from "../input/ActionFrame";
import { RunFactory, type RunConfiguration } from "./RunFactory";

export interface SessionInputPort { sample(tick: number): ActionFrame; clear(): void }
export class SessionController {
  private session: GameSession | undefined;
  private input: SessionInputPort | undefined;
  private readonly runner = new FixedStepRunner();
  private paused = false;
  private configuration: RunConfiguration = Object.freeze({ seed: 0x5a17d });
  private accepted: RunResult | undefined;
  constructor(private readonly factory = new RunFactory()) {}
  get result(): RunResult | undefined { return this.accepted; }
  get active(): boolean { return this.session !== undefined && this.accepted === undefined; }
  attachInput(input: SessionInputPort): void { this.input?.clear(); this.input = input; }
  start(configuration: RunConfiguration = { seed: this.configuration.seed + 7919 }): void {
    this.input?.clear(); this.runner.reset(); this.paused = false; this.accepted = undefined;
    this.configuration = Object.freeze({ ...configuration }); this.session = this.factory.create(this.configuration);
  }
  restart(): void { this.start({ ...this.configuration, seed: this.configuration.seed + 7919 }); }
  pause(): void { this.paused = true; this.input?.clear(); this.runner.reset(); }
  resume(): void { this.input?.clear(); this.runner.reset(); this.paused = false; }
  resetTiming(): void { this.runner.reset(); }
  snapshot() { return this.requireSession().snapshot(); }
  advance(deltaMs: number): MovementFrameResult {
    const session = this.requireSession(); const events: DomainEvent[] = [];
    let lastAction: ActionFrame | undefined;
    const report = this.runner.advance(this.paused || this.accepted ? 0 : deltaMs, () => {
      if (this.accepted) return;
      const action = this.input?.sample(session.nextTick) ?? neutralActionFrame(session.nextTick);
      lastAction = action;
      const result = session.step(action); events.push(...result.events); this.accepted ??= result.result;
    });
    const frame = { report, snapshot: session.snapshot(), events: Object.freeze(events) };
    return Object.freeze(lastAction ? { ...frame, lastAction } : frame);
  }
  requestEnd(): SessionStepResult {
    const session = this.requireSession();
    session.queueCommand({ type: "RequestEnd", reason: "player-ended", requestedTick: session.tick });
    const result = session.flushControlCommands(); this.accepted ??= result.result; this.input?.clear(); this.runner.reset(); return result;
  }
  destroy(): void { this.input?.clear(); this.input = undefined; this.session = undefined; this.accepted = undefined; this.runner.reset(); }
  private requireSession(): GameSession { if (!this.session) throw new Error("No active session."); return this.session; }
}
