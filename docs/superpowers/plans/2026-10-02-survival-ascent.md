# Survival Ascent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Steps use checkbox tracking.

**Goal:** Play the complete climb, escalating pursuit and rooftop RPG boss loop.
**Architecture:** A world clock/platform collision service feeds vertical Hunter
locomotion, moving-surface worm motion and a life/stage director; HuntRules retains
one terminal boundary. Extend the existing scene, input, combat and views.
**Tech Stack:** Existing pinned stack.
**Spec:** `../specs/2026-10-02-sandstrike-survival-redesign.md` and plan-set constraints.

## Global Constraints

Plan-set constraints apply. Simulation60Hz; normal return600 ticks; boss immunity
180 ticks. No enforced 300s delivery or 360s boss timeout. Target 3-4min climb plus
1-2min boss is unverified until a natural playtest. All themes share authored routes.

## Review Focus

Fast landings/drop-through, pause on hazard, elevated attack sector fairness,
summit during absence/death, and simultaneous player/boss death need explicit tests.

### Task 1: World geometry and vertical Hunter

**Files:** Create `src/game/data/ascentArena.ts`,
`src/game/domain/world/AscentWorld.ts`, `src/game/domain/world/PlatformContacts.ts`; modify
HunterLocomotion/HuntTypes, ActionFrame/input adapters/TouchControls/ViewportLayout,
RunFactory, SessionSnapshot, GameSession, WorldRenderer and camera.
Tests: `tests/unit/platformContacts.test.ts`, `tests/integration/hunterAscent.test.ts`.
**Interfaces:** Immutable platforms `{id,left,right,y}`; world
`step(tick:number, stage:"ascent"|"boss"): AscentWorldSnapshot` with surfaceY,
platforms, summit bounds and hazard depth. Start surface0, proposed ascent rise5px/s,
summit y=-1600; authored Hunt bounds left/right-2400/2400, top-2800, bottom3200
must replace the old -1182 ceiling so summit/camera/worm breaches are reachable.
Author climbable alternating routes and tune from actual traversal.
Vertical Hunter snapshot adds velocity/grounded/platformId. Run180, jump660, gravity1800,
one-way swept landings; short coyote/buffer6 ticks. Semantic jump/drop inputs add
neutral defaults to every frame helper. Space/W jump, down drop, mouse fire, Q skill.

- [ ] RED: standing/jumping/falling/edge jump buffer, swept landing at high speed,
  dropping one platform without falling through the next, blocked grapple geometry;
  hazard does not lift a buried player, pause freezes hazard. Burial grace90ticks
  then20HP/s; route is reachable with every base kit without a skill.
- [ ] Implement small world/contact modules and shared vertical integration,
  theme-specific rising material, camera/landing visibility and jump controls.
- [ ] Run focused tests/typecheck/build; browser desktop/touch first climb, pause,
  orientation and distinct theme rendering. Commit `feat: add vertical survival ascent`.

### Task 2: Worm lives and moving-surface pursuit

**Files:** Create `src/game/domain/hunt/WormLifeDirector.ts`; modify HuntSystems,
GameSession/WormController/WormBreachPlanner, terrain interfaces and WormView.
Tests: `tests/unit/wormLifeDirector.test.ts`, `tests/integration/ascentPursuit.test.ts`.
**Interfaces:** Director `step(tick:number, input:{wormDead:boolean,summitReached:boolean,ended:boolean}): WormLifeSnapshot`
owns alive/absent/boss-entry, generation and returnTick. Ascent deaths return at
deathTick+600; new worm resets health/motion/body/AI only. Derive aggression from
generation, cap at generation5: recovery120 down to48ticks, attack cadence/height
tuned to elevated targets. Forecast projects the same future moving surface ticks.

- [ ] RED: no worm at599, exactly one at600; old followers/collision do not remain;
  generations cap; Hunter/world/ammo/tick unchanged; every natural crossing gets a
  >=60tick reachable sector even on rising terrain; cancelled/ended return never spawns.
- [ ] Implement life ownership through narrow session restart APIs, not resetting
  the run. Show warning and return countdown; test elevated threats rather than
  surface-only targeting. Freeze generation/hazard on pause.
- [ ] Run focused domain/integration tests and one normal browser return capture.
  Commit `feat: add escalating worm pursuit and returns`.

### Task 3: Allied Hunters and support helicopter

**Files:** Create `src/game/domain/ai/AlliedHunterController.ts`,
`SupportHelicopterController.ts`; extend actors/enemies data, faction targeting,
HuntSystems/GameSession, ActorViews and projectile ownership.
Tests: `tests/integration/huntAllies.test.ts`.
**Interfaces:** Bounded populations2 ground allies/1 helicopter; controller consumes
allowed perception/world platforms and emits move/jump/aim/fire decisions on named
streams. Ground allies seek safe landings and exposed targets. Air patrol altitude
relative to the hazard; no friendly-fire damage to player, no objective pickup.

- [ ] RED: capped seeded population, no buried tracking fire, valid platform paths,
  friendly damage blocked, allies can damage exposed worms, no RPG theft, no listeners
  or duplicate actors after retry. Existing opposing Rampage factions still fight.
- [ ] Implement sensed FSM/utility support, visible firing and original rotors/actors.
- [ ] Run tests/typecheck and visual support encounter; commit `feat: add Hunt squad and helicopter`.

### Task 4: Summit, RPG and boss rules

**Files:** Create `src/game/domain/hunt/HuntStageDirector.ts`, `BossSkillController.ts`;
modify HuntRules/RunResult, RifleSystem/weapon data, HuntSnapshot/Hud, ResultsView,
AppShell, camera and feedback. Tests: `tests/integration/huntBoss.test.ts`,
`tests/e2e/ascent-boss.spec.ts` with explicit pre-run summit/boss fixtures.
**Interfaces:** Stages ascent/boss; summit bounds transition once and freeze surfaceY.
Cancel return, remove old worm and introduce a warned fresh boss600HP. RPG80damage,
cadence72, magazine2/reload120; ordinary rifle8 damage. Boss shield windup30ticks,
active180, cooldown900; visible immunity. Rooftop crate replenishes missed rockets.
Boss death wins regardless of final valid damage source; player lethal damage wins
priority on the same tick. No normal worm kill produces victory.

- [ ] RED: summit arrival during absent/alive/fatal tick creates one boss, freezes
  world and cancels returns; shield blocks rockets/ordinary fire and expires exactly;
  ammo can recover after misses; one death/victory result and one write; no deadline
  ends a surviving boss battle. Full fast deterministic 6-minute scenario is finite.
- [ ] Implement stage rules/weapon/UI, explicit boss entrance/bar/shield cues and
  clearer objective instructions. Add actual built-output staged boss flow.
- [ ] Run focused tests/browser root plus Pages for the new path; verify buried poses,
  input/console and original detailed characters. Commit `feat: add rooftop RPG boss fight`.

Continue with the roster and records gate; do not claim natural duration is proven.
