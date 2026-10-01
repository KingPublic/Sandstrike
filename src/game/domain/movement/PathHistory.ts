import {
  freezeVec2,
  isFiniteVec2,
  type Vec2,
} from "../math/Vector2";

export interface PathHistoryConfig {
  readonly capacity: number;
  readonly minSampleDistance: number;
  readonly maxTickGap: number;
}

export interface PathSample {
  readonly position: Vec2;
  readonly tangent: Vec2;
  readonly tick: number;
  readonly cumulativeDistance: number;
}

export interface PathPose {
  readonly position: Vec2;
  readonly tangent: Vec2;
}

const NORMAL_EPSILON = 1e-12;

export class PathHistory {
  private readonly capacity: number;
  private readonly minSampleDistanceSquared: number;
  private readonly maxTickGap: number;
  private readonly x: Float64Array;
  private readonly y: Float64Array;
  private readonly tangentX: Float64Array;
  private readonly tangentY: Float64Array;
  private readonly tick: Float64Array;
  private readonly cumulativeDistance: Float64Array;
  private startIndex = 0;
  private count = 0;
  private traveledDistance = 0;

  constructor(config: PathHistoryConfig) {
    if (!Number.isInteger(config.capacity) || config.capacity < 2) {
      throw new RangeError("Path history capacity must be an integer of at least 2.");
    }
    if (
      !Number.isFinite(config.minSampleDistance) ||
      config.minSampleDistance <= 0
    ) {
      throw new RangeError("Path history sample distance must be positive.");
    }
    if (!Number.isInteger(config.maxTickGap) || config.maxTickGap <= 0) {
      throw new RangeError("Path history tick gap must be a positive integer.");
    }

    this.capacity = config.capacity;
    this.minSampleDistanceSquared = config.minSampleDistance ** 2;
    this.maxTickGap = config.maxTickGap;
    this.x = new Float64Array(this.capacity);
    this.y = new Float64Array(this.capacity);
    this.tangentX = new Float64Array(this.capacity);
    this.tangentY = new Float64Array(this.capacity);
    this.tick = new Float64Array(this.capacity);
    this.cumulativeDistance = new Float64Array(this.capacity);
  }

  get sampleCount(): number {
    return this.count;
  }

  reset(position: Vec2, tangent: Vec2, tick: number): void {
    this.assertPosition(position);
    const normal = this.normalizeTangent(tangent);
    this.assertTick(tick);

    this.startIndex = 0;
    this.count = 1;
    this.traveledDistance = 0;
    this.write(0, position, normal, tick, 0);
  }

  append(position: Vec2, tangent: Vec2, tick: number): boolean {
    this.assertInitialized();
    this.assertPosition(position);
    const normal = this.normalizeTangent(tangent);
    this.assertTick(tick);

    const newestIndex = this.physicalIndex(this.count - 1);
    const newestTick = this.read(this.tick, newestIndex);
    if (tick < newestTick) {
      throw new RangeError("Path history ticks must be monotonic.");
    }

    const deltaX = position.x - this.read(this.x, newestIndex);
    const deltaY = position.y - this.read(this.y, newestIndex);
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;
    const tickGap = tick - newestTick;
    if (
      distanceSquared < this.minSampleDistanceSquared &&
      tickGap < this.maxTickGap
    ) {
      return false;
    }

    const distance = Math.sqrt(distanceSquared);
    this.traveledDistance += distance;

    let targetIndex: number;
    if (this.count < this.capacity) {
      targetIndex = this.physicalIndex(this.count);
      this.count += 1;
    } else {
      targetIndex = this.startIndex;
      this.startIndex = (this.startIndex + 1) % this.capacity;
    }

    this.write(targetIndex, position, normal, tick, this.traveledDistance);
    return true;
  }

  sampleDistanceBehind(distance: number): PathPose {
    this.assertInitialized();
    if (!Number.isFinite(distance) || distance < 0) {
      throw new RangeError("Path history distance must be finite and non-negative.");
    }

    const newestLogicalIndex = this.count - 1;
    if (distance <= NORMAL_EPSILON) {
      return this.poseAt(newestLogicalIndex);
    }

    const newestIndex = this.physicalIndex(newestLogicalIndex);
    const targetDistance =
      this.read(this.cumulativeDistance, newestIndex) - distance;
    const oldestIndex = this.physicalIndex(0);
    if (targetDistance <= this.read(this.cumulativeDistance, oldestIndex)) {
      return this.poseAt(0);
    }

    for (let newerLogicalIndex = newestLogicalIndex; newerLogicalIndex > 0; newerLogicalIndex -= 1) {
      const olderLogicalIndex = newerLogicalIndex - 1;
      const newerIndex = this.physicalIndex(newerLogicalIndex);
      const olderIndex = this.physicalIndex(olderLogicalIndex);
      const newerDistance = this.read(this.cumulativeDistance, newerIndex);
      const olderDistance = this.read(this.cumulativeDistance, olderIndex);

      if (targetDistance >= olderDistance) {
        const span = newerDistance - olderDistance;
        if (span <= NORMAL_EPSILON) {
          return this.poseAt(newerLogicalIndex);
        }
        const alpha = (targetDistance - olderDistance) / span;
        return this.interpolatePose(olderIndex, newerIndex, alpha);
      }
    }

    return this.poseAt(0);
  }

  private interpolatePose(
    olderIndex: number,
    newerIndex: number,
    alpha: number,
  ): PathPose {
    const olderX = this.read(this.x, olderIndex);
    const newerX = this.read(this.x, newerIndex);
    const olderY = this.read(this.y, olderIndex);
    const newerY = this.read(this.y, newerIndex);
    const olderTangentX = this.read(this.tangentX, olderIndex);
    const newerTangentX = this.read(this.tangentX, newerIndex);
    const olderTangentY = this.read(this.tangentY, olderIndex);
    const newerTangentY = this.read(this.tangentY, newerIndex);
    const position = freezeVec2(
      olderX + (newerX - olderX) * alpha,
      olderY + (newerY - olderY) * alpha,
    );
    const tangent = this.normalizeTangent({
      x: olderTangentX + (newerTangentX - olderTangentX) * alpha,
      y: olderTangentY + (newerTangentY - olderTangentY) * alpha,
    });
    return Object.freeze({ position, tangent });
  }

  private poseAt(logicalIndex: number): PathPose {
    const index = this.physicalIndex(logicalIndex);
    return Object.freeze({
      position: freezeVec2(this.read(this.x, index), this.read(this.y, index)),
      tangent: freezeVec2(
        this.read(this.tangentX, index),
        this.read(this.tangentY, index),
      ),
    });
  }

  private physicalIndex(logicalIndex: number): number {
    return (this.startIndex + logicalIndex) % this.capacity;
  }

  private write(
    index: number,
    position: Vec2,
    tangent: Vec2,
    tick: number,
    cumulativeDistance: number,
  ): void {
    this.x[index] = position.x;
    this.y[index] = position.y;
    this.tangentX[index] = tangent.x;
    this.tangentY[index] = tangent.y;
    this.tick[index] = tick;
    this.cumulativeDistance[index] = cumulativeDistance;
  }

  private read(buffer: Float64Array, index: number): number {
    const value = buffer[index];
    if (value === undefined) {
      throw new RangeError("Path history index is out of bounds.");
    }
    return value;
  }

  private normalizeTangent(tangent: Vec2): Vec2 {
    if (!isFiniteVec2(tangent)) {
      throw new RangeError("Path tangent must be finite.");
    }
    const magnitude = Math.hypot(tangent.x, tangent.y);
    if (magnitude <= NORMAL_EPSILON) {
      throw new RangeError("Path tangent must have non-zero length.");
    }
    return freezeVec2(tangent.x / magnitude, tangent.y / magnitude);
  }

  private assertPosition(position: Vec2): void {
    if (!isFiniteVec2(position)) {
      throw new RangeError("Path position must be finite.");
    }
  }

  private assertTick(tick: number): void {
    if (!Number.isSafeInteger(tick) || tick < 0) {
      throw new RangeError("Path tick must be a non-negative safe integer.");
    }
  }

  private assertInitialized(): void {
    if (this.count === 0) {
      throw new Error("Path history must be reset before use.");
    }
  }
}
