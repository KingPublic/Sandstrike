export const enemies = Object.freeze({
  vehicleHealth: 80, vehicleArmor: 4, vehicleSpeed: 75,
  aerialHealth: 50, aerialSpeed: 96,
  infantryHealth: 25,
  projectileSpeed: 480,
  projectileLifetimeSeconds: 2.5,
  projectileDamage: 10,
  projectileCapacity: 24,
  bounds: Object.freeze({ left: -20_000, right: 20_000, top: -1_200, bottom: 3_200 }),
});
export interface ProjectileDefinition { readonly id: string; readonly damage: number; readonly speed: number; readonly lifetimeSeconds: number }
export const projectiles = Object.freeze({
  infantry: Object.freeze({ id: "ability.rifle", damage: 10, speed: 480, lifetimeSeconds: 2.5 }),
  vehicle: Object.freeze({ id: "ability.vehicle-shell", damage: 15, speed: 440, lifetimeSeconds: 2.5 }),
  aerial: Object.freeze({ id: "ability.aerial-round", damage: 10, speed: 520, lifetimeSeconds: 2.5 }),
} satisfies Record<string, ProjectileDefinition>);
