# Survival Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkbox tracking.

**Goal:** Make the requested menu and worm improvements immediately playable in three themes.
**Architecture:** Theme data feeds the existing world renderer; a new movement
profile and focused mouth/skill systems reuse shared locomotion and combat.
**Tech Stack:** Existing pinned stack; no new dependencies.
**Spec:** `../specs/2026-10-02-sandstrike-survival-redesign.md`.

## Global Constraints

All values/contracts from `2026-10-02-survival-plan-set.md` apply. Historical
laboratory/fixture physics stay explicit; revised Rampage is marked practice until
Batch 3 record migration. Hunt retains the old prototype until Batch 2 is playable.

## Review Focus

Menu zoom/short windows must expose every button; three theme selections survive
retry; rapid skill taps are sampled once; body-only contacts cannot feed; shield
expiry/pause cannot revive actors or permanently prevent damage.

### Task 1: Compact menu and theme plumbing

**Files:** Create `src/game/data/themes.ts`; modify `src/styles/main.css`,
`src/game/ui/MenuView.ts`, `src/app/AppShell.ts`, `src/game/application/RunFactory.ts`,
`src/game/domain/session/{GameSession,SessionSnapshot}.ts`,
`src/game/rendering/WorldRenderer.ts`, `src/game/scenes/GameplayScene.ts`.
Tests: `tests/unit/themes.test.ts`, `tests/e2e/survival-menu.spec.ts`.
**Interfaces:** Export `ThemeId = "desert" | "ruins" | "frozen"` and immutable
`themes` records with sky/ground/structure/effect palettes and hazard label.
`RunConfiguration.themeId?: ThemeId` defaults desert, captured immutably in
`SessionSnapshot.themeId`. Renderer consumes `setTheme(themeId: ThemeId): void`.

- [ ] RED: definitions have three unique valid IDs/palettes; desktop title/mode/help
  at 1366x768 and 1440x900 have scrollHeight <= innerHeight+2, no hidden primary
  buttons; zoom/short windows scroll inside an accessible panel; 844x390 controls
  remain usable. Selecting each theme sets the next run snapshot and retry keeps it.
- [ ] Implement viewport-bound menu composition, theme selection and original
  scenery/material differences; avoid document overflow clipping as a fake fix.
- [ ] Run theme unit tests, menu browser cases, typecheck; inspect desktop/mobile
  and all three theme captures. Record actual results and commit `feat: add compact multi-theme menus`.

### Task 2: Arcade movement and automatic mouth contacts

**Files:** Create `src/game/data/arcadeMovementBalance.ts`,
`src/game/domain/combat/AutomaticFeeding.ts`; modify RunFactory, GameSession,
camera framing and worm animation. Tests: `tests/unit/automaticFeeding.test.ts`,
`tests/integration/arcadeWorm.test.ts`, affected worm/contact tests.
**Interfaces:** `arcadeMovementBalance: WormMovementConfig` derives existing config;
starting values cruise 800, burst cap 950/gain150, gravity640, turn rate6 and
high-speed factor .8. Existing `movementBalance` remains the legacy fixture profile.
`automaticMouthCommands(previous: readonly ActorState[], current: readonly ActorState[], tick: number): readonly DamageCommand[]`
uses a swept forward circle radius34/offset20, damage15 independent of speed.
Use CombatSystem/registry removal for one reward; do not damage through followers.

- [ ] RED: a low-speed mouth hit consumes prey without primary input; body brushing
  does not; fast contact tunnels neither way; overlapping impact/mouth commands give
  one consume/heal/score. Turn 90 degrees at cruise within .5s; natural vertical
  cruise breach rises near500px, boosted near705px; all followers stay finite/stable.
- [ ] Implement profile selection for normal Rampage, passive mouth contacts and
  high-arc camera context; remove manual Bite behavior from revised runs while
  retaining explicit historical fixtures. Keep movement head-authoritative.
- [ ] Run named/affected tests, typecheck and real upward movement browser capture.
  Update BALANCE/CHANGELOG and commit `feat: improve breaches and automatic feeding`.

### Task 3: Sandguard skill and input/feedback clarity

**Files:** Create `src/game/domain/abilities/TimedSkill.ts`; modify GameSession,
KeyboardInput, GamepadInput, TouchControls, GameplayScene, RampageHudModel/Hud,
MenuView and AppShell instructions. Tests: `tests/unit/timedSkill.test.ts`,
`tests/unit/roleInput.test.ts`, `tests/e2e/arcade-controls.spec.ts`.
**Interfaces:** TimedSkill constructor `(id: string, activeTicks: number, cooldownTicks: number)`;
`step(tick: number, pressed: boolean): AbilityState`. Sandguard180/1200 ticks;
snapshot `abilities` contains `skill.sandguard`. On activation extend the worm's
existing `invulnerableUntilTick` with max(existing,activeUntil), never overwrite a
longer deadline or restore health. Role-aware adapter bindings put Space/RT/touch
Skill on semantic `ability` for worm; keep legacy fixtures explicit.

- [ ] RED: activation blocks incoming damage through tick179, allows at180; cannot
  reactivate until1200; pause/clear/retry resets held actions and fresh skill; a
  press/release between samples is emitted once, then released; move/aim stay independent.
- [ ] Implement the skill and short-tap latching with clear/neutral-gate coverage;
  visible shield/countdown/cooldown; relabel manual Bite to Skill everywhere revised.
- [ ] Run focused input/skill/browser tests, lint/typecheck/build. Preserve a root
  playable checkpoint and README exact next action. Commit `feat: add Sandguard and skill controls`.

Checkpoint: Batch 1 is not completion of the full revision. Continue with Ascent.
