import type { Platform } from "../domain/world/PlatformContacts";

export type AscentStage = "ascent" | "boss";

export interface AscentArena {
  readonly bounds: Readonly<{ left: number; right: number; top: number; bottom: number }>;
  readonly initialSurface: number;
  readonly riseSpeed: number;
  readonly summitY: number;
  readonly summit: Readonly<{ left: number; right: number; top: number; y: number }>;
  readonly platforms: readonly Platform[];
  readonly burialGraceTicks: number;
  readonly burialDamagePerTick: number;
}

const LEDGE_STEP = 90;
const LEDGE_COUNT = 17;
const CATWALK_HALF_WIDTH = 3350;
const STAIR_CENTER = 3250;

function ledge(index: number): Platform {
  const y = -LEDGE_STEP * (index + 1);
  // The first two ledges teach jump/drop. Higher floors are two jump-heights
  // apart, joined at alternating ends so the climb includes real traversal.
  if (index === 0) return Object.freeze({ id: "ledge.0", left: -80, right: 240, y });
  if (index % 2 === 1 || index === LEDGE_COUNT - 1) return Object.freeze({ id: `ledge.${String(index)}`, left: -CATWALK_HALF_WIDTH, right: CATWALK_HALF_WIDTH, y });
  const center = (Math.floor(index / 2) % 2 === 0 ? 1 : -1) * STAIR_CENTER;
  return Object.freeze({ id: `ledge.${String(index)}`, left: center - 100, right: center + 100, y });
}

const platforms: readonly Platform[] = Object.freeze([
  Object.freeze({ id: "base", left: -3600, right: 3600, y: 0 }),
  ...Array.from({ length: LEDGE_COUNT }, (_, index) => ledge(index)),
  Object.freeze({ id: "summit", left: -700, right: 700, y: -1600 }),
]);

export const ascentArena: AscentArena = Object.freeze({
  bounds: Object.freeze({ left: -3600, right: 3600, top: -2800, bottom: 3200 }),
  // The base outpost sits above the initial sand line so the climb has a short,
  // fair grace window before the hazard reaches the player.
  initialSurface: 200,
  riseSpeed: 5,
  summitY: -1600,
  summit: Object.freeze({ left: -700, right: 700, top: -1900, y: -1600 }),
  platforms,
  burialGraceTicks: 90,
  burialDamagePerTick: 1 / 3,
});

export const ascentHunterBalance = Object.freeze({
  runSpeed: 180,
  jumpSpeed: 660,
  gravity: 1800,
  maximumFallSpeed: 1200,
  coyoteTicks: 6,
  jumpBufferTicks: 6,
  halfHeight: 16,
});
