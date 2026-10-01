import Phaser from "phaser";

import { movementBalance } from "../data/movementBalance";
import { DebugOverlay } from "../debug/DebugOverlay";
import {
  installE2EDebugBridge,
  type NextRunConfiguration,
} from "../debug/E2EDebugBridge";
import type { DomainEvent } from "../domain/events/DomainEvent";
import { FixedStepRunner } from "../domain/session/FixedStepRunner";
import { GameSession } from "../domain/session/GameSession";
import { MovementPipeline } from "../domain/session/MovementPipeline";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import { FlatTerrainProfile } from "../domain/terrain/FlatTerrainProfile";
import { GamepadInput } from "../input/GamepadInput";
import { InputRouter } from "../input/InputRouter";
import { KeyboardInput } from "../input/KeyboardInput";
import { ScriptedInput } from "../input/ScriptedInput";
import { TouchInput } from "../input/TouchInput";
import { CameraController } from "../rendering/CameraController";
import { WorldRenderer } from "../rendering/WorldRenderer";
import { WormView } from "../rendering/WormView";
import { ActorViews } from "../rendering/ActorViews";
import { EffectsRenderer } from "../rendering/EffectsRenderer";
import { FeedbackController, defaultPresentationSettings } from "../rendering/FeedbackController";
import { spawnActor } from "../data/actors";
import {
  GAME_LIFECYCLE_REGISTRY_KEY,
  type GameBootstrapOptions,
} from "../createGame";

const DEFAULT_SEED = 0x5a17d;

export class GameplayScene extends Phaser.Scene {
  private keyboard: KeyboardInput | undefined;
  private touch: TouchInput | undefined;
  private scripted: ScriptedInput | undefined;
  private inputRouter: InputRouter | undefined;
  private pipeline: MovementPipeline | undefined;
  private wormView: WormView | undefined;
  private cameraController: CameraController | undefined;
  private debugOverlay: DebugOverlay | undefined;
  private snapshot: SessionSnapshot | undefined;
  private recentEvents: DomainEvent[] = [];
  private actorViews: ActorViews | undefined;
  private effects: EffectsRenderer | undefined;
  private feedback = new FeedbackController();
  private totalDroppedMs = 0;
  private removeTestBridge: (() => void) | undefined;

  constructor() {
    super("Gameplay");
  }

  create(): void {
    const lifecycle = this.lifecycle();
    const debug = lifecycle.debug ?? (import.meta.env.DEV && !__SANDSTRIKE_E2E__);
    new WorldRenderer(this).create();

    this.keyboard = new KeyboardInput(window);
    this.touch = new TouchInput();
    this.scripted = new ScriptedInput();
    this.inputRouter = new InputRouter([
      this.keyboard,
      this.touch,
      new GamepadInput(),
      this.scripted,
    ]);
    this.wormView = new WormView(this, debug);
    this.actorViews = new ActorViews(this);
    this.effects = new EffectsRenderer(this);
    this.debugOverlay = new DebugOverlay(this, debug);
    this.cameraController = new CameraController(
      this.cameras.main,
      movementBalance,
    );
    this.configureSession({ seed: DEFAULT_SEED });
    lifecycle.onControlsReady?.(
      Object.freeze({
        touchInput: this.touch,
        clear: () => {
          this.inputRouter?.clear();
        },
        resetTiming: () => {
          this.pipeline?.resetTiming();
        },
      }),
    );

    if (__SANDSTRIKE_E2E__) {
      this.removeTestBridge = installE2EDebugBridge({
        presentation: () => Object.freeze({ actorIds: this.actorViews?.actorIds() ?? Object.freeze([]) }),
        snapshot: () => this.requireSnapshot(),
        configureNextRun: (configuration) => {
          this.inputRouter?.clear();
          this.configureSession(configuration);
        },
        enqueueActions: (frames) => {
          this.scripted?.enqueueActions(frames);
        },
      });
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shutdown();
    });
    lifecycle.onReady?.();
  }

  override update(_time: number, deltaMs: number): void {
    if (
      !this.pipeline ||
      !this.wormView ||
      !this.cameraController ||
      !this.debugOverlay ||
      !this.inputRouter
    ) {
      return;
    }

    const frame = this.pipeline.advance(deltaMs);
    if (frame.lastAction?.pause.pressed) {
      this.lifecycle().onPauseRequested?.();
    }
    this.snapshot = frame.snapshot;
    this.totalDroppedMs += frame.report.droppedMs;
    this.recentEvents.push(...frame.events);
    if (this.recentEvents.length > 12) {
      this.recentEvents = this.recentEvents.slice(-12);
    }

    this.wormView.render(frame.snapshot.worm, frame.report.alpha);
    this.cameraController.update(frame.snapshot, deltaMs / 1000);
    const lifecycle = this.lifecycle();
    const settings = lifecycle.settings?.() ?? defaultPresentationSettings;
    const commands = this.feedback.consume(frame.events, settings, lifecycle.audio?.ready ?? false);
    this.actorViews?.sync(frame.snapshot, frame.report.alpha, settings.highContrast);
    this.effects?.consume(commands);
    this.effects?.update(deltaMs / 1000, settings.reducedMotion);
    if (settings.shake === 0 || settings.reducedMotion) this.cameras.main.shakeEffect.reset();
    for (const command of commands) {
      if (command.shake > 0) this.cameras.main.shake(90, command.shake);
      lifecycle.audio?.play(command, settings);
      if (command.haptic && typeof navigator.vibrate === "function") navigator.vibrate(12);
    }
    lifecycle.onSnapshot?.(frame.snapshot);
    this.debugOverlay.update({
      snapshot: frame.snapshot,
      report: frame.report,
      fps: this.game.loop.actualFps,
      frameMs: deltaMs,
      totalDroppedMs: this.totalDroppedMs,
      activeInputSource: this.inputRouter.activeSourceId,
      pauseReasons: Object.freeze([]),
      camera: this.cameraController.debugBounds(),
      recentEvents: this.recentEvents,
    });
  }

  private configureSession(configuration: NextRunConfiguration): void {
    if (!this.inputRouter) {
      return;
    }
    const fixtureMovement =
      configuration.fixtureId === "surface-breach" || configuration.fixtureId === "combat-breach"
        ? {
            ...movementBalance,
            initialPosition: { x: 0, y: 28 },
            initialDirection: { x: 0, y: -1 },
            initialSpeed: movementBalance.cruiseSpeed,
          }
        : movementBalance;
    const session = new GameSession({
      seed: configuration.seed,
      movement: fixtureMovement,
      terrain: new FlatTerrainProfile(0),
      ...(configuration.fixtureId === "surface-breach" ? {} : { mode: "rampage" as const, actors: [spawnActor("opening.prey.1", "actor.prey", { x: 260, y: -10 }), spawnActor("opening.prey.2", "actor.prey", { x: 440, y: -10 }), spawnActor("opening.prey.3", "actor.prey", { x: -320, y: -10 }), ...(configuration.fixtureId === "combat-breach" ? [spawnActor("opening.infantry", "actor.infantry", { x: 180, y: -16 })] : [])] }),
    });
    this.pipeline = new MovementPipeline(
      new FixedStepRunner(),
      this.inputRouter,
      session,
    );
    this.snapshot = session.snapshot();
    this.actorViews?.reset();
    this.effects?.reset();
    this.feedback = new FeedbackController();
    this.lifecycle().onSnapshot?.(this.snapshot);
    this.recentEvents = [];
    this.totalDroppedMs = 0;
    this.cameraController?.snap(this.snapshot);
    this.wormView?.render(this.snapshot.worm, 1);
  }

  private requireSnapshot(): SessionSnapshot {
    if (!this.snapshot) {
      throw new Error("Gameplay snapshot is not ready.");
    }
    return this.snapshot;
  }

  private lifecycle(): GameBootstrapOptions {
    return (
      (this.registry.get(
        GAME_LIFECYCLE_REGISTRY_KEY,
      ) as GameBootstrapOptions | undefined) ?? {}
    );
  }

  private shutdown(): void {
    this.removeTestBridge?.();
    this.removeTestBridge = undefined;
    this.keyboard?.destroy();
    this.inputRouter?.clear();
    this.wormView?.destroy();
    this.actorViews?.destroy();
    this.effects?.destroy();
    this.debugOverlay?.destroy();
    this.keyboard = undefined;
    this.touch = undefined;
    this.scripted = undefined;
    this.inputRouter = undefined;
    this.pipeline = undefined;
    this.wormView = undefined;
    this.cameraController = undefined;
    this.debugOverlay = undefined;
    this.snapshot = undefined;
  }
}
