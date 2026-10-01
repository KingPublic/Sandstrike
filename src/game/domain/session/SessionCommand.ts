export type SessionCommand = Readonly<{ type: "RequestEnd"; reason: "player-ended"; requestedTick: number }>;
