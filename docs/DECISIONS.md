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
