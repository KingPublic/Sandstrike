import type { ActionFrame } from "../../input/ActionFrame";
import { freezeVec2, isFiniteVec2, type Vec2 } from "../math/Vector2";
import type { TerrainProfile } from "../terrain/TerrainProfile";
import { PathHistory, type PathPose } from "./PathHistory";
import type {
  WormMotionEvent,
  WormMotionPhase,
  WormMotionSnapshot,
  WormMovementConfig,
} from "./WormMovementTypes";

const VECTOR_EPSILON = 1e-9;

export class WormLocomotion {
  private readonly pathHistory: PathHistory;
  private position: Vec2;
  private velocity: Vec2;
  private headingRadians: number;
  private speed: number;
  private phase: WormMotionPhase = "underground";
  private phaseElapsedSeconds = 0;
  private burstCooldownRemaining = 0;
  private tick = 0;

  constructor(private readonly config: WormMovementConfig) {
    this.validateConfig(config);
    const initialDirection = normalize(config.initialDirection);
    this.position = freezeVec2(
      config.initialPosition.x,
      config.initialPosition.y,
    );
    this.headingRadians = Math.atan2(initialDirection.y, initialDirection.x);
    this.speed = config.initialSpeed;
    this.velocity = scale(initialDirection, this.speed);
    this.pathHistory = new PathHistory({
      capacity: config.pathCapacity,
      minSampleDistance: config.pathMinSampleDistance,
      maxTickGap: config.pathMaxTickGap,
    });
    this.seedFollowerHistory(initialDirection);
  }

  step(
    action: ActionFrame,
    dtSeconds: number,
    terrain: TerrainProfile,
  ): readonly WormMotionEvent[] {
    if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
      throw new RangeError("Movement delta must be finite and positive.");
    }
    if (!Number.isSafeInteger(action.tick) || action.tick < this.tick) {
      throw new RangeError("Movement action tick must be monotonic.");
    }

    this.tick = action.tick;
    this.phaseElapsedSeconds += dtSeconds;
    this.burstCooldownRemaining = Math.max(
      0,
      this.burstCooldownRemaining - dtSeconds,
    );

    const previousPosition = this.position;
    const previousDepth = this.depthAt(previousPosition, terrain);
    const events: WormMotionEvent[] = [];

    if (this.phase === "underground" || this.phase === "reentering") {
      this.stepUnderground(action, dtSeconds);
    } else {
      this.stepAirborne(action, dtSeconds);
    }

    if (action.boost.pressed && this.burstCooldownRemaining === 0) {
      this.applyBurst(events);
    }

    this.position = freezeVec2(
      previousPosition.x + this.velocity.x * dtSeconds,
      previousPosition.y + this.velocity.y * dtSeconds,
    );
    const bounds = this.config.worldBounds;
    if (bounds) {
      const x = clamp(this.position.x, bounds.left, bounds.right);
      const y = clamp(this.position.y, bounds.top, bounds.bottom);
      const vx = x !== this.position.x ? -this.velocity.x : this.velocity.x;
      const vy = y !== this.position.y ? -this.velocity.y : this.velocity.y;
      this.position = freezeVec2(x, y);
      this.velocity = freezeVec2(vx, vy);
      this.headingRadians = Math.atan2(vy, vx);
    }

    const currentDepth = this.depthAt(this.position, terrain);
    const phaseEvent = this.resolvePhaseTransition(
      previousDepth,
      currentDepth,
      terrain,
    );
    if (phaseEvent) {
      events.push(phaseEvent);
    }

    const tangent = this.motionTangent();
    this.pathHistory.append(this.position, tangent, action.tick);

    return Object.freeze(events);
  }

  snapshot(): WormMotionSnapshot {
    const tangent = this.motionTangent();
    const followers: PathPose[] = [];
    for (let index = 1; index < this.config.segmentCount; index += 1) {
      followers.push(
        this.pathHistory.sampleDistanceBehind(
          index * this.config.segmentSpacing,
        ),
      );
    }

    return Object.freeze({
      tick: this.tick,
      head: Object.freeze({
        position: freezeVec2(this.position.x, this.position.y),
        tangent,
        velocity: freezeVec2(this.velocity.x, this.velocity.y),
      }),
      followers: Object.freeze(followers),
      speed: this.speed,
      phase: this.phase,
      burstCooldownSeconds: this.burstCooldownRemaining,
    });
  }

  private stepUnderground(action: ActionFrame, dtSeconds: number): void {
    const desired = inputDirection(action);
    if (desired) {
      const desiredAngle = Math.atan2(desired.y, desired.x);
      const speedRatio = clamp(
        (this.speed - this.config.minimumUndergroundSpeed) /
          (this.config.cruiseSpeed - this.config.minimumUndergroundSpeed),
        0,
        1,
      );
      const authority =
        1 - (1 - this.config.highSpeedTurnFactor) * speedRatio;
      const maximumTurn =
        this.config.lowSpeedTurnRate * authority * dtSeconds;
      this.headingRadians = rotateToward(
        this.headingRadians,
        desiredAngle,
        maximumTurn,
      );
      if (this.speed < this.config.cruiseSpeed) {
        this.speed = Math.min(
          this.config.cruiseSpeed,
          this.speed +
            this.config.undergroundAcceleration * desired.magnitude * dtSeconds,
        );
      }
    }

    if (this.speed > this.config.cruiseSpeed) {
      this.speed = Math.max(
        this.config.cruiseSpeed,
        this.speed - this.config.undergroundAcceleration * 0.5 * dtSeconds,
      );
    }
    this.speed = Math.max(this.config.minimumUndergroundSpeed, this.speed);
    this.velocity = freezeVec2(
      Math.cos(this.headingRadians) * this.speed,
      Math.sin(this.headingRadians) * this.speed,
    );
  }

  private stepAirborne(action: ActionFrame, dtSeconds: number): void {
    const desired = inputDirection(action);
    let velocity = this.velocity;
    if (desired) {
      const currentAngle = Math.atan2(velocity.y, velocity.x);
      const desiredAngle = Math.atan2(desired.y, desired.x);
      const angle = rotateToward(
        currentAngle,
        desiredAngle,
        this.config.lowSpeedTurnRate * this.config.airTurnFactor * dtSeconds,
      );
      const magnitude = Math.hypot(velocity.x, velocity.y);
      velocity = freezeVec2(
        Math.cos(angle) * magnitude,
        Math.sin(angle) * magnitude,
      );
    }
    velocity = freezeVec2(
      velocity.x,
      velocity.y + this.config.gravity * dtSeconds,
    );
    this.velocity = velocity;
    this.speed = Math.hypot(velocity.x, velocity.y);
    this.headingRadians = Math.atan2(velocity.y, velocity.x);
  }

  private applyBurst(events: WormMotionEvent[]): void {
    this.speed = Math.min(
      this.config.burstSpeedCap,
      this.speed + this.config.burstSpeedGain,
    );
    const tangent = this.motionTangent();
    this.velocity = scale(tangent, this.speed);
    this.headingRadians = Math.atan2(tangent.y, tangent.x);
    this.burstCooldownRemaining = this.config.burstCooldownSeconds;
    events.push(
      Object.freeze({
        type: "burst",
        tick: this.tick,
        speed: this.speed,
        position: freezeVec2(this.position.x, this.position.y),
      }),
    );
  }

  private resolvePhaseTransition(
    previousDepth: number,
    currentDepth: number,
    terrain: TerrainProfile,
  ): WormMotionEvent | undefined {
    if (
      this.phase === "underground" &&
      previousDepth > 0 &&
      currentDepth <= 0
    ) {
      return this.transitionTo("breaching");
    }

    if (
      this.phase === "breaching" &&
      (currentDepth <= -this.config.surfaceHysteresis ||
        this.phaseElapsedSeconds >= 2 / 60)
    ) {
      return this.transitionTo("airborne");
    }

    if (
      this.phase === "airborne" &&
      currentDepth >= 0 &&
      this.velocity.y > 0
    ) {
      return this.transitionTo("reentering");
    }

    if (
      this.phase === "reentering" &&
      (currentDepth >= this.config.surfaceHysteresis ||
        this.phaseElapsedSeconds >= this.config.maxForcedReentrySeconds)
    ) {
      if (currentDepth < this.config.surfaceHysteresis) {
        const surfaceY = terrain.surfaceY(this.position.x);
        this.position = freezeVec2(
          this.position.x,
          surfaceY + this.config.surfaceHysteresis,
        );
      }
      return this.transitionTo("underground");
    }

    return undefined;
  }

  private transitionTo(next: WormMotionPhase): WormMotionEvent {
    const previous = this.phase;
    this.phase = next;
    this.phaseElapsedSeconds = 0;
    return Object.freeze({
      type: "phase-changed",
      tick: this.tick,
      from: previous,
      to: next,
      position: freezeVec2(this.position.x, this.position.y),
    });
  }

  private depthAt(position: Vec2, terrain: TerrainProfile): number {
    const surfaceY = terrain.surfaceY(position.x);
    if (!Number.isFinite(surfaceY)) {
      throw new RangeError("Terrain profile returned a non-finite surface.");
    }
    return position.y - surfaceY;
  }

  private motionTangent(): Vec2 {
    if (Math.hypot(this.velocity.x, this.velocity.y) > VECTOR_EPSILON) {
      return normalize(this.velocity);
    }
    return freezeVec2(
      Math.cos(this.headingRadians),
      Math.sin(this.headingRadians),
    );
  }

  private seedFollowerHistory(tangent: Vec2): void {
    const tailDistance =
      (this.config.segmentCount - 1) * this.config.segmentSpacing;
    const tail = freezeVec2(
      this.position.x - tangent.x * tailDistance,
      this.position.y - tangent.y * tailDistance,
    );
    this.pathHistory.reset(tail, tangent, 0);
    for (let index = this.config.segmentCount - 2; index >= 0; index -= 1) {
      const distance = index * this.config.segmentSpacing;
      this.pathHistory.append(
        freezeVec2(
          this.position.x - tangent.x * distance,
          this.position.y - tangent.y * distance,
        ),
        tangent,
        0,
      );
    }
  }

  private validateConfig(config: WormMovementConfig): void {
    const bounds = config.worldBounds;
    if (bounds && ([bounds.left, bounds.right, bounds.top, bounds.bottom].some((value) => !Number.isFinite(value)) || bounds.right <= bounds.left || bounds.bottom <= bounds.top)) throw new RangeError("Invalid movement bounds.");
    if (
      !isFiniteVec2(config.initialPosition) ||
      !isFiniteVec2(config.initialDirection) ||
      Math.hypot(config.initialDirection.x, config.initialDirection.y) <=
        VECTOR_EPSILON
    ) {
      throw new RangeError("Initial worm pose must be finite and directed.");
    }

    const positiveValues = [
      config.segmentSpacing,
      config.pathMinSampleDistance,
      config.initialSpeed,
      config.minimumUndergroundSpeed,
      config.undergroundAcceleration,
      config.cruiseSpeed,
      config.lowSpeedTurnRate,
      config.highSpeedTurnFactor,
      config.airTurnFactor,
      config.gravity,
      config.burstSpeedGain,
      config.burstSpeedCap,
      config.burstCooldownSeconds,
      config.surfaceHysteresis,
      config.maxForcedReentrySeconds,
    ];
    if (
      !Number.isInteger(config.segmentCount) ||
      config.segmentCount < 2 ||
      !Number.isInteger(config.pathCapacity) ||
      config.pathCapacity < config.segmentCount ||
      !Number.isInteger(config.pathMaxTickGap) ||
      config.pathMaxTickGap <= 0 ||
      positiveValues.some((value) => !Number.isFinite(value) || value <= 0) ||
      config.highSpeedTurnFactor > 1 ||
      config.airTurnFactor > 1 ||
      config.minimumUndergroundSpeed > config.cruiseSpeed ||
      config.cruiseSpeed > config.burstSpeedCap
    ) {
      throw new RangeError("Worm movement configuration is invalid.");
    }
  }
}

interface InputDirection extends Vec2 {
  readonly magnitude: number;
}

function inputDirection(action: ActionFrame): InputDirection | undefined {
  const x = clamp(action.moveX, -1, 1);
  const y = clamp(action.moveY, -1, 1);
  const magnitude = Math.hypot(x, y);
  if (!Number.isFinite(magnitude) || magnitude <= VECTOR_EPSILON) {
    return undefined;
  }
  const clampedMagnitude = Math.min(1, magnitude);
  return Object.freeze({
    x: x / magnitude,
    y: y / magnitude,
    magnitude: clampedMagnitude,
  });
}

function normalize(vector: Vec2): Vec2 {
  if (!isFiniteVec2(vector)) {
    throw new RangeError("Movement vector must be finite.");
  }
  const magnitude = Math.hypot(vector.x, vector.y);
  if (magnitude <= VECTOR_EPSILON) {
    throw new RangeError("Movement vector must have non-zero length.");
  }
  return freezeVec2(vector.x / magnitude, vector.y / magnitude);
}

function scale(vector: Vec2, scalar: number): Vec2 {
  return freezeVec2(vector.x * scalar, vector.y * scalar);
}

function rotateToward(current: number, target: number, maximumDelta: number): number {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + clamp(difference, -maximumDelta, maximumDelta);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
