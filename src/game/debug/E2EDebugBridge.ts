import type { ThemeId } from "../data/themes";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import type { ActionFrame } from "../input/ActionFrame";
import type { PresentationMetrics } from "./PresentationMetrics";

export interface NextRunConfiguration {
  readonly themeId?: ThemeId;
  readonly mode?: "rampage" | "hunt";
  readonly ascent?: boolean;
  readonly debugAI?: boolean;
  readonly aimAssist?: number;
  readonly seed: number;
  readonly fixtureId?: string;
}

export interface SandstrikeTestApi {
  presentation(): Readonly<{ actorIds: readonly string[]; metrics?: PresentationMetrics }>;
  snapshot(): SessionSnapshot;
  configureNextRun(configuration: NextRunConfiguration): void;
  enqueueActions(frames: readonly ActionFrame[]): void;
}

export interface E2EDebugBridgeController {
  readonly presentation: SandstrikeTestApi["presentation"];
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
    presentation: controller.presentation,
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
