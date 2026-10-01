import type { DomainEvent } from "../events/DomainEvent";
import type { SessionSnapshot } from "./SessionSnapshot";

export interface SessionStepResult {
  readonly snapshot: SessionSnapshot;
  readonly events: readonly DomainEvent[];
}
