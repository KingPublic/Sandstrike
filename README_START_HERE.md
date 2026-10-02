# Sandstrike

## Read this first when continuing with AI

Updated 2026-10-02. Work in this root on `phase-b-ready`; do not create worktrees,
switch branches, push or merge. The user controls remote integration. Communicate
in Bahasa Indonesia. A short "lanjutkan" means resume the exact next task below.

Read in this order, then check `git status`, recent commits and the actual source:
1. `AGENTS.md` for project rules.
2. `docs/SESSION_HANDOFF.md` for the latest verified state, approvals and next action.
3. `docs/superpowers/specs/2026-10-02-sandstrike-survival-redesign.md` for the
   **user-approved replacement direction**; it supersedes conflicting old gameplay.
4. `docs/superpowers/plans/2026-10-02-survival-plan-set.md`, then the current child
   plan. Do not execute all old Phase A/B/C plans again.
5. Relevant sections of `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`,
   `docs/DECISIONS.md`, `docs/BALANCE.md`, `docs/ASSET_LICENSES.md`, and
   `docs/REFERENCE_RESEARCH.md`; inspect only source/tests relevant to the task.

Current shipped checkpoint: Phase C two-role prototype, product `073b9d9`;
final evidence `docs/PHASE_C_VERIFICATION.md`. **The revised game is not implemented
yet.** The user approved the redesign and requested extra themes on 2026-10-02.
New written implementation plans are ready; written-plan review was asked
asynchronously and is pending until an explicit answer is recorded.
Exact next action: after that review, execute **Survival Foundation Task 1**
(`2026-10-02-survival-foundation.md`) inline, then continue the ordered child plans.
Do not ask for the already-approved design again. If plan review arrives later,
update this approval state and the handoff before coding.

Required target: 5 worms + 5 Hunters, unique active skills, automatic mouth feeding,
agile/high breaches, compact desktop menu, allied Hunt NPCs/helicopters, climbable
platforms/buildings, rising hazard and normal worm return after10s with escalating
pressure. At summit: hazard stops, RPG pickup, stronger/high-HP boss with3s immunity;
boss defeat wins. Target whole successful run5-6min, not a forced timer. Themes:
desert outpost, urban ruins, frozen facility; shared physics/world rules.

Checkpoint after every playable task: list files, observed tests/build/browser
results, known limits, commit/dirty state and exact next task here and in handoff.
Keep plan ledgers under ignored `.superpowers/sdd/`. Never label plans as shipped
features or report unrun tests as passing. Preserve v1/v2 saves and protect future
schemas. Run focused tests; repeat a passed check only for a relevant change/failure.
User reported18% account quota and wants a handoff at1%; the agent cannot observe
that percentage. Save progress continuously and checkpoint promptly if the user
reports the remaining quota. Do not invent an account-usage reading.

## Current game (before the approved revision)

Sandstrike is an original browser-first 2D action game with two asymmetric roles:
an underground monster and a human hunter. The project targets desktop and
landscape-first mobile play from one shared simulation. Phase C adds playable
Ranger Hunt and completes Rampage response bands 0-3.

## Play the current slice

From the project root, run `npm ci` once, then `npm run dev` and open the local
URL printed by Vite. Choose Enter desert → Play → Rampage or Hunt → Start.

- Keyboard: WASD or arrow keys steer, Space bites, Shift bursts, Escape pauses.
- Touch: drag the joystick; use Bite and Burst with another finger. Landscape
  is required during play; portrait safely pauses the run.
- Gamepad: left stick steers, right trigger bites, right bumper bursts, Start
  pauses. The shared action adapter is tested; physical hardware remains unverified.
- Pause offers Resume, Restart and End run. Results offers Retry, mode selection
  and the main menu. Restart/end/reset require explicit confirmation.
- Settings control feedback, volume, touch handedness/opacity and accessibility.
  Muted play retains critical text/shape cues. There is no music track yet.
- Hunt: WASD/arrows move, mouse aims, click/Space fires, Q places or recovers a
  snare, Shift dodges, R/Control reloads. Touch uses independent movement,
  captured Fire/Aim drag, Snare and Dodge. Gamepad uses both sticks, RT fire,
  LT reload, LB snare, RB dodge. Protect the relay and shoot exposed worm regions.

Burrow, turn upward to breach, strike prey for healing and chain varied targets.
Infantry, armored vehicles and aerial threats lock aim before firing. Each new
response band has its own warning and bounded population. Hunt uses a seeded AI
worm, broad tracking, temporary snare reveal and explicit victory/defeat outcomes.
Both modes' records, Hunt victories, onboarding and settings save locally.
Save v2 migrates v1 records. If storage is unavailable,
play continues with memory-only progress for that session.

## Files

- `MASTER_PROMPT_CODEX.md` — paste this into a fresh Codex project/session.
- `AGENTS.md` — keep at repository root so future Codex sessions retain project rules.
- `docs/REFERENCE_RESEARCH.md` — living source/evidence ledger.
- `docs/GAME_DESIGN.md` — living GDD.
- `docs/ARCHITECTURE.md` — module boundaries and technical design.
- `docs/DECISIONS.md` — design/architecture decision log.
- `docs/ASSET_LICENSES.md` — asset provenance.
- `docs/BALANCE.md` — tuning record.
- `docs/CHANGELOG.md` — meaningful changes.
- `docs/SESSION_HANDOFF.md` — latest verified checkpoint and exact resume action.
- `docs/PHASE_C_VERIFICATION.md` — actual two-role evidence and release limits.

## Start development

Use Node.js `^20.19.0 || >=22.12.0` and npm. The pinned local baseline is in
`.nvmrc`.

```bash
npm ci
npm run dev
```

Use targeted tests while developing. Run the integrated gate for release changes:

```bash
npm run verify
npm run test:e2e
npm run test:e2e:pages
npm run test:smoke:root
npm run test:smoke:pages
```

For a later session, a short request such as “lanjutkan proyek” means: read the
handoff, verify it against Git, and continue from its recorded next action without
repeating completed research.


## Cross-platform target

The prompt and AGENTS rules now require the game to be playable responsively on:
- desktop/laptop;
- mobile phones;
- tablets where practical.

Codex also has explicit permission to propose original gameplay features, while still requiring design justification and approval before major scope expansion.

## Static deployment

The game requires no backend, server runtime, rewrite rule, or runtime secret.
Every deployment publishes the generated `dist/` directory.

### Vercel

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

The root production smoke test uses the same output:

```bash
npm run test:smoke:root
```

### GitHub Pages

The Pages build sets Vite's base path to `/Sandstrike/` so JavaScript and CSS
resolve under the repository subpath.

```bash
npm install
npm run build:pages
```

Publish `dist/` as the Pages artifact. Validate that exact build locally with:

```bash
npm run test:smoke:pages
```

The repository-subpath behavior is covered independently from the root build;
asset or chunk responses at HTTP 400 and above fail the smoke test.
