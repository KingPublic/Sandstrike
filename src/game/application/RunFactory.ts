import { GameSession } from "../domain/session/GameSession";
import { arcadeMovementBalance } from "../data/arcadeMovementBalance";
import { movementBalance } from "../data/movementBalance";
import { FlatTerrainProfile } from "../domain/terrain/FlatTerrainProfile";
import { spawnActor } from "../data/actors";
import type { ThemeId } from "../data/themes";

export interface RunConfiguration { readonly seed: number; readonly fixtureId?: string; readonly mode?: "rampage" | "hunt"; readonly debugAI?: boolean; readonly aimAssist?: number; readonly themeId?: ThemeId }
export class RunFactory {
  private sequence = 0;
  constructor(private readonly namespace = Date.now().toString(36)) {}
  create(configuration: RunConfiguration): GameSession {
    this.sequence += 1;
    if (configuration.mode === "hunt") {
      const fixture = configuration.fixtureId;
      const hunter = spawnActor("hunter", "actor.hunter", { x: -180, y: -16 }), relay = spawnActor("relay", "actor.relay", { x: 0, y: -30 });
      const defeat = fixture === "hunter-defeat" || fixture === "relay-defeat";
      const trap = fixture === "hunt-trap";
      const movement = fixture === "hunt-victory" ? { ...movementBalance, initialPosition: { x: 100, y: -80 } } : defeat ? { ...movementBalance, initialPosition: { x: fixture === "hunter-defeat" ? -180 : 0, y: 28 }, initialDirection: { x: 0, y: -1 }, initialSpeed: 360 } : trap ? { ...movementBalance, initialPosition: { x: -180, y: 100 }, initialDirection: { x: 0, y: -1 }, initialSpeed: 90 } : movementBalance;
      return new GameSession({ themeId: configuration.themeId ?? "desert", sessionId: `${this.namespace}.${String(this.sequence)}`, mode: "hunt", seed: configuration.seed, debugAI: configuration.debugAI ?? false, aimAssist: configuration.aimAssist ?? .35, movement, terrain: new FlatTerrainProfile(0), ...(fixture === "hunt-victory" ? { playerHealth: 8 } : {}), actors: [{ ...hunter, health: fixture === "hunter-defeat" ? 10 : hunter.health }, { ...relay, health: fixture === "relay-defeat" ? 10 : relay.health }] });
    }
    const stress = configuration.fixtureId === "phase-b-smoke";
    const defeat = configuration.fixtureId === "rampage-defeat";
    const breach = stress || configuration.fixtureId === "surface-breach" || configuration.fixtureId === "combat-breach" || configuration.fixtureId === "rampage-short";
    const laboratory = configuration.fixtureId === "surface-breach";
    const advancedBand = configuration.fixtureId === "rampage-band-3" ? 3 : configuration.fixtureId === "rampage-band-2" ? 2 : undefined;
    const arcade = configuration.mode === "rampage" && configuration.fixtureId === undefined;
    const movement = arcade ? arcadeMovementBalance : breach ? { ...movementBalance, initialPosition: { x: 0, y: 28 }, initialDirection: { x: 0, y: -1 }, initialSpeed: movementBalance.cruiseSpeed } : movementBalance;
    const actors = stress ? [
      ...Array.from({ length: 3 }, (_, index) => spawnActor(`smoke.prey.${String(index + 1)}`, "actor.prey", { x: 0, y: -10 })),
      ...Array.from({ length: 4 }, (_, index) => spawnActor(`smoke.infantry.${String(index + 1)}`, "actor.infantry", { x: 0, y: -16 })),
    ] : laboratory ? [] : [spawnActor("opening.prey.1", "actor.prey", { x: 260, y: -10 }), spawnActor("opening.prey.2", "actor.prey", { x: 440, y: -10 }), spawnActor("opening.prey.3", "actor.prey", { x: -320, y: -10 }), ...(configuration.fixtureId === "combat-breach" ? [spawnActor("opening.infantry", "actor.infantry", { x: 180, y: -16 })] : [])];
    const shots = stress ? [{ position: { x: -26, y: 22 }, direction: { x: 1, y: 0 } }, { position: { x: -26, y: 22 }, direction: { x: 1, y: 0 } }] : defeat ? [{ position: { x: -26, y: 180 }, direction: { x: 1, y: 0 } }] : [];
    const advancedActors = advancedBand ? [...actors, spawnActor("opening.vehicle", "actor.vehicle", { x: 300, y: -18 }), ...(advancedBand === 3 ? [spawnActor("opening.aerial", "actor.aerial", { x: 300, y: -220 })] : [])] : actors;
    return new GameSession({ themeId: configuration.themeId ?? "desert", sessionId: `${this.namespace}.${String(this.sequence)}`, seed: configuration.seed, arcade, movement: advancedBand ? { ...movementBalance, initialPosition: { x: 0, y: 28 }, initialDirection: { x: 0, y: -1 }, initialSpeed: 360 } : movement, terrain: new FlatTerrainProfile(0), actors: advancedActors, ...(advancedBand ? { initialBand: advancedBand } : {}), ...(laboratory ? {} : { mode: "rampage" }), ...(stress || defeat ? { playerHealth: stress ? 30 : 10, initialProjectiles: shots } : {}) });
  }
}
