import type { CollisionProfile } from "../domain/collision/CollisionTypes";

export const collisionProfiles = Object.freeze({
  worm: Object.freeze({ id: "collision.worm-head", layer: 1, mask: 2 | 4 | 8, shape: Object.freeze({ kind: "circle", radius: 18 }) }),
  prey: Object.freeze({ id: "collision.prey", layer: 2, mask: 1, shape: Object.freeze({ kind: "circle", radius: 10 }) }),
  infantry: Object.freeze({ id: "collision.infantry", layer: 4, mask: 1, shape: Object.freeze({ kind: "box", halfWidth: 9, halfHeight: 16 }) }),
  projectile: Object.freeze({ id: "collision.projectile", layer: 8, mask: 1, shape: Object.freeze({ kind: "circle", radius: 3 }) }),
} satisfies Record<string, CollisionProfile>);
