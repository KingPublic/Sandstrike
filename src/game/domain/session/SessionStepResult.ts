import type { DomainEvent } from "../events/DomainEvent";
import type { SessionSnapshot } from "./SessionSnapshot";
import type { RunResult } from "../modes/RunResult";

export interface SessionStepResult {
  readonly result: RunResult | undefined;
  readonly snapshot: SessionSnapshot;
  readonly events: readonly DomainEvent[];
}
