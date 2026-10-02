import { neutralActionFrame } from "../../input/ActionFrame";
import type { Vec2 } from "../math/Vector2";
import { WormLocomotion } from "../movement/WormLocomotion";
import type { WormMotionSnapshot, WormMovementConfig } from "../movement/WormMovementTypes";
import type { TerrainProfile } from "../terrain/TerrainProfile";

// Forecast uses the same turn limits and integration as the live worm.
export function predictBreachX(self: WormMotionSnapshot, target: Vec2, movement: WormMovementConfig, terrain: TerrainProfile, surfaceRisePerSecond = 0): number | undefined {
  const forecast = new WormLocomotion({ ...movement, initialPosition: self.head.position, initialDirection: self.head.tangent, initialSpeed: self.speed });
  // Project the same future surface the live world will use, so a rising hazard
  // cannot invalidate the forecast crossing.
  let projectedTick = 0;
  const forecastTerrain: TerrainProfile = surfaceRisePerSecond === 0 ? terrain : { surfaceY: (x: number) => terrain.surfaceY(x) - (surfaceRisePerSecond * projectedTick) / 60 };
  for (let offset = 0; offset < 600; offset++) {
    projectedTick = offset;
    const head = forecast.snapshot().head.position;
    const dx = target.x - head.x, dy = target.y - head.y, length = Math.hypot(dx, dy) || 1;
    const boost = offset === 60 && self.burstCooldownSeconds <= 1;
    const events = forecast.step({ ...neutralActionFrame(offset + 1), moveX: dx / length, moveY: dy / length, boost: { held: boost, pressed: boost, released: false } }, 1 / 60, forecastTerrain);
    if (events.some(e => e.type === "phase-changed" && e.to === "breaching")) return forecast.snapshot().head.position.x;
  }
  return undefined;
}
