# Ascent progress

Base 287afc2 (foundation). Root phase-b-ready.

## Task 1 (world geometry and vertical Hunter) - done, commit ef34688
Files: data/ascentArena.ts, domain/world/{AscentWorld,PlatformContacts}.ts,
HunterLocomotion, HuntTypes, ActionFrame/ScriptedInput/KeyboardInput/GamepadInput,
TouchControls, ViewportLayout, RunFactory, GameSession, SessionSnapshot, HuntSystems,
WormPerception, HuntPresentation, WorldRenderer, CameraController, HuntHud(Model),
HuntRules/RunResult/RunResultValidation, MenuView, AppShell.
Tests: tests/unit/platformContacts.test.ts (5), tests/integration/hunterAscent.test.ts (4).
Evidence: 181 tests, lint/typecheck/build green, hunt-controls 4/4, hunt-flow 4/4,
hunt-warning 1/1, survival-menu 3/3, arcade-controls 2/2.

## Task 2 (worm lives and moving-surface pursuit) - done, commit ee44d17
Files: WormLifeDirector, collisionProfiles.hidden, WormLocomotion.reset,
WormController (aggression + surface-relative depth + future-surface forecast),
WormBreachPlanner, WormPerception, HuntSystems, GameSession, HuntHudModel, WormView.
Tests: tests/unit/wormLifeDirector.test.ts (3), tests/integration/ascentPursuit.test.ts (2),
fixture "ascent-kill" + browser kill/return case in hunt-flow.
Evidence: 186 tests; hunt-flow 5/5 (return case 12.2s), hunt-controls 4/4, hunt-warning 1/1.

## Task 3 (allied hunters and support helicopter) - done
Files: data/allies.ts, domain/ai/{AlliedHunterController,SupportHelicopterController}.ts,
data/actors.ts (actor.ally/actor.heli), HuntTypes (AllyState), HuntSystems (bounded
support stepping + alliesFire), GameSession (support commands), ActorViews (friendly
silhouettes, rotors, aiming lines).
Tests: tests/integration/huntAllies.test.ts (4); hunt-controls e2e asserts the capped
population in the browser.
Evidence: 190 tests pass, lint/typecheck green, hunt-controls 4/4.
Ruling: allies are an ascent-only feature (legacy relay fixtures keep their old cast).
Ruling: allies fire only at exposed regions, never at the player, and stand down when
the worm is absent; no ally may take the objective (Task 4 keeps the crate player-only).

## Task 4 (summit, RPG and boss) - done
Files: data/bossBalance.ts, domain/hunt/{HuntStageDirector,BossSkillController,RpgSystem}.ts,
HuntTypes (BossState/RpgHudState), HuntSystems (stage, crate, objective fire),
WormController (elevation tuning), GameSession (boss spawn, objective commands,
stage ownership), HuntRules (boss victory + victory bonus), RunResult/Validation
(`bossDefeated`), DomainEvent (`rpg-fired`, `boss-entrance`), FeedbackController,
HuntHudModel/HuntHud (boss bar, shield, RPG), WormView (boss presence scale),
ResultsView (boss victory text), GameplayScene, RunFactory ("ascent-boss" fixture),
playwright.pages.config.ts testMatch.
Tests: tests/integration/huntBoss.test.ts (7), tests/e2e/ascent-boss.spec.ts (1).
Evidence: 197 tests pass in the full suite; lint/typecheck green; ascent-boss e2e
passes at 1440x900 with no console errors and writes docs/verification/survival-boss.png.
Ruling: the boss reuses the arena worm id; the existing per-hit worm immunity can
swallow late RPG shots, recorded as a tuning note in docs/BALANCE.md.
Known limits: 1-2 minute fight length, the 5-6 minute whole-run target, real
hardware and human feel are unverified; ten-kit roster/selection/records are next.

## Task 4 next (summit, RPG and boss) - SUPERSEDED, see above
HuntStageDirector + BossSkillController, summit transition freezes the hazard,
cancels returns and introduces a warned 600HP boss with a 180-tick shield; RPG 80
damage on a 72-tick cadence with 2 rockets and a 120-tick reload; rifle 8 damage;
boss defeat wins once, player lethal damage wins ties, no deadline ends the fight.
Tests: tests/integration/huntBoss.test.ts and tests/e2e/ascent-boss.spec.ts
(add the spec to playwright.pages.config.ts testMatch for the Pages run).
