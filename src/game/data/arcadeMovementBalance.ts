import { movementBalance } from "./movementBalance";
import type { WormMovementConfig } from "../domain/movement/WormMovementTypes";

export const arcadeMovementBalance: WormMovementConfig = Object.freeze({
  ...movementBalance,
  initialSpeed: 360,
  undergroundAcceleration: 1600,
  cruiseSpeed: 650,
  lowSpeedTurnRate: 6,
  highSpeedTurnFactor: .8,
  ballisticAirControl: true,
  gravity: 2000,
  burstSpeedGain: 150,
  burstSpeedCap: 800,
  /**
   * Apex is burstLiftSpeed^2 / (2 * gravity) = 275px above the surface, so a
   * well-timed upward Burst reaches a helicopter patrolling at 220px.
   */
  burstLiftSpeed: 1050,
  cameraLookAheadX: 200,
  cameraLookAheadY: 100,
});
