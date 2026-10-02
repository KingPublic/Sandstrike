import { movementBalance } from "./movementBalance";
import type { WormMovementConfig } from "../domain/movement/WormMovementTypes";

export const arcadeMovementBalance: WormMovementConfig = Object.freeze({
  ...movementBalance,
  initialSpeed: 360,
  undergroundAcceleration: 1600,
  cruiseSpeed: 800,
  lowSpeedTurnRate: 6,
  highSpeedTurnFactor: .8,
  gravity: 640,
  burstSpeedGain: 150,
  burstSpeedCap: 950,
  cameraLookAheadX: 250,
  cameraLookAheadY: 200,
});
