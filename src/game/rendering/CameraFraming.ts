import type { Vec2 } from "../domain/math/Vector2";
import type { WormMovementConfig } from "../domain/movement/WormMovementTypes";

export interface CameraHeadPose {
  readonly position: Vec2;
  readonly velocity: Vec2;
}

export interface CameraFraming {
  readonly centerX: number;
  readonly centerY: number;
  readonly zoom: number;
}

const SURFACE_Y = 0;
const DEEP_FRAMING_START = 480;
const DEEP_FRAMING_RANGE = 240;
const VERTICAL_MARGIN = 96;
const MINIMUM_ZOOM = 0.45;

export function computeCameraFraming(
  head: CameraHeadPose,
  viewportHeight: number,
  config: WormMovementConfig,
): CameraFraming {
  const lookX = clamp(
    head.velocity.x * 0.38,
    -config.cameraLookAheadX,
    config.cameraLookAheadX,
  );
  const lookY = clamp(
    head.velocity.y * 0.28,
    -config.cameraLookAheadY,
    config.cameraLookAheadY,
  );
  const depth = Math.max(0, head.position.y - SURFACE_Y);
  const safeViewportHeight =
    Number.isFinite(viewportHeight) && viewportHeight > 0
      ? viewportHeight
      : 900;
  const requiredWorldHeight = Math.max(
    safeViewportHeight,
    depth + VERTICAL_MARGIN * 2,
  );
  const zoom = clamp(
    safeViewportHeight / requiredWorldHeight,
    MINIMUM_ZOOM,
    1,
  );
  const shallowCenterY = clamp(head.position.y + lookY, -210, 330);
  const naturalDeepCenterY =
    SURFACE_Y + depth * 0.5 + Math.max(0, lookY) * 0.18;
  const halfWorldHeight = safeViewportHeight / zoom / 2;
  const minimumCenterForHead =
    head.position.y +
    VERTICAL_MARGIN +
    Math.max(0, lookY) * 0.5 -
    halfWorldHeight;
  const deepCenterY = Math.max(naturalDeepCenterY, minimumCenterForHead);
  const deepBlend = clamp(
    (depth - DEEP_FRAMING_START) / DEEP_FRAMING_RANGE,
    0,
    1,
  );

  return Object.freeze({
    centerX: head.position.x + lookX,
    centerY: lerp(shallowCenterY, deepCenterY, deepBlend),
    zoom,
  });
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
