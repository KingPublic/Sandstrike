import { weaponById, type WeaponDefinition } from "../../data/characters";
import type { ActionFrame } from "../../input/ActionFrame";
import { freezeRecord } from "../actors/Actor";
import type { DamageCommand } from "../combat/DamageResolver";
import type { Vec2 } from "../math/Vector2";
import type { ExposedRegion, RifleState } from "./HuntTypes";
import { rayContacts } from "./ExposedWormContacts";
export interface RifleStep { readonly state: RifleState; readonly commands: readonly DamageCommand[]; readonly shot?: Readonly<{ from: Vec2; to: Vec2 }> }
export class RifleSystem {
  private state: RifleState;
  private burstRemaining = 0;
  private burstTick = 0;
  constructor(private readonly weapon: WeaponDefinition = weaponById()) { this.state = Object.freeze({ ammo: weapon.magazine, reloadUntilTick: 0, readyTick: 0 }); }
  step(action: ActionFrame, context: Readonly<{ position: Vec2; regions: readonly ExposedRegion[]; surfaceY?: number }>, tick: number): RifleStep {
    let { ammo, reloadUntilTick, readyTick } = this.state;
    if (reloadUntilTick > 0 && tick >= reloadUntilTick) { ammo = this.weapon.magazine; reloadUntilTick = 0; }
    if (action.secondary.pressed && ammo < this.weapon.magazine && reloadUntilTick === 0) reloadUntilTick = tick + this.weapon.reloadTicks;
    const x = action.aimWorld ? action.aimWorld.x - context.position.x : action.aimX;
    const y = action.aimWorld ? action.aimWorld.y - context.position.y : action.aimY;
    const length = Math.hypot(x, y);
    let shot: RifleStep["shot"];
    const commands: DamageCommand[] = [];
    if (action.primary.held && tick >= readyTick && this.burstRemaining === 0) this.burstRemaining = this.weapon.burst;
    if (this.burstRemaining > 0 && reloadUntilTick === 0 && tick >= this.burstTick && ammo > 0 && Number.isFinite(length) && length > 0.001) {
      const to = { x: context.position.x + x / length * this.weapon.range, y: context.position.y + y / length * this.weapon.range };
      const hit = rayContacts(context.position, to, context.regions, context.surfaceY ?? 0)[0];
      shot = freezeRecord({ from: context.position, to: hit?.position ?? to });
      ammo--; this.burstRemaining--; this.burstTick = tick + 6; if (this.burstRemaining === 0) readyTick = tick + this.weapon.cadence;
      if (hit) commands.push(freezeRecord({ sourceId: "hunter", targetId: "worm", abilityId: "ability.rifle", tick, amount: this.weapon.damage, tags: ["rifle"], priority: 0 }));
      if (ammo === 0) reloadUntilTick = tick + this.weapon.reloadTicks;
    }
    this.state = Object.freeze({ ammo, reloadUntilTick, readyTick, ...(this.weapon.id !== "rifle" ? { weaponId: this.weapon.id } : {}) });
    return freezeRecord({ state: this.state, commands, ...(shot ? { shot } : {}) });
  }
  cancelBurst(): void { this.burstRemaining = 0; }
  snapshot(): RifleState { return this.state; }
}
