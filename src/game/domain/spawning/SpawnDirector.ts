import { rampageBalance as balance } from "../../data/rampageBalance";
import type { ActorState } from "../actors/Actor";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { RandomStream } from "../random/RandomSource";
import type { ResponseBand } from "./ThreatDirector";

export interface SpawnCommand { readonly id: string; readonly definitionId: string; readonly position: Vec2 }
export interface SpawnSnapshot {
  readonly tick: number; readonly actors: readonly ActorState[]; readonly playerPosition: Vec2;
  readonly playerHealth: number; readonly band: ResponseBand; readonly cameraHalfWidth: number; readonly surfaceY: number;
}
export class SpawnDirector {
  private nextId = 0;
  private preyTick = 0;
  private infantryTick = 0;
  private vehicleTick = 0; private aerialTick = 0;
  step(snapshot: SpawnSnapshot, random: RandomStream): readonly SpawnCommand[] {
    const active = snapshot.actors.filter((actor) => actor.lifecycle === "active");
    const preyCount = active.filter((actor) => actor.tags.includes("prey")).length;
    const infantryCount = active.filter((actor) => actor.tags.includes("infantry")).length;
    const needPrey = preyCount < balance.preyCap && (snapshot.tick >= this.preyTick || (snapshot.playerHealth < balance.lowHealthThreshold && preyCount < 2));
    const needInfantry = snapshot.band >= 1 && infantryCount < balance.infantryCap && snapshot.tick >= this.infantryTick;
    const needVehicle = snapshot.band >= 2 && active.filter(a => a.tags.includes("vehicle")).length < balance.vehicleCap && snapshot.tick >= this.vehicleTick;
    const needAerial = snapshot.band >= 3 && active.filter(a => a.tags.includes("aerial")).length < balance.aerialCap && snapshot.tick >= this.aerialTick;
    if (!needPrey && !needInfantry && !needVehicle && !needAerial) return Object.freeze([]);
    const definitionId = needPrey ? "actor.prey" : needInfantry ? "actor.infantry" : needVehicle ? "actor.vehicle" : "actor.aerial";
    const y = snapshot.surfaceY - (needPrey ? 10 : needInfantry ? 16 : needVehicle ? 18 : 220);
    const left = balance.arena.left + 40;
    const right = balance.arena.right - 40;
    for (let attempt = 0; attempt < 32; attempt += 1) {
      const x = left + random.float() * (right - left);
      if (Math.abs(x - snapshot.playerPosition.x) <= snapshot.cameraHalfWidth + balance.cameraLead || active.some((actor) => Math.abs(actor.position.x - x) < balance.spawnClearance)) continue;
      if (needPrey) this.preyTick = snapshot.tick + balance.preyCadenceTicks;
      else if (needInfantry) this.infantryTick = snapshot.tick + balance.infantryCadenceTicks;
      else if (needVehicle) this.vehicleTick = snapshot.tick + balance.vehicleCadenceTicks;
      else this.aerialTick = snapshot.tick + balance.aerialCadenceTicks;
      return freezeRecord([{ id: `spawn.${String(++this.nextId)}`, definitionId, position: { x, y } }]);
    }
    return Object.freeze([]);
  }
}
