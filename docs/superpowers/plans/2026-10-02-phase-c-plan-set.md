# Phase C Two-Role Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans
> to implement this plan set task-by-task. Steps use checkbox (`- [ ]`) syntax
> for tracking. Preserve the user's native execution method and project-root workflow.

**Goal:** Complete the approved two-role prototype: playable Ranger/Hunt with a
fair AI worm, followed by Rampage response bands 2–3 and the integrated MVP gate.

**Architecture:** Extend the existing GameSession, action/event contracts and
GameplayScene. Focused Hunter, AI, tracking and objective systems own mode behavior;
the scene renders role-specific views. Save v2 explicitly migrates Phase B records.

**Tech Stack:** Existing pinned Phaser 4.2.1, TypeScript, Vite, Vitest and Playwright.
No additional dependency or runtime service is planned.

**Spec:** `docs/GAME_DESIGN.md` sections 5, 7–18.2;
`docs/ARCHITECTURE.md` sections 3, 6–16, 18–21;
accepted decision D-006 and `docs/PHASE_B_VERIFICATION.md`.

## Global Constraints

- Work directly in `C:/Users/Adrian/Games/Sandstrike`, branch `phase-b-ready`.
- Phase B is complete at `7ca0d47`; current cleanup checkpoint is `6fb8f66`.
- Preserve working movement, contact ordering, pause, save fallback and retry.
- Use one GameSession and one GameplayScene for desktop, touch and gamepad.
- Domain code imports no Phaser, DOM, storage, audio or wall-clock API.
- AI consumes allowed perception and emits the same ActionFrame as human input.
- Normal Hunt views must not reveal exact buried worm poses or track them by camera.
- No backend, runtime LLM, new roster, campaign, economy or proprietary assets.
- Balance numbers below are original prototype hypotheses, not reference facts.
- Keep all timers in 60 Hz simulation ticks and cap actors/projectiles/effects.
- Use one browser worker; do not run root/Pages builds sharing dist concurrently.
- Run focused tests per increment; rerun unaffected checks only when integration
  changes justify it. One fresh whole-branch review closes Phase C.
- User controls later remote publish/merge/deployment; do not perform those actions.

## Ordered plans

1. `2026-10-02-phase-c-hunt-prototype.md`: Hunter kit, AI/tracking, Hunt session,
   save migration, shared input/presentation and the Hunt viability gate.
2. `2026-10-02-phase-c-rampage-completion.md`: only after Hunt is viable, add two
   threat archetypes, complete response bands 2–3 and run the integrated gate.

Each child plan owns its own execution ledger under `.superpowers/sdd/`; add that
scratch directory to `.gitignore` at execution setup. Do not create a new worktree.

## Shared contracts

- Keep worm actor ID `worm`; add stable IDs `hunter` and `relay` only in Hunt.
- `RunConfiguration.mode?: "rampage" | "hunt"` defaults to Rampage; laboratory
  fixture behavior remains an explicit separate setup path.
- SessionSnapshot gains `mode` and `playerActorId`; Hunt snapshots carry a typed
  `hunt` payload, while existing Rampage fields remain available.
- RunResult becomes a discriminated union. Preserve existing Rampage fields and
  reasons; Hunt has `victory`, `hunter-defeated`, `relay-destroyed`, `player-ended`.
- Hunt combat damage uses existing CombatSystem/DamageResolver. Rifle contact
  tests exposed logical worm regions; the rendered sprite does not define damage.
- Hunt disables Rampage spawning/scoring. ModeRules alone ends a run.
- Save v2 keeps Rampage records, adds Hunt bestScore/bestRun/bestVictory, aim assist
  and huntSeen. Historical environment-specific `.save.v1` and `.backup` keys stay
  stable so existing saves are discoverable; envelope version governs migration.
- Exact AI inspection is developer-only and makes that Hunt run ineligible for
  records. It is opt-in before starting; no mid-run configuration mutation.

## Review Focus

- Mouse/right-stick aim cannot replace a concurrently held movement action.
- Hidden worm poses cannot leak through camera, effects, aim assistance or telegraphs.
- Fatal damage and multiple same-tick objectives produce one consistent result.
- Switching roles/retrying cannot retain old input, trap, projectile or view state.
- Valid v1 records survive migration; future data remains protected until reset.

## Self-review and handoff

Checked spec coverage, task signatures, save migration order and Review Focus tests.
Hunt must be playable before vehicle/aerial content grows. Physical-device 60 fps,
human feel, real touch/gamepad and audible quality remain required evidence limits;
automated host measurements cannot be relabeled as hardware results.

Status: implementation approved by the user on 2026-10-02. Both child plans are
implemented as a functional two-role prototype. One fresh final review found one
Important warning defect, resolved in one fix pass with RED-to-GREEN regressions.
Final evidence and release limits: docs/PHASE_C_VERIFICATION.md. Physical-device
quality and human-feel release gates remain pending, as Task 3 explicitly permits.
