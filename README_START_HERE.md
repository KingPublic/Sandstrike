# Sandstrike

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
