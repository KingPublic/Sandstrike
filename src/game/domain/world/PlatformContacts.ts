import type { Vec2 } from "../math/Vector2";

export interface Platform {
  readonly id: string;
  readonly left: number;
  readonly right: number;
  readonly y: number;
}

export interface VerticalBody {
  readonly position: Vec2;
  readonly halfWidth: number;
  readonly halfHeight: number;
}

function feetY(body: VerticalBody): number {
  return body.position.y + body.halfHeight;
}

function overlapsHorizontally(x: number, body: VerticalBody, platform: Platform): boolean {
  return x >= platform.left - body.halfWidth && x <= platform.right + body.halfWidth;
}

/** Platform the body is resting on, if any. */
export function supportPlatform(body: VerticalBody, platforms: readonly Platform[]): Platform | undefined {
  const feet = feetY(body);
  return platforms.find(platform => Math.abs(feet - platform.y) <= 1 && overlapsHorizontally(body.position.x, body, platform));
}

/**
 * First platform crossed while descending. Swept against the interpolated crossing
 * x so a fast fall cannot tunnel through a ledge or land on a distant one.
 */
export function sweptLanding(
  previous: VerticalBody,
  current: VerticalBody,
  velocityY: number,
  platforms: readonly Platform[],
  ignorePlatformId?: string,
): Platform | undefined {
  if (!(velocityY > 0)) return undefined;
  const previousFeet = feetY(previous);
  const currentFeet = feetY(current);
  if (currentFeet <= previousFeet) return undefined;
  const crossed = platforms.filter(platform =>
    platform.id !== ignorePlatformId &&
    previousFeet <= platform.y &&
    currentFeet >= platform.y &&
    overlapsHorizontally(crossingX(previous.position.x, current.position.x, previousFeet, currentFeet, platform.y), current, platform));
  return crossed.reduce<Platform | undefined>((top, platform) => !top || platform.y < top.y ? platform : top, undefined);
}

/** Grapple/line of sight: highest platform edge a straight segment would pass through. */
export function crossedPlatform(from: Vec2, to: Vec2, platforms: readonly Platform[], ignorePlatformId?: string): Platform | undefined {
  if (![from.x, from.y, to.x, to.y].every(Number.isFinite)) return undefined;
  const dy = to.y - from.y;
  if (dy === 0) return undefined;
  const hits = platforms.filter(platform => {
    if (platform.id === ignorePlatformId) return false;
    const t = (platform.y - from.y) / dy;
    if (t <= 0 || t >= 1) return false;
    const x = from.x + (to.x - from.x) * t;
    return x >= platform.left && x <= platform.right;
  });
  return hits.reduce<Platform | undefined>((first, platform) => !first || platform.y < first.y ? platform : first, undefined);
}

function crossingX(fromX: number, toX: number, fromFeet: number, toFeet: number, surfaceY: number): number {
  const t = (surfaceY - fromFeet) / (toFeet - fromFeet);
  return fromX + (toX - fromX) * t;
}
