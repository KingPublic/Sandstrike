# SESSION HANDOFF - Project Sandstrike

Updated: 2026-10-02 (later session). Active root: C:/Users/Adrian/Games/Sandstrike.
Branch: phase-b-ready. No extra worktrees. User handles remote push/merge.

## Latest active work: roster + playtest correction (2026-10-02)

User resumed the project and requested realistic building-height player breaches.
Corrected the excessive 500px Rampage arc and upward steering counteracting gravity.
Normal player profile: cruise650, burst800, gravity2000, ballistic vertical motion.
Hunt has its own tower pursuit profile800/950/640 with ballistic vertical motion,
so the rooftop420px clearance stays reachable. Historical fixtures unchanged.
Evidence this session:19 focused movement/pursuit/boss tests,3 browser cases
(arcade desktop, touch, summit boss), lint/typecheck passed; inspected
docs/verification/survival-building-breach.png.
Continue Survival Roster Task1 directly in root, then selection/savev3/final gate.
No new approval gate. Account quota cannot be read; checkpoint continuously.

## Previous checkpoint: Survival Foundation + Full Ascent

The user asked to stop after Survival Ascent Task 4 so they can playtest before the
roster work. Commits in order: `287afc2` (compact themes, arcade breaches,
automatic feeding, Sandguard), `ef34688` (vertical ascent world/platforms/hazard),
`ee44d17` (escalating worm returns and moving-surface pursuit), `59e9589` (bounded
allied survivors and support helicopter), and the final `feat: add rooftop RPG boss
fight` commit for the summit batch. Verify the last one with `git log`.

Implemented in this batch:
- Compact viewport-bound menus with a frozen per-run environment choice and original
  desert/ruins/frozen palettes (`src/game/data/themes.ts`).
- Arcade worm profile, automatic swept-mouth feeding and the Space Sandguard skill.
- `AscentWorld` rising hazard (5px/s from y=200, frozen at the summit stage), an
  authored 17-ledge route, vertical Hunter locomotion with swept one-way landings
  and drop-through, and jump/drop inputs on keyboard, gamepad and touch.
- Worm lives: an ordinary kill hides the worm for 600 ticks, then a stronger one
  returns (recovery 120 to 48 ticks over five capped generations).
- Bounded support: two allied survivors that climb above the hazard and one
  helicopter, with original friendly silhouettes, rotors and aiming lines.
- Summit boss: one 600 HP boss with a 90-tick entrance warning, a 30/180/900-tick
  shield cycle, plus the objective RPG (80 damage, two rockets, crate restock) and a
  single boss-defeat victory.

Verified in this checkpoint: 197 unit/integration tests pass; lint and typecheck
clean; browser cases pass for menus (3), arcade controls (2), Hunt controls at
1440x900/915x412/844x390/1024x768 (4), kill/return (1), natural moving-surface
breach warning (1) and the summit boss (1). Captures are in `docs/verification/`.
Production build was verified through the e2e build and `npm run test:e2e` runs.

Known limits (do not overclaim): the 5-6 minute whole-run target, the 1-2 minute
boss length, human feel of the climb, physical phone/tablet/gamepad, audio/haptics
and long-match balance remain unverified. The existing per-hit worm immunity can
swallow late RPG shots (recorded in `docs/BALANCE.md`). The ten-kit roster,
character selection and revised record buckets are not implemented yet, so ascent
runs are not yet separated from legacy records.

Exact next action: run `npm run verify` plus the ascent browser cases if the last
tree state was not verified, playtest the ascent, then implement **Survival Roster**
(`docs/superpowers/plans/2026-10-02-survival-roster.md`): ten kits and strategies,
selection UI, save v3 migration with `legacyRecords`, then the whole-revision
verification and documentation refresh.

## Active redesign work (2026-10-02)

Resolved: Survival Foundation and the complete Ascent batch are implemented and
committed; see the checkpoint above. Remaining redesign work is Survival Roster
(ten kits, selection, save v3, whole-revision verification). Prefer
README_START_HERE.md over the historical Phase C material below.

## Earlier Phase C checkpoint (historical)

Phase A and Phase B are complete. Phase C two-role prototype is implemented:
Ranger/Hunt plus vehicle/aerial response and Rampage bands 0-3. Product checkpoint
073b9d9 (AI review correction); earlier verification 1dc10d0; prior increments
a032f7a (Ranger/AI), d6323ac (Hunt/save v2), e6f8f7e
(playable UI/controls), beaf638 (advanced threats/bands). No remote actions.
One fresh whole-branch review found one Important AI warning defect; it is fixed.
Phase C functional prototype is complete. Physical-device/human-feel release gate
remains pending. This file's final checkpoint follows the review correction.

## Implemented - do not rebuild

- Existing pinned Phaser 4.2.1/TypeScript/Vite, shared 60Hz GameSession/GameplayScene.
- Head-authoritative worm and path followers; Bite/Burst, swept stable combat,
  seeded infantry, combo/rewards, pause/catch-up protection and safe role retry.
- Ranger surface movement/dodge, exposed logical-region hitscan rifle/reload,
  recoverable/expiring shallow snare, bounded lift, temporary reveal, relay defense.
- Seeded worm AI: 12-tick decisions, allowed Hunter sightings, 60-tick locked
  breach-sector warning; deep approaches accommodate the turn radius. One bounded
  shared-locomotion forecast prepares the physical crossing sector. Every natural
  crossing has a distinct warning >=60 ticks earlier and lies in its bracket;
  snare lift can intentionally interrupt it. Broad quantized tracking and
  Hunter/relay camera remain restricted.
- CPU surface-clipped worm polygons in ordinary Hunt. Phaser 4 GeometryMask is
  Canvas-only; do not reintroduce it for WebGL. Exact AI inspection is opt-in
  before a practice run and makes that run ineligible for records.
- Shared input with separate movement/aim owners; mouse and independent touch
  movement, Fire/Aim drag, Snare/Dodge plus existing gamepad slots.
- Role menu/HUD/results, one terminal boundary, pause/portrait protection.
- Save v2 migrates genuine v1 preferences and Rampage records, adds Hunt records
  and victories, retains historical .save.v1 keys and original backup bytes,
  protects future schemas and falls back to memory if storage is denied.
- Vehicle/aerial 60-tick telegraphs, 180-tick cadence, typed resettable projectiles,
  sequential response bands 1/2/3 warnings, legal capped spawns and rewards.

## Fresh evidence

Final npm run verify: lint/typecheck/build passed; 160 tests in 53 files.
Four 5400-tick AI cases (one replayed twice) and two identical 18000-tick full-band Rampage replays;
finite bounded poses, caps and zero overflow. Root Hunt 8 scenarios pass;
Pages Hunt 4 pass; root and Pages role-switch flows and short performance case pass;
ordinary production root/Pages smoke 1 each pass with test bridge absent.
Viewport controls: 1440x900, 915x412, 844x390, 1024x768; portrait 390x844 pauses.
Visual desktop/phone checks caught and verified the WebGL hidden-pose correction.
Post-review natural warning/crossing, snare/hit and 844x390 control cases passed.
Live warning/breach captures are preserved in docs/verification and visually
checked. Q is held until sampled placement in browser tests, including Pages.
Raw host data: docs/PHASE_C_PERFORMANCE.json; detailed evidence and rulings:
docs/PHASE_C_VERIFICATION.md. Earlier Phase B evidence remains in its own file.

## Limits - do not overclaim

Procedural original prototype art, not photorealistic/GOTY production art.
Physical phone/tablet/gamepad/audio/haptics, physical 60fps, long matches and human
feel remain release checks. Host 6-second samples are not hardware evidence and
predate the AI review fix.
No backend/runtime LLM/campaign/economy/new dependency. No music track yet.
Nonfatal Phaser bundle warning remains about 1514kB minified / 400kB gzip.

## Exact next action on resume

### Historical design discussion (superseded execution state) - 2026-10-02

The user tried Phase C and requested a substantial direction correction. Priority
is now compact desktop menus, agile/high-breaching worms, automatic mouth feeding
instead of manual Bite, five playable worms AND five hunters with unique skills,
allied Hunt NPCs/helicopters, vertical platform/building ascent, continuously rising
sand, ordinary worm kills followed by fiercer respawn after 10s, and a summit RPG
objective with a 5-6 minute run. Preserve original assets and the shared simulation.
This latest request supersedes the old five-total roster and relay-defense target.

Written design: docs/superpowers/specs/2026-10-02-sandstrike-survival-redesign.md.
The user explicitly approved it and continuation on 2026-10-02, then requested
themes beyond sand and a quota-aware handoff in README_START_HERE. Proposed initial
themes: desert outpost, urban ruins, frozen facility; one shared rising hazard model.
Written plan set: docs/superpowers/plans/2026-10-02-survival-plan-set.md, with
foundation/ascent/roster child plans. Native execution in root is preserved.
Plan self-review is complete; explicit written-plan review was requested through
request_user_input_async this turn and remains pending until a reply is received.
Account quota percentages cannot be observed; do not pretend to detect1%.
No product code has changed for this revision. The user clarified: summit arrival
starts a boss fight, freezes sand, and provides a high-damage RPG (not a one-shot).
The boss is more aggressive, has much thicker HP, and may use 3-second immunity.
Successful boss defeat wins. Total climb plus boss is targeted at 5-6 minutes;
no forced 300s RPG delivery or hard 360s boss timeout. The draft was updated with
this clarification and a concrete visual/animation revision.
Next action: incorporate written-plan review, then execute Survival Foundation
Task1 in root and continue the ordered plans. Do not re-ask design approval or
restart completed Phase C. Current investigation read Menu CSS,
movementBalance, HunterLocomotion and existing ability/combat composition: the menu
uses a long document layout, Hunters are surface-locked, and full-speed turn authority
is about 1.08 radians/second. No browser reproduction/new test was run this revision.

### Previous production next steps (now subordinate to the revision)

Continue from the playable prototype, not the Phase A/B/C plan start. Read the
verification report and latest Git checkpoint first. Next work is focused human
playtesting/tuning and production presentation: real phone/tablet and gamepad,
Ranger trap/dodge timing, natural match pressure/duration/exposure windows, worm
movement feel, sustained post-fix performance, audio and character animation.
Establish the user's next requested increment before major scope expansion.
No known code-review blocker remains. Do not repeat unchanged passing browser,
performance or deterministic checks unless a changed dependency justifies it.

## Workflow preferences

User approved Phase C implementation and requested an attempted 30-60 minute
completion. Work directly in root; no new worktree, branch switch, push or merge.
Use native Superpowers executing-plans; adjacent domain tasks were committed
jointly where coupled. Focused tests per increment; one combined initial verify
and one justified post-review rerun; one final fresh reviewer only.
Scratch ledgers in .superpowers/sdd/ are ignored;
versioned evidence and this handoff must retain needed facts before scratch cleanup.
To resume later the user only needs to say 'lanjutkan proyek'.
