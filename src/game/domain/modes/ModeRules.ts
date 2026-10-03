import type { DomainEvent } from "../events/DomainEvent";
import type { SessionCommand } from "../session/SessionCommand";
import type { SessionSnapshot } from "../session/SessionSnapshot";
import type { RunResult } from "./RunResult";
export interface ModeUpdate { readonly result: RunResult | undefined; readonly events: readonly DomainEvent[] }
export interface ModeRules { observe(snapshot: SessionSnapshot, events: readonly DomainEvent[], commands: readonly SessionCommand[]): ModeUpdate }
