import Phaser from "phaser";

import {
  GAME_LIFECYCLE_REGISTRY_KEY,
  type GameBootstrapOptions,
} from "../createGame";

const REQUIRED_ASSET_IDS: readonly string[] = [];
let injectedFailureConsumed = false;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  create(): void {
    const lifecycle = this.registry.get(
      GAME_LIFECYCLE_REGISTRY_KEY,
    ) as GameBootstrapOptions | undefined;

    if (REQUIRED_ASSET_IDS.some((assetId) => !this.textures.exists(assetId))) {
      lifecycle?.onFatalError?.(new Error("A required preview asset is missing."));
      return;
    }

    if (this.shouldInjectFailure()) {
      injectedFailureConsumed = true;
      this.time.delayedCall(80, () => {
        lifecycle?.onFatalError?.(new Error("Injected E2E boot failure."));
        this.scene.stop();
      });
      return;
    }

    this.time.delayedCall(300, () => this.scene.start("Gameplay"));
  }

  private shouldInjectFailure(): boolean {
    if (import.meta.env.VITE_ENABLE_TEST_BRIDGE !== "true" || injectedFailureConsumed) {
      return false;
    }

    return new URLSearchParams(window.location.search).has("e2eBootFailure");
  }
}
