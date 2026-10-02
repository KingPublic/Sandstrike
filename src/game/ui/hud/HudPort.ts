import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
export interface HudPort { update(snapshot: SessionSnapshot, reducedMotion?: boolean): void; destroy(): void }
