# Phase B Rampage Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Phase B vertical slice with one consumable prey target,
one armed infantry threat, deterministic combat and escalation, score/combo,
responsive HUD and feedback, pause/restart/Results, and versioned local records.

**Architecture:** Extend the Phaser-free `GameSession` with actor aggregates,
normalized collision contacts, a bounded typed event queue, focused combat,
scoring, combo, spawn, threat, and mode-rule systems. Presentation drains
immutable snapshots/events into pooled procedural views and an accessible DOM
HUD. `SaveCoordinator` is the only persistence policy owner and degrades to an
in-memory repository when browser storage is unusable.

**Tech Stack:** The exact pinned stack produced by
`2026-10-01-phase-b-foundation.md` and the contracts verified by
`2026-10-01-phase-b-worm-movement.md`.

**Spec:** `docs/GAME_DESIGN.md` sections 7, 11–18.1;
`docs/ARCHITECTURE.md` sections 7, 10–19, and 21.

## Global Constraints

- Complete the foundation and movement plans first, including the explicit
  movement-feel go decision recorded in `docs/SESSION_HANDOFF.md`.
- Apply every constraint and public contract in the Phase B plan-set index.
- Keep domain modules independent of Phaser, DOM, `localStorage`, audio, and
  wall-clock APIs; the scene composes, steps, renders, and drains events only.
- Resolve logical contacts in stable order and defer actor removal until event
  processing ends. One actor may be consumed or destroyed only once.
- Keep logical collision profiles separate from procedural placeholder visuals.
- Use one run seed with named gameplay streams. Presentation randomness may not
  alter spawn, AI, damage, score, or combo outcomes.
- Put score, combat, spawn, AI, feedback, and accessibility values in validated
  typed data. Record tested tuning and rationale in `docs/BALANCE.md`.
- Use original procedural programmer art and generated Web Audio tones/noise only;
  add no copied or external asset without provenance in `docs/ASSET_LICENSES.md`.
- Implement response bands 0 and 1 only. Do not add vehicles, aircraft, Hunter,
  AI worm, currency, upgrades, achievements, account, analytics, or backend.
- Keep every run playable when storage, audio, gamepad, or haptics is unavailable.

## Review Focus

- Maximum-speed swept head/projectile contacts cannot tunnel, double-resolve, or
  award score after deferred removal.
- Pause, restart, and run end freeze every gameplay timer and publish one result
  and one persistence update, even when events share a tick.
- Combo grace/decay, variety credit, and threat changes derive from simulation
  ticks rather than rendering or wall time.
- Infantry telegraph, shot cadence, and aim use only its allowed perception and
  remain reproducible from seed plus action frames.
- Corrupt, future-version, quota-denied, and unavailable storage never block boot
  or active play; a valid backup is preserved before replacement.
- At 915×412 and 844×390, health, score/combo, threat warning, pause, joystick,
  Bite, and Burst remain readable and operable without critical overlap.

---

### Task 1: Normalize contacts and publish bounded domain events

**Files:**
- Create: `src/game/domain/actors/Actor.ts`
- Create: `src/game/domain/actors/ActorRegistry.ts`
- Create: `src/game/domain/collision/CollisionTypes.ts`
- Create: `src/game/domain/collision/CollisionWorld.ts`
- Modify: `src/game/domain/events/DomainEvent.ts`
- Create: `src/game/domain/events/EventQueue.ts`
- Create: `src/game/data/collisionProfiles.ts`
- Create: `tests/unit/collisionWorld.test.ts`
- Create: `tests/unit/eventQueue.test.ts`
- Create: `tests/integration/contactPipeline.test.ts`
- Modify: `src/game/domain/session/GameSession.ts`
- Modify: `src/game/domain/session/SessionSnapshot.ts`
- Modify: `src/game/domain/session/SessionStepResult.ts`

**Interfaces:**
- Produces immutable `ActorId`, `ActorState`, `CollisionShape`,
  `CollisionProfile`, and `Contact` records; extends the existing `DomainEvent`
  union with actor/contact/combat lifecycle variants.
- `CollisionWorld.query(previous, current): readonly Contact[]` performs swept
  head/projectile queries and returns contacts ordered by contact priority, stable
  actor ID, and contact kind.
- `EventQueue.publish(event): boolean` and
  `EventQueue.drain(): readonly DomainEvent[]` enforce a configured per-tick
  bound without recursive delivery.
- `GameSession.step(actionFrame): SessionStepResult` commits deferred spawns/
  removals only after contact and event resolution and returns one immutable
  snapshot plus the ordered drained events.

- [ ] **Step 1: Write failing collision behavior tests**

  Cover circle, capsule, and axis-aligned-box overlap; maximum configured head
  sweep through a thin target; projectile sweep; collision masks; deterministic
  ordering from reversed insertion order; and zero duplicate contact IDs.

- [ ] **Step 2: Write failing event and deferred-removal tests**

  Cover FIFO publication, immutable drained records, queue overflow diagnostic,
  no event processing recursion, one-time consume/destroy markers, and an actor
  remaining queryable until the end-of-tick commit.

- [ ] **Step 3: Run focused tests and observe RED**

  Run: `npm run test -- tests/unit/collisionWorld.test.ts tests/unit/eventQueue.test.ts tests/integration/contactPipeline.test.ts`

  Expected: FAIL because the actor, collision, and event contracts do not exist.

- [ ] **Step 4: Implement the minimal actor/contact/event pipeline**

  Give each actor one stable ID, definition ID, faction, transform, health, tags,
  collision profile, and lifecycle state. Start with a logical 18 px worm-head
  circle, 10 px prey circle, 9×16 px infantry half-extents, and 3 px projectile
  circle. Use a 256-event initial queue cap;
  rejected overflow increments a typed session diagnostic outside the full queue
  so reporting cannot recurse. Do not expose Phaser bodies to domain code.

- [ ] **Step 5: Run focused tests and observe GREEN**

  Run: `npm run test -- tests/unit/collisionWorld.test.ts tests/unit/eventQueue.test.ts tests/integration/contactPipeline.test.ts && npm run typecheck`

  Expected: every contact/order/lifecycle case passes with no domain dependency
  on Phaser, DOM, storage, or audio.

- [ ] **Step 6: Commit**

  ```bash
  git add src/game/domain/actors src/game/domain/collision src/game/domain/events src/game/data/collisionProfiles.ts src/game/domain/session/GameSession.ts src/game/domain/session/SessionSnapshot.ts src/game/domain/session/SessionStepResult.ts tests/unit/collisionWorld.test.ts tests/unit/eventQueue.test.ts tests/integration/contactPipeline.test.ts
  git commit -m "feat: add deterministic contact pipeline"
  ```

### Task 2: Add Bite, impact damage, consumption, and health sustain

**Files:**
- Create: `src/game/domain/abilities/Ability.ts`
- Create: `src/game/domain/abilities/AbilitySystem.ts`
- Create: `src/game/domain/combat/CombatSystem.ts`
- Create: `src/game/domain/combat/DamageResolver.ts`
- Create: `src/game/domain/combat/Health.ts`
- Create: `src/game/data/abilities.ts`
- Create: `src/game/data/actors.ts`
- Create: `src/game/data/combatBalance.ts`
- Create: `tests/unit/abilitySystem.test.ts`
- Create: `tests/unit/damageResolver.test.ts`
- Create: `tests/integration/preyConsumption.test.ts`
- Modify: `src/game/domain/session/GameSession.ts`
- Modify: `src/game/domain/events/DomainEvent.ts`

**Interfaces:**
- Produces validated `AbilityDefinition`, `AbilityState`, `DamageCommand`,
  `DamageResult`, and health helpers with explicit clamping.
- `AbilityDefinition` contains stable ID, allowed owner tags, cooldown ticks,
  optional resource cost, activation-condition ID, execution-strategy ID,
  telemetry/debug tags, and feedback hook IDs; strategies are registered by ID
  rather than selected by actor-name branches.
- Bite activates from `primary.pressed`, remains active for its configured tick
  window, and emits contacts through the same logical pipeline as impact.
- Damage events carry source, target, ability, tick, amount, and tags. Consumption
  emits `TargetConsumed` and `ActorHealed` at most once for one prey actor.

- [ ] **Step 1: Write failing ability and damage tests**

  Assert Bite edge activation, active-window boundaries, cooldown rejection,
  impact threshold and speed scaling, armor/tag routing, non-negative health,
  invulnerability-window behavior, cause tags, and deterministic simultaneous
  damage ordering.

- [ ] **Step 2: Write the failing prey-consumption integration test**

  Spawn one stationary prey target, strike it by Bite and by impact in separate
  fixtures, and assert one removal, one score-eligible consume event, health gain
  capped at max health, no repeated healing on overlapping ticks, and no healing
  from an infantry actor.

- [ ] **Step 3: Run focused tests and observe RED**

  Run: `npm run test -- tests/unit/abilitySystem.test.ts tests/unit/damageResolver.test.ts tests/integration/preyConsumption.test.ts`

  Expected: FAIL because the ability/combat modules and prey definition are
  absent.

- [ ] **Step 4: Implement the minimum combat slice**

  Start with provisional data: worm health 100; prey health 1; Bite active for 6
  ticks with a 24-tick cooldown, a 34 px circle offset 20 px forward, and 15
  damage; prey healing 8; impact activation at 220 px/s with linear damage from
  10 at threshold to 40 at the 460 px/s Burst cap; and a 30-tick worm post-hit
  invulnerability window. Keep every number in typed data and validate references/
  ranges at test boot.

- [ ] **Step 5: Record and verify the tuning hypothesis**

  Add the values, date, build/test fixture, and “prototype hypothesis” status to
  `docs/BALANCE.md`.

  Run: `npm run test -- tests/unit/abilitySystem.test.ts tests/unit/damageResolver.test.ts tests/integration/preyConsumption.test.ts`

  Expected: GREEN; a prey actor cannot produce duplicate removal, healing, or
  score-eligible events.

- [ ] **Step 6: Commit**

  ```bash
  git add src/game/domain/abilities src/game/domain/combat src/game/data/abilities.ts src/game/data/actors.ts src/game/data/combatBalance.ts src/game/domain/session/GameSession.ts src/game/domain/events/DomainEvent.ts tests/unit/abilitySystem.test.ts tests/unit/damageResolver.test.ts tests/integration/preyConsumption.test.ts docs/BALANCE.md
  git commit -m "feat: add worm combat and prey sustain"
  ```

### Task 3: Add one readable armed infantry threat

**Files:**
- Create: `src/game/domain/ai/PerceptionSnapshot.ts`
- Create: `src/game/domain/ai/InfantryController.ts`
- Create: `src/game/domain/actors/enemies/ProjectileSystem.ts`
- Create: `src/game/domain/random/RandomSource.ts`
- Create: `src/game/data/enemies.ts`
- Create: `src/game/data/aiBalance.ts`
- Create: `tests/unit/randomSource.test.ts`
- Create: `tests/unit/infantryController.test.ts`
- Create: `tests/unit/projectileSystem.test.ts`
- Create: `tests/integration/infantryEncounter.test.ts`
- Modify: `src/game/domain/session/GameSession.ts`
- Modify: `src/game/domain/events/DomainEvent.ts`
- Modify: `src/game/debug/E2EDebugBridge.ts`

**Interfaces:**
- Produces named deterministic random streams, read-only
  `PerceptionSnapshot`, `InfantryState` (`idle`, `reposition`, `telegraph`,
  `fire`, `recover`), `InfantryDecision`, and pooled logical projectiles.
- `InfantryController.step(perception, tick, random): InfantryDecision` reads only
  visible/allowed facts and includes state, target, transition reason, and aim
  point in the debug snapshot.
- `ProjectileSystem.step(dtSeconds, collisionWorld)` uses swept contacts and emits
  normalized damage events; views never decide hits.

- [ ] **Step 1: Write failing seeded-random tests**

  Assert equal seeds and stream names produce equal sequences, different named
  streams do not consume one another, bounded integer/float outputs remain valid,
  and presentation randomness is a separate object.

- [ ] **Step 2: Write failing infantry behavior tests**

  Cover minimum state dwell, visible telegraph before every shot, lateral
  repositioning, fire cadence, aim limited to perceived current/recent worm
  position, no hidden-input access, stable tie-breaking, and deterministic
  decisions for equal seed/perception history.

- [ ] **Step 3: Write failing projectile and encounter tests**

  Assert pool reset, maximum-speed sweep, one hit, damage plus invulnerability,
  expiry/world-bound removal, no post-removal hit, worm destruction of infantry,
  and identical encounter snapshots/events for equal seed and action frames.

- [ ] **Step 4: Run focused tests and observe RED**

  Run: `npm run test -- tests/unit/randomSource.test.ts tests/unit/infantryController.test.ts tests/unit/projectileSystem.test.ts tests/integration/infantryEncounter.test.ts`

  Expected: FAIL because the random, AI, and projectile modules are absent.

- [ ] **Step 5: Implement the smallest band-1 threat**

  Start with provisional data: infantry health 25, 90 px/s lateral reposition,
  0.6 s telegraph, one shot every 1.5 s after recovery, projectile speed 480 px/s,
  projectile lifetime 2.5 s, damage 10, and a pool/cap of 24 projectiles. Announce
  each shot through shape/motion plus a presentation hook; do not require audio.

- [ ] **Step 6: Run tests, expose diagnostics, and record tuning**

  Add AI state, transition reason, perceived target, aim point, cooldown, active
  projectile count, and recent events to the read-only debug bridge. Record all
  initial values as prototype hypotheses in `docs/BALANCE.md`.

  Run: `npm run test -- tests/unit/randomSource.test.ts tests/unit/infantryController.test.ts tests/unit/projectileSystem.test.ts tests/integration/infantryEncounter.test.ts && npm run typecheck`

  Expected: GREEN with deterministic results and no render-side hit logic.

- [ ] **Step 7: Commit**

  ```bash
  git add src/game/domain/ai src/game/domain/actors/enemies src/game/domain/random src/game/data/enemies.ts src/game/data/aiBalance.ts src/game/domain/session/GameSession.ts src/game/domain/events/DomainEvent.ts src/game/debug/E2EDebugBridge.ts tests/unit/randomSource.test.ts tests/unit/infantryController.test.ts tests/unit/projectileSystem.test.ts tests/integration/infantryEncounter.test.ts docs/BALANCE.md
  git commit -m "feat: add readable infantry threat"
  ```

### Task 4: Drive score, combo, spawn, and response band from events

**Files:**
- Create: `src/game/domain/scoring/ScoreSystem.ts`
- Create: `src/game/domain/scoring/ComboSystem.ts`
- Create: `src/game/domain/spawning/SpawnDirector.ts`
- Create: `src/game/domain/spawning/ThreatDirector.ts`
- Create: `src/game/data/rampageBalance.ts`
- Create: `src/game/data/modes.ts`
- Create: `src/game/data/validateDefinitions.ts`
- Create: `tests/unit/scoreSystem.test.ts`
- Create: `tests/unit/comboSystem.test.ts`
- Create: `tests/unit/spawnDirector.test.ts`
- Create: `tests/unit/threatDirector.test.ts`
- Create: `tests/unit/dataValidation.test.ts`
- Create: `tests/integration/rampagePacing.test.ts`
- Modify: `src/game/domain/session/GameSession.ts`
- Modify: `src/game/domain/session/SessionSnapshot.ts`
- Modify: `src/game/domain/events/DomainEvent.ts`

**Interfaces:**
- `ScoreSystem.consume(events, comboState): ScoreDelta` rewards typed causes only.
- `ComboSystem.step(events, tick): ComboState` exposes chain count, multiplier,
  grace ticks, visible decay phase, maximum chain, and last credited category.
- `SpawnDirector.step(snapshot, randomStream): readonly SpawnCommand[]` respects
  typed arena regions and actor caps.
- `ThreatDirector.step(snapshot, events): ThreatState` may enter band 1 only after
  its warning period; it cannot increase every actor's health.

- [ ] **Step 1: Write failing score/combo tests**

  Cover prey and infantry values, multi-target breach bonus, alternating-category
  variety credit, repeat-category reduction, 3.0 s grace, visible decay before
  reset, multiplier cap, no reward for duplicate/untyped removal, pause-frozen
  ticks, and stable simultaneous-event order.

- [ ] **Step 2: Write failing spawn/threat tests**

  Assert equal seed produces equal spawn sequence, legal non-overlapping spawn
  regions, active caps, off-camera lead-in, low-health prey opportunity, band-1
  trigger from elapsed time or destruction pressure, a 2.0 s warning before
  infantry activation, and no band above 1.

- [ ] **Step 3: Write failing definition-validation tests**

  Reject duplicate IDs, missing references, negative/out-of-range values,
  impossible collision masks, invalid spawn weights/caps, and role-incompatible
  abilities before a run starts. Assert validated definitions are immutable for
  the lifetime of an active run.

- [ ] **Step 4: Run focused tests and observe RED**

  Run: `npm run test -- tests/unit/scoreSystem.test.ts tests/unit/comboSystem.test.ts tests/unit/spawnDirector.test.ts tests/unit/threatDirector.test.ts tests/unit/dataValidation.test.ts tests/integration/rampagePacing.test.ts`

  Expected: FAIL because the reward/director/data modules are absent.

- [ ] **Step 5: Implement bands 0–1 and provisional values**

  Start with a 4,800 px-wide bounded prototype arena; prey 100 points, infantry
  250, 25% variety credit, multiplier steps
  at chain 3 and 6 with a 3× cap, 3.0 s grace plus 0.75 s visible decay, maximum 8
  prey and 4 infantry active, and band 1 at 45 s or 1,000 base points after a 2.0
  s warning. Store seconds as validated simulation ticks at session creation.

- [ ] **Step 6: Run deterministic pacing and record the hypothesis**

  Run a scripted 90-second fixture twice and assert equal spawn IDs, band timing,
  score, combo, actor caps, and event sequence. Record the exact values, fixture,
  and expected player effect in `docs/BALANCE.md`.

  Run: `npm run test -- tests/unit/scoreSystem.test.ts tests/unit/comboSystem.test.ts tests/unit/spawnDirector.test.ts tests/unit/threatDirector.test.ts tests/unit/dataValidation.test.ts tests/integration/rampagePacing.test.ts`

  Expected: GREEN; only response bands 0 and 1 appear.

- [ ] **Step 7: Commit**

  ```bash
  git add src/game/domain/scoring src/game/domain/spawning src/game/data/rampageBalance.ts src/game/data/modes.ts src/game/data/validateDefinitions.ts src/game/domain/session/GameSession.ts src/game/domain/session/SessionSnapshot.ts src/game/domain/events/DomainEvent.ts tests/unit/scoreSystem.test.ts tests/unit/comboSystem.test.ts tests/unit/spawnDirector.test.ts tests/unit/threatDirector.test.ts tests/unit/dataValidation.test.ts tests/integration/rampagePacing.test.ts docs/BALANCE.md
  git commit -m "feat: add Rampage scoring and response pacing"
  ```

### Task 5: Render actors, feedback, and the responsive Rampage HUD

**Files:**
- Create: `src/game/rendering/ActorViews.ts`
- Create: `src/game/rendering/EffectsRenderer.ts`
- Create: `src/game/rendering/FeedbackController.ts`
- Create: `src/game/infrastructure/phaser/PhaserAudioAdapter.ts`
- Create: `src/game/ui/hud/RampageHud.ts`
- Create: `src/game/ui/hud/RampageHudModel.ts`
- Create: `src/game/ui/hud/SettingsPanel.ts`
- Create: `tests/unit/rampageHudModel.test.ts`
- Create: `tests/unit/feedbackController.test.ts`
- Create: `tests/e2e/rampage-hud.spec.ts`
- Modify: `src/game/rendering/WorldRenderer.ts`
- Modify: `src/game/ui/ViewportLayout.ts`
- Modify: `src/game/scenes/GameplayScene.ts`
- Modify: `src/app/AppShell.ts`
- Modify: `src/styles/main.css`

**Interfaces:**
- `RampageHudModel.fromSnapshot(snapshot)` returns health, score, combo/grace,
  threat/warning, Bite, Burst, pause, and status-announcement state without
  reading Phaser objects.
- `FeedbackController.consume(events, settings)` returns capped presentation
  commands for hit flash, debris, text/icon, camera impulse, generated tone, and
  optional haptic hooks. Missing audio/haptics is a no-op.
- `ActorViews.sync(snapshot)` and `EffectsRenderer.consume(commands)` reuse pooled
  procedural objects and never mutate domain state.

- [ ] **Step 1: Write failing HUD-model tests**

  Assert health, score, multiplier, grace/decay warning, band-change warning,
  cooldown state, reduced-motion labels, and non-color-only status text for the
  relevant immutable snapshots.

- [ ] **Step 2: Write failing feedback-policy tests**

  Cover distinct Bite/impact/damage/blocked-armor/heal/band/failure commands,
  low-health warning, particle caps, at least two available modalities for each
  critical cue without requiring audio/color/haptics, screen-shake off/intensity,
  reduced motion/flashes, event deduplication, and silent operation before audio
  unlock or when Web Audio is unavailable.

- [ ] **Step 3: Run unit tests and observe RED**

  Run: `npm run test -- tests/unit/rampageHudModel.test.ts tests/unit/feedbackController.test.ts`

  Expected: FAIL because HUD and feedback modules are absent.

- [ ] **Step 4: Implement original procedural presentation**

  Draw prey, infantry, projectiles, telegraphs, hit/heal cues, and capped dust as
  distinct geometric silhouettes. Make screen shake additive and settings-bound.
  Generate simple tones/noise at runtime only after a user gesture; gameplay must
  remain fully legible while muted.

- [ ] **Step 5: Implement responsive HUD and settings controls**

  Keep HUD in semantic DOM with live announcements throttled for score/combo.
  Include master/music/effects volume, shake, reduced motion, reduced flashes,
  high contrast, touch handedness/opacity, and optional haptics. Aim for 48 CSS px
  controls and enforce the 44 CSS px floor.

- [ ] **Step 6: Write and run the browser layout/feedback checks**

  At 1440×900, 1280×720, 1024×768, 915×412, and 844×390, assert no critical HUD
  overlap, usable pause/Bite/Burst regions, visible band warning outside thumb
  zones, one pooled view per actor ID, and no console/page/request failure.

  Run: `npm run test:e2e -- rampage-hud.spec.ts`

  Expected: PASS; settings changes update presentation without changing domain
  score, movement, damage, or timers.

- [ ] **Step 7: Commit**

  ```bash
  git add src/game/rendering src/game/infrastructure/phaser/PhaserAudioAdapter.ts src/game/ui/hud src/game/ui/ViewportLayout.ts src/game/scenes/GameplayScene.ts src/app/AppShell.ts src/styles/main.css tests/unit/rampageHudModel.test.ts tests/unit/feedbackController.test.ts tests/e2e/rampage-hud.spec.ts
  git commit -m "feat: present Rampage combat and HUD"
  ```

### Task 6: Complete run rules, pause, restart, and Results

**Files:**
- Create: `src/game/domain/modes/ModeRules.ts`
- Create: `src/game/domain/modes/RampageRules.ts`
- Create: `src/game/domain/modes/RunResult.ts`
- Create: `src/game/domain/session/SessionCommand.ts`
- Create: `src/game/application/RunFactory.ts`
- Create: `src/game/application/SessionController.ts`
- Create: `src/app/NavigationCoordinator.ts`
- Create: `src/game/ui/ResultsView.ts`
- Create: `tests/unit/rampageRules.test.ts`
- Create: `tests/unit/navigationCoordinator.test.ts`
- Create: `tests/integration/runLifecycle.test.ts`
- Create: `tests/e2e/rampage-flow.spec.ts`
- Modify: `src/app/PauseCoordinator.ts`
- Modify: `src/game/domain/session/GameSession.ts`
- Modify: `src/game/domain/session/SessionStepResult.ts`
- Modify: `src/game/domain/events/DomainEvent.ts`
- Modify: `src/game/debug/E2EDebugBridge.ts`
- Modify: `src/app/AppShell.ts`
- Modify: `src/game/scenes/GameplayScene.ts`
- Modify: `src/styles/main.css`

**Interfaces:**
- `SessionCommand` includes immutable `RequestEnd` with reason and requested tick.
  `GameSession.queueCommand(command: SessionCommand): void` consumes queued
  commands at the next deterministic end-of-tick boundary after combat events;
  `flushControlCommands(): SessionStepResult` resolves them while paused without
  advancing tick, AI, timers, or projectiles.
- `ModeRules.observe` accepts a `SessionSnapshot`, ordered `DomainEvent[]`, and
  ordered `SessionCommand[]`, then returns `ModeUpdate` and owns objective/end
  logic. If lethal damage and `RequestEnd` coexist at one boundary, `defeated`
  takes priority over `player-ended`; an ended-state guard rejects later results.
- `RampageRules` ends only when player health reaches zero or the player confirms
  end-run; it creates one immutable `RunResult` with reason, score, duration,
  maximum combo, targets by class, highest band, and health recovered.
- `SessionController` owns exactly one active session and supports `start`,
  `pause`, `resume`, `restart`, `requestEnd`, and `destroy` without duplicate
  canvases or listeners. A confirmed pause-menu exit queues `RequestEnd` and uses
  the zero-time command boundary rather than constructing a result itself.
- `NavigationCoordinator` owns title/menu/preview/run/pause/results transitions.

- [ ] **Step 1: Write failing rule and lifecycle tests**

  Cover health-zero and confirmed-end reasons; defeat priority plus exactly one
  `RunEnded` event/result when lethal damage and exit share a tick; zero-time
  paused exit without clock/AI/projectile advancement; duration from simulation
  ticks; role statistics; pause-frozen simulation/combo/threat/projectile clocks;
  fresh input on resume; restart with a new session ID/seed; and complete teardown
  of old listeners.

- [ ] **Step 2: Write failing navigation tests**

  Assert legal transitions, focus restoration, pause-reason stacking, restart
  confirmation, quit confirmation, Retry, Change mode, Main menu, How to Play,
  Settings, Credits, browser-back interception during a run, first-run contextual
  prompts, and no route requiring a server rewrite.

- [ ] **Step 3: Run unit/integration tests and observe RED**

  Run: `npm run test -- tests/unit/rampageRules.test.ts tests/unit/navigationCoordinator.test.ts tests/integration/runLifecycle.test.ts`

  Expected: FAIL because mode/lifecycle/navigation contracts are absent.

- [ ] **Step 4: Implement the minimum Phase B flow**

  Provide Title, Main menu, role/mode selection, Rampage preview, How to Play,
  Settings, Credits, active run, Pause, and Results. Keep Hunt as informative
  “planned for Phase C” text rather than a nonfunctional button. Show short
  contextual prompts on the first run and allow How to Play to replay them.
  Results includes outcome/reason, score, record-status placeholder, duration,
  max combo, Rampage statistics, Retry, Change mode, and Main menu.

- [ ] **Step 5: Write and run end-to-end run-flow checks**

  In dedicated E2E builds, call `configureNextRun` with the named
  `rampage-short` fixture before starting through the real menu; then drive the
  semantic UI/input path to pause/resume, reach Results, retry, and return to menu.
  Assert one canvas, one result, frozen ticks while paused, fresh input after
  resume, accessible focus, and zero console/page/request failure. The fixture
  changes initial seed/spawns/tuning only and cannot mutate an active session.

  Run: `npm run test:e2e -- rampage-flow.spec.ts && npm run test:e2e:pages -- rampage-flow.spec.ts`

  Expected: PASS in Chromium for both E2E root and `/Sandstrike/` builds.

- [ ] **Step 6: Commit**

  ```bash
  git add src/game/domain/modes src/game/domain/session/SessionCommand.ts src/game/domain/session/GameSession.ts src/game/domain/session/SessionStepResult.ts src/game/domain/events/DomainEvent.ts src/game/application/RunFactory.ts src/game/application/SessionController.ts src/game/debug/E2EDebugBridge.ts src/app/NavigationCoordinator.ts src/game/ui/ResultsView.ts src/app/PauseCoordinator.ts src/app/AppShell.ts src/game/scenes/GameplayScene.ts src/styles/main.css tests/unit/rampageRules.test.ts tests/unit/navigationCoordinator.test.ts tests/integration/runLifecycle.test.ts tests/e2e/rampage-flow.spec.ts
  git commit -m "feat: complete Rampage run flow"
  ```

### Task 7: Persist settings and accepted results safely

**Files:**
- Create: `src/game/save/SaveData.ts`
- Create: `src/game/save/SaveValidation.ts`
- Create: `src/game/save/SaveMigrations.ts`
- Create: `src/game/application/SaveCoordinator.ts`
- Create: `src/game/infrastructure/storage/SaveRepository.ts`
- Create: `src/game/infrastructure/storage/LocalStorageSaveRepository.ts`
- Create: `src/game/infrastructure/storage/MemorySaveRepository.ts`
- Create: `tests/fixtures/save/v1-valid.json`
- Create: `tests/fixtures/save/corrupt.json`
- Create: `tests/fixtures/save/future.json`
- Create: `tests/unit/saveValidation.test.ts`
- Create: `tests/unit/saveMigrations.test.ts`
- Create: `tests/unit/saveCoordinator.test.ts`
- Create: `tests/integration/resultPersistence.test.ts`
- Create: `tests/e2e/save-recovery.spec.ts`
- Modify: `src/app/AppShell.ts`
- Modify: `src/game/ui/ResultsView.ts`
- Modify: `src/game/ui/hud/SettingsPanel.ts`

**Interfaces:**
- `SaveRepository.load(key): string | null` and `replace(key, value): void` are
  raw storage ports; adapters may throw and expose no gameplay policy.
- Save schema v1 contains schema/app version, Rampage best score/stat summary,
  settings/accessibility/control preferences, and onboarding flags only.
- `SaveCoordinator.load(): LoadResult`, `updateSettings(patch)`,
  `acceptRunResult(result)`, and `resetConfirmed()` validate complete documents,
  preserve the prior valid primary as backup, and fall back to memory on failure.

- [ ] **Step 1: Write failing validation and migration tests**

  Cover empty storage defaults, valid v1, malformed JSON, wrong shapes, rejection
  of unknown object keys at schema boundaries, future version rejection, every
  supported migration fixture, default merging, and post-migration validation.

- [ ] **Step 2: Write failing coordinator failure-path tests**

  Cover valid-primary load, corrupt-primary/valid-backup recovery, both corrupt,
  read SecurityError, write quota failure, complete-document replacement,
  previous-valid backup preservation, nonfatal diagnostics, memory fallback,
  explicit reset confirmation, and no write when settings/result are unchanged.

- [ ] **Step 3: Write the failing result-persistence integration test**

  Assert one completed run produces exactly one accepted update, a lower score
  does not replace the record, a higher score does, new-record state reaches
  Results, and reload returns the same validated settings/record. Reuse the
  lethal-damage-plus-exit fixture and assert its one result causes exactly one
  persistence acceptance and at most one repository replacement.

- [ ] **Step 4: Run focused tests and observe RED**

  Run: `npm run test -- tests/unit/saveValidation.test.ts tests/unit/saveMigrations.test.ts tests/unit/saveCoordinator.test.ts tests/integration/resultPersistence.test.ts`

  Expected: FAIL because the save schema, ports, and coordinator are absent.

- [ ] **Step 5: Implement v1, adapters, and recoverable UI diagnostics**

  Use environment-namespaced primary and backup keys. Show a concise nonblocking
  message when memory fallback is active. Persist settings after a real change and
  results after one accepted `RunResult`; never persist a mid-run snapshot.

- [ ] **Step 6: Write and run browser recovery checks**

  Preload valid, corrupt, future, and throwing-storage fixtures. Assert the game
  boots, settings remain operable, Results records only valid improvements, reset
  requires confirmation, reload recovers valid data, and no uncaught exception or
  fatal console/page/request failure occurs.

  Run: `npm run test:e2e -- save-recovery.spec.ts`

  Expected: PASS for all storage states.

- [ ] **Step 7: Commit**

  ```bash
  git add src/game/save src/game/application/SaveCoordinator.ts src/game/infrastructure/storage src/app/AppShell.ts src/game/ui/ResultsView.ts src/game/ui/hud/SettingsPanel.ts tests/fixtures/save tests/unit/saveValidation.test.ts tests/unit/saveMigrations.test.ts tests/unit/saveCoordinator.test.ts tests/integration/resultPersistence.test.ts tests/e2e/save-recovery.spec.ts
  git commit -m "feat: persist Rampage records safely"
  ```

### Task 8: Verify and document the Phase B vertical-slice gate

**Files:**
- Create: `tests/e2e/phase-b-smoke.spec.ts`
- Modify: `playwright.pages.config.ts`
- Modify: `README_START_HERE.md`
- Modify: `docs/BALANCE.md`
- Modify: `docs/CHANGELOG.md`
- Modify: `docs/DECISIONS.md`
- Modify: `docs/SESSION_HANDOFF.md`

**Interfaces:**
- Consumes the complete foundation, movement, and Rampage implementation plus
  fresh automated/manual evidence.
- Produces the explicit Phase B go/no-go ruling and the measured inputs needed to
  plan Phase C without reopening settled Phase A decisions.

- [ ] **Step 1: Add a built-output full-flow smoke**

  In both dedicated E2E built outputs, configure the named Phase B smoke fixture,
  then start Rampage through the real UI, steer/breach, consume prey, take infantry
  damage, destroy infantry, observe combo and band warning, pause/resume, reach
  Results, persist a best score, reload it, and retry. Assert no duplicate award/
  result/write and no fatal console, page, or required-request error. In ordinary
  production root/pages builds, assert the same app boots and the bridge is absent.

- [ ] **Step 2: Run the complete automated gate**

  Run: `npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e && npm run test:e2e:pages && npm run test:smoke:root && npm run test:smoke:pages`

  Expected: every command exits 0. E2E root and `/Sandstrike/` built outputs
  complete the Phase B flow; ordinary production outputs expose no bridge; none
  has a fatal console or required-asset error.

- [ ] **Step 3: Inspect architecture and hot-loop boundaries**

  Confirm domain code imports no Phaser/DOM/storage/audio modules, the scene does
  not own combat/score/save rules, tunable values remain in typed data, object
  pools reset state, event/contact ordering is stable, and no avoidable hot-loop
  allocation was introduced. Run the repository's dependency-boundary checks.

- [ ] **Step 4: Perform desktop gameplay checks**

  On a documented Chromium build and desktop viewport, verify first intentional
  breach hit, prey Bite/impact, healing, infantry telegraph/projectile/damage,
  combo warning/decay, band warning, failure, pause/restart/Results/retry, keyboard,
  available gamepad, audio unlock/mute, reduced feedback settings, camera, and ten
  repeated high-speed breach contacts without jitter or duplicate awards.

- [ ] **Step 5: Perform touch and responsive checks**

  Verify 915×412, 844×390, and 1024×768 landscape with representative safe-area
  insets: simultaneous steering+Bite/Burst, critical cue visibility, target sizes,
  handedness/opacity, pause/resume, resize, portrait interruption, touch cancel,
  and no stuck action. Record any real-device limitation honestly.

- [ ] **Step 6: Measure and record the representative encounter**

  Record browser/device, production build, viewport, seed, active actors/shapes/
  projectiles/particles, FPS/frame-time distribution, slow-frame count, simulation
  tick cost, catch-up/drop count, memory observation, console errors, run length,
  first-hit time, and remaining feel limitations. Do not claim a mobile device
  result from emulation alone.

- [ ] **Step 7: Run a fresh final verification after the last fix or tuning edit**

  For any failure, invoke `superpowers:systematic-debugging`, reproduce it, add a
  failing test where appropriate, make the smallest fix, and repeat the affected
  manual check.

  Run: `npm run verify && npm run test:e2e && npm run test:e2e:pages && npm run test:smoke:root && npm run test:smoke:pages && git diff --check`

  Expected: fresh all-green evidence for the final tree.

- [ ] **Step 8: Review the completed implementation**

  Invoke `superpowers:requesting-code-review`. Resolve every Critical or Important
  finding, rerun affected verification, and record accepted Minor follow-ups.

- [ ] **Step 9: Update durable documentation and rule on Phase B**

  Update the README with verified setup/build/deploy/play controls; `BALANCE` with
  measured values/rationale; `CHANGELOG` with player-visible behavior; `DECISIONS`
  with any accepted compatibility/architecture ruling; and `SESSION_HANDOFF` with
  exact commits, evidence, limitations, and either:

  - **GO:** Phase B gate passes and the next action is to invoke
    `superpowers:writing-plans` for Phase C using measured evidence; or
  - **NO-GO:** keep the exact failing criterion and next reproduction/fix inside
    Phase B. Do not plan broader content.

- [ ] **Step 10: Commit**

  ```bash
  git add tests/e2e/phase-b-smoke.spec.ts playwright.pages.config.ts README_START_HERE.md docs/BALANCE.md docs/CHANGELOG.md docs/DECISIONS.md docs/SESSION_HANDOFF.md
  git commit -m "test: verify Phase B vertical slice"
  ```
