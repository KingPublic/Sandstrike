import { huntBalance as b } from "../../data/huntBalance";
import type { Vec2 } from "../math/Vector2";
import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import type { ExposedContact, ExposedRegion } from "./HuntTypes";
export function exposedWormRegions(worm: WormMotionSnapshot, surfaceY: number): readonly ExposedRegion[] {
  return Object.freeze([worm.head, ...worm.followers].map((pose, index) => Object.freeze({ position: pose.position, index, radius: index === 0 ? b.headRadius : b.bodyRadius })).filter(r => r.position.y - r.radius < surfaceY));
}
export function rayContacts(from: Vec2, to: Vec2, regions: readonly ExposedRegion[], surfaceY = 0): readonly ExposedContact[] {
  if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return [];
  const dx = to.x - from.x, dy = to.y - from.y, length2 = dx * dx + dy * dy;
  if (length2 === 0) return [];
  const hits: ExposedContact[] = [];
  for (const r of regions) {
    const ox = from.x - r.position.x, oy = from.y - r.position.y;
    const linear = 2 * (ox * dx + oy * dy), constant = ox * ox + oy * oy - r.radius * r.radius;
    const discriminant = linear * linear - 4 * length2 * constant;
    if (discriminant < 0) continue;
    let enter = Math.max(0, (-linear - Math.sqrt(discriminant)) / (2 * length2));
    let leave = Math.min(1, (-linear + Math.sqrt(discriminant)) / (2 * length2));
    if (dy > 0) leave = Math.min(leave, (surfaceY - from.y) / dy);
    else if (dy < 0) enter = Math.max(enter, (surfaceY - from.y) / dy);
    else if (from.y > surfaceY) continue;
    if (enter > leave || enter > 1 || leave < 0) continue;
    hits.push(Object.freeze({ targetId: "worm", regionIndex: r.index, position: Object.freeze({ x: from.x + dx * enter, y: from.y + dy * enter }), distance: Math.sqrt(length2) * enter }));
  }
  hits.sort((a, b) => a.distance - b.distance || a.regionIndex - b.regionIndex);
  return Object.freeze(hits.slice(0, 1));
}
export function queryExposedWormContacts(from: Vec2, to: Vec2, worm: WormMotionSnapshot, surfaceY: number, revealed: boolean): readonly ExposedContact[];
export function queryExposedWormContacts(from: Vec2, to: Vec2, worm: WormMotionSnapshot, surfaceY: number): readonly ExposedContact[] {
  // Reveal affects tracking only; rifle contact still requires surface exposure.
  return rayContacts(from, to, exposedWormRegions(worm, surfaceY), surfaceY);
}
