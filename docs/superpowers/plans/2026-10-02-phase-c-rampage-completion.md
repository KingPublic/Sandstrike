# Phase C Rampage Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Rampage's light vehicle, aerial threat and bands 2–3, then verify
the integrated two-role prototype without enlarging the approved MVP scope.

**Architecture:** Reuse actor registry, swept combat, projectile pool, seeded
perception and directors. Typed threat definitions add behavioral pressure; mode
rules/results/save v2 remain the only end/record owners.

**Tech Stack:** Existing pinned stack, no new dependencies.

**Spec:** GAME_DESIGN sections 5, 7.5, 12, 18.2 and ARCHITECTURE sections 11–21;
global constraints/contracts in `2026-10-02-phase-c-plan-set.md` apply.

## Global Constraints

- Start only after the Hunt viability GO; work in root on phase-b-ready.
- One light ground archetype and one aerial archetype, original procedural art.
- Bands change composition, never multiply all enemy health.
- Hold infantry cap 4, prey cap 8, vehicle cap 2, aerial cap 1, projectile cap 24,
  feedback particles 48. Keep deterministic stable contact/removal ordering.
- Hostile AI fires only from allowed sightings; avoid unavoidable below-ground damage.

## Review Focus

- Reusing a projectile slot cannot retain another weapon's damage/owner (Task 1).
- Large score jumps cannot skip transition warnings or flood spawns (Task 2).
- Armor/airborne contacts credit each victim once; old saves/results still load (Task 2).
- Role switch cannot carry hostile pressure into Hunt or reveal buried AI (Task 3).
- Slow-frame pause/end/retry freezes all new AI timers and writes one result (Task 3).

### Task 1: Typed vehicle/aerial threats and projectile metadata

**Files:** Create `src/game/domain/ai/VehicleController.ts`, `AerialController.ts`;
modify actors/enemies/collisionProfiles/aiBalance data, ProjectileSystem,
GameSession enemy composition, ActorViews and feedback.
Tests: `tests/unit/advancedThreats.test.ts`, `tests/unit/projectileSystem.test.ts`,
`tests/integration/advancedThreatEncounter.test.ts`.

**Interfaces:**
- Both controllers emit movement/locked aim/fire decisions from PerceptionSnapshot,
  simulation tick and their own named stream `ai.<actorId>`; no scene access.
- ProjectileSystem.spawn gains optional typed ProjectileDefinition, defaulting to
  the existing infantry definition. Every reused slot resets owner, definition,
  damage, speed, lifetime and retirement state; step emits shared DamageCommands.
- Ground vehicle: HP 80, armor 4, lateral speed 75 px/s, 60-tick telegraph,
  180-tick shot cadence, damage 15. Aerial: HP 50, no armor, altitude -220 px,
  lateral speed 96 px/s, 60-tick telegraph, 180-tick cadence, damage 10.
  These original balance hypotheses do not change normal infantry values.
- Use range 900 px and shallow/visible worm perception; target position locks at
  telegraph entry. Aerial patrol turns obey arena bounds; no buried tracking fire.
- Distinct procedural silhouettes and text/shape aim cues precede all firing.

- [x] Test finite seeded patrol/reposition, sight memory/cadence/locked aim, no fire
  at an unseen deep worm, pooled projectiles reused across weapon definitions, and
  swept breach/air contacts without double resolution or reward after removal.
- [x] Run named tests, observe RED, implement the interfaces, rerun GREEN + typecheck,
  inspect threat captures. Update BALANCE and commit `feat: add ground and aerial response`.

### Task 2: Bands 2–3, composition and record compatibility

**Files:** Modify rampageBalance/modes/validateDefinitions, ThreatDirector,
SpawnDirector, DomainEvent, RewardEvents/ScoreSystem/ComboSystem/RampageRules,
RunResult, SaveValidation/SaveMigrations, RampageHudModel/ResultsView.
Tests: `tests/unit/responseBands.test.ts`, `tests/integration/fullRampagePacing.test.ts`,
affected scoring/spawn/save tests.

**Interfaces:**
- ResponseBand becomes 0|1|2|3. Keep band-1 threshold 2,700 ticks / 1,000 base points;
  band 2 uses 7,200 ticks / 3,000 base points, band 3 uses 12,600 ticks / 6,000.
  Each transition has its own 120-tick warning; advance at most one band at a time.
  No high-band spawn is permitted during its warning.
- SpawnDirector retains legal off-camera spacing and low-health prey priority;
  allow infantry at every band >=1, vehicle >=2, aerial >=3. Vehicle cadence 600
  ticks, aerial 900. All per-class caps remain; at most one spawn command per tick.
- Add reward categories vehicle/aerial, base points 500/750, reuse existing variety,
  repeat and breach policy. Add optional Rampage result counts for those categories;
  omitted historical fields normalize to 0. Only Rampage highestBand may reach 3.
- Validate definitions, v2 mode-specific results and migrated v1 highestBand <=1.
  Existing save keys and schema v2 from the Hunt plan stay unchanged.

- [x] Test time and score transitions, once-only warning, a large score jump with
  sequential delays, pause freeze, stable seeded spawn caps/spacing at every band,
  one credit per new category, old result normalization and invalid mode stats.
- [x] Observe RED, implement, then run two 18,000-tick seeded action replays. Expected
  identical events/outcomes, legal finite poses, every band, zero overflow and caps.
  Run affected scoring/save suites, typecheck/lint; record hypotheses/evidence and
  commit `feat: complete Rampage response bands`.

### Task 3: Integrated two-role completion gate and review

**Files:** Create `tests/e2e/two-role-mvp.spec.ts`, update Pages testMatch,
README/ASSET_LICENSES/BALANCE/CHANGELOG/DECISIONS/SESSION_HANDOFF and add
`docs/PHASE_C_VERIFICATION.md` with all actual evidence/remaining limitations.

**Interfaces:** E2E staged fixtures include rampage-band-2/rampage-band-3; normal
production has no fixture/cheat bridge. Existing root/Pages static build contract stays.

- [x] Add real-menu smoke: Rampage advanced pressure→pause→Results→Hunt→trap/exposure
  combat→Results→reload/retry. Assert one result/persist update, no old role actors,
  hidden-state leak, stuck pointers, listener growth or fatal console/asset error.
  Include slow/catch-up pause with new AI and result-boundary adversarial events.
- [x] Observe RED then implement only missing integration/fixture behavior. Run new
  flow at root and /Sandstrike/, both production smokes, applicable input/viewport
  checks and verify. Do not repeat unchanged checks without a changed dependency.
- [x] Inspect actual desktop/phone/tablet layouts and reduced feedback, measure
  natural Hunt and full-band Rampage including burst-heavy intervals. Report all
  physical-device/input/audio/performance limits and human feel evidence precisely.
- [x] Request one fresh whole-branch review across Phase C, using every child plan's
  Review Focus. Resolve Important/Critical through one RED→GREEN fix pass, rerun
  affected tests and the deterministic suite; record deferred minors and rulings.
- [x] Record GO only for criteria actually verified in GAME_DESIGN 18.2. If human
  feel or hardware/mobile criteria remain unverified, label the prototype complete
  and release gate pending, name the exact next checks. Do not call the entire game
  production-ready or promise a GOTY outcome. Commit `test: verify two-role prototype`.

## Execution checkpoint - 2026-10-02

Approved and implemented in the root on phase-b-ready. All implementation tasks
and the functional prototype gate are complete; the physical-device/human-feel
release gate remains pending. See docs/PHASE_C_VERIFICATION.md for actual checks,
review finding/fix, workflow rulings and limits. Use docs/SESSION_HANDOFF.md to
resume; do not rebuild the completed systems or restart this plan.

Checked steps denote completed implementation/verification workflows, subject
to the explicit evidence limits and rulings in PHASE_C_VERIFICATION.md; they do
not assert physical-device performance or human-feel acceptance.
