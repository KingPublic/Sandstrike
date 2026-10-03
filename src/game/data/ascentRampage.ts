import type { HunterId } from "./characters";
import type { ProjectileDefinition } from "./enemies";

/**
 * Rampage (ascent) balance: the worm hunts five Hunter bots that race the rising
 * sand to the summit crate, while carrion in the sand is the worm's only healing.
 * Provisional numbers - see docs/BALANCE.md.
 */
export interface RivalPlanEntry {
  readonly hunterId: HunterId;
  /** Minimum ticks of ascent before this rival may deploy. */
  readonly afterTicks: number;
}

export const ascentRampageBalance = Object.freeze({
  // Five kits, deployed one at a time as the sand climbs.
  rivals: Object.freeze([
    Object.freeze({ hunterId: "ranger", afterTicks: 0 }),
    Object.freeze({ hunterId: "scout", afterTicks: 900 }),
    Object.freeze({ hunterId: "engineer", afterTicks: 2100 }),
    Object.freeze({ hunterId: "siegebreaker", afterTicks: 3600 }),
    Object.freeze({ hunterId: "field-medic", afterTicks: 5400 }),
  ] satisfies readonly RivalPlanEntry[]),
  maxActiveRivals: 2,
  rivalHealth: 100,
  /** Deploy distance from the player worm along the surface, in pixels. */
  deployMinDistance: 420,
  deployMaxDistance: 1200,
  rivalFireCadenceTicks: 42,
  rivalReloadTicks: 150,
  rivalMagazine: 5,
  rivalRange: 900,
  /** Rifle damage a rival deals per shot once it has line of sight. */
  rivalRifleDamage: 10,
  /** Heavy rounds are slower and louder: the summit crate is the real threat. */
  heavyDamage: 55,
  heavySpeed: 330,
  heavyLifetimeSeconds: 3,
  heavyCadenceTicks: 240,
  summitCrateHalfWidth: 180,
  carrionCadenceTicks: 600,
  carrionCap: 3,
  /** Carrion floats this far under the rising surface. */
  carrionMinDepth: 60,
  carrionMaxDepth: 160,
  carrionHalfWidth: 2600,
  /** Climb urgency: a rival starts climbing when the sand is this close. */
  climbPanicDistance: 120,
});

/** Rival fire: a normal rifle round, and the heavier summit-crate round. */
export const rivalProjectiles = Object.freeze({
  rifle: Object.freeze({ id: "ability.hunter-round", damage: ascentRampageBalance.rivalRifleDamage, speed: 520, lifetimeSeconds: 2.6 }),
  heavy: Object.freeze({ id: "ability.hunter-rpg", damage: ascentRampageBalance.heavyDamage, speed: ascentRampageBalance.heavySpeed, lifetimeSeconds: ascentRampageBalance.heavyLifetimeSeconds }),
} satisfies Record<string, ProjectileDefinition>);
