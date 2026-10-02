# Phase C Hunt Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Ranger/Hunt a complete prediction, trap, shooting and relay-defense
loop with an AI worm, explicit Results and durable records.

**Architecture:** Reuse GameSession's deterministic boundaries and shared combat.
HuntSystems composes small Hunter, rifle, snare, tracking and AI modules. Presentation
consumes restricted Hunt cues and exposed poses; ordinary views never use debug AI.

**Tech Stack:** Existing pinned stack; no new packages.

**Spec:** GAME_DESIGN sections 8–18.2 and ARCHITECTURE sections 7–15, 21;
global constraints/contracts in `2026-10-02-phase-c-plan-set.md` apply to every task.

## Global Constraints

- Work in root on phase-b-ready; preserve existing Rampage and laboratory fixtures.
- No second scene/simulation, runtime LLM or new backend.
- Movement/AI/snare/reload/invulnerability advance only on simulation ticks.
- AI never reads device input or Phaser objects. Use named `ai.worm` randomness.
- No exact underground pose in normal camera/HUD/effects/aim-assist input.
- Surface-only Hunter movement and one active Seismic Snare distinguish the role.

## Review Focus

- Held movement plus pointer aim/fire survives device arbitration (Task 4).
- Rifle intersections cannot damage buried body or hit a single worm twice (Task 1).
- A missed/deep/expired snare cannot leave the run permanently unwinnable (Tasks 1–2).
- Simultaneous worm/relay/Hunter death and paused exit give one result (Task 3).
- Preview/retry/migration and mirrored multi-touch cannot leak old state (Tasks 3–5).

## Initial balance hypotheses

Hunter/worm health 100, relay integrity 200. Hunter speed 180 px/s; dodge lasts
12 ticks at 420 px/s, cooldown 120 ticks, no added invulnerability. Rifle damage
8, cadence 30 ticks, magazine 6, reload 90 ticks, range 1,200 px. The existing
worm post-hit protection remains 30 ticks. Automatic reload begins on empty;
secondary requests manual reload and never damages anything.

Snare arm delay 42 ticks, one active, radius 150 px, shallow limit 100 px,
steering restriction 48 ticks, reveal 120 ticks, cooldown 600 ticks. Untriggered
snare expires at 900 ticks; recovery through Ability removes it and retains cooldown.
Placement is at Hunter x on the surface; it cannot be stacked during arm/recovery.
No trap damage. A triggered shallow worm receives a bounded upward force, not a
teleport, with the same movement integration and velocity cap as ordinary motion.
Initial lift acceleration is 1,200 px/s² for the restriction window; initial
turn scale is 0.25. These effects end on their tick deadline and never persist
after pause/retry/role change.

AI commits to a breach with a 60-tick warning, locked target and visible surface
bracket. AI decision cadence 12 ticks; steering runs every tick. Arena dimensions
stay unchanged. At 60 seconds, urgency increases relay utility, never health.
These hypotheses require Hunt playtesting; do not claim 3–7 minute match duration
or 4–7 successful exposure windows without measured evidence.

### Task 1: Hunter kit and exposed-region combat

**Files:** Create `src/game/data/huntBalance.ts`,
`src/game/domain/hunt/HuntTypes.ts`, `HunterLocomotion.ts`, `RifleSystem.ts`,
`SeismicSnare.ts`, `ExposedWormContacts.ts` under `src/game/domain/hunt/`.
Modify `src/game/data/actors.ts`, `collisionProfiles.ts`, `abilities.ts` and
`src/game/domain/actors/Actor.ts` only for the new typed definitions/faction.
Tests: `tests/unit/hunterKit.test.ts`, `tests/unit/exposedWormContacts.test.ts`.

**Interfaces:**
- `HunterLocomotion.step(action: ActionFrame, tick: number): HunterState` emits
  position, direction, dodge cooldown; its constructor takes terrain/bounds/data.
- `RifleSystem.step(action, context, tick): RifleStep` emits immutable rifle state,
  shot feedback and DamageCommands; context is Hunter pose, exposed logical regions.
- `SeismicSnare.step(action, hunterPosition, wormPose, tick): SnareStep` emits state,
  typed events and optional motion/reveal modifiers. No registry or scene mutation.
- `queryExposedWormContacts(from, to, worm, surfaceY, revealed): readonly Contact[]`
  selects head/follower regions, maps all hits to worm, and emits the nearest hit
  once. Radius comes from typed logical data, not procedural sprite size.

- [ ] Write tests: move 60 ticks => 180 px; diagonal input cannot move faster on the
  surface; dodge never crosses arena bounds; cooldown ignores wall time. Rifle
  fires no more often than tick 1/31, six-round ammo/reload transitions, held fire
  through reload, missing/invalid aim, miss costs ammo but earns no damage.
- [ ] Test above-ground body with buried head is hittable, wholly buried regions
  are not; one ray crossing three regions produces one DamageCommand to worm.
  Test snare arm tick 42 boundary, one active, expiry/recovery and re-placement
  after tick cooldown. Trap does not directly remove health.
- [ ] Run `npm run test -- tests/unit/hunterKit.test.ts tests/unit/exposedWormContacts.test.ts`.
  Expected RED: new modules absent; then implement the exact interfaces/data above.
- [ ] Rerun the same command plus typecheck. Expected GREEN; record tuning in
  BALANCE as hypotheses and commit `feat: add Ranger kit and exposed worm contacts`.

### Task 2: Fair worm AI, tracking cues and snare motion

**Files:** Create `src/game/domain/ai/WormController.ts`, `WormPerception.ts`,
`src/game/domain/hunt/TrackingSystem.ts`. Modify `WormLocomotion.ts`,
`WormMovementTypes.ts` only to add optional bounded external motion effects.
Tests: `tests/unit/wormController.test.ts`, `tests/unit/huntTracking.test.ts`.

**Interfaces:**
- `WormController.step(perception: WormPerception, tick, random: RandomStream):
  WormDecision`; decision contains ActionFrame, state, target, utility scores,
  transition reason, route, breach prediction and steering target.
- States: roam, acquire, stalk, accelerate, breach, evade, recover, reposition.
  Minimum dwell 12 ticks; only one locked target changes per committed attack.
- Perception contains self state, fixed relay location/integrity, nearby visible
  Hunter or its last sighting, and observed trap cues. Hunter visibility requires
  depth <=60 px and distance <=500 px; memory expires at 120 ticks. No hidden input.
- `TrackingSystem.step(worm, aiDecision, snare, tick): TrackingState` produces broad
  bands, approximate cue x and committed breach bracket. Quantize unrevealed x to
  120-px cells; only snare reveal allows an exact transient trace.
- Extend `WormLocomotion.step` with optional `WormMotionEffects` (turn scale and
  lift acceleration); default leaves every Phase B trajectory unchanged. Clamp
  resulting speed to existing burst cap; no direct head-position assignment.

- [ ] Test identical seed/actions reproduce every AI decision; idle Hunter leads
  to relay pressure; stale Hunter sightings expire; trapped AI cannot snap-turn.
  Test hidden-input variation cannot affect a perception-identical decision.
- [ ] Test all poses finite/legal across 5,400 ticks; warning precedes committed
  crossing; default motion effects reproduce Phase B snapshots. Shallow snare
  creates exposure through integration; deep snare reveals/restricts but does not
  teleport. Cooldown recovery allows another trap after a failed attempt.
- [ ] Test two positions within one unrevealed cell produce the same tracking x;
  reveal expiration hides the exact trace; audio-disabled cues retain shape/text.
- [ ] Run the two new files and existing wormLocomotion tests, observe RED, implement,
  rerun GREEN + typecheck, update BALANCE and commit `feat: add observable worm AI`.

### Task 3: Hunt session, outcomes, score and save v2

**Files:** Create `src/game/domain/hunt/HuntSystems.ts`, `HuntScoreSystem.ts`,
`src/game/domain/modes/HuntRules.ts`, `src/game/save/SaveV1.ts`.
Modify GameSession/SessionSnapshot/RunResult/DomainEvent, data modes/validation,
RunFactory, SaveData/SaveValidation/SaveMigrations/SaveCoordinator.
Update `tests/fixtures/save/future.json` to schema 3 because schema 2 is now
supported; preserve the genuine Phase B v1-valid fixture unchanged.
Tests: `tests/integration/huntSession.test.ts`, `tests/unit/huntRules.test.ts`,
`tests/unit/saveV2Migration.test.ts`, plus existing runLifecycle/resultPersistence.

**Interfaces:**
- GameSessionOptions mode gains hunt; RunConfiguration gains mode and debugAI.
  RunFactory creates hunter/relay/worm in Hunt; existing start/retry API is retained.
- HuntSystems owns kit/AI/tracking/statistics; it supplies worm ActionFrame and
  shared combat commands to GameSession, then observes immutable applied events.
  It never writes storage or constructs Results. GameSession retains one registry,
  event queue, step boundary and deferred-removal ordering for both roles.
- Snapshot adds mode, playerActorId and optional typed HuntSnapshot containing
  Hunter/rifle/snare/relay/tracking/tactical stats and read-only worm decision.
  Require hunt payload whenever mode is hunt; runtime validation checks the invariant.
- HuntRunResult includes mode hunt, reason, duration/score/maximumCombo, trapTriggers,
  breachInterruptions, shotsFired, shotsHit, exposureWindowsUsed, hunterHealth,
  relayIntegrity and eligibleForRecords. Freeze deeply. Keep RampageResult unchanged.
- Hunt scoring: valid hit 10 per applied damage point; trap trigger 100 once per
  activation; breach interruption 150 once per committed attack; victory adds
  relayIntegrity*5 + hunterHealth*2 + max(0, 1,800-floor(durationSeconds*5)).
  Empty/deep shots, repeat contacts and debug inspection award no extra credit.
- HuntRules priority: Hunter defeat, relay destruction, worm defeat/victory, exit.
  Defeat takes precedence over simultaneous victory. Never heal/reward dead actors.
- Save v2 adds per-mode Hunt records, huntSeen and aimAssist (default 0.35, range
  0–1). Pure v1→v2 migration validates old data before adding defaults. Keep historical
  keys stable. `parseSave` routes through pure migration then v2 validation;
  preserve valid original v1 bytes as backup before replacement. Protect schema >2.
  SaveCoordinator accepts both result kinds once;
  bestVictory accepts victories only, ordered by score then shorter duration.
  Runs with exact AI debug enabled never update best records/onboarding.

- [ ] Test seed replay, Hunter and relay swept impacts, valid/blocked rifle damage,
  no Rampage spawns/score in Hunt, simultaneous terminal priority, one run-ended,
  paused exit at zero time, fresh role/retry IDs and no retained snare/AI state.
- [ ] Test v1 settings/best result remain equal after migration; backup migration,
  v2 round-trip, future schema unchanged on disk, quota fallback, one accepted
  result/write and debug record exclusion. Existing v1 fixtures remain genuine.
- [ ] Observe RED on the named tests, implement, then run new tests plus existing
  runLifecycle/resultPersistence and all save tests. Expected GREEN + typecheck.
  Update DECISIONS/BALANCE/ARCHITECTURE and commit `feat: integrate Hunt and migrate records`.

### Task 4: Shared aiming, Hunt presentation and menu activation

**Files:** Create `src/game/input/PointerInput.ts`,
`src/game/rendering/HuntPresentation.ts`, `src/game/ui/hud/HuntHudModel.ts`,
`HuntHud.ts`. Modify InputRouter, KeyboardInput, TouchControls, ViewportLayout,
GameplayScene, WormView, ActorViews, CameraController/CameraFraming, DebugOverlay,
FeedbackController, MenuView, ResultsView, SettingsPanel, AppShell and styles.
Tests: `tests/unit/huntInput.test.ts`, `tests/unit/huntPresentation.test.ts`,
`tests/unit/huntHudModel.test.ts`, `tests/e2e/hunt-controls.spec.ts`.

**Interfaces:**
- PointerInput implements InputSource with aimWorld and primary. Constructor
  takes canvas and an injected client→world projection from the current camera.
  It captures/releases only active gameplay pointers; destroy removes listeners.
- InputRouter selects movement and aim owners independently; button OR/edge and
  neutral-after-pause rules remain. Zero movement in a pointer sample cannot replace
  keyboard movement. Preserve existing scripted/gamepad/touch tie semantics.
- Hunter mappings: WASD/arrows move, mouse/LMB or Space fires, Q snare, Shift dodge,
  R or existing Control secondary reloads. Gamepad uses existing slots. Touch Fire
  is a captured drag-to-aim region plus separate Snare and Dodge buttons; movement,
  aim/fire and an ability finger have independent pointer ownership.
- ViewportLayout adds Hunter aim/ability rectangles, mirrors all controls with
  handedness, keeps every interactive target >=44 px (aim for 48 px) at safe areas.
- HuntPresentation projects snapshots into exposed worm poses and permitted cues.
  Render only above-surface portions unless reveal is active; clear old visuals at
  reveal expiry. Aim assist only considers currently exposed regions within an
  18-degree cone, blending by configured strength; never targets hidden debug poses.
- Camera frames Hunter, relay and approximate breach bracket; no buried worm follow.
  HUD exposes player/worm health, relay, ammo/reload, snare/dodge and tracking text.
- Show functional Hunt choice/preview and role-specific Results statistics. Generalize
  HUD/control ownership in AppShell through small ports instead of more rule branches.
  Generated sound remains optional; all warning/trap/failure cues retain shape/text.
- Developer AI overlay is opt-in before Hunt starts, marks records ineligible and is
  off for production score-valid runs. E2E bridge remains test-only and read-only.

- [ ] Observe RED: held A/D plus mouse aim/fire retains movement; pointer world
  mapping handles letterboxing/scroll/camera; cancel/lost capture/pause clears aim,
  fire and all three fingers; retry listener counts and view pools remain stable.
- [ ] Test hidden pose changes do not affect normal camera or aim assist; reveal
  expiration removes exact graphics; snapshots retain diagnostics only behind debug.
- [ ] Test UI at 1440x900, 915x412, 844x390, 1024x768, portrait and safe-area insets;
  critical HUD and controls cannot overlap; handedness/opacity and reduced feedback
  work. Start Hunt through real menus, fire, trap, dodge, pause and resume.
- [ ] Implement; run new unit files plus affected input/layout tests and Hunt control
  browser checks. Expected GREEN, lint/typecheck/build. Commit `feat: make Ranger Hunt playable`.

### Task 5: Hunt viability gate

**Files:** Create `tests/e2e/hunt-flow.spec.ts`; modify Pages testMatch, BALANCE,
CHANGELOG, SESSION_HANDOFF and README with actual evidence/controls.

**Interfaces:** Staged E2E fixtures use mode hunt and fixture IDs hunt-victory,
hunter-defeat, relay-defeat and hunt-trap. No active-session mutation is introduced.

- [ ] Write built-output smoke for tracking→placement→arm→trigger→exposed hit,
  victory/defeat/exit, pause/restart, one Results/write, reload/retry and role switch.
  Assert normal buried rendering absent, fresh input/views and no fatal console/assets.
- [ ] Observe RED, add the minimum fixture setup, then run Hunt flow/control tests
  in root and Hunt flow under /Sandstrike/. Expected GREEN.
- [ ] Measure representative natural Hunt plus breach-heavy interval: frames/ticks,
  actors/shapes/projectiles/particles, memory observations and catch-up/console.
  Inspect actual captures and desktop/synthetic-touch input. Record real-device
  limitations and unmet provisional duration/exposure/60-fps targets honestly.
- [ ] Run verify once after final fixes; reuse current unaffected evidence. Record
  GO/NO-GO for the Hunt loop. NO-GO stays here with a precise reproduction; GO
  permits the Rampage-completion plan. Commit `test: verify Hunt prototype gate`.
