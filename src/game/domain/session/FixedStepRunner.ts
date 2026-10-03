export interface StepReport {
  readonly steps: number;
  readonly alpha: number;
  readonly droppedMs: number;
}

export interface FixedStepConfig {
  readonly stepHz?: number;
  readonly maxCatchUpSteps?: number;
  readonly maxFrameMs?: number;
}

const DEFAULT_STEP_HZ = 60;
const DEFAULT_MAX_CATCH_UP_STEPS = 5;
const DEFAULT_MAX_FRAME_MS = 250;
const EPSILON_MS = 1e-9;

export class FixedStepRunner {
  private readonly stepMs: number;
  private readonly dtSeconds: number;
  private readonly maxCatchUpSteps: number;
  private readonly maxFrameMs: number;
  private accumulatorMs = 0;

  constructor(config: FixedStepConfig = {}) {
    const stepHz = config.stepHz ?? DEFAULT_STEP_HZ;
    const maxCatchUpSteps =
      config.maxCatchUpSteps ?? DEFAULT_MAX_CATCH_UP_STEPS;
    const maxFrameMs = config.maxFrameMs ?? DEFAULT_MAX_FRAME_MS;

    if (
      !Number.isFinite(stepHz) ||
      stepHz <= 0 ||
      !Number.isInteger(maxCatchUpSteps) ||
      maxCatchUpSteps <= 0 ||
      !Number.isFinite(maxFrameMs) ||
      maxFrameMs <= 0
    ) {
      throw new RangeError("Fixed-step configuration must contain positive values.");
    }

    this.stepMs = 1000 / stepHz;
    this.dtSeconds = 1 / stepHz;
    this.maxCatchUpSteps = maxCatchUpSteps;
    this.maxFrameMs = maxFrameMs;
  }

  advance(
    deltaMs: number,
    step: (dtSeconds: number) => void,
  ): StepReport {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) {
      return this.report(0, 0);
    }

    const acceptedMs = Math.min(deltaMs, this.maxFrameMs);
    let droppedMs = Math.max(0, deltaMs - acceptedMs);
    this.accumulatorMs += acceptedMs;

    let steps = 0;
    while (
      this.accumulatorMs + EPSILON_MS >= this.stepMs &&
      steps < this.maxCatchUpSteps
    ) {
      step(this.dtSeconds);
      this.accumulatorMs -= this.stepMs;
      steps += 1;
    }

    if (this.accumulatorMs + EPSILON_MS >= this.stepMs) {
      const discardedSteps = Math.floor(
        (this.accumulatorMs + EPSILON_MS) / this.stepMs,
      );
      const discardedMs = discardedSteps * this.stepMs;
      this.accumulatorMs -= discardedMs;
      droppedMs += discardedMs;
    }

    if (Math.abs(this.accumulatorMs) < EPSILON_MS) {
      this.accumulatorMs = 0;
    }

    return this.report(steps, droppedMs);
  }

  reset(): void {
    this.accumulatorMs = 0;
  }

  private report(steps: number, droppedMs: number): StepReport {
    return Object.freeze({
      steps,
      alpha: this.accumulatorMs / this.stepMs,
      droppedMs,
    });
  }
}
