import { freezeRecord } from "../actors/Actor";
import type { CollisionProfile } from "../collision/CollisionTypes";
import type { Vec2 } from "../math/Vector2";
import type { AbilityDefinition, AbilityState } from "./Ability";

type AbilityStrategy = (definition: AbilityDefinition, direction: Vec2) => CollisionProfile;
const strategies: ReadonlyMap<string, AbilityStrategy> = new Map([
  ["forward-circle", (definition, direction) => freezeRecord({
    id: definition.id, layer: 1, mask: 2 | 4,
    shape: { kind: "circle", radius: definition.radius,
      offset: { x: direction.x * definition.forwardOffset, y: direction.y * definition.forwardOffset },
    },
  } satisfies CollisionProfile)],
]);

export class AbilitySystem {
  readonly definition: AbilityDefinition;
  private activeUntil = 0;
  private cooldownUntil = 0;

  constructor(definition: AbilityDefinition, ownerTags: readonly string[]) {
    if (!definition.id || !definition.ownerTags.some((tag) => ownerTags.includes(tag)) ||
        !strategies.has(definition.strategyId) || definition.activationConditionId !== "ready" ||
        !Number.isSafeInteger(definition.cooldownTicks) || definition.cooldownTicks <= 0 ||
        !Number.isSafeInteger(definition.activeTicks) || definition.activeTicks <= 0 ||
        definition.activeTicks > definition.cooldownTicks ||
        [definition.radius, definition.damage].some((value) => !Number.isFinite(value) || value <= 0) ||
        !Number.isFinite(definition.forwardOffset) || definition.forwardOffset < 0 ||
        !Number.isFinite(definition.resourceCost ?? 0) || (definition.resourceCost ?? 0) < 0) {
      throw new RangeError("Invalid or incompatible ability definition.");
    }
    this.definition = freezeRecord(definition);
  }

  step(tick: number, pressed: boolean, availableResource = Infinity): Readonly<{ activated: boolean; state: AbilityState }> {
    const activated = pressed && tick >= this.cooldownUntil && availableResource >= (this.definition.resourceCost ?? 0);
    if (activated) {
      this.activeUntil = tick + this.definition.activeTicks;
      this.cooldownUntil = tick + this.definition.cooldownTicks;
    }
    return Object.freeze({ activated, state: this.snapshot(tick) });
  }

  snapshot(tick: number): AbilityState {
    return Object.freeze({ id: this.definition.id, active: tick < this.activeUntil, activeUntilTick: this.activeUntil, cooldownUntilTick: this.cooldownUntil, cooldownTicksRemaining: Math.max(0, this.cooldownUntil - tick) });
  }

  contactProfile(direction: Vec2): CollisionProfile {
    const strategy = strategies.get(this.definition.strategyId);
    if (!strategy) throw new Error("Ability strategy was removed.");
    return strategy(this.definition, direction);
  }
}
