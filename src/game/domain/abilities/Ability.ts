export interface AbilityDefinition {
  readonly id: string;
  readonly ownerTags: readonly string[];
  readonly cooldownTicks: number;
  readonly activeTicks: number;
  readonly resourceCost?: number;
  readonly activationConditionId: string;
  readonly strategyId: string;
  readonly debugTags: readonly string[];
  readonly feedbackHooks: readonly string[];
  readonly radius: number;
  readonly forwardOffset: number;
  readonly damage: number;
}

export interface AbilityState {
  readonly id: string;
  readonly active: boolean;
  readonly activeUntilTick: number;
  readonly cooldownUntilTick: number;
  readonly cooldownTicksRemaining: number;
}
