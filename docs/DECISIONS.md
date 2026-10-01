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

Status: head authority and path/history following are accepted requirements from
`AGENTS.md`; the custom-kinematics and collision-adapter details remain pending
written-spec review and Phase B evidence.

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

Status: domain/rendering separation is an accepted requirement from `AGENTS.md`;
the concrete module/port layout remains pending written-spec review.

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
