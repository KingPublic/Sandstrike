import type { InputRouter } from "../../input/InputRouter";
import type { DomainEvent } from "../events/DomainEvent";
import type { FixedStepRunner, StepReport } from "./FixedStepRunner";
import type { GameSession } from "./GameSession";
import type { SessionSnapshot } from "./SessionSnapshot";

export interface MovementFrameResult {
  readonly report: StepReport;
  readonly snapshot: SessionSnapshot;
  readonly events: readonly DomainEvent[];
}

export class MovementPipeline {
  constructor(
    private readonly runner: FixedStepRunner,
    private readonly input: InputRouter,
    private readonly session: GameSession,
  ) {}

  advance(deltaMs: number): MovementFrameResult {
    const events: DomainEvent[] = [];
    let snapshot = this.session.snapshot();
    const report = this.runner.advance(deltaMs, () => {
      const action = this.input.sample(this.session.nextTick);
      const result = this.session.step(action);
      snapshot = result.snapshot;
      events.push(...result.events);
    });

    return Object.freeze({
      report,
      snapshot,
      events: Object.freeze(events),
    });
  }
}
