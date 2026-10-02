import Phaser from "phaser";

import { movementBalance } from "../data/movementBalance";
import { DebugOverlay } from "../debug/DebugOverlay";
import type { DomainEvent } from "../domain/events/DomainEvent";
import type { PresentationMetrics } from "../debug/PresentationMetrics";
import { SessionController } from "../application/SessionController";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
import { GamepadInput } from "../input/GamepadInput";
import { InputRouter } from "../input/InputRouter";
import { KeyboardInput } from "../input/KeyboardInput";
import { PointerInput } from "../input/PointerInput";
import { HuntCueView } from "../rendering/HuntCueView";
import { ScriptedInput } from "../input/ScriptedInput";
import { TouchInput } from "../input/TouchInput";
import type { ActionFrame } from "../input/ActionFrame";
import { CameraController } from "../rendering/CameraController";
import { WorldRenderer } from "../rendering/WorldRenderer";
import { WormView } from "../rendering/WormView";
import { ActorViews } from "../rendering/ActorViews";
import { EffectsRenderer } from "../rendering/EffectsRenderer";
import { FeedbackController, defaultPresentationSettings } from "../rendering/FeedbackController";
import {
  GAME_LIFECYCLE_REGISTRY_KEY,
  type GameBootstrapOptions,
} from "../createGame";

export class GameplayScene extends Phaser.Scene {
  private keyboard: KeyboardInput | undefined;
  private pointer: PointerInput | undefined;
  private huntCues: HuntCueView | undefined;
  private touch: TouchInput | undefined;
  private scripted: ScriptedInput | undefined;
  private inputRouter: InputRouter | undefined;
  private controller: SessionController | undefined;
  private wormView: WormView | undefined;
  private cameraController: CameraController | undefined;
  private debugOverlay: DebugOverlay | undefined;
  private snapshot: SessionSnapshot | undefined;
  private recentEvents: DomainEvent[] = [];
  private actorViews: ActorViews | undefined;
  private effects: EffectsRenderer | undefined;
  private feedback = new FeedbackController();
  private totalDroppedMs = 0;
  private reportedResult = false;
  private metrics: PresentationMetrics | undefined;

  constructor() {
    super("Gameplay");
  }

  create(): void {
    const lifecycle = this.lifecycle();
    this.controller = lifecycle.controller ?? new SessionController();
    if (!this.controller.active) this.controller.start();
    const initial = this.controller.snapshot();
    const debug = initial.mode === "hunt" ? !initial.hunt?.eligibleForRecords : lifecycle.debug ?? (import.meta.env.DEV && !__SANDSTRIKE_E2E__);
    new WorldRenderer(this).create();

    this.keyboard = new KeyboardInput(window);
    this.touch = new TouchInput();
    this.scripted = new ScriptedInput();
    if (initial.mode === "hunt") {
      this.huntCues = new HuntCueView(this);
      this.pointer = new PointerInput(this.game.canvas, (x, y) => { const bounds = this.game.canvas.getBoundingClientRect(); return this.cameras.main.getWorldPoint((x - bounds.left) * this.scale.width / bounds.width, (y - bounds.top) * this.scale.height / bounds.height); });
    }
    this.inputRouter = new InputRouter([
      this.keyboard,
      this.touch,
      new GamepadInput(),
      this.scripted,
      ...(this.pointer ? [this.pointer] : []),
    ]);
    this.wormView = new WormView(this, debug);
    this.actorViews = new ActorViews(this);
    this.effects = new EffectsRenderer(this);
    this.debugOverlay = new DebugOverlay(this, debug);
    this.cameraController = new CameraController(
      this.cameras.main,
      movementBalance,
    );
    this.controller.attachInput(this.inputRouter);
    this.snapshot = this.controller.snapshot();
    this.cameraController.snap(this.snapshot);
    this.wormView.render(this.snapshot.worm, 1, this.snapshot.mode === "hunt");
    lifecycle.onControlsReady?.(
      Object.freeze({
        enqueueActions: (frames: readonly ActionFrame[]) => { this.scripted?.enqueueActions(frames); },
        actorIds: () => this.actorViews?.actorIds() ?? Object.freeze([]),
        metrics: () => this.metrics,
        touchInput: this.touch,
        clear: () => {
          this.inputRouter?.clear();
        },
        resetTiming: () => {
          this.controller?.resetTiming();
        },
      }),
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.shutdown();
    });
    lifecycle.onReady?.();
  }

  override update(_time: number, deltaMs: number): void {
    if (
      !this.controller ||
      !this.wormView ||
      !this.cameraController ||
      !this.debugOverlay ||
      !this.inputRouter
    ) {
      return;
    }

    const simulationStart = performance.now();
    const frame = this.controller.advance(deltaMs);
    const simulationMs = performance.now() - simulationStart;
    if (frame.lastAction?.pause.pressed) {
      this.lifecycle().onPauseRequested?.();
    }
    this.snapshot = frame.snapshot;
    this.totalDroppedMs += frame.report.droppedMs;
    this.recentEvents.push(...frame.events);
    if (this.recentEvents.length > 12) {
      this.recentEvents = this.recentEvents.slice(-12);
    }

    this.wormView.render(frame.snapshot.worm, frame.report.alpha, frame.snapshot.mode === "hunt" && frame.snapshot.hunt?.tracking.exactTrace === undefined);
    this.huntCues?.render(frame.snapshot);
    this.cameraController.update(frame.snapshot, deltaMs / 1000);
    const lifecycle = this.lifecycle();
    const settings = lifecycle.settings?.() ?? defaultPresentationSettings;
    const visibleEvents = frame.snapshot.mode === "hunt" && !frame.snapshot.hunt?.tracking.exactTrace ? frame.events.filter(e => !("position" in e) || e.position.y <= 0 || e.type === "snare-triggered") : frame.events;
    const commands = this.feedback.consume(visibleEvents, settings, lifecycle.audio?.ready ?? false);
    this.actorViews?.sync(frame.snapshot, frame.report.alpha, settings.highContrast);
    this.effects?.consume(commands);
    this.effects?.update(deltaMs / 1000, settings.reducedMotion);
    this.metrics = Object.freeze({ fps: this.game.loop.actualFps, frameMs: deltaMs, simulationMsPerTick: frame.report.steps > 0 ? simulationMs / frame.report.steps : 0, steps: frame.report.steps, totalDroppedMs: this.totalDroppedMs, actors: frame.snapshot.actors.length, shapes: frame.snapshot.actors.length, projectiles: frame.snapshot.diagnostics.projectileCount, particles: this.effects?.particleCount() ?? 0 });
    if (settings.shake === 0 || settings.reducedMotion) this.cameras.main.shakeEffect.reset();
    for (const command of commands) {
      if (command.shake > 0) this.cameras.main.shake(90, command.shake);
      lifecycle.audio?.play(command, settings);
      if (command.haptic && typeof navigator.vibrate === "function") navigator.vibrate(12);
    }
    lifecycle.onSnapshot?.(frame.snapshot);
    if (this.controller.result && !this.reportedResult) { this.reportedResult = true; lifecycle.onResult?.(this.controller.result); }
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
      particles: this.metrics.particles,
    });
  }

  private lifecycle(): GameBootstrapOptions {
    return (
      (this.registry.get(
        GAME_LIFECYCLE_REGISTRY_KEY,
      ) as GameBootstrapOptions | undefined) ?? {}
    );
  }

  private shutdown(): void {
    this.keyboard?.destroy();
    this.pointer?.destroy(); this.pointer = undefined;
    this.huntCues?.destroy(); this.huntCues = undefined;
    this.inputRouter?.clear();
    this.wormView?.destroy();
    this.actorViews?.destroy();
    this.effects?.destroy();
    this.debugOverlay?.destroy();
    this.keyboard = undefined;
    this.touch = undefined;
    this.scripted = undefined;
    this.inputRouter = undefined;
    this.controller = undefined;
    this.wormView = undefined;
    this.cameraController = undefined;
    this.debugOverlay = undefined;
    this.snapshot = undefined;
  }
}
