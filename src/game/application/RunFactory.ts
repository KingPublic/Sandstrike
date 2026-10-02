import { GameSession } from "../domain/session/GameSession";
import { movementBalance } from "../data/movementBalance";
import { FlatTerrainProfile } from "../domain/terrain/FlatTerrainProfile";
import { spawnActor } from "../data/actors";

export interface RunConfiguration { readonly seed: number; readonly fixtureId?: string; readonly mode?: "rampage" | "hunt"; readonly debugAI?: boolean }
export class RunFactory {
  private sequence = 0;
  constructor(private readonly namespace = Date.now().toString(36)) {}
  create(configuration: RunConfiguration): GameSession {
    this.sequence += 1;
    if (configuration.mode === "hunt") return new GameSession({ sessionId: `${this.namespace}.${String(this.sequence)}`, mode: "hunt", seed: configuration.seed, debugAI: configuration.debugAI ?? false, movement: movementBalance, terrain: new FlatTerrainProfile(0), actors: [spawnActor("hunter", "actor.hunter", { x: -180, y: -16 }), spawnActor("relay", "actor.relay", { x: 0, y: -30 })] });
    const stress = configuration.fixtureId === "phase-b-smoke";
    const defeat = configuration.fixtureId === "rampage-defeat";
    const breach = stress || configuration.fixtureId === "surface-breach" || configuration.fixtureId === "combat-breach" || configuration.fixtureId === "rampage-short";
    const laboratory = configuration.fixtureId === "surface-breach";
    const movement = breach ? { ...movementBalance, initialPosition: { x: 0, y: 28 }, initialDirection: { x: 0, y: -1 }, initialSpeed: movementBalance.cruiseSpeed } : movementBalance;
    const actors = stress ? [
      ...Array.from({ length: 3 }, (_, index) => spawnActor(`smoke.prey.${String(index + 1)}`, "actor.prey", { x: 0, y: -10 })),
      ...Array.from({ length: 4 }, (_, index) => spawnActor(`smoke.infantry.${String(index + 1)}`, "actor.infantry", { x: 0, y: -16 })),
    ] : laboratory ? [] : [spawnActor("opening.prey.1", "actor.prey", { x: 260, y: -10 }), spawnActor("opening.prey.2", "actor.prey", { x: 440, y: -10 }), spawnActor("opening.prey.3", "actor.prey", { x: -320, y: -10 }), ...(configuration.fixtureId === "combat-breach" ? [spawnActor("opening.infantry", "actor.infantry", { x: 180, y: -16 })] : [])];
    const shots = stress ? [{ position: { x: -26, y: 22 }, direction: { x: 1, y: 0 } }, { position: { x: -26, y: 22 }, direction: { x: 1, y: 0 } }] : defeat ? [{ position: { x: -26, y: 180 }, direction: { x: 1, y: 0 } }] : [];
    return new GameSession({ sessionId: `${this.namespace}.${String(this.sequence)}`, seed: configuration.seed, movement, terrain: new FlatTerrainProfile(0), actors, ...(laboratory ? {} : { mode: "rampage" }), ...(stress || defeat ? { playerHealth: stress ? 30 : 10, initialProjectiles: shots } : {}) });
  }
}
