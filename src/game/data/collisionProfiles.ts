import type { CollisionProfile } from "../domain/collision/CollisionTypes";

export const collisionProfiles = Object.freeze({
  worm: Object.freeze({ id: "collision.worm-head", layer: 1, mask: 2 | 4 | 8 | 16 | 32, shape: Object.freeze({ kind: "circle", radius: 18 }) }),
  hunter: Object.freeze({ id: "collision.hunter", layer: 16, mask: 1, shape: Object.freeze({ kind: "box", halfWidth: 10, halfHeight: 16 }) }),
  relay: Object.freeze({ id: "collision.relay", layer: 32, mask: 1, shape: Object.freeze({ kind: "box", halfWidth: 26, halfHeight: 30 }) }),
  vehicle: Object.freeze({ id: "collision.vehicle", layer: 4, mask: 1, shape: Object.freeze({ kind: "box", halfWidth: 30, halfHeight: 18 }) }),
  aerial: Object.freeze({ id: "collision.aerial", layer: 4, mask: 1, shape: Object.freeze({ kind: "box", halfWidth: 32, halfHeight: 16 }) }),
  prey: Object.freeze({ id: "collision.prey", layer: 2, mask: 1, shape: Object.freeze({ kind: "circle", radius: 10 }) }),
  infantry: Object.freeze({ id: "collision.infantry", layer: 4, mask: 1, shape: Object.freeze({ kind: "box", halfWidth: 9, halfHeight: 16 }) }),
  projectile: Object.freeze({ id: "collision.projectile", layer: 8, mask: 1, shape: Object.freeze({ kind: "circle", radius: 3 }) }),
  // Absent actors stay in the registry but never interact with anything.
  hidden: Object.freeze({ id: "collision.hidden", layer: 0, mask: 0, shape: Object.freeze({ kind: "circle", radius: 1 }) }),
} satisfies Record<string, CollisionProfile>);
