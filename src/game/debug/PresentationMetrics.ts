export interface PresentationMetrics {
  readonly fps: number;
  readonly frameMs: number;
  readonly simulationMsPerTick: number;
  readonly steps: number;
  readonly totalDroppedMs: number;
  readonly actors: number;
  readonly shapes: number;
  readonly projectiles: number;
  readonly particles: number;
}
