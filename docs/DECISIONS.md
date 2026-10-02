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
