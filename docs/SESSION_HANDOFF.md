# SESSION HANDOFF - Project Sandstrike

Updated 2026-10-02, latest execution. Root C:/Users/Adrian/Games/Sandstrike.
Branch phase-b-ready. Work directly in root; no new worktree, branch switch, push
or merge. User handles remote integration. Communicate in Bahasa Indonesia.

## Latest checkpoint: playtest corrections (commit a9f0615, 2026-10-02)

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
The user has now playtested and reported major defects: weak gun/RPG sound and
feel, little distinction between weapons, missing distinct skill sounds, wrong
Hunter hand/shot direction, weak UI/art, stupid worm AI, missing allied soldiers
with repeated helicopters, and strange/weak allied shooting and audio.
All remain OPEN, user-reported, not reproduced/fixed. Read PLAYER_FEEDBACK.md.
This turn records the request only. Next "lanjutkan": briefly reproduce aiming
and soldier presence, then execute focused fixes and audio/weapon feel improvements,
followed by worm AI/UI polish. Reuse existing systems; no new Superpowers or generic
phase/plan. Passing automated tests does not overrule this human feedback.

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
