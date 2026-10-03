# DECISIONS

Use this as an append-only-ish decision log. Revise an old decision only by adding a newer superseding entry.

## D-001 — Browser-first stack

Decision:
Use Phaser 4.x + TypeScript + Vite for the new project, after verifying and pinning a current stable compatible version.

Why:
The project is a 2D browser game, needs fast iteration, static deployment, sprite/physics/camera/audio support, and straightforward TypeScript integration.

Status: proposed until Codex verifies current versions during Phase A.

## D-002 — Static MVP

Decision:
No mandatory backend for MVP. Persistence uses a versioned localStorage schema.

Why:
Keeps Vercel/GitHub Pages deployment simple and reduces scope.

Status: accepted bootstrap constraint.

## D-003 — Runtime NPC AI

Decision:
Use FSM + utility AI + movement prediction. No LLM/API calls for real-time NPC behavior.

Why:
Needs deterministic low-latency behavior, offline play and zero runtime AI cost.

Status: accepted.

## D-004 — Reference fidelity

Decision:
Pursue mechanical/game-feel fidelity where useful, but original visual/audio/text/code expression.

Why:
Allows serious study of the reference while keeping the public project original and safer to distribute.

Status: accepted.

## D-005 — Pinned Phase B engine baseline

Decision:
Use `phaser@4.2.1` as the initial engine baseline when Phase B scaffolding begins,
with TypeScript, Vite and npm. Record the resolved dependency versions in the
lockfile and recheck browser compatibility before adding plugins.

Why:
Phaser 4.2.1 is the current stable release verified during Phase A. Pinning the
engine keeps builds reproducible while an early compatibility check limits the
risk of adopting a relatively new major version.

Evidence:
Official Phaser GitHub release `v4.2.1`, checked 2026-10-01:
https://github.com/phaserjs/phaser/releases/tag/v4.2.1

Consequences:
Phase B begins with a build-and-load smoke spike. No Phaser plugin is assumed
compatible until that spike passes on representative desktop and mobile browsers.

Status: accepted on 2026-10-01; supersedes the proposed-version portion of D-001.

## D-006 — Staged two-role MVP

Decision:
Treat Phase B as the worm-movement vertical slice and Phase C as completion of
the playable MVP. The MVP contains one original desert arena, one balanced worm,
one Ranger hunter, Rampage and Hunt, a readable score/combo loop, threat
escalation, an observable AI worm, and the minimum pause/results/settings flow.
The five-character roster, campaign, multiple biomes and broad metaprogression
remain post-MVP expansion work.

Why:
This validates both the signature locomotion and the project's asymmetric
differentiator before content production multiplies tuning and presentation
costs.

Consequences:
Phase B is not called a complete product MVP. Phase C must deliver both roles;
Phase D can then expand characters, environments and progression.

Status: accepted by the user at the Phase A research checkpoint on 2026-10-01.

## D-007 — Shared actions and adaptive presentation

Decision:
Run one gameplay simulation for all platforms. Keyboard/mouse, touch and gamepad
adapters emit the same semantic gameplay actions. Canvas, HUD and touch controls
adapt to viewport, orientation and safe-area constraints without changing domain
rules.

Why:
Desktop and mobile are equal release targets. A shared action contract prevents
input-specific gameplay forks and keeps deterministic tests useful.

Consequences:
Role controllers consume actions rather than device events. Responsive HUD and
touch control placement are presentation concerns around the same world rules.

Status: accepted on 2026-10-01.

## D-008 — Stable cross-section world for MVP

Decision:
Use a stylized surface/underground cross-section with authored collision regions
and logical hitboxes. Do not require deformable terrain simulation for the MVP.
Visual debris, trails and impact marks may communicate destruction without
changing the terrain mesh.

Why:
The core value is worm motion, breach timing and tactical prediction. Full
terrain deformation would add collision, rendering and mobile-performance risk
before those systems are validated.

Consequences:
Gameplay collision uses stable authored regions. Destruction feedback is visual
unless a later reviewed design explicitly adds terrain-state changes.

Status: accepted for MVP on 2026-10-01; may be revisited after profiling a complete two-role run.

## D-009 — Minimal MVP persistence

Decision:
The first versioned local save stores settings, accessibility preferences and
local best results. Its schema reserves explicit migration paths, but character
upgrades, achievements and broad unlock progression are added only with the
post-MVP content phase.

Why:
This exercises save creation, validation and migration without making unproven
gameplay depend on an economy or long progression grind.

Consequences:
Menus do not expose inactive upgrade or achievement economies during MVP. Save
loading must reject or migrate incompatible data safely.

Status: accepted as part of the staged MVP scope on 2026-10-01.

## D-010 — Hunter mode is a distinct tactical loop

Decision:
Hunt centers on readable underground cues, breach prediction, repositioning,
one deployable trap, ranged attacks and protection of a concrete objective. It
uses a player-facing information model designed for fairness against the AI worm.

Why:
Role switching is the product differentiator. Mirroring Rampage with a human
sprite would not create a second game with meaningful decisions.

Consequences:
The AI worm must telegraph intent without exposing exact hidden coordinates.
Hunt-specific win/loss rules and HUD information require separate acceptance
criteria while sharing combat and world services.

Status: accepted as part of the two-role MVP on 2026-10-01.

## D-011 — Head-authoritative worm locomotion

Decision:
Model the worm head with custom kinematic state and make follower segment poses
sample an ordered path history. Keep logical hitboxes independent from rendered
segment dimensions; use engine physics only at narrow collision boundaries.

Why:
This makes curvature, momentum and breach/re-entry behavior tunable without the
jitter and instability common to chains of physics joints.

Consequences:
Phase B needs an isolated locomotion spike and deterministic tests for path
sampling and state transitions before content grows.

Status: accepted with the written architecture on 2026-10-01. Phase B spike
evidence may supersede the collision-adapter detail through a newer decision.

## D-012 — Domain logic remains testable outside Phaser scenes

Decision:
Keep score/combo rules, cooldowns, spawn progression, AI decisions, save
migration and other deterministic rules in focused TypeScript modules that do
not import Phaser scenes or rendering objects.

Why:
The highest-risk rules need fast deterministic tests, and scenes should
coordinate presentation rather than own the entire game.

Consequences:
Adapters translate between domain events and Phaser rendering, audio, input and
collision. Cross-module dependencies follow declared public contracts.

Status: accepted with the written architecture on 2026-10-01.

## D-013 — Persistent session handoff

Decision:
Maintain `docs/SESSION_HANDOFF.md` as the current verified resumption checkpoint.
Later sessions read it after the core design documents, compare it with Git, and
continue from its exact next action when the user asks to continue.

Why:
The project spans multiple sessions and must not depend on chat history or
repeat completed research.

Consequences:
Every material checkpoint or intentional stop refreshes the handoff with scope,
files, verification evidence, limitations and the next gated action.

Status: accepted at the user's request on 2026-10-01.

## D-014 — Node 20-compatible Vitest baseline

Decision:
Pin `vitest@4.1.11` for Phase B while the project runtime baseline remains Node.js
20.19.3. Keep Vite at 8.3.1 and all other accepted direct versions unchanged.

Why:
The first foundation install reproduced an npm Arborist peer-graph crash. A
peer-bypassing diagnostic exposed the underlying engine mismatch: Vitest 5.0.3
requires Node.js 22.12 or newer, while Vitest 4.1.11 officially supports Node 20
and Vite 8. The older major is the smallest compatible correction and avoids
forcing a machine-wide Node upgrade during the browser-toolchain spike.

Consequences:
The lockfile and verification commands must resolve Vitest 4.1.11 exactly. A
later Node 22 baseline may reassess Vitest 5 through a separate compatibility
ruling; no upgrade happens implicitly.

Status: accepted from Phase B compatibility evidence on 2026-10-01.

## D-015 — Static Phase B run and save ownership

Decision: SessionController owns one authoritative session; RampageRules constructs
one immutable result; SaveCoordinator accepts each session ID once and preserves
the previous valid save as backup before replacement. v1 is the first supported
schema. Unknown future schemas remain on disk and the current session uses memory
until explicit reset confirmation. No mid-run persistence is required.

Why: Render timing, retries and storage failure must not duplicate scores or block
play. Domain code remains independent of Phaser, DOM and persistence adapters.

Status: implemented and covered by run-lifecycle, result-persistence, save-recovery
and browser tests on 2026-10-01.

## D-016 — Project-root workflow after Phase B

Decision: At the user's request, move the completed Phase B checkout into the
project root on a development branch. Future work runs directly in the root;
the user controls later pushes and merging to main.

Why: The root workflow makes changes easier for this user to inspect. Isolation
through additional worktree folders is no longer desired.

Consequences: Inspect the existing root branch and dirty state before switching.
Keep the Phase B branch/history intact; do not overwrite unrelated edits.

Status: explicitly authorized by the user on 2026-10-01.

## D-017 - Hunt integration and save v2 (2026-10-02)
Approved Phase C implementation now uses the existing GameSession boundary and
CombatSystem for both roles. Hunt disables Rampage spawn/rewards and keeps one
result owner; defeat precedes victory. AI diagnostics are opt-in before the run
and invalidate records. Save v2 migrates genuine v1 settings and Rampage records;
historical storage keys remain stable and original valid bytes become backup.

## D-018 - Physically reachable Hunt breach warning (2026-10-02)

Decision: Prepare/recover deep enough for the shared worm turn radius, and forecast
one locked approach with WormLocomotion to publish its quantized crossing sector.
Every natural breach must have a distinct warning at least 60 ticks earlier and
remain inside that sector. Snare lift is an intentional route interruption.

Why: Final review reproduced unannounced and out-of-sector attacks in the normal
start seed. Predictable attacks are necessary for the Ranger trap/dodge loop.

Status: accepted review correction; focused crossing regressions and the final
160-test suite passed. Human warning-duration/pressure tuning remains pending.

## D-019 - User-directed ascent and boss revision (2026-10-02)

Request: prioritize the user's actual playtest over the old Phase C relay scenario.
Five worms and five Hunters replace the previous five-total target. Automatic mouth
feeding replaces manual Bite; active skills become meaningful combat choices.
Hunt gains platforms, allied support, rising sand and 10-second escalating worm
returns. Summit entry stops the sand and starts a high-HP boss fight; RPG damage
is strong but subject to the boss's visible 3-second immunity. Boss defeat wins.
The whole successful run is targeted at 5-6 minutes, not a hard boss timeout.

Status: user-requested direction and boss clarification recorded. Concrete design
is proposed for written review; no product implementation in this checkpoint.
The plan must preserve shared simulation, original IP, root workflow and efficient
verification. Existing systems and historical records are migrated, not discarded.

## D-020 - Survival ascent implementation rulings (2026-10-02)

Decision:
Implement the approved survival revision inside the existing root checkout and
shared simulation, with these concrete rulings:
- A Hunt run without a legacy relay fixture id is the ascent; the historical relay
  scenarios remain explicit fixtures (`hunt-relay`, `hunt-victory`, `hunt-trap`,
  `hunter-defeat`, `relay-defeat`) and keep their old physics.
- `AscentWorld` owns the world clock: a hazard surface that rises 5px/s from the
  base outpost, the authored ledge route and the summit bounds; every actor uses it
  as the terrain profile, so sand motion is shared rather than special-cased.
- Start the hazard at y=200 (below the base platform) so the climb has a fair grace
  period instead of instant burial.
- Burial damage is applied by `GameSession` as a `hazard` source rather than through
  `CombatSystem`, because CombatSystem requires a live source actor.
- The ascent worm is one AI actor at a time: an ordinary kill hides it (no collision,
  no AI, no exposure) for 600 ticks and the next worm returns stronger, capped at
  five generations. The boss reuses the arena worm id so exposure, rifle and ally
  fire need no duplicate code paths; only its stats, AI depth and skill change.
- Allies are ascent-only, bounded (two ground, one air) and can never target the
  player or take the objective; the summit crate is player-only.
- The RPG is the objective weapon with finite rockets restocked at the crate; the
  starter rifle remains usable, and victory is exactly one boss defeat result.

Why:
Keeps one simulation, one terminal boundary and stable interfaces while delivering
the user-requested experience; historical scenarios stay comparable for regression.

Status: implemented and locally verified (197 unit/integration tests, lint/typecheck
green, root browser cases for menu, controls, kill/return, warning and boss). Human
feel, the 5-6 minute run target and physical devices remain open.

## D-020 - Building-height player arcs (2026-10-02)

Latest user playtest supersedes the original500-700px player jump proposal.
Rampage uses a compact ballistic arc; Hunt tower AI uses its own profile so the
existing rooftop fight stays reachable. No new approval pause: user requested
immediate continuation of the existing plan.

## D-022 - Roster, revised records and final review rulings (2026-10-02)
Ten immediately selectable original kits implement the approved roster, with
shared simulation/input and bounded strategies. Save3 isolates historical scores
in legacyRecords and persists selection; revised results freeze role-compatible
character/theme/version ownership. No new approval gate, worktree or remote action.
RPG loaded priority plus firearm fallback during reload preserves starter usability
without spending two weapons per trigger. Enemy post-hit recovery no longer cancels
actual weapon cadence; explicit shields still block.
One fresh read-only whole-range Superpowers review found four Important issues,
all reproduced RED then corrected: moving-surface presentation/contact, fatal
simultaneous boss impact, buried ground support and post-minute decoy targeting.
Resolve-start committed impact applies only in Hunt, preserving Rampage death rules.
Ascent fallback uses fixed arena coordinates, not hidden live Hunter coordinates.
Minor crate marker and clipped boss shield feedback were also implemented.
Natural5-6min pacing, physical-device controls and production art remain playtest
and polish work; procedural animated graphics are not claimed as GOTY realism.

## D-024 - Execute directly and measure real route pacing (2026-10-02)
Latest user explicitly waives Superpowers skills and further generic planning/review
loops. Use focused verification and persist actual work in README/handoff.
A normal automated run exposed9.88s climb/25.87s total; the approved5-6min direction
therefore needs actual traversal and boss endurance. Alternating end stairs and
3600HP boss replace overlapping vertical skips/600HP boss without a wait timer.
Contact damage every frame caused near-instant Hunter death: configurable1s hit
recovery and0.2s dodge protection correct it. One-use caches sustain long walks;
RPG first pickup restores living health once. Engineer drops beacon behind travel.
Five seed33 full-run successes measure5:46-6:03; user/device acceptance remains open.

## D-025 - Debug must be explicit, gameplay text minimal (2026-10-02)
User asks to hide unclear gameplay text except in debug and finish within20min.
Fix dev auto-debug, put technical counters/tracking/floating labels behind an
explicit menu checkbox, retain essential HUD and graphical warnings. No physics,
combat or pacing change and no rerun of unchanged full-game simulations.

## D-026 - Major playtest corrections remain open (2026-10-02)
User reports unsatisfying gun/RPG audio and feel, indistinct weapon/skill sounds,
wrong hand/shot alignment, weak UI/art and worm AI, missing allied soldiers with
repeated helicopters, and strange allied fire/audio. PLAYER_FEEDBACK.md records
all requested corrections. These are not fixed or reproduced yet; automated
feasibility is not user acceptance. On continue, reproduce aiming/soldier presence
briefly and execute focused fixes without Superpowers or new planning loops.

## D-021 - Playtest corrections: squad anchoring, honest aim, weapon voices, seismic hunt (2026-10-02)

Decision:
- Ground allies anchor to the Hunter (escort leash) instead of navigating the arena
  on their own, because "allied soldiers" must be visible next to the player.
- The stored aim is exactly the direction the shot uses; aim assist is limited to a
  6-degree cone so the drawn pose, muzzle and tracer never disagree with the bullet.
- Every weapon, skill and allied shot has its own procedural audio voice; shooting
  and skill use previously produced no sound at all.
- The worm senses the Hunter by an approximate seismic bearing (80px cells, 20-tick
  cadence) with crossing prediction, a surface dive guard and immediate re-acquire
  after a breach. This is an original sense, not input reading or hidden coordinates.
- Compensating rebalance: RPG 200 damage and a 0.5 impact scale against the Hunter,
  keeping deterministic full runs inside the acceptance band.

Why:
The user's playtest reported missing soldiers, wrong aim, weak gun audio and a
stupid worm. The fixes must make the game readable without adding unfair difficulty
or duplicating systems.

Status: implemented and locally verified (231 tests, lint/typecheck green, browser
cases for squad visibility, shot alignment, controls and the boss). Human feel and
art quality remain open in docs/PLAYER_FEEDBACK.md.

## D-022 - Rampage worm leap: an upward Burst is a leap, not a sprint (2026-10-02)

Decision:
- Steered upward (`moveY <= -0.5`) or while already rising beyond 180px/s, the
  player's Burst converts velocity to a fixed vertical launch speed
  (`burstLiftSpeed`, 1050 in the arcade profile, apex 275px at gravity 2000)
  instead of adding speed along the current tangent.
- The leap lives in the movement configuration as `burstLiftSpeed`, so it stays
  data-driven and tunable. `movementBalance` (fixtures) and `huntMovementBalance`
  (the Hunt pursuit worm) keep it at 0; only real player Rampage uses it.
- Intent, not phase, decides the leap. Steering up and bursting must work from
  underground or mid-air so the timing is forgiving on both keyboard and touch.
- Presentation follows: `worm-burst` gains a distinct `leap` audio voice and dust,
  the worm's touch Burst button is a full-size thumb target with a cooldown ring,
  and the HUD advertises `Burst - hold up to leap` while an air target is alive.

Why:
The user reported that boosting upward barely lifted the worm, so the 220px
helicopter was unreachable. Measurement confirmed the design literally stopped
short: the best-timed Breach apex was 159px against ~164px of required head
clearance. Air targets need a deliberate, satisfying vertical move, and honesty
requires the Burst to do what its upward steer implies.

Status: implemented and locally verified (233 domain tests across 75 files with the
heavy Hunt full-run gate excluded, plus browser leap cases on desktop keyboard and a
phone viewport measuring a peak above helicopter altitude + 20px). Human feel of the
leap, the new sound and the touch control remains open in docs/PLAYER_FEEDBACK.md.

## D-023 - Mouse mirrors the mobility action, and every control shows its cooldown (2026-10-02)

Decision:
- The right mouse button is a first-class alias for the mobility action: worm Burst
  in Rampage, Hunter Dodge in Hunt. PointerInput latches a press for at least one
  simulation sample so a quick click can never be dropped between frames, and the
  canvas context menu is suppressed. Desktop skill bindings stay as they are
  (`Q` for the Hunter skill and grapple); touch keeps the same actions on buttons.
- Cooldown visibility becomes shared UI state instead of per-widget text:
  `ui/ControlReadiness.ts` derives boost/ability/primary readiness from the existing
  snapshot cooldowns, the HUD draws filled gauges for health, skill, dodge, ammo and
  Burst, and touch buttons draw a readiness ring. A tap during a cooldown is now
  visibly explained rather than silently ignored.
- The worm return countdown ("Maw returns 8.3s") is player information and shows in
  normal Hunt play again; only the generation/kill counters stay behind debug.

Why:
The user asked for mouse access to the Shift action, for the UI/art pass to continue,
and for mobile skill buttons that are present, responsive and working (grapple
included). Readiness had previously been expressed only as text on the HUD, which
cannot be read while looking at a touch button.

Status: implemented and locally verified (236 domain tests across 76 files with the
heavy Hunt full-run gate excluded; browser cases for right-click Burst in Rampage,
right-click Dodge in Hunt, the mobile skill button firing the skill with its ring,
the Scout grapple touch button, and the HUD gauges at five viewports). This also
repaired the stale `hunt-flow` expectation about the worm return countdown. Art
quality beyond the HUD/control presentation remains a subjective, open item.

## D-024 - Rampage becomes the mirrored ascent hunt, classic arena kept as an option (2026-10-02)

Decision:
- Rampage is no longer an endless arena score chase. The worm now hunts five Hunter
  bots up the existing rising-sand tower: they deploy one at a time as the sand
  climbs, race to the rooftop crate and arm the RPG; the worm heals only from carrion
  floating in the sand. Clearing all five wins; losing the worm's health ends the run.
- The player keeps the arcade worm kit (burst leap, active skill, automatic mouth
  feeding) so the mode needs no new controls, and the sand is deliberately harmless
  to the worm: the rising hazard that threatens the Hunters is what lifts the worm's
  reach, which is what makes the two modes mirror images rather than a reskin.
- The old arena experience stays playable as "Choose classic arena" on the mode
  screen: same balance, fixtures, records and tests. Rampage fixtures always run on
  the classic arena because that is the arena they were authored for.
- Internally this is `mode: "rampage"` + `arcade` + `ascent: true` with a
  `mode.ascent-rampage` definition, a `RivalSystems`/`RivalHunterController` pair and
  an optional `ascentRampage` flag in the run result. No save schema bump and no new
  `SessionSnapshot.mode`, so existing v1-v3 saves and every Hunt path are untouched;
  the cost is that ascent rampage scores share the Rampage record slot for now.

Why:
The user reported that Rampage had no clear objective (random prey/infantry/vehicle
spawns) and should instead be the worm hunting the five Hunters while the sand rises
and the bots rush the rooftop RPG, healing only from carrion. They also asked to keep
the classic arena available separately.

Status: Stage 1 implemented and locally verified - 241 domain tests across 77 files
(heavy Hunt full-run gate excluded) including five new ascent-rampage integration
cases (deployment, climbing, carrion healing, death, five-kill win), plus browser
cases proving the new mode deploys rivals that climb while the sand rises and that
classic arena still starts unchanged. Stage 2 (per-kit rival skills, crate/pickup
presentation) and Stage 3 (HUD/art/balance, human feel) remain open.

## D-025 ? One-charge alternative Hunter skills and grounded presentation (2026-10-03)
The user explicitly confirmed one random skill per crate, chosen from the other
four Hunter kits. One extra slot uses the existing interact action, preserving Q
and primary cooldown. Full slots do not consume a crate; unreachable grapples keep
the charge. Effects reuse their kit definitions rather than copying rules.
Spawns use a dedicated seed stream, safe nearby platforms, an 18s interval and
three-crate cap. These initial values are provisional pending a human playtest.
Original generated key art/transparent worm textures establish the more realistic
art direction. Human/environment geometry stays procedural and small-device
readable. Sound uses original cached physical-noise/foley samples rather than
third-party recordings; skill device cues stay distinct. Root/Pages hosting and
save schema3 are retained. User requested no wasted time/long test cycles: focused
logic tests, existing scoped browser checks and short production smoke only.

## D-026 - Geological cutaway decoration (2026-10-03)

The user requested visible natural underground objects and a realistic environment.
Use original generated rock textures plus procedural sediment, roots, gravel,
fractures, minerals, fossils and theme-specific buried debris/ice. Details remain
behind gameplay actors and have no hitboxes. This satisfies the visual request
without changing settled worm movement or adding a terrain obstacle system.
Ascent decoration follows the rising material band; classic decoration is fixed.
Build static geometry and a shared cached grain texture once, with local visual
hashing independent of gameplay RNG. Ship one compact transparent atlas with
documented provenance and base-path-safe loading. Verify appearance/input at
representative sizes and static hosting with short checks, without long gameplay
simulation reruns for a presentation-only change.

## D-027 - Aggressive, skill-sensitive AI with committed warnings (2026-10-03)

The user accepted the environment and explicitly requested smarter/aggressive
worm/Hunter bots and personalized skill effects, especially a real beacon attack.
Fix the existing deterministic brains instead of replacing them or adding LLMs.
Prioritize actionable sensory cues: beacon overrides visual sightings, grapple
and healing publish brief bearings, Shield prompts a flank/delayed commitment,
and Mark provokes pursuit. Primary/borrowed skills share one signal adapter.
Already warned attacks remain committed; a lure can queue the following attack.
Maintain minimum warning lead and no blind rival shooting through underground soil.

Use real Hunter kit skill/weapon definitions for rivals, shared locomotion/dodge,
safe nearby ledge selection and predictive exposed-target aiming. Fix rooftop RPG
ownership and feed its state into rendering/audio. A bot beacon never overrides
a human worm's input. Focused deterministic/browser checks establish behavior;
human aggression and complete-run pacing remain provisional. No workflow restart,
save migration, new dependency or major content expansion is needed.

## D-028 - Use vanilla, production-only Vercel Web Analytics (2026-10-03)

The user explicitly requested @vercel/analytics. This app stays Vite/Phaser and
uses inject from the package root, following Vercel's other-framework setup.
Pin2.0.1; keep the tracking call at app startup, outside gameplay systems.
Enable only Vercel production builds, preserving local/E2E/Pages behavior and
custom-domain support. No custom game events, identity/score payloads, React or
mandatory backend is introduced. Existing project Analytics is already enabled.
Verify deployment/script availability and clean game boot; headless test traffic
is intentionally excluded by the served SDK, so real data needs normal visitors.
