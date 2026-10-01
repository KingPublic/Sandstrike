import type { TerrainProfile } from "./TerrainProfile";

export class FlatTerrainProfile implements TerrainProfile {
  constructor(private readonly height: number) {
    if (!Number.isFinite(height)) {
      throw new RangeError("Terrain height must be finite.");
    }
  }

  surfaceY(x: number): number {
    if (!Number.isFinite(x)) {
      throw new RangeError("Terrain query must be finite.");
    }
    return this.height;
  }
}
