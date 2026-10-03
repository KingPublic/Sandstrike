import type { InputRouter } from "../../input/InputRouter";
import type { ActionFrame } from "../../input/ActionFrame";
import type { DomainEvent } from "../events/DomainEvent";
import type { FixedStepRunner, StepReport } from "./FixedStepRunner";
import type { GameSession } from "./GameSession";
import type { SessionSnapshot } from "./SessionSnapshot";

export interface MovementFrameResult {
  readonly report: StepReport;
  readonly snapshot: SessionSnapshot;
  readonly events: readonly DomainEvent[];
  readonly lastAction?: ActionFrame;
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
    let lastAction: ActionFrame | undefined;
    const report = this.runner.advance(deltaMs, () => {
      const action = this.input.sample(this.session.nextTick);
      lastAction = action;
      const result = this.session.step(action);
      snapshot = result.snapshot;
      events.push(...result.events);
    });

    const result = {
      report,
      snapshot,
      events: Object.freeze(events),
    };
    return lastAction
      ? Object.freeze({ ...result, lastAction })
      : Object.freeze(result);
  }

  resetTiming(): void {
    this.runner.reset();
  }
}
