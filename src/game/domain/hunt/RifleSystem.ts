import { huntBalance as b } from "../../data/huntBalance";
import type { ActionFrame } from "../../input/ActionFrame";
import { freezeRecord } from "../actors/Actor";
import type { DamageCommand } from "../combat/DamageResolver";
import type { Vec2 } from "../math/Vector2";
import type { ExposedRegion, RifleState } from "./HuntTypes";
import { rayContacts } from "./ExposedWormContacts";
export interface RifleStep { readonly state: RifleState; readonly commands: readonly DamageCommand[]; readonly shot?: Readonly<{ from: Vec2; to: Vec2 }> }
export class RifleSystem {
  private state: RifleState = Object.freeze({ ammo: b.magazine, reloadUntilTick: 0, readyTick: 0 });
  step(action: ActionFrame, context: Readonly<{ position: Vec2; regions: readonly ExposedRegion[]; surfaceY?: number }>, tick: number): RifleStep {
    let { ammo, reloadUntilTick, readyTick } = this.state;
    if (reloadUntilTick > 0 && tick >= reloadUntilTick) { ammo = b.magazine; reloadUntilTick = 0; }
    if (action.secondary.pressed && ammo < b.magazine && reloadUntilTick === 0) reloadUntilTick = tick + b.reloadTicks;
    const x = action.aimWorld ? action.aimWorld.x - context.position.x : action.aimX;
    const y = action.aimWorld ? action.aimWorld.y - context.position.y : action.aimY;
    const length = Math.hypot(x, y);
    let shot: RifleStep["shot"];
    const commands: DamageCommand[] = [];
    if (action.primary.held && reloadUntilTick === 0 && tick >= readyTick && ammo > 0 && Number.isFinite(length) && length > 0.001) {
      const to = { x: context.position.x + x / length * b.rifleRange, y: context.position.y + y / length * b.rifleRange };
      const hit = rayContacts(context.position, to, context.regions, context.surfaceY ?? 0)[0];
      shot = freezeRecord({ from: context.position, to: hit?.position ?? to });
      ammo--; readyTick = tick + b.shotCadence;
      if (hit) commands.push(freezeRecord({ sourceId: "hunter", targetId: "worm", abilityId: "ability.rifle", tick, amount: b.rifleDamage, tags: ["rifle"], priority: 0 }));
      if (ammo === 0) reloadUntilTick = tick + b.reloadTicks;
    }
    this.state = Object.freeze({ ammo, reloadUntilTick, readyTick });
    return freezeRecord({ state: this.state, commands, ...(shot ? { shot } : {}) });
  }
  snapshot(): RifleState { return this.state; }
}
