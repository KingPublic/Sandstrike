import { bossBalance as b } from "../../data/bossBalance";
import type { ActionFrame } from "../../input/ActionFrame";
import { freezeRecord } from "../actors/Actor";
import type { DamageCommand } from "../combat/DamageResolver";
import type { Vec2 } from "../math/Vector2";
import { rayContacts } from "./ExposedWormContacts";
import type { ExposedRegion } from "./HuntTypes";

export interface RpgState {
  readonly owned: boolean;
  readonly rockets: number;
  readonly reloadUntilTick: number;
  readonly readyTick: number;
  readonly crateReadyTick: number;
}

/** Objective weapon: high damage, finite magazine, restocked at the summit crate. */
export class RpgSystem {
  private state: RpgState = Object.freeze({ owned: false, rockets: 0, reloadUntilTick: 0, readyTick: 0, crateReadyTick: 0 });

  step(action: ActionFrame, context: Readonly<{ position: Vec2; regions: readonly ExposedRegion[] }>, tick: number): Readonly<{ state: RpgState; commands: readonly DamageCommand[]; shot?: Readonly<{ from: Vec2; to: Vec2 }> | undefined }> {
    const { owned, crateReadyTick } = this.state;
    let { rockets, reloadUntilTick, readyTick } = this.state;
    if (reloadUntilTick > 0 && tick >= reloadUntilTick) { rockets = b.rpgMagazine; reloadUntilTick = 0; }
    if (action.secondary.pressed && owned && rockets < b.rpgMagazine && reloadUntilTick === 0) reloadUntilTick = tick + b.rpgReloadTicks;
    const commands: DamageCommand[] = [];
    let shot: Readonly<{ from: Vec2; to: Vec2 }> | undefined;
    const x = action.aimWorld ? action.aimWorld.x - context.position.x : action.aimX;
    const y = action.aimWorld ? action.aimWorld.y - context.position.y : action.aimY;
    const length = Math.hypot(x, y);
    if (owned && action.primary.held && reloadUntilTick === 0 && tick >= readyTick && rockets > 0 && Number.isFinite(length) && length > 0.001) {
      const to = { x: context.position.x + x / length * b.rpgRange, y: context.position.y + y / length * b.rpgRange };
      const hit = rayContacts(context.position, to, context.regions)[0];
      shot = freezeRecord({ from: context.position, to: hit?.position ?? to });
      rockets -= 1;
      readyTick = tick + b.rpgCadenceTicks;
      if (hit) commands.push(freezeRecord({ sourceId: "hunter", targetId: "worm", abilityId: "ability.rpg", tick, amount: b.rpgDamage, tags: ["rpg"], priority: 0 }));
      if (rockets === 0) reloadUntilTick = tick + b.rpgReloadTicks;
    }
    this.state = Object.freeze({ owned, rockets, reloadUntilTick, readyTick, crateReadyTick });
    return freezeRecord({ state: this.state, commands, ...(shot ? { shot } : {}) });
  }

  /** Entering the highlighted crate zone restocks the objective weapon. */
  pickup(tick: number): boolean {
    if (tick < this.state.crateReadyTick) return false;
    this.state = Object.freeze({ ...this.state, owned: true, rockets: b.rpgMagazine, reloadUntilTick: 0, crateReadyTick: tick + b.crateRestockTicks });
    return true;
  }

  snapshot(): RpgState { return this.state; }
}
