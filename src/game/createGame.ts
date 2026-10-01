import Phaser from "phaser";

import { BootScene } from "./scenes/BootScene";
import { GameplayScene } from "./scenes/GameplayScene";
import { PreloadScene } from "./scenes/PreloadScene";

export interface GameBootstrapOptions {
  readonly onReady?: () => void;
  readonly onFatalError?: (error: Error) => void;
  readonly debug?: boolean;
}

export const GAME_LIFECYCLE_REGISTRY_KEY = "sandstrike.lifecycle";

export function createGame(
  parent: HTMLElement,
  options: GameBootstrapOptions = {},
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#17101f",
    antialias: true,
    pixelArt: false,
    roundPixels: false,
    render: {
      powerPreference: "high-performance",
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PreloadScene, GameplayScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set(GAME_LIFECYCLE_REGISTRY_KEY, options);
      },
    },
  };

  return new Phaser.Game(config);
}
