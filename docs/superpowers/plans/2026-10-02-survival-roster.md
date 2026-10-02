# Survival Roster and Final Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkbox tracking.

**Goal:** Complete ten real kits, original animated identities and reliable records.
**Architecture:** Data-driven definitions select focused skill/weapon strategies;
selection is immutable per run. A save migration separates old and revised records.
**Tech Stack:** Existing pinned stack.
**Spec:** `../specs/2026-10-02-sandstrike-survival-redesign.md` and plan-set constraints.

## Global Constraints

All plan-set constraints apply; all ten kits must work. Every Hunter can finish
without relying on a traversal skill. No arbitrary grind/locked placeholders.

## Review Focus

All ten selections/theme retry, expired effects/dead owners, grapple geometry,
friendly healing/fire and legacy/future save protection must survive integration.

### Task 1: Definitions, ten strategies and original animated identities

**Files:** Create `src/game/data/characters.ts`,
`src/game/domain/abilities/CharacterSkills.ts` and focused skill strategies;
modify RunFactory/GameSession/HuntSystems, projectile/effect data, ActorViews,
WormView, MenuView and HUD. Tests: `tests/unit/characterSkills.test.ts`,
`tests/integration/characterRuns.test.ts`.
**Interfaces:** `WormId` DuneMaw/CinderWyrm/IronBurrower/StormSerpent/RiftSpitter;
`HunterId` Ranger/Siegebreaker/Scout/Engineer/FieldMedic, stable kebab-case IDs.
Definitions own role, stat profile, starting weapon, active skill and visual ID.
RunConfiguration gains characterId, validates role compatibility, freezes selection.
Strategy `step(context: SkillContext): SkillFrame` yields typed commands/effects;
durations/cooldowns and intended behavior are exactly the approved spec roster.

- [x] RED:10 valid distinct kits, correct roles/defaults; fire/venom projectiles finite;
  armor/shockwave/air surge bounded; mark4s affects sensed exposed aim only;
  shield3s ends; grapple cannot cross solids; decoy5s expires; medic heals30 only living
  friendly actors. Every death/retry clears effects; cooldowns never tick while paused.
- [x] Implement shared strategy dispatch, five meaningful weapons and all ten skill
  feedbacks. Articulated Hunter walk/jump/aim/reload and worm jaw/armor/skill animation;
  distinctive geometry/materials, not five recolors. Only use original/licensed assets.
- [x] Run focused kit/run tests and visually play/capture every identity/skill.
  Update ASSET_LICENSES/BALANCE and commit `feat: complete ten-character roster`.

### Task 2: Selection and save v3 migration

**Files:** Modify AppShell/MenuView, SaveData/Validation/Migrations/Coordinator,
RunResult/results ownership, selection and README controls.
Tests: `tests/unit/saveV3.test.ts`, `tests/e2e/survival-selection.spec.ts`.
**Interfaces:** Schema3 stores `selection:{themeId,wormId,hunterId}` and new revised
mode record buckets; `legacyRecords` preserves validated v2 Rampage/relay records.
Validate v1 through current migration then v2->v3, original byte backups and future
schemas protected. New results carry gameplayVersion and characterId/themeId;
practice/debug runs never update ranked records. Separate old/new rules, no score mixing.

- [x] RED: genuine v1/v2 survive intact in legacy buckets; new selected values round
  trip; wrong role/ID rejected or safely defaulted before run; unknown future disk
  untouched; malformed fields and duplicate run IDs cannot write records twice.
- [x] Implement migration/role+theme selection and actual per-kit instructions.
- [x] Run save/input/selection tests and reload/retry browser flow; commit
  `feat: migrate revised records and character selection`.

### Task 3: Whole revision verification, one final review and handoff

**Files:** Add `tests/e2e/survival-game.spec.ts`,
`docs/SURVIVAL_VERIFICATION.md`; refresh README_START_HERE, SESSION_HANDOFF,
GAME_DESIGN/ARCHITECTURE/DECISIONS/BALANCE/CHANGELOG/ASSET_LICENSES.

- [x] Run focused end-to-end full flow, ten-kit/theme selection, desktop1440x900,
  1366x768 and touch844x390/tablet1024x768 with orientation interruptions. Root/Pages
  production smokes must exclude test bridge and fatal assets/console errors.
- [x] One `npm run verify`, applicable root/Pages flows and representative performance
  capture with high breach, NPCs and boss. Record actual timings and unverified
  physical inputs/duration/graphics limits; do not repeat unaffected checks.
- [x] One fresh whole-range review. Re-grade findings, fix Important/Critical with
  RED->GREEN and justified final suite; record minors/rulings. No per-task agent churn.
- [x] Commit local evidence and clean owned scratch only after preserving facts.
  Leave root/branch intact, normal production dist, exact next task in README.
  Natural 5-6 minute duration and real hardware require playtest, not an asserted timer.

Self-review: all requested systems have a task; contracts pass theme->world->stage
and character->strategy->save. No backend/engine replacement; no hidden objective gate.

## Exact task verification commands

Run commands individually in PowerShell, not as a separator-chained shell string.
All named new tests must first demonstrate the intended RED, then GREEN after
implementation; browser cases must also have inspected captures and no fatal errors.

Task 1:

`npm run test -- tests/unit/characterSkills.test.ts tests/integration/characterRuns.test.ts`

`npm run typecheck`

Expected: every command exits0, tests pass, typecheck/lint have no errors; build
produces usable dist. Record failures and rerun only the affected checks.

Task 2:

`npm run test -- tests/unit/saveV3.test.ts`

`npm run test:e2e -- tests/e2e/survival-selection.spec.ts`

`npm run typecheck`

Expected: every command exits0, tests pass, typecheck/lint have no errors; build
produces usable dist. Record failures and rerun only the affected checks.

Task 3:

`npm run verify`

`npm run test:e2e -- tests/e2e/survival-game.spec.ts tests/e2e/survival-selection.spec.ts`

`npm run test:e2e:pages -- tests/e2e/survival-game.spec.ts`

`npm run test:smoke:root`

`npm run test:smoke:pages`

Expected: every command exits0, tests pass, typecheck/lint have no errors; build
produces usable dist. Record failures and rerun only the affected checks.

Add survival-game and survival-selection to the Pages testMatch as appropriate
before final commands. Rebuild normal production output after E2E artifacts.

## Execution outcome (2026-10-02)
Implemented inline in root; one combined local roster/save checkpoint per user efficiency preference.
Final222tests/lint/typecheck/build GREEN;12rootcases/5Pages/productionroot+Pages smoke GREEN.
One final review, four Important reproduced and corrected; actualcamera cutoff also fixed.
Natural duration, physical controls and production art remain explicit playtest limits.
See docs/SURVIVAL_VERIFICATION.md and SESSION_HANDOFF; do not replay this plan.
