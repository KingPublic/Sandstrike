import { arcadeMovementBalance } from "./arcadeMovementBalance";
import type { WormMovementConfig } from "../domain/movement/WormMovementTypes";

// The pursuit worm must reach the tall ascent tower and the rooftop encounter.
export const huntMovementBalance: WormMovementConfig = Object.freeze({
  ...arcadeMovementBalance,
  cruiseSpeed: 800,
  burstSpeedCap: 950,
  gravity: 640,
  cameraLookAheadX: 250,
  cameraLookAheadY: 200,
});
