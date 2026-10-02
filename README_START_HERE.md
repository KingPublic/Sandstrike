# Sandstrike

## Read this first when continuing with AI

Updated 2026-10-02. Work in this root on `phase-b-ready`; do not create worktrees,
switch branches, push or merge. The user controls remote integration. Communicate
in Bahasa Indonesia. A short "lanjutkan" means resume the exact next task below.

Read in this order, then check `git status`, recent commits and the actual source:
1. `AGENTS.md` for project rules.
2. `docs/SESSION_HANDOFF.md` for the latest verified state, approvals and next action.
   Read `docs/PLAYER_FEEDBACK.md` for the latest open major playtest issues.
3. `docs/superpowers/specs/2026-10-02-sandstrike-survival-redesign.md` for the
   **user-approved replacement direction**; it supersedes conflicting old gameplay.
4. Old files under `docs/superpowers/plans/` are optional historical references.
   Do not load skills or execute completed Phase A/B/C plans to resume work.
5. Relevant sections of `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`,
   `docs/DECISIONS.md`, `docs/BALANCE.md`, `docs/ASSET_LICENSES.md`, and
   `docs/REFERENCE_RESEARCH.md`; inspect only source/tests relevant to the task.

Current checkpoint (2026-10-02, latest execution): **the approved survival revision,
pacing pass, presentation pass, first playtest corrections, the Rampage worm leap,
the mouse/UI-control pass and Stage 1 of the new Rampage (ascent hunt) are
implemented** in the root on phase-b-ready. Latest checkpoint commit subject:
`feat: make Rampage hunt five Hunter bots up the rising sand`. Use git log/status for
the exact SHAs; no push or merge was performed.

New Rampage (Stage 1): the worm now runs the ascent arena as the hunter. Five Hunter
kits deploy one at a time as the sand rises (max two active), climb ledge by ledge,
shoot only at an exposed worm and arm heavy rounds at the rooftop crate; carrion in
the sand is the worm's only healing. Kill all five to win, lose all health to fail.
The old endless arena is untouched and reachable via "Choose classic arena" on the
mode screen, so nothing classic regressed. Stage 2 (per-kit rival skills, crate
presentation) and Stage 3 (HUD/art/balance, human feel) still to come.

Mouse and control presentation (latest): the right mouse button mirrors Shift (worm
Burst in Rampage, Hunter Dodge in Hunt) beside left-click aim/fire, a quick click is
never dropped and the field suppresses the browser menu. Both HUDs now draw filled
health/skill/dodge/ammo/Burst gauges, touch buttons with a cooldown (Burst, the active
skill, reloading fire) draw a readiness ring, and the worm return countdown is visible
again in normal Hunt play. Desktop skill bindings are unchanged (`Q`, grapple
included); mobile keeps a working button for every action, including the Scout
grapple, verified in a browser at a phone viewport.

Rampage leap (latest): holding an upward steer while pressing Burst (Shift, or the
touch Burst button) now launches the player worm ~275px above the surface instead
of only sprinting, which finally reaches the 220px helicopter patrol altitude and
lets the worm bite them out of the sky. Burst also has its own rising leap sound
plus dust, the worm's touch Burst button is now a full-size thumb target with a
cooldown ring, and the HUD says `Burst - hold up to leap` while an air target is
alive. Campaign (Hunt) worm movement is unchanged.

Playtest corrections (a9f0615, from docs/PLAYER_FEEDBACK.md items 1-5): allied
soldiers spawn beside the Hunter and escort them instead of drifting off camera;
weapon, skill and allied fire now have distinct audio; the muzzle, pose and tracer
follow the exact shot direction (assist cone 6 degrees); the worm senses the player
seismically, leads the crossing, dives between attacks and re-acquires after a
breach. Rebalanced with RPG 200 damage and a 0.5 Hunter impact scale; deterministic
seed-33 runs still finish (ascent ~248s, totals 393-413s). Evidence:
`docs/verification/hunt-squad.png`, `tests/e2e/hunt-clarity.spec.ts`, 231 tests.

The user explicitly asked to SKIP Superpowers skills and further plan/review cycles.
This is a persistent preference for future fixes and game updates, not just this
checkpoint. Default to direct execution; use Superpowers again only when explicitly
requested by the user. Keep necessary planning brief, reuse working systems, run
only relevant checks, respect time limits, and let the user assess the game.
Do not reopen completed plans. AGENTS.md now records the same preference.

New in this checkpoint:
- Authored alternating end stairs and long industrial catwalks, directional route
  cues, summit progress, boss health meter and squad/air counts.
- 3600 HP summit boss, unchanged 3-second shield and RPG; first RPG pickup restores
  living Hunter health once. One-use 35 HP medical caches along the long floors.
- Hunter contact damage now grants 1 second recovery; Dodge protects its 0.2-second
  movement window. Immunity has a visible outline. No healing/revival of dead actors.
- Engineer drops the beacon behind travel direction. All ten kits remain distinct.
- Original menu illustration, articulated worm jaws/head, Hunter armor/limbs,
  industrial supports and bounded dust/snow; reduced motion respected.
- Building-height ballistic player worm fix from b1bac82 is retained.

Measured seed33 full runs: Ranger5:59, Siege5:53, Scout5:46, Medic5:58,
Engineer6:03. These are deterministic input runs, not a human difficulty guarantee;
Scout grapple was not used. Four baseline runs precede the extra cache placement;
only failed Engineer was rerun after the focused change. See SURVIVAL_PLAYTHROUGH.json.
Verification: lint/typecheck pass; 236 domain tests across 76 files pass with the
heavy 5-run survival gate excluded, plus browser cases for the leap, mouse controls,
the mobile skill/grapple buttons, HUD gauges at five viewports and worm controls.
`dist` is a normal root production build. See SURVIVAL_VERIFICATION.md.

Exact next action: the user is playtesting the new Rampage (Stage 1). If they say
"lanjutkan", continue with Stage 2 of the ascent hunt: give each rival kit its own
skill (Scout grapple, Siegebreaker shield, Engineer decoy, Field Medic heal, Ranger
mark) so the climb reads differently per kit, make the rooftop crate a visible
pickup with its own feedback instead of an instant arm, and let an armed rival lose
the heavy weapon when it dives or dies. Then Stage 3: HUD/art polish for the new mode
(armed warning, remaining-Hunter presentation, carrion cue), balance tuning from their
verdict (rival cadence/damage, carrion cadence and heal size, deploy timing), and the
score/record question (ascent and classic still share the Rampage record slot).
Also still open: item 6 (art quality) in `docs/PLAYER_FEEDBACK.md`, which needs the
user's own judgement, and the a9f0615 items' human feel. Do not restart a generic
plan/review/testing cycle, and do not rebalance Hunt for ascent-rampage tuning.
Physical devices, gamepad/audio/haptics, sustained performance and human difficulty
still need real feedback. Visuals are stylized original procedural art, not photorealism.

Required target: 5 worms + 5 Hunters, unique active skills, automatic mouth feeding,
responsive building-height breaches, compact desktop menu, allied Hunt NPCs/helicopters, climbable
platforms/buildings, rising hazard and normal worm return after10s with escalating
pressure. At summit: hazard stops, RPG pickup, stronger/high-HP boss with3s immunity;
boss defeat wins. Target whole successful run5-6min, not a forced timer. Themes:
desert outpost, urban ruins, frozen facility; shared physics/world rules.

Checkpoint after every playable task: list files, observed tests/build/browser
results, known limits, commit/dirty state and exact next task here and in handoff.
Do not start new Superpowers ledgers after the explicit user override. Never label plans as shipped
features or report unrun tests as passing. Preserve v1/v2 saves and protect future
schemas. Run focused tests; repeat a passed check only for a relevant change/failure.
User reported18% account quota and wants a handoff at1%; the agent cannot observe
that percentage. Save progress continuously and checkpoint promptly if the user
reports the remaining quota. Do not invent an account-usage reading.

## Current playable prototype

Sandstrike is an original browser-first 2D action game with two asymmetric roles:
an underground monster and a human hunter. The project targets desktop and
landscape-first mobile play from one shared simulation. The approved survival revision adds ten kits, three themes and a rooftop boss.

## Play the current slice

From the project root, run `npm ci` once, then `npm run dev` and open the local
URL printed by Vite (or `npm run preview` to play the built `dist/`). Choose Enter
desert → Play → Rampage, Classic arena or Hunt → Start. The character selector offers
five role-compatible kits. The environment selector (desert outpost / urban ruins /
frozen facility) is on the mode screen and is frozen for the run.

- Rampage (ascent hunt): you are the worm inside the rising sand. WASD or arrows
  steer, Space activates the selected worm skill (Dune Maw: Sandguard, 3s immunity),
  hold up with Shift or a right click to leap out of the sand, Escape pauses. Five
  Hunter bots climb the tower and race for the rooftop RPG; kill all five to win.
  Carrion drifting in the sand heals you when your mouth touches it - it is the only
  healing here, and rivals only shoot at you while you are out of the sand.
- Classic arena: the older endless arena run (prey for health, response bands and
  score) is unchanged and selected with "Choose classic arena".
- Hunt (survival ascent): A/D move, Space or W jump, S drops through a platform,
  mouse aims and fires, Q uses the character skill, Shift dodges, R reloads.
  Climb the outpost route above the rising sand, survive the worms (each ordinary
  kill buys 10 seconds before a stronger worm returns), reach the rooftop crate for
  the RPG and finish the boss at the summit.
- Touch: joystick plus Jump, Fire/Aim drag, Skill and Dodge (Rampage: selected skill and
  Burst). Landscape is required during play; portrait safely pauses the run.
- Gamepad: left stick steers/moves, right stick aims, RT fires, LT reloads, RB
  boost/dodge, LB skill, A jumps and B drops through. The shared action adapter is
  tested; physical hardware remains unverified.
- Pause offers Resume, Restart and End run. Results offers Retry, mode selection
  and the main menu. Restart/end/reset require explicit confirmation.
- Settings control feedback, volume, touch handedness/opacity and accessibility.
  Muted play retains critical text/shape cues. There is no music track yet.

Burrow, turn upward to breach, strike prey for healing and chain varied targets.
Infantry, armored vehicles and aerial threats lock aim before firing. Each new
response band has its own warning and bounded population. Hunt uses a seeded AI
worm, broad tracking, rising-hazard ascent, allied support and summit boss victory.
Both modes' records, Hunt victories, onboarding and settings save locally.
Save v3 migrates v1/v2 records into legacyRecords without mixing revised scores. If storage is unavailable,
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
- `docs/SURVIVAL_VERIFICATION.md` ? latest redesign evidence and release limits.
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

## Latest user correction: remove gameplay text clutter (2026-10-02)
Completed after the pacing pass, within the user20-minute cutoff. Debug was
incorrectly enabled automatically for Rampage under npm run dev. It is now explicit
via the dev-menu Debug mode checkbox for either role. Normal play has no debug
panel/hitbox paths, floating Bite/Breach/Protected labels, tremor labels, technical
height/hazard/generation/bot counters, or7-second controls banner. Essential
health/ammo/skill, objective direction and boss meter remain; graphical threat cues
and particle/audio feedback are retained. Debug still exposes diagnostics.

Focused evidence: lint/typecheck pass;6 HUD unit cases pass, including the new
ordinary-vs-debug case. Four affected browser cases pass (normal/debug Hunter2,
mobile/tablet2). Actual Vite dev Rampage was visually checked both ordinary and
explicit-debug, no page errors; captures dev-rampage-clean/debug.png and
survival-hunt-clean.png. Production root/Pages smoke pass again after this change.
Total evidence231 domain tests and10 distinct root browser cases across scoped
runs; no repeat of the five full-game simulations for a text-only correction.
Final dist remains normal root production. Subsequent major user feedback is now
recorded in docs/PLAYER_FEEDBACK.md and supersedes the earlier next action.
