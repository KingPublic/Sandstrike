import { rampageBalance as balance } from "../../data/rampageBalance";
import type { ActorState } from "../actors/Actor";
import { freezeRecord } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { RandomStream } from "../random/RandomSource";

export interface SpawnCommand { readonly id: string; readonly definitionId: string; readonly position: Vec2 }
export interface SpawnSnapshot {
  readonly tick: number; readonly actors: readonly ActorState[]; readonly playerPosition: Vec2;
  readonly playerHealth: number; readonly band: 0 | 1; readonly cameraHalfWidth: number; readonly surfaceY: number;
}
export class SpawnDirector {
  private nextId = 0;
  private preyTick = 0;
  private infantryTick = 0;
  step(snapshot: SpawnSnapshot, random: RandomStream): readonly SpawnCommand[] {
    const active = snapshot.actors.filter((actor) => actor.lifecycle === "active");
    const preyCount = active.filter((actor) => actor.tags.includes("prey")).length;
    const infantryCount = active.filter((actor) => actor.tags.includes("infantry")).length;
    const needPrey = preyCount < balance.preyCap && (snapshot.tick >= this.preyTick || (snapshot.playerHealth < balance.lowHealthThreshold && preyCount < 2));
    const needInfantry = snapshot.band === 1 && infantryCount < balance.infantryCap && snapshot.tick >= this.infantryTick;
    if (!needPrey && !needInfantry) return Object.freeze([]);
    const definitionId = needPrey ? "actor.prey" : "actor.infantry";
    const y = snapshot.surfaceY - (needPrey ? 10 : 16);
    const left = balance.arena.left + 40;
    const right = balance.arena.right - 40;
    for (let attempt = 0; attempt < 32; attempt += 1) {
      const x = left + random.float() * (right - left);
      if (Math.abs(x - snapshot.playerPosition.x) <= snapshot.cameraHalfWidth + balance.cameraLead || active.some((actor) => Math.abs(actor.position.x - x) < balance.spawnClearance)) continue;
      if (needPrey) this.preyTick = snapshot.tick + balance.preyCadenceTicks;
      else this.infantryTick = snapshot.tick + balance.infantryCadenceTicks;
      return freezeRecord([{ id: `spawn.${String(++this.nextId)}`, definitionId, position: { x, y } }]);
    }
    return Object.freeze([]);
  }
}
