import Phaser from "phaser";

import type { TouchInput } from "./input/TouchInput";
import { BootScene } from "./scenes/BootScene";
import { GameplayScene } from "./scenes/GameplayScene";
import { PreloadScene } from "./scenes/PreloadScene";
import type { SessionSnapshot } from "./domain/session/SessionSnapshot";
import type { PresentationSettings } from "./rendering/FeedbackController";
import type { PhaserAudioAdapter } from "./infrastructure/phaser/PhaserAudioAdapter";

export interface GameBootstrapOptions {
  readonly onSnapshot?: (snapshot: SessionSnapshot) => void;
  readonly settings?: () => PresentationSettings;
  readonly audio?: PhaserAudioAdapter;
  readonly onReady?: () => void;
  readonly onFatalError?: (error: Error) => void;
  readonly debug?: boolean;
  readonly onControlsReady?: (controls: GameplayControlPort) => void;
  readonly onPauseRequested?: () => void;
}

export interface GameplayControlPort {
  readonly touchInput: TouchInput;
  clear(): void;
  resetTiming(): void;
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
