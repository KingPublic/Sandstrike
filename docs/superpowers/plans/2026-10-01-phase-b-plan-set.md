# Phase B Vertical Slice Implementation Plan Set

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a tested browser vertical slice in which one original segmented
worm can burrow, breach, consume one prey target, fight one armed threat, build a
score/combo, pause/restart, and reach Results on desktop and touch layouts.

**Architecture:** Execute three ordered plans. The foundation plan proves the
pinned browser toolchain and static hosting. The movement plan establishes the
deterministic action, simulation, terrain-crossing, camera, and segmented-worm
contracts. The Rampage plan adds only the content and run systems needed to pass
the Phase B gate; it extends those contracts instead of replacing them.

**Tech Stack:** Node.js `^20.19.0 || >=22.12.0`, npm, Phaser 4.2.1,
TypeScript 6.0.3, Vite 8.3.1,
Vitest 5.0.3, Playwright 1.63.0, ESLint 10.11.0, typescript-eslint 8.71.0,
plain HTML/CSS, and versioned `localStorage`.

**Spec:** `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, and
`docs/DECISIONS.md` D-005 through D-013.

## Global Constraints

- Pin exact direct dependency versions and commit `package-lock.json`.
- Require Node.js `^20.19.0 || >=22.12.0`; the planning environment reports
  `v20.19.3`.
- Keep one domain simulation and semantic action layer for keyboard, touch, and
  gamepad; physical devices do not branch gameplay rules.
- Keep deterministic domain modules independent of Phaser, DOM, storage, audio,
  and rendering APIs.
- Use a head-authoritative worm with distance-sampled path history; do not build a
  chain of independently simulated rigid bodies.
- Keep logical hitboxes independent from procedural placeholder visuals.
- Use only original procedural programmer art in Phase B; add no external asset
  without an `ASSET_LICENSES.md` entry.
- Add no React, backend, account, analytics, cloud save, currency, upgrades,
  achievements, vehicle, aircraft, Hunter, or AI-worm implementation in Phase B.
- Keep Vercel root hosting and GitHub Pages subpath hosting working from static
  `dist/` output.
- Follow TDD for deterministic behavior: observe each focused test fail for the
  intended reason, implement the minimum behavior, then observe it pass.
- A task is complete only after its focused checks pass and its documentation is
  current; commits remain small and task-scoped.

## Toolchain Evidence Checked 2026-10-01

- Phaser 4.2.1 is the current stable npm release:
  https://www.npmjs.com/package/phaser?activeTab=versions
- Vite 8.3.1 is current and requires Node.js 20.19+ or 22.12+:
  https://www.npmjs.com/package/vite?activeTab=versions and
  https://vite.dev/guide/
- TypeScript 7.0.2 is current, but the official typescript-eslint support window
  is `<6.1.0`; therefore this plan deliberately pins TypeScript 6.0.3 with
  typescript-eslint 8.71.0:
  https://www.npmjs.com/package/typescript?activeTab=versions and
  https://typescript-eslint.io/users/dependency-versions/
- Vitest 5.0.3 and Playwright Test 1.63.0 are the current stable test packages:
  https://www.npmjs.com/package/vitest and
  https://www.npmjs.com/package/%40playwright/test?activeTab=versions
- ESLint 10.11.0 is the current stable linter release:
  https://www.npmjs.com/package/eslint

The foundation compatibility task must prove this exact set together before any
gameplay task depends on it. A failure triggers `superpowers:systematic-debugging`
and a documented version ruling rather than an unrecorded package change.

## Review Focus

1. **High-speed terrain crossing:** one tick must not miss, duplicate, or reverse a
   breach/re-entry transition. Covered by movement-plan swept-crossing tests.
2. **Interruption and stale input:** visibility, orientation, blur, and resume must
   freeze simulation and require fresh input. Covered by movement-plan unit and
   Playwright lifecycle tests.
3. **Narrow safe-area layouts:** HUD and touch controls must remain usable at
   915×412 and 844×390 without covering critical warnings. Covered by movement and
   Rampage viewport checks.
4. **Corrupt or unavailable storage:** the run must remain playable and records
   must fall back safely. Covered by Rampage save tests and browser smoke checks.
5. **Non-root deployment:** scripts and asset URLs must load under a repository
   subpath without network or console failures. Covered by foundation and final
   Rampage production-build smoke tests.

---

## Ordered Plans

1. [Phase B Foundation](2026-10-01-phase-b-foundation.md)
   - Produces a pinned, linted, typed, tested Vite/Phaser shell.
   - Proves root and non-root static builds before gameplay depends on them.
2. [Phase B Worm Movement](2026-10-01-phase-b-worm-movement.md)
   - Produces the shared action layer, fixed-step session, terrain model,
     locomotion/path history, procedural worm view, camera, and responsive touch
     layout.
   - Must pass the isolated movement-feel gate before content work proceeds.
3. [Phase B Rampage Slice](2026-10-01-phase-b-rampage-slice.md)
   - Produces prey, one armed infantry threat, combat, score/combo, HUD,
     pause/restart/results, local records, feedback, and complete Phase B
     verification.

The three files form one reviewed execution set. Their task numbering is local to
each file; execute every checkbox in file order.

## Cross-Plan Public Contracts

Later plans may extend these contracts but may not silently rename or bypass them.
If implementation evidence requires a change, record a `Ruling:` in the execution
ledger and update every downstream plan reference before continuing.

| Contract | Owning plan | Downstream expectation |
|---|---|---|
| `normalizeBasePath(raw?: string): string` | Foundation | Returns `/` or a leading-and-trailing-slash subpath used by build and tests. |
| `createGame(parent: HTMLElement, options?: GameBootstrapOptions): Phaser.Game` | Foundation | Creates exactly one Phaser instance and exposes a destroy path for tests/restart. |
| `ActionFrame` and `InputSource` | Movement | Human, scripted, and later AI controllers use the same normalized held/pressed/released semantics. |
| `FixedStepRunner.advance(deltaMs, step)` | Movement | Caps catch-up, reports dropped time, and never feeds render interpolation back into domain state. |
| `TerrainProfile.surfaceY(x)` | Movement | Locomotion and collision code query terrain instead of assuming one global Y value. |
| `PathHistory.append/sampleDistanceBehind/reset` | Movement | Rendered segments and optional follower hurt capsules derive poses from one bounded ring buffer. |
| `WormLocomotion.step(action, dt, terrain)` | Movement | Produces legal head/path state and typed breach/re-entry events without Phaser objects. |
| `GameSession.step(actionFrame): SessionStepResult` | Movement, extended by Rampage | Owns deterministic run state and returns one immutable snapshot plus ordered domain events. |
| `DomainEvent` discriminated union | Movement, extended by Rampage | Starts with movement transitions; combat, score, HUD, feedback, objectives, and Results add typed immutable variants. |
| `window.__SANDSTRIKE_TEST__` | Movement, extended by Rampage | Exists only in dedicated E2E root/pages builds; configures the next named fixture and supplies actions/read-only snapshots without direct domain-state mutation. |
| `SessionCommand` and `ModeRules` | Rampage | Route confirmed end-run requests through one deterministic domain boundary; mode rules alone create one `RunResult`. |
| `SaveRepository` and `SaveCoordinator` | Rampage | Only the coordinator validates, migrates, backs up, and writes versioned records/settings. |

## Phase B Exit Gate

The plan set is complete only when fresh evidence shows all of the following:

- the production build, lint, typecheck, unit tests, integration tests, and
  Playwright smoke suite pass;
- root and repository-subpath builds load required modules/assets with no fatal
  console errors; dedicated E2E builds alone expose the test bridge, while both
  ordinary production builds prove it is absent;
- the worm turns smoothly, builds underground momentum, breaches, has limited air
  steering, re-enters, and preserves stable follower spacing;
- one prey and one armed threat can be hit intentionally, with bite/impact,
  damage, eat-to-heal, combo, and failure feedback;
- pause, visibility interruption, restart, Results, local best score, and corrupt
  save fallback behave as specified;
- keyboard and touch drive the same movement rules, and representative desktop,
  phone, and tablet landscape layouts retain critical playfield/HUD visibility;
- manual browser evidence records movement feel, camera behavior, touch ergonomics,
  audio-unlock behavior if audio hooks exist, and remaining limitations;
- `README`, `BALANCE`, `CHANGELOG`, `DECISIONS`, and `SESSION_HANDOFF` describe the
  implementation actually verified.

Failure of the movement-feel portion blocks Phase C planning and broader content.

## Plan Boundary

Do not write detailed Phase C or D implementation plans yet. Hunter tracking,
worm AI utility weights, vehicle/air-response density, and the five-character
roster depend on measured movement, camera, collision, and mobile-layout evidence
from this plan set. After the Phase B gate passes, update the specifications with
those findings and invoke `superpowers:writing-plans` for Phase C.
