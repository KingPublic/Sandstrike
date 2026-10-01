import { GameSession } from "../domain/session/GameSession";
import { movementBalance } from "../data/movementBalance";
import { FlatTerrainProfile } from "../domain/terrain/FlatTerrainProfile";
import { spawnActor } from "../data/actors";

export interface RunConfiguration { readonly seed: number; readonly fixtureId?: string }
export class RunFactory {
  private sequence = 0;
  constructor(private readonly namespace = Date.now().toString(36)) {}
  create(configuration: RunConfiguration): GameSession {
    this.sequence += 1;
    const breach = configuration.fixtureId === "surface-breach" || configuration.fixtureId === "combat-breach" || configuration.fixtureId === "rampage-short";
    const laboratory = configuration.fixtureId === "surface-breach";
    const movement = breach ? { ...movementBalance, initialPosition: { x: 0, y: 28 }, initialDirection: { x: 0, y: -1 }, initialSpeed: movementBalance.cruiseSpeed } : movementBalance;
    const actors = laboratory ? [] : [spawnActor("opening.prey.1", "actor.prey", { x: 260, y: -10 }), spawnActor("opening.prey.2", "actor.prey", { x: 440, y: -10 }), spawnActor("opening.prey.3", "actor.prey", { x: -320, y: -10 }), ...(configuration.fixtureId === "combat-breach" ? [spawnActor("opening.infantry", "actor.infantry", { x: 180, y: -16 })] : [])];
    return new GameSession({ sessionId: `${this.namespace}.${String(this.sequence)}`, seed: configuration.seed, movement, terrain: new FlatTerrainProfile(0), actors, ...(laboratory ? {} : { mode: "rampage" }) });
  }
}
