# SESSION HANDOFF - Project Sandstrike

Updated 2026-10-03, latest execution. Root C:/Users/Adrian/Games/Sandstrike.
Current branch main (192a7f1 observed; use git log/status for later user commits).
Work directly in root; no new worktree, branch switch, push
or merge. User handles remote integration. Communicate in Bahasa Indonesia.

## Latest checkpoint: Vercel Web Analytics integration (2026-10-03)

User pasted the Vercel Analytics install/React snippet and asked for it. Implemented
the equivalent official vanilla JavaScript integration for this Vite/Phaser app,
reusing the existing project and CLI login. No agent commit/push or branch change.
The user committed during execution: cd17c83 (analytic), then192a7f1 (nice).
Preserve those commits/edits; hosting and package changes are already in the user's
history. Current tracked dist/node_modules cache changes come from verification;
do not mass-untrack or reset them without a separate request.

- Pinned production dependency @vercel/analytics2.0.1, package/lock updated.
- src/main.ts calls inject({mode:"production",framework:"vite",debug:false}) after
  app mount, gated by __SANDSTRIKE_ANALYTICS__. vite.config.ts enables that constant
  only for mode production with VERCEL=1; src/vite-env.d.ts declares it.
- Local/E2E/Pages builds omit Analytics requests. Vercel custom domains work through
  the build-time flag. Analytics is non-blocking, outside the game simulation;
  no React, backend, save data, custom gameplay events or per-frame tracking.
- Official setup/package docs consulted; SDK MIT license recorded in ASSET_LICENSES.
- API through vercel api confirms project webAnalytics.enabledAt1791004183303 and
  autoExposeSystemEnvs true. No extra account setting or credential was needed.

Deployed production READY:
- Public URL unchanged: https://sandstrike-sandy.vercel.app
- Deployment dpl_FHSa6fqXZQd4XmYV6koChD71Jyfe
- Immutable URL https://sandstrike-fn2jldbnw-hartawansuwardi953-1589s-projects.vercel.app
- Metadata source main/192a7f1, source cli, target production. Remote install/build
  successful; same project/team as the previous deployment below.

Verified:
- Lint/typecheck pass. Root and GitHub Pages production smoke each pass one case
  (build and actual browser boot, error/request checks). Final local dist is root
  production. No unrelated full-suite or whole-run replay.
- Anonymous HTML and /_vercel/insights/script.js return200. Live headless desktop
  1280x720 Hunt and phone915x412 Rampage start, one canvas, no test bridge, no
  console/page errors, injected Analytics script present. Captures:
  verification/analytics-desktop.png and analytics-mobile.png.
- Chromium initially failed DNS on the domain; isolated test browser used the
  address from Node DNS lookup without changing TLS verification. No user browser
  settings or production code changed for this test workaround.
- Initial checker expected a POST/view from headless browsers and failed that
  expectation. The actual served script explicitly skips navigator.webdriver or
  a Headless user agent. Both automated checks are excluded traffic, correctly
  recorded as pageView:null; no fake visitors were injected.
- Metrics query at first returned no data. User was asked to open/refresh the game
  normally to verify a real visit; production collector/script availability is
  verified. The user then confirmed it is functioning and asked whether installation
  was in the root; confirmed C:/Users/Adrian/Games/Sandstrike and the same Vercel
  project. Aggregate metrics were not re-queried after that confirmation.
  Evidence: verification/vercel-analytics.json.

Exact next action: use the project Analytics dashboard for normal visitor data
or via `vercel metrics vercel.analytics.page_view.count --since 1h --project
sandstrike --prod` in the linked root. Do not treat excluded headless traffic as
a broken collector or bypass bot filtering. Preserve the existing Vercel project.
Gameplay follow-up still uses the prior AI feedback and rooftop pickup/HUD work.

## Previous checkpoint: Vercel production deployment (2026-10-03)

User explicitly requested Vercel deployment and allowed browser access. The browser
inventory was empty; a later in-app-browser creation failed in the Windows helper.
Vercel connector login succeeded, but deploy_to_vercel was missing server-side and
get_project had a parameter mapping error. Deployed via the official npm Vercel
CLI62.2.0 after the user completed its device login. No token was exposed or
committed. CLI authentication remains available on this machine.

Observed before deployment: user had merged phase-b-ready into main, HEAD and
origin/main both 41327df92b0d9e17ad554b50dd5b3cd194ed8b68, working tree clean.
No agent commit, push, merge or branch switch occurred in this task.

Production READY:
- Public URL: https://sandstrike-sandy.vercel.app
- Deployment: dpl_CAWRtN2LaAzxifFPnzLuG6CEKDcv
- Immutable URL: https://sandstrike-hjhppo6qq-hartawansuwardi953-1589s-projects.vercel.app
- Project: sandstrike / prj_8yOw2LxNgyvAD1MGVxNN5JlWBFN7
- Team: team_i7CQ6vAmCBLrZCLuX5JjAR1B
- Dashboard: https://vercel.com/hartawansuwardi953-1589s-projects/sandstrike
- GitHub: https://github.com/KingPublic/Sandstrike (CLI confirmed Connected)
- Source main/41327df; deployment source cli, target production. Build-to-ready
  interval reported by deployment metadata:13.1s. npm ci and Vite build succeeded.
  CLI project inspection confirms root directory '.', Vite/dist and Node24.x.

Added vercel.json (Vite, npm ci, npm run build, dist), .vercelignore and .vercel/
ignore. CLI created ignored .vercel/project.json and .env.local with a local OIDC
token. Preserve credentials locally; never print/commit them. Hosting configuration
and this documentation are uncommitted and need the user's next GitHub push.
Future manual deploy from this root:
`npm exec --yes --package=vercel@62.2.0 -- vercel deploy --prod`.
Git integration is connected for subsequent commits; no extra backend/env setup.

Verified: connector deployment status READY; anonymous HTTP200 for production
HTML, JS, CSS and all four art assets; image hashes identical to local files;
production JS has no __SANDSTRIKE_TEST__. No repeat of passed domain/full-run
tests because this task changed hosting configuration only. Existing broad Node
engine upgrade warning remains. Remote interactive/browser gameplay was not
verified because no usable browser was connected; earlier local desktop/mobile
checks still describe the deployed gameplay. Evidence: verification/vercel-production.json.

Exact next action: user opens the public URL and confirms online desktop/mobile
feel. On a deployment follow-up, reuse this project/team (do not create another),
check status/logs only when needed, and redeploy from the linked root or user's
main push. For gameplay continuation, use the AI checkpoint's remaining feedback
and rooftop pickup/HUD polish below. Stay on the user's current branch.

## Previous checkpoint: aggressive AI and personalized Hunter skill reactions (2026-10-03)

The user accepted the underground improvement, then requested smarter/aggressive
worm and Hunter bots and real, distinct Maw reactions to every Hunter skill,
especially Attract Maw. Executed directly in the same root/branch, preserving
earlier art/audio/geology/supplies. All changes remain uncommitted; no push/merge.
Estimate given 20-30 minutes, later revised with 5-10 minutes of remaining checks.

Implemented:
- WormController fixes the unconditional underground dive, chooses a sensible
  approach side, bounds trajectory correction, follows the target until warning,
  commits the advertised attack, and continues toward it above ground. A latched
  escape turn prevents stalled/shallow unwarned crossings. Hunt pure sprint no
  longer zeros upward momentum when burstLiftSpeed is zero.
- HunterSkillSignals combines primary and borrowed skill frames for perception.
  Attract Maw's beacon overrides a recent visual sighting and queues the next
  warned attack. Grapple publishes its landing; Heal publishes a brief location
  pulse; Shield encourages flanking/waiting; Mark provokes faster reacquisition.
  Skill durations, cooldowns, one-charge supplies and Q/E ownership are retained.
- RivalHunterController fires while moving/climbing, fixes its inverted climb
  panic test, picks nearby reachable landing points, predicts imminent contact
  and dodges only where ledge room permits. Allied Hunters also retreat while
  firing and correctly regroup toward a player on their left.
- RivalSkillTactics and RivalSystems use real CharacterSkills: Ranger mark,
  Scout grapple, Engineer beacon, Siegebreaker protection, Medic nearby living
  recovery. Actual kit armor/ammo/cadence/reloads/bursts replace generic rifle
  behavior; fire leads velocity/gravity. Living nearby Ranger marks coordinate
  1.5x damage. Healing/protection survive subsequent registry updates.
- Unarmed rooftop bots walk toward the crate and really arm an RPG; first shot
  waits 45 ticks, heavy cadence stays 240 ticks, burial/death clears armed state.
  Real weapon/skill snapshots feed shared graphics, visible RPG barrel, recoil,
  muzzle flash and weapon-specific sound. No runtime LLM/new dependency.

Verified, incrementally after relevant fixes (50 unique cases across 11 files):
- wormController 6, wormSkillReactions 4, wormLocomotion 5, wormLifeDirector 3;
  rivalTactics 5, characterSkills 8, huntSession 3, huntAllies 4, rivalHunt 5,
  rivalSkills 5, huntSkillCrates 2. Includes primary and borrowed beacon pursuit,
  real physical approach, warning lead/edge crossings, all five bot skills,
  lead fire, safe dodge, rooftop arming/delay/loss and surviving healing.
- Final lint/typecheck passed. Root production smoke passed (one case, builds
  production); final dist is root production. Existing bundle-size warning only.
- Desktop 1280x720: Engineer Q, seed8, beacon (-300,-16), warning tick61 and
  commitment121, head within133.83px at tick125, target/reason still beacon attack.
- Phone viewport 915x412: real touch ability activation, same seed/beacon,
  head within74.84px at tick129; no page/console errors in either check.
  Captures: ai-attract-maw-breach.png and ai-attract-maw-mobile.png (explicit debug).
- Real Rampage menu path, desktop keyboard up/Burst: Ranger marked and fired
  while climbing by tick54. Captured ai-rival-hunter.png; no page/console errors.
  Forced next-run configuration omitted ascentRampage in two preliminary checks
  and started classic; those checks are not AI evidence. Normal menu path verified.
- Normal production Hunt at http://127.0.0.1:4173/: Engineer Q activates,
  no technical debug labels, test bridge absent, no page/console errors.
  Capture ai-production-hunt.png. Exact evidence: verification/ai-skill-behavior.json.

Limits: no human/physical-device difficulty acceptance, no five-kit full-run balance
gate, and no complete tower win via manual controls in this task. Previous pacing
measurements predate these stronger bots. Beacon reactions steer only AI Maw in
Hunt; a human-controlled Rampage worm retains its own controls when a bot deploys
a beacon. Dedicated rooftop crate pickup/restock artwork still needs polish.
Prior art/audio/device limitations remain. Save/static-host interfaces unchanged;
Pages smoke was already verified for the assets earlier today and not repeated.

Exact next action: user playtest aggression, dodge, shield counterplay and beacon
usefulness. On a generic "lanjutkan", resume remaining rooftop pickup feedback and
HUD polish, then targeted balance based on feedback. Do not redo per-kit skills,
RPG ownership or long historical simulations. Keep direct, focused execution.

## Previous checkpoint: underground environment detail (2026-10-03 follow-up)

The user asked for an estimate and realistic rocks/objects in the underground
environment, with no wasted time or long tests. Estimate given: 15-25 minutes.
Completed directly in the same root/branch, preserving all prior art/audio and
one-use supply work. Everything remains uncommitted; no push or merge.

- Original transparent four-rock imagegen atlas (granite, sandstone, limestone,
  shale) in public/art/underground-rocks.png, resized to 768x512 / 745,568 bytes.
  Exact prompt and provenance are in ART_GENERATION.md / ASSET_LICENSES.md.
- Uneven sediment seams, fractures, smaller gravel, near-surface branching roots,
  muted mineral veins and small dark pockets. Desert adds skeletal fossils, ruins
  add broken masonry/corroded pipes/rebar, frozen soil adds ice lenses.
- A cached 256px original grain texture replaces flat-looking soil. Classic
  terrain now uses the smooth ground gradient as well as the new geology.
- UndergroundDetails uses a local deterministic hash; it does not consume AI or
  gameplay RNG. UndergroundRockView batches the atlas and cached grain in a
  static container. Both move with the rising hazard's local coordinates; classic
  terrain stays fixed. No per-frame rock generation, collisions or new pickups.
  Worm, carrion and supply crates remain above the background decoration.
- Missing rock texture falls back to original procedural rock geometry. Asset
  loading uses Vite BASE_URL; static root/Pages compatibility is retained.

Verified for this follow-up:
- Lint/typecheck passed. Root and GitHub Pages production smoke passed, one case
  each. The final root production build includes the final grain refinement.
- Browser desktop 1280x720: all three themes start, accept arrow-key steering,
  show their terrain details, keep canvas focus and have no page scrolling,
  console warning/error or page error. Captures: underground-desert.png,
  underground-ruins.png, underground-frozen.png in docs/verification/.
- Phone Hunt 915x412: environment visible behind the field, controls remain at
  least 57px, keyboard movement works, and portrait 390x844 interruption safely
  pauses. Returning to landscape 844x390 resumes without errors or scrolling.
  Captures: underground-mobile-hunt.png, underground-mobile-return.png.
- Phone Rampage joystick/steering checked; underground-mobile-rampage.png records
  the cutaway and worm visibility. Final production browser checked without
  test bridge or console errors. No domain/gameplay behavior changed, so earlier
  domain suites and long full-run simulations were not repeated.

Limits: artistic realism still requires the user's judgement; small roots/veins
and buried debris remain procedural. Rocks are decorative cutaway details, not
physical obstacles. Physical-device sustained performance is not yet verified.
Existing Phaser bundle-size warning remains. Previous audio still needs human
listening feedback.

Exact next action: get feedback on the underground appearance, visual/audio feel
and supply frequency. A generic "lanjutkan" resumes the previously approved
Rampage Stage 2 (rival kit skills, rooftop pickup feedback and heavy-weapon loss
on diving/death). This visual follow-up does not complete that separate AI work.

## Previous checkpoint: realistic presentation and one-use Hunter supplies (2026-10-03)

Implemented on `phase-b-ready` in the project root; changes are uncommitted.
The user's current request superseded the generic Stage 2 continuation. No worktree,
branch switch, push or merge. Keep execution direct and checks focused.

- Hunt supply crates spawn at random safe platform positions: first opportunity at
  tick 1, then every 1080 ticks (18s), max three visible. The dedicated seeded
  `supplies` stream does not alter worm AI randomness. Buried crates disappear.
- Touching one gives exactly one randomly chosen skill from the other four Hunter
  kits. One extra slot; a full slot leaves crates available. E / gamepad X / the
  Supply touch button activates it once. Q and the selected kit's cooldown remain
  independent. All five borrowed effects reuse CharacterSkills; impossible grapple
  attempts keep their charge. Effects retain normal durations, then expire.
- Original imagegen menu key art and transparent textured worm head/body replace
  the flat menu illustration and main worm skin. Kit tints, path interpolation,
  boss scale and logical hitboxes are retained. The shared menu image depicts the
  desert; selected kit/theme information remains in the caption, not in the image.
- Natural environment/gear palettes, smooth sky and rising-ground gradients,
  grain/weathering, Hunter equipment details, steel equipment crates and readable
  mobile controls. The environment and human animation still use procedural art.
- Cached original pressure/noise/foley samples replace the old oscillator voices.
  Player and rival gun identities, RPG launch/impact, skills, pickup/reload/steps, wind and rotor
  receive spatial attenuation and a compressor. Burst audio now emits one report
  per actual shot event. No external sound recording or runtime network dependency.
- Phaser 4 WebGL uses one container Mask filter for worm surface clipping; Canvas
  keeps a GeometryMask. The first visual inspection found the obsolete WebGL
  setMask path; it was corrected and browser-checked without warnings afterward.
- Art provenance and exact generation prompts: docs/ASSET_LICENSES.md and
  docs/ART_GENERATION.md. New assets total approximately 894 KB.

Verified evidence:
- 29 unique focused domain/presentation cases across 7 files verified: original
  28-case pass in 838ms, then the 4-case feedback suite including one new rival
  rifle/heavy-fire routing case in 311ms. Coverage includes
  all four alternative skills for each Hunter, charge exhaustion, full slots,
  failed grapple retention, safe bounded spawns, shielding/heal/mark/decoy duration,
  real-session Scout pickup/E use and bounded distinct audio samples.
- 10 existing browser cases passed (Hunt controls at desktop/phone/tablet sizes,
  Scout touch grapple, Rampage ascent/classic and menu/theme flows). These ran
  before the WebGL mask correction; the affected mask was then checked directly.
- Browser seed20: Scout walks into Shield supply, E activates it, slot empties,
  repeated E preserves shield expiry, and primary grapple remains ready.
  Phone 915x412: joystick collects it, 57.67px Supply button activates it and hides,
  selected grapple remains ready. No warnings/page errors in corrected checks.
- Textured exposed Hunt worm and hidden underground worm visually inspected.
  Captures: realistic-menu.png, realistic-hunt.png, realistic-rampage.png,
  supply-desktop.png and supply-mobile.png under docs/verification/.
- Production GitHub Pages and root smoke checks passed (one each); they build
  production outputs. Final dist is the ordinary root production build.
- Final lint and typecheck exit0; final npm run build exit0. Final production
  Rampage browser check: no warnings/page errors, test bridge absent. No heavy
  full-run simulations or unrelated full-suite rerun.

Limits: no human listening or physical-device/gamepad verification. Art/audio
realism is a subjective improvement, not photorealistic production acceptance.
The environment and humans remain procedural, the worm uses a textured profile
rather than a new skeletal jaw animation, and mobile sustained performance still
needs a device playtest. Existing Phaser bundle-size warning remains.

Exact next action: get the user's verdict on the new visual/audio feel and supply
frequency before expanding it. A generic "lanjutkan" can resume the previously
approved Rampage Stage 2: rival kit skills, visible rooftop pickup feedback and
heavy-weapon loss on diving/death. This task added player Hunter supplies; it did
not complete that separate rival-AI work. Reuse existing systems and focused checks.



## Previous checkpoint: Rampage becomes the ascent hunt (2026-10-02, Stage 1)

User report: Rampage should be the worm hunting the five Hunters, not an unclear
object-collecting arena - the sand should rise, the smart Hunter bots should rush the
rooftop RPG, and the worm should heal only from carrion appearing slowly in the sand.
The user chose to keep the classic arena as a separate mode option.

Implemented: `mode: "rampage"` + `arcade` + `ascent: true` now runs the ascent arena
with the player as the worm (the sand is harmless to the worm and lifts its reach).
`RivalSystems`/`RivalHunterController` deploy five Hunter kits one at a time (max two
active), climb ledge by ledge under sand pressure, fire only at an exposed worm with
travel lead and arm heavier crate rounds at the summit. `actor.carrion` spawns every
600 ticks in the sand and is the only healing (8 HP through the normal mouth path).
Clearing all five wins, worm death loses, and the result carries `ascentRampage` with
`huntersDefeated`. The classic arena keeps its balance, records and specs and is
reached with "Choose classic arena"; Rampage fixtures stay classic by design.

Verified: lint and typecheck clean; 241 domain tests across 77 files pass with the
heavy 5-run survival gate excluded, including the five new ascent-rampage integration
cases. Browser: `rampage-hunt.spec.ts` (2 cases - rivals deploy and climb while the
sand rises, HUD shows "Hunters 5 / 5", carrion appears, classic still starts), plus
re-verified boot, static hosting, phase-b smoke, menu, selection, arcade controls,
Rampage HUD at five viewports, worm leap and mouse controls. Not run: the heavy full
Hunt simulations (Hunt paths untouched) and physical devices. Screenshot:
`docs/verification/rampage-hunt.png`.

## Previous checkpoint: mouse controls and UI/control presentation (2026-10-02)

User request: continue the UI/art work, add mouse control for the Shift action
(right click), keep desktop skill bindings (`Q`, grapple included), and make sure
mobile buttons exist, are responsive and work.

Implemented: the right mouse button mirrors the mobility action in both modes (worm
Burst, Hunter Dodge) beside left-click aim/fire, with press latching so a fast click
is never dropped and no browser context menu on the field. `ui/ControlReadiness.ts`
now derives boost/ability/primary readiness from existing snapshot cooldowns; both
HUDs draw filled health/skill/dodge/ammo/Burst gauges and every touch button with a
cooldown (Burst, skill, reloading fire) draws a readiness ring. The worm return
countdown is visible again in normal Hunt play (generation/kill counters stay debug),
which also repaired the stale `tests/e2e/hunt-flow.spec.ts` expectation - it failed
on the pre-change baseline (confirmed by stashing).

Verified: lint and typecheck clean; 236 domain tests across 76 files pass with the
heavy 5-run survival gate excluded (including a new readiness suite). Browser:
`mouse-controls.spec.ts` (right-click Burst + right-click Dodge), `hunt-controls.spec.ts`
(mobile skill button fires the skill and hides its ring; a phone-viewport Scout grapple
button reads "Grapple", fires and cools down), `worm-leap.spec.ts`, `rampage-hud.spec.ts`
(gauges, five viewports), `gameplay-clutter.spec.ts`, `hunt-flow.spec.ts`,
`arcade-controls.spec.ts`, `movement-controls.spec.ts`, `ascent-boss.spec.ts` - all
pass with no page errors. Not re-run: the 5 heavy full-run Hunt simulations (movement
and balance untouched) and physical devices. `huntAllies.test.ts` now has an explicit
30s timeout because it is a 5400-tick simulation that can exceed the 5s default under
full-suite load (observed once; it passes in isolation and on repeat runs).

## Previous checkpoint: Rampage worm leap (2026-10-02)

User report: in Rampage the worm's jump was far too weak - even boosting upward it
could not reach the helicopters - and they asked for a more comfortable game on
mobile and desktop. Root cause, measured: the arcade profile capped the best-timed
upward Burst apex at 159px above the surface (104px without Burst) while a 220px
helicopter needs about 164px of head clearance, so the target was exactly out of
reach. Fixed by turning an upward Burst into an intent-based leap
(`burstLiftSpeed = 1050`, apex 275px at gravity 2000), reachable from underground or
mid-air so timing is forgiving on keyboard and touch. Burst also gained a rising
`leap` audio voice and dust, the touch Burst button became a full-size thumb target
with a cooldown readiness ring, and the HUD shows `Burst - hold up to leap` while an
air target is alive. `movementBalance` and `huntMovementBalance` keep
`burstLiftSpeed = 0`, so plain breaches and the Hunt pursuit worm are unchanged.

Verified: lint and typecheck clean; 233 domain tests across 75 files pass with the
heavy 5-run survival gate excluded, including the new leap unit bands
(`tests/unit/ballisticBreach.test.ts`), the real-session helicopter bite
(`tests/integration/arcadeWorm.test.ts`), the HUD leap label and the worm touch
layout. Browser: `tests/e2e/worm-leap.spec.ts` (desktop keyboard + phone-viewport
touch) measures the peak above helicopter altitude + 20px with no page errors, and
the 10 existing worm control/HUD browser cases still pass. Capture:
`docs/verification/worm-leap-mobile.png`. Not re-run: the 5 heavy full-run Hunt
simulations (their movement profile is untouched) and physical devices.

## Previous checkpoint: playtest corrections (commit a9f0615, 2026-10-02)

The user's five reproducible complaints from `docs/PLAYER_FEEDBACK.md` are fixed and
committed; item 6 (UI/art quality) is intentionally left open pending their next
playtest. Verified: 231 tests pass (76 files), lint and typecheck clean, browser
cases pass for squad visibility and shot alignment (`tests/e2e/hunt-clarity.spec.ts`,
capture `docs/verification/hunt-squad.png`), Hunt controls at four viewports and the
summit boss. Deterministic seed-33 full runs: ascent ~248s, totals 393-413s, all
Victory. Known limits: scripted runs now sit at the top of the 240-420s acceptance
band (boss fight length is the first tuning lever), audio was verified by code and
browser only (no human listening), and physical devices remain untested.

## Resume instructions
1. Read README_START_HERE.md, AGENTS.md and this file.
2. Read relevant sections of GAME_DESIGN, ARCHITECTURE, DECISIONS, BALANCE,
   ASSET_LICENSES and REFERENCE_RESEARCH; then relevant source/tests.
3. Check git status/log against this record. The approved survival specification
   under docs/superpowers/specs is design history; do not replay completed plans.
4. User explicitly waived Superpowers skills, repeated planning/review and unnecessary
   retesting for future maintenance/updates as well as this session. Default to direct
   execution; use Superpowers only if explicitly requested again. Follow AGENTS.md's
   persistent preferences, respect time limits, and execute observed fixes directly.

A short 'lanjutkan' resumes from the next action below. Account quota cannot be
observed; never invent its percentage. If user reports1%, checkpoint and stop.

## Completed state
Foundation, Ascent and roster were committed through dc48e23. Building-height
ballistic player worm correction is b1bac82; this checkpoint retains it.
Latest local checkpoint subject: feat: polish survival presentation and tune full-run pacing.
Resolve its SHA using git log; no remote publication.

- 5 worms and 5 Hunters, distinct skills/starting guns, 3 themes, persisted selection.
- Save3 preserves genuine v1/v2 records and future-schema protections.
- Automatic mouth feeding; Space worm skill / Shift burst; Hunter jump/fire/Q/dodge.
- Hunt ordinary worms return after10s with escalation; two allied Hunters/one heli.
- New route: base and17 ledges,90px intermediary step,180px between main catwalks,
  alternating stairs at x+/-3250, floors span+/-3350, world bounds+/-3600.
  First jump remains reachable, run180/jump660/gravity1800 unchanged. No waiting timer.
- Hazard rises5px/s; summit freezes it and starts a3600HP boss with3s immunity.
  RPG80damage/two rockets, restock4s; first pickup restores living Hunter once.
- Medical caches:3 on each wide ledge (24 total), each35HP, capped at max health,
  one use, not wasted at full health, player only, never revive dead actors.
- Hunter hit recovery60ticks; dodge protection12ticks; steady visible outline.
  Ordinary AI worm hit recovery remains0; boss explicit immunity unchanged.
- Engineer beacon120px behind facing/travel direction,5s active, existing sensing.
- New inline SVG menu illustration, tangent-oriented worm head/teeth/carapace,
  Hunter armor/boots/limbs, tower panels/braces, route arrows, weather24streaks/flakes.
  No added dependency or external asset. Reduced motion disables ambient weather.
- HUD: accessible boss meter, ascent progress, direction/distance to next ledge,
  theme hazard label, squad/air counts, shield cue; responsive compact touch layout.

## Verified evidence
- Lint and typecheck exit0.225 tests/75files pass with survivalCompletion excluded.
- Five full-run cases pass across focused runs;231 total tests across76files.
  The first long-run test exceeded Vitest's default5s timeout despite Victory;
  the test now has60s per kit. Engineer initially died from repeated impacts on
  long walks; distributed caches corrected the failed case, rerun Engineer only.
- Seed33 normal simulation, exposed-target aiming, no teleport/health overrides,
  no Scout traversal skill: Ranger358.93s, Siege353.32s, Scout346.30s,
  Medic358.02s, Engineer363.00s; summit at247.53-248.87s. All finish Victory.
  Four initial successes precede the extra caches; Engineer is measured after them.
  SURVIVAL_PLAYTHROUGH.json records exact measurements. Human timing may differ.
- Root browser10 distinct cases: boss1, revised role switch1, mobile/tablet2,
  performance1, ten-kit selection/retry2, small menu1. Earlier menu3cases also pass.
- Pages boss1 passes; normal production root1/Pages1 smoke pass, no test bridge.
- Actual captures inspected: compact menu, tangent worm head, mobile Hunter HUD,
  rooftop camera/player/RPG/boss meter. Fatal browser/console errors absent in checks.
- Final dist is ordinary root production. Nonfatal Phaser bundle-size warning remains.
  No full old Phase B/C E2E rerun; no new review-agent or Superpowers workflow.

## Exact next action

The 2026-10-03 checkpoint above is current. Get the user's art/audio/supply verdict.
On a generic continuation, resume the separate Rampage Stage 2 (rival kit skills,
visible rooftop pickup feedback, heavy-weapon loss). Keep focused checks and reuse
working systems. Do not infer human acceptance from automated verification.

## Practical limits
Procedural stylized visuals, not photorealistic/GOTY production assets. Seed33 is
one automated route with precise aim;5-6min is guidance, no forced timer or human
acceptance. Scout grapple can shorten traversal. Long horizontal walks need user
judgment. Physical phone/tablet/gamepad/audio/haptics and sustained60fps remain
unverified. Latest short host sample in SURVIVAL_PERFORMANCE.json is not device proof.
No backend, runtimeLLM, music/campaign or new engine dependency. Preserve static
Vercel/Pages deployment and keep test hooks out of ordinary builds.

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
