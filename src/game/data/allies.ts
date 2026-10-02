/** Bounded survivor support: two ground allies and one helicopter, never more. */
export const allies = Object.freeze({
  groundCap: 2,
  airCap: 1,
  replacementTicks: 420,
  groundHealth: 60,
  groundSpeed: 150,
  groundRange: 640,
  groundDamage: 6,
  groundCadence: 48,
  groundJumpSpeed: 620,
  groundGravity: 1800,
  airHealth: 80,
  airSpeed: 130,
  airDamage: 7,
  airCadence: 60,
  airRange: 900,
  airAltitude: 320,
  airPatrolHalfWidth: 260,
  spawnClearance: 220,
});

export type AllyKind = "ally.ground" | "ally.air";
