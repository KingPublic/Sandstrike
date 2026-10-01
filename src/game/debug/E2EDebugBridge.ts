import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import type { ActionFrame } from "../input/ActionFrame";

export interface NextRunConfiguration {
  readonly seed: number;
  readonly fixtureId?: string;
}

export interface SandstrikeTestApi {
  snapshot(): SessionSnapshot;
  configureNextRun(configuration: NextRunConfiguration): void;
  enqueueActions(frames: readonly ActionFrame[]): void;
}

export interface E2EDebugBridgeController {
  readonly snapshot: () => SessionSnapshot;
  readonly configureNextRun: (configuration: NextRunConfiguration) => void;
  readonly enqueueActions: (frames: readonly ActionFrame[]) => void;
}

declare global {
  interface Window {
    __SANDSTRIKE_TEST__?: SandstrikeTestApi;
  }
}

export function installE2EDebugBridge(
  controller: E2EDebugBridgeController,
): () => void {
  const api: SandstrikeTestApi = Object.freeze({
    snapshot: controller.snapshot,
    configureNextRun: controller.configureNextRun,
    enqueueActions: controller.enqueueActions,
  });
  window.__SANDSTRIKE_TEST__ = api;

  return () => {
    if (window.__SANDSTRIKE_TEST__ === api) {
      delete window.__SANDSTRIKE_TEST__;
    }
  };
}
