import { ascentArena, type AscentArena, type AscentStage } from "../../data/ascentArena";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import type { Platform } from "./PlatformContacts";

export interface AscentWorldSnapshot {
  readonly tick: number;
  readonly stage: AscentStage;
  readonly surfaceY: number;
  readonly frozen: boolean;
  readonly platforms: readonly Platform[];
  readonly summit: Readonly<{ left: number; right: number; top: number; y: number }>;
  readonly bounds: Readonly<{ left: number; right: number; top: number; bottom: number }>;
}

const BOSS_SURFACE_CLEARANCE = 420;

/**
 * Authoritative world clock for survival runs. Owns the rising hazard surface,
 * the authored platform route and the summit bounds. Also acts as the terrain
 * profile for every actor so worm motion follows the same moving surface.
 */
export class AscentWorld implements TerrainProfile {
  private currentTick = 0;
  private currentStage: AscentStage = "ascent";
  private frozenSurfaceY: number | undefined;

  constructor(private readonly arena: AscentArena = ascentArena) {
    if (!Number.isFinite(arena.initialSurface) || !Number.isFinite(arena.riseSpeed) || arena.riseSpeed < 0) throw new RangeError("Invalid ascent arena surface.");
  }

  step(tick: number, stage: AscentStage = this.currentStage): AscentWorldSnapshot {
    if (!Number.isSafeInteger(tick) || tick < 0) throw new RangeError("World tick must be a non-negative safe integer.");
    this.currentTick = tick;
    this.currentStage = stage;
    if (stage === "boss" && this.frozenSurfaceY === undefined) {
      this.frozenSurfaceY = Math.min(this.surfaceY(), this.arena.summitY + BOSS_SURFACE_CLEARANCE);
    }
    return this.snapshot();
  }

  snapshot(): AscentWorldSnapshot {
    return Object.freeze({
      tick: this.currentTick,
      stage: this.currentStage,
      surfaceY: this.surfaceY(),
      frozen: this.frozenSurfaceY !== undefined,
      platforms: this.arena.platforms,
      summit: this.arena.summit,
      bounds: this.arena.bounds,
    });
  }

  /** Terrain contract: the hazard surface is flat but rises on simulation ticks. */
  surfaceY(): number {
    if (this.frozenSurfaceY !== undefined) return this.frozenSurfaceY;
    return this.arena.initialSurface - (this.arena.riseSpeed * this.currentTick) / 60;
  }

  /** Depth of a world point below the rising surface; positive means buried. */
  depthAt(y: number): number {
    return y - this.surfaceY();
  }

  isAtSummit(position: Readonly<{ x: number; y: number }>): boolean {
    return position.y <= this.arena.summit.y && position.x >= this.arena.summit.left && position.x <= this.arena.summit.right;
  }
}
