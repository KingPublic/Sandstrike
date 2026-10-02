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
const LEDGE_SPAN = 80;
const LEDGE_WIDTH = 320;

function ledge(index: number): Platform {
  const y = -LEDGE_STEP * (index + 1);
  const center = (index % 2 === 0 ? 1 : -1) * (LEDGE_SPAN + (index % 3) * 40);
  return Object.freeze({ id: `ledge.${String(index)}`, left: center - LEDGE_WIDTH / 2, right: center + LEDGE_WIDTH / 2, y });
}

const platforms: readonly Platform[] = Object.freeze([
  Object.freeze({ id: "base", left: -2400, right: 2400, y: 0 }),
  ...Array.from({ length: LEDGE_COUNT }, (_, index) => ledge(index)),
  Object.freeze({ id: "summit", left: -700, right: 700, y: -1600 }),
]);

export const ascentArena: AscentArena = Object.freeze({
  bounds: Object.freeze({ left: -2400, right: 2400, top: -2800, bottom: 3200 }),
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
