# Phase B Worm Movement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the foundation shell into a deterministic, responsive movement
slice with one procedural segmented worm that burrows, builds momentum, breaches,
flies with limited control, re-enters, and pauses safely.

**Architecture:** Device adapters emit one `ActionFrame`; a capped fixed-step
runner advances a Phaser-free `GameSession`. `WormLocomotion` owns the head and a
bounded `PathHistory`; presentation samples immutable snapshots for the worm,
camera, HUD/debug overlay, and touch controls.

**Tech Stack:** The exact pinned stack produced by
`2026-10-01-phase-b-foundation.md`.

**Spec:** `docs/GAME_DESIGN.md` sections 7, 9–11, 16, and 18.1;
`docs/ARCHITECTURE.md` sections 7–10, 15, and 18.

## Global Constraints

- Complete and verify the foundation plan first.
- Apply all constraints and public contracts in the Phase B plan-set index.
- Keep domain modules free of Phaser, DOM, storage, and browser APIs.
- Use one head-authoritative motion state and distance-sampled follower history;
  rendered segments never push the head or become independent rigid bodies.
- Keep all tuning in typed data and label initial values provisional in
  `docs/BALANCE.md`.
- Add no prey, enemy, damage, score, progression, or final art in this plan.

## Review Focus

- A long/throttled frame cannot advance unbounded ticks or teleport the worm.
- A fast head crossing the surface emits exactly one legal phase transition.
- Ring-buffer wrap and reset preserve segment ordering and finite poses.
- Simultaneous device input produces stable edges and no stuck action on resume.
- Phone safe areas and portrait interruption cannot hide the game or keep it live.

---

### Task 1: Establish semantic actions and a deterministic fixed step

**Files:**
- Create: `src/game/domain/math/Vector2.ts`
- Create: `src/game/input/ActionFrame.ts`
- Create: `src/game/domain/session/FixedStepRunner.ts`
- Create: `tests/unit/actionFrame.test.ts`
- Create: `tests/unit/fixedStepRunner.test.ts`

**Interfaces:**
- Produces: immutable `Vec2`, `ActionButtonState`, `ActionFrame`,
  `neutralActionFrame(tick: number): ActionFrame`, `StepReport`, and
  `FixedStepRunner.advance(deltaMs: number, step: (dtSeconds: number) => void): StepReport`.
- `ActionFrame` contains `tick`, finite/clamped `moveX`, `moveY`, `aimX`, and
  `aimY`, an optional `aimWorld: Vec2`, and `ActionButtonState` values for
  `primary`, `secondary`, `ability`, `boost`, `interact`, `pause`, `confirm`, and
  `back`. A button state contains `held`, `pressed`, and `released`.
- `StepReport` exposes `steps`, `alpha`, and `droppedMs`.

- [ ] **Step 1: Write failing tests for neutral actions and button edges**

  Assert finite zero axes, all buttons unheld/unpressed/unreleased, immutable
  results, and a preserved simulation tick.

- [ ] **Step 2: Write failing fixed-step tests**

  Assert a 60 Hz step, fractional interpolation, at most five catch-up steps,
  discarded excess after a 250 ms capped frame, and no negative/non-finite delta.

- [ ] **Step 3: Run focused tests and observe RED**

  Run: `npm run test -- tests/unit/actionFrame.test.ts tests/unit/fixedStepRunner.test.ts`

  Expected: FAIL because the modules do not exist.

- [ ] **Step 4: Implement the minimal public types and runner**

  Do not import Phaser time or `performance.now`; the caller supplies real delta
  and the runner supplies only fixed `dtSeconds` to domain steps.

- [ ] **Step 5: Run focused tests and observe GREEN**

  Run: `npm run test -- tests/unit/actionFrame.test.ts tests/unit/fixedStepRunner.test.ts`

  Expected: all cases pass deterministically.

- [ ] **Step 6: Commit**

  ```bash
  git add src/game/domain/math/Vector2.ts src/game/input/ActionFrame.ts src/game/domain/session/FixedStepRunner.ts tests/unit/actionFrame.test.ts tests/unit/fixedStepRunner.test.ts
  git commit -m "feat: add deterministic action step"
  ```

### Task 2: Build the bounded path-history follower contract

**Files:**
- Create: `src/game/domain/movement/PathHistory.ts`
- Create: `tests/unit/pathHistory.test.ts`

**Interfaces:**
- Consumes: finite `Vec2` positions and normalized tangents.
- Produces: `PathSample`, `PathPose`, and class `PathHistory` with
  constructor config `capacity`, `minSampleDistance`, and `maxTickGap`, plus
  `reset(position, tangent, tick)`, `append(position, tangent, tick): boolean`,
  `sampleDistanceBehind(distance): PathPose`, and read-only `sampleCount`.

- [ ] **Step 1: Write the failing behavior tests**

  Cover distance-threshold sampling, maximum tick-gap sampling while stationary,
  interpolation by cumulative distance, clamping beyond available history,
  duplicate-position tangents, fixed-capacity wrap, reset after teleport, and
  rejection of NaN/Infinity.

- [ ] **Step 2: Run the focused test and observe RED**

  Run: `npm run test -- tests/unit/pathHistory.test.ts`

  Expected: FAIL because `PathHistory` is missing.

- [ ] **Step 3: Implement a preallocated ring buffer**

  Store positions, tangents, ticks, and cumulative distance without per-step array
  growth. Sampling must return finite normalized tangents after wrap and reset.

- [ ] **Step 4: Run the focused test and observe GREEN**

  Run: `npm run test -- tests/unit/pathHistory.test.ts`

  Expected: all interpolation, wrap, and reset cases pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/game/domain/movement/PathHistory.ts tests/unit/pathHistory.test.ts
  git commit -m "feat: add worm path history"
  ```

### Task 3: Implement head-authoritative locomotion and terrain transitions

**Files:**
- Create: `src/game/domain/terrain/TerrainProfile.ts`
- Create: `src/game/domain/terrain/FlatTerrainProfile.ts`
- Create: `src/game/domain/movement/WormMovementTypes.ts`
- Create: `src/game/domain/movement/WormLocomotion.ts`
- Create: `src/game/data/movementBalance.ts`
- Create: `tests/unit/wormLocomotion.test.ts`
- Create: `tests/unit/terrainCrossing.test.ts`

**Interfaces:**
- Produces: `TerrainProfile.surfaceY(x: number): number`, `WormMovementConfig`,
  `WormMotionPhase`, `WormMotionSnapshot`, `WormMotionEvent`, and
  `WormLocomotion.step(action: ActionFrame, dtSeconds: number, terrain: TerrainProfile): readonly WormMotionEvent[]`.
- `WormLocomotion.snapshot(): WormMotionSnapshot` contains head pose, speed,
  phase, burst cooldown, and follower poses derived from `PathHistory`.

- [ ] **Step 1: Write failing underground-motion tests**

  Assert bounded acceleration, max speed, continuous rate-limited turning,
  lower high-speed turn authority, Burst speed gain with no invulnerability, one
  cooldown activation, and equal results for identical actions.

- [ ] **Step 2: Write failing surface-transition tests**

  Use a fast segment crossing a flat profile to assert underground → breaching →
  airborne → reentering → underground order, surface hysteresis, exactly one event
  per crossing, gravity, reduced air steering, and prompt re-entry control.

- [ ] **Step 3: Run focused tests and observe RED**

  Run: `npm run test -- tests/unit/wormLocomotion.test.ts tests/unit/terrainCrossing.test.ts`

  Expected: FAIL because terrain and locomotion modules are absent.

- [ ] **Step 4: Implement the minimal movement model**

  Start with a 14-segment, 24 px spacing prototype; a 128-sample path buffer that
  appends after 4 px or 4 ticks; 260 px/s² underground acceleration; 360 px/s
  cruise cap; 2.4 rad/s low-speed turn cap; 0.35 air-turn factor; 720 px/s²
  gravity; +100 px/s Burst with a 460 px/s Burst cap; 1.8 s Burst cooldown; 6 px
  surface hysteresis; and 0.25 s maximum forced re-entry recovery. Keep every
  value in `movementBalance.ts` and mark it provisional.

- [ ] **Step 5: Run tests and record the initial tuning hypothesis**

  Run: `npm run test -- tests/unit/wormLocomotion.test.ts tests/unit/terrainCrossing.test.ts`

  Expected: GREEN. Add the exact initial values and “prototype hypothesis” status
  to `docs/BALANCE.md`.

- [ ] **Step 6: Commit**

  ```bash
  git add src/game/domain/terrain src/game/domain/movement src/game/data/movementBalance.ts tests/unit/wormLocomotion.test.ts tests/unit/terrainCrossing.test.ts docs/BALANCE.md
  git commit -m "feat: add worm locomotion states"
  ```

### Task 4: Normalize keyboard, touch, gamepad, and scripted input

**Files:**
- Create: `src/game/input/InputSource.ts`
- Create: `src/game/input/InputRouter.ts`
- Create: `src/game/input/KeyboardInput.ts`
- Create: `src/game/input/TouchInput.ts`
- Create: `src/game/input/GamepadInput.ts`
- Create: `src/game/input/ScriptedInput.ts`
- Create: `tests/unit/inputRouter.test.ts`

**Interfaces:**
- Produces: `InputSource.sample(tick): PartialActionFrame`,
  `InputSource.clear(): void`, and `InputRouter.sample(tick): ActionFrame`.
- Defaults: WASD/arrows steer, Space primary, Shift mobility/Burst, Esc pause;
  gamepad left stick steers, right trigger is primary, right shoulder is
  mobility/Burst, and the south button confirms menus.

- [ ] **Step 1: Write failing router tests**

  Cover clamping, 0.18 gamepad dead zone, held/pressed/released edges, duplicate
  device buttons firing once, most-recent analog source ownership, clear-on-pause,
  and fresh-press requirement after resume.

- [ ] **Step 2: Run the focused test and observe RED**

  Run: `npm run test -- tests/unit/inputRouter.test.ts`

  Expected: FAIL because input ports/router do not exist.

- [ ] **Step 3: Implement ports, pure edge logic, and thin device adapters**

  DOM/Gamepad APIs remain inside adapters. `ScriptedInput` accepts recorded frames
  for deterministic integration tests; actors never query physical devices.

- [ ] **Step 4: Run focused tests and observe GREEN**

  Run: `npm run test -- tests/unit/inputRouter.test.ts`

  Expected: all edge/arbitration cases pass.

- [ ] **Step 5: Commit**

  ```bash
  git add src/game/input tests/unit/inputRouter.test.ts
  git commit -m "feat: unify gameplay input actions"
  ```

### Task 5: Integrate the deterministic movement session and procedural view

**Files:**
- Create: `src/game/domain/session/GameSession.ts`
- Create: `src/game/domain/session/SessionSnapshot.ts`
- Create: `src/game/domain/session/SessionStepResult.ts`
- Create: `src/game/domain/events/DomainEvent.ts`
- Create: `src/game/rendering/WormView.ts`
- Create: `src/game/rendering/WorldRenderer.ts`
- Create: `src/game/rendering/CameraController.ts`
- Create: `src/game/debug/DebugOverlay.ts`
- Create: `src/game/debug/E2EDebugBridge.ts`
- Create: `tests/integration/movementSession.test.ts`
- Create: `tests/integration/catchUpPipeline.test.ts`
- Modify: `src/game/scenes/GameplayScene.ts`
- Modify: `src/game/createGame.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `GameSession.step(action: ActionFrame): SessionStepResult`, where the
  result contains one immutable `SessionSnapshot` and ordered immutable
  `DomainEvent` movement variants for breach and re-entry; also produces
  `WormView.render(snapshot, alpha)` and an E2E-only read API
  `window.__SANDSTRIKE_TEST__` with `snapshot()`,
  `configureNextRun({ seed: number, fixtureId?: string })`, and
  `enqueueActions(frames: readonly ActionFrame[])` through `ScriptedInput`.
- `VITE_ENABLE_TEST_BRIDGE` includes that API only in the dedicated E2E root/pages
  builds. Ordinary production root/pages builds tree-shake the bridge and expose
  no `window.__SANDSTRIKE_TEST__` property.

- [ ] **Step 1: Write the failing deterministic integration test**

  Run the same scripted actions twice and assert equivalent head/follower poses,
  phases, ordered movement events, and tick count; assert rendering is not
  imported by domain code. Add a three-substep catch-up fixture that proves input
  is sampled inside each fixed-step callback: one physical press is `pressed` on
  exactly one simulation tick, held state continues on later substeps, every
  substep event is delivered once in order, and only the last snapshot is rendered.

- [ ] **Step 2: Run it and observe RED**

  Run: `npm run test -- tests/integration/movementSession.test.ts tests/integration/catchUpPipeline.test.ts`

  Expected: FAIL because the session does not exist.

- [ ] **Step 3: Implement the session and snapshot boundary**

  Inside every `FixedStepRunner` callback, sample `InputRouter` for the next
  simulation tick and call `GameSession.step` once. Accumulate events from every
  returned `SessionStepResult` in order, but render only the final snapshot with
  the runner's interpolation alpha. Map `WormMotionEvent` values into the initial
  `DomainEvent` breach/re-entry variants.
  Draw original procedural sky, ground layers, head/body/tail shapes, path samples,
  collision circles, phase, speed, and tick. The debug snapshot also exposes FPS/
  frame time, catch-up/drop count, seed, actor/shape/particle counts, active input
  source, pause reasons, camera bounds, and recent events; low-cost counters remain
  available only behind an explicit debug flag in a production build.

- [ ] **Step 4: Add a velocity-aware camera**

  Start with look-ahead clamped to 180 px horizontally and 120 px vertically plus
  a 0.12 s smoothing half-life. Keep the surface and useful underground depth
  visible, never feed shake/projection into world coordinates, expose camera
  bounds in debug mode, and keep the values in `movementBalance.ts`.

- [ ] **Step 5: Run integration and browser checks**

  Run: `npm run test -- tests/integration/movementSession.test.ts tests/integration/catchUpPipeline.test.ts && npm run typecheck && npm run build && npm run test:smoke:root && npm run test:smoke:pages`

  Expected: GREEN with no domain import of Phaser/DOM and no test bridge in either
  ordinary production build.

- [ ] **Step 6: Commit**

  ```bash
  git add src/game/domain/session src/game/domain/events/DomainEvent.ts src/game/rendering src/game/debug src/game/scenes/GameplayScene.ts src/game/createGame.ts tests/integration/movementSession.test.ts tests/integration/catchUpPipeline.test.ts package.json package-lock.json
  git commit -m "feat: render deterministic worm movement"
  ```

### Task 6: Add responsive touch layout and interruption safety

**Files:**
- Create: `src/game/ui/ViewportLayout.ts`
- Create: `src/game/ui/TouchControls.ts`
- Create: `src/app/PauseCoordinator.ts`
- Create: `tests/unit/viewportLayout.test.ts`
- Create: `tests/unit/pauseCoordinator.test.ts`
- Create: `tests/e2e/movement-controls.spec.ts`
- Modify: `src/app/AppShell.ts`
- Modify: `src/styles/main.css`

**Interfaces:**
- Produces: `computeViewportLayout(input: ViewportLayoutInput):
  ViewportLayoutResult`; the input contains CSS width/height, device-pixel ratio,
  four safe-area insets, orientation, coarse-pointer/touch capability, and role.
- `PauseCoordinator.add(reason)`, `remove(reason)`, `has(reason)`, and read-only
  `reasons` operate on `user`, `visibility`, `focus`, `orientation`, and `system`.

- [ ] **Step 1: Write failing layout and pause tests**

  Cover 1440×900, 1280×720, 1024×768 landscape, 915×412, and 844×390 with safe
  insets; enforce 48 px target preference/44 px floor, no critical-region overlap,
  portrait block, reason stacking, frozen tick, cleared actions, and deliberate
  resume.

- [ ] **Step 2: Run unit tests and observe RED**

  Run: `npm run test -- tests/unit/viewportLayout.test.ts tests/unit/pauseCoordinator.test.ts`

  Expected: FAIL because layout/pause modules are absent.

- [ ] **Step 3: Implement constraint-based layout and touch controls**

  Use no user-agent detection. Capture joystick/action pointers independently,
  respect safe areas, support handedness-ready regions, and prevent scroll/zoom
  only on the active control surface.

- [ ] **Step 4: Wire visibility, focus, resize, and orientation events**

  Discard large resume deltas, clear device state, keep menus usable in portrait,
  and require a fresh input through an accessible resume overlay.

- [ ] **Step 5: Write and run browser lifecycle/control tests**

  Assert keyboard and synthetic touch produce comparable speed/turn direction,
  resizing preserves finite snapshots, portrait/visibility pause freezes ticks,
  and resume does not replay held Burst.

  Run: `npm run test:e2e -- movement-controls.spec.ts`

  Expected: PASS with no console/page/request failure.

- [ ] **Step 6: Commit**

  ```bash
  git add src/game/ui src/app/PauseCoordinator.ts src/app/AppShell.ts src/styles/main.css tests/unit/viewportLayout.test.ts tests/unit/pauseCoordinator.test.ts tests/e2e/movement-controls.spec.ts
  git commit -m "feat: add responsive movement controls"
  ```

### Task 7: Verify the movement-feel gate before content

**Files:**
- Modify: `docs/BALANCE.md`
- Modify: `docs/CHANGELOG.md`
- Modify: `docs/SESSION_HANDOFF.md`

**Interfaces:**
- Consumes: the complete movement slice and all automated evidence.
- Produces: recorded measurements, observed feel limitations, and a go/no-go
  decision for the Rampage plan.

- [ ] **Step 1: Run the complete automated gate**

  Run: `npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e && npm run test:e2e:pages && npm run test:smoke:root && npm run test:smoke:pages`

  Expected: every command exits 0 with no fatal console or required-asset error.

- [ ] **Step 2: Perform desktop movement checks**

  Verify keyboard and available gamepad steering, low/high-speed turning, Burst,
  multiple breach angles, re-entry, deep travel, camera look-ahead, pause/resume,
  debug path/collision display, and ten consecutive breach cycles without jitter.

- [ ] **Step 3: Perform representative touch checks**

  Verify 915×412, 844×390, and 1024×768 landscape layouts, safe areas, simultaneous
  steering+Burst, thumb visibility, portrait/visibility interruption, and resize.

- [ ] **Step 4: Record evidence and rule on tuning**

  Add tested browser/device/viewport, frame observations, settings, failures, and
  accepted or changed values to `BALANCE.md`; update changelog and handoff. If
  movement is not convincing, keep iterating under this task and do not start
  Rampage content.

- [ ] **Step 5: Re-run checks after the last tuning change**

  Run: `npm run verify && npm run test:e2e && npm run test:e2e:pages && npm run test:smoke:root && npm run test:smoke:pages && git diff --check`

  Expected: fresh all-green evidence after the final edit.

- [ ] **Step 6: Commit**

  ```bash
  git add src tests docs/BALANCE.md docs/CHANGELOG.md docs/SESSION_HANDOFF.md
  git commit -m "test: validate worm movement slice"
  ```
