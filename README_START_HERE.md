# Sandstrike

## Latest integration: Vercel Web Analytics — 2026-10-03

@vercel/analytics2.0.1 is installed and live at https://sandstrike-sandy.vercel.app.
This Vite/Phaser app uses the official JavaScript inject API at startup.
Only Vercel production builds enable it; local development, automated fixtures
and GitHub Pages do not request the Analytics script. No game-state/custom-event
tracking was added. App startup does not wait for Analytics.

Project Web Analytics is enabled. Deployment dpl_FHSa6fqXZQd4XmYV6koChD71Jyfe
is READY (main/192a7f1). Lint/typecheck and root/Pages production smoke passed.
Live desktop Hunt and phone-viewport Rampage booted with the Analytics script,
one canvas, no test bridge and no console/page errors. Script endpoint returns
HTTP200. Vercel deliberately excludes automated/headless browsers from page-view
counts, so real visitor data still needs a normal browser visit/refresh.
The user confirmed the integration is functioning in this root project.
Dashboard: https://vercel.com/hartawansuwardi953-1589s-projects/sandstrike/analytics.
Evidence: docs/verification/vercel-analytics.json. Do not replace this project or
copy React/Next.js instructions into the Phaser app.

## Live on Vercel — 2026-10-03

Production: **https://sandstrike-sandy.vercel.app** — deployment READY.
Project: sandstrike, linked to https://github.com/KingPublic/Sandstrike.
The user merged the prior work into main; deployed source commit: 41327df.
Production was published directly from the current root with Vercel CLI62.2.0.
GitHub integration is connected for subsequent pushes. No commit/push was made
by the agent in this deployment task.

vercel.json sets Vite, npm ci, npm run build and output dist. .vercelignore omits
local dependencies, test reports, docs and local credentials from CLI uploads.
.vercel/ and .env.local are ignored; never commit the generated local OIDC token.
For a later manual production update from this linked root:
`npm exec --yes --package=vercel@62.2.0 -- vercel deploy --prod`.
Commit/push the new hosting configuration when ready to retain it on GitHub.

Verified remote build and READY status; public URL, JS/CSS and all four original
art files return HTTP200 without authentication. Deployed art hashes match local
files; production JS has no test bridge. Remote interactive gameplay was not
checked because the browser connection was unavailable. Local gameplay evidence
is in the previous AI checkpoint. Exact hosting evidence:
docs/verification/vercel-production.json.

## Latest playable update: aggressive AI and skill reactions — 2026-10-03

Maw now follows current movement, corrects its breach trajectory, completes the
attack above ground and repositions without getting stuck in repeated dives.
Hunter bots shoot while climbing/moving, predict incoming Maw attacks, dodge with
ledge safety checks, and use their real kit skills and weapons. Rooftop bots now
actually collect the RPG, show the armed weapon and lose it when buried/dead.

All five Hunter skills affect Maw differently: Attract Maw draws a warned attack
to its beacon; Grapple draws pursuit to the landing; Shield prompts a flank and
delayed commitment; Target Mark provokes faster reacquisition; Field Heal emits
a short location pulse. Primary and one-use crate skills share these reactions.
An already warned charge finishes before switching targets.

Verified: 50 unique focused cases across 11 files in incremental checks, lint,
typecheck and root production smoke/build. Browser: desktop Q and phone touch
Attract Maw reached the beacon; Rampage Ranger marked and fired while climbing;
normal production Hunt activated the skill without debug text or test bridge.
Evidence and remaining limits: docs/verification/ai-skill-behavior.json and
docs/SESSION_HANDOFF.md. No long five-run balance simulation was repeated.

The user subsequently merged this work into main (41327df); it is now deployed.
Next: the user's playtest verdict on aggression and skill usefulness. Earlier
5-6 minute pacing results predate this AI change and are not current acceptance.
Continue with remaining rooftop pickup feedback/HUD polish only when requested;
per-kit rival skills and actual RPG ownership are now implemented.

## Previous same-day update: underground environment

Underground now has textured natural rocks, pebbles, uneven sediment seams,
fractures, roots, mineral veins and small pockets. Desert soil includes fossils;
ruins include buried masonry, corroded pipe and rebar; frozen soil has ice lenses.
This works in the rising terrain and classic arena, behind the worm and pickups.
Original generated rock atlas: `public/art/underground-rocks.png` (about 746 KB).

Follow-up verification: lint/typecheck, root and GitHub Pages production smoke
(one each), desktop checks for all three themes, and phone/orientation checks.
Captures and exact scope are recorded in docs/SESSION_HANDOFF.md.

## Earlier same-day update: art, audio and Hunter supplies

More realistic original menu art and textured worm skin, natural equipment/world
colors, weathered platforms/steel crates and rebuilt weapon/foley/ambient audio.
Hunt now spawns random platform supplies: each grants one skill from the other four
Hunter kits, usable **once with E / gamepad X / Supply touch button**. Q remains the
selected kit's independent skill. One extra slot; full slots leave crates available.
No charge is lost on a grapple attempt without a reachable ledge.

Verified: 29 focused tests, 10 scoped browser cases, manual desktop E and phone
joystick/Supply pickup/use, plus production root and GitHub Pages smoke (one each).
The old WebGL mask API warning discovered during visual inspection was fixed;
the corrected skin is hidden underground and visible above the surface in Hunt.
Captures and detailed scope: docs/SESSION_HANDOFF.md. Exact asset prompts:
docs/ART_GENERATION.md. Human animation and small environment details remain procedural; audio needs
human listening feedback and physical devices remain unverified.

The user accepted the underground improvement and requested the AI update above.
Keep execution direct and testing focused; do not replay historical plans or
full-run tests without a relevant unresolved concern.

## Read this first when continuing with AI

Updated 2026-10-03. Work in this root on the user's current branch (`main` at the
deployment checkpoint); do not create worktrees,
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

Previous checkpoint (2026-10-02): **the approved survival revision,
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
mode screen. The latest update adds Stage 2 per-kit rival skills, RPG ownership,
weapon presentation and loss on burial/death. Dedicated rooftop pickup feedback,
HUD/art/balance and human feel remain open.

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

Exact next action: get the user's verdict on the 2026-10-03 aggressive AI and
personalized skill reactions. A generic continuation resumes remaining rooftop
pickup feedback/HUD polish in the newest handoff. Physical devices, human listening
and revised difficulty still need feedback; do not repeat long simulations routinely.

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
