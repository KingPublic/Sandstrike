import type { Vec2 } from "../math/Vector2";
import type { WormMotionSnapshot } from "../movement/WormMovementTypes";
import { exposedWormRegions } from "./ExposedWormContacts";
export function assistExposedAim(from: Vec2, aim: Vec2, worm: WormMotionSnapshot, strength: number): Vec2 {
  const length = Math.hypot(aim.x, aim.y);
  if (length === 0 || !Number.isFinite(length) || strength <= 0) return aim;
  const normal = { x: aim.x / length, y: aim.y / length };
  let best: Vec2 | undefined, closest = Math.cos(Math.PI / 10);
  for (const region of exposedWormRegions(worm, 0)) {
    if (region.position.y > 0) continue;
    const dx = region.position.x - from.x, dy = region.position.y - from.y, distance = Math.hypot(dx, dy);
    if (distance < .001 || distance > 1200) continue;
    const dot = (dx * normal.x + dy * normal.y) / distance;
    if (dot > closest) { closest = dot; best = { x: dx / distance, y: dy / distance }; }
  }
  if (!best) return aim;
  const blend = Math.max(0, Math.min(1, strength));
  return { x: normal.x * (1 - blend) + best.x * blend, y: normal.y * (1 - blend) + best.y * blend };
}
