export const combatBalance = Object.freeze({
  wormHealth: 100,
  preyHealth: 1,
  preyHealing: 8,
  impactThreshold: 220,
  impactMaximumSpeed: 460,
  impactMinimumDamage: 10,
  impactMaximumDamage: 40,
  wormInvulnerabilityTicks: 30,
  /**
   * A breach that lands on the Hunter costs less than a body hit on lighter
   * prey, so a missed dodge is punishing without deleting a whole climb.
   */
  hunterImpactScale: 0.5,
});
