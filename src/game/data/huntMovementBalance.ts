import { arcadeMovementBalance } from "./arcadeMovementBalance";
import type { WormMovementConfig } from "../domain/movement/WormMovementTypes";

// The pursuit worm must reach the tall ascent tower and the rooftop encounter.
export const huntMovementBalance: WormMovementConfig = Object.freeze({
  ...arcadeMovementBalance,
  cruiseSpeed: 800,
  burstSpeedCap: 950,
  // The pursuit worm breaches to reach ledges, never to hunt air targets, so it
  // keeps Burst as a pure sprint.
  burstLiftSpeed: 0,
  gravity: 640,
  cameraLookAheadX: 250,
  cameraLookAheadY: 200,
});
