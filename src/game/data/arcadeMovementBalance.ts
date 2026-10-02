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
  cameraLookAheadX: 200,
  cameraLookAheadY: 100,
});
