# Survival Revision Verification

Date: 2026-10-02. Root checkout, branch `phase-b-ready`; local changes only.
Approved scope: foundation, ascent and ten-kit roster, with the latest user override
requiring building-height ballistic player breaches. Historical Phase B/C fixtures
retain their explicit physics and relay objectives.

## Latest pacing and presentation checkpoint

This section supersedes older222-test/600HP/unmeasured-run statements below.
Latest user explicitly waived further Superpowers skill, planning and review cycles.

- Lint and typecheck exit0.225 tests in75files pass with survivalCompletion.test.ts
  excluded. Five full-run cases pass across focused runs (four first successes,
  Engineer corrected and rerun alone):231 tests/76files in the combined evidence.
  No single new npm run verify invocation is claimed. No repeat of all full runs.
- Initial full-run controller measured9.88s climb/25.87s total on the previous
  overlapping route. The new alternating stairs/catwalks and3600HP boss produce:

| Hunter | Climb | Full Victory | Boss duration |
|---|---:|---:|---:|
| Ranger |248.87s|358.93s|110.07s|
| Siegebreaker |247.80s|353.32s|105.52s|
| Scout |247.80s|346.30s|98.50s|
| Field Medic |247.53s|358.02s|110.48s|
| Engineer |247.53s|363.00s|115.47s|

Seed33, normal simulation, precise exposed-target aim, no teleport/health override
or traversal skill. Four cases precede extra medical-cache placement; failed
Engineer rerun after that focused change. SURVIVAL_PLAYTHROUGH.json stores exact
results. This demonstrates route feasibility, not average human difficulty.

A long-run case initially timed out under default5s despite Victory; explicit60s
per kit resolves the test budget. Contact damage every frame was a real defect:
configured60tick Hunter recovery and12tick Dodge protection fix it, with unit and
integration coverage. Engineer died on long walks before further cache placement;
three one-use35HP caches per wide floor sustain the route. No forced waiting timer.

Browser checks this checkpoint:
- Root8 distinct cases: ascent-boss1, survival-game4, survival-selection2,
  small/phone menu1. Initial menu3cases also passed; affected menu case recaptured
  after fixing artwork continuity. No full historical Phase B/C rerun.
- Pages ascent-boss1/1 passes; ordinary root/Pages production smoke1each passes.
- Tested1440x900 boss,844x390 touch,1024x768 tablet,390x844 portrait interruption,
 720x450/844x390/390x844 menus. HUD meter max3600 checked, player/camera visibility,
 RPG pickup/restock and frozen hazard retained.44px touch targets and pause/resume.
- Refreshed captures visually inspected: menu artwork, Cinder jaws/head, mobile HUD,
  boss meter/RPG/player and catwalk supports. No fatal page/console errors in checks.
- Final ordinary root production build exits0 (617ms),128modules,
 JS1581.66kB/gzip419.97kB; nonfatal Phaser bundle warning only. Test bridge absent in
 normal-production smoke; final dist is root production, not E2E mode.

Latest short boss host sample:100frames, median16.67ms/p9538.31ms,
 simulationmax1.30ms,3actors/8particles/1ally. CPU was also running domain simulations;
 this is not physical-device60fps acceptance. See SURVIVAL_PERFORMANCE.json.

Remaining user checks: human difficulty/long catwalk feel, physical touch devices,
 gamepad/audio/haptics and sustained performance. Art is original stylized code
 geometry; no photorealistic/GOTY production claim. The approved functional design
 and this presentation/pacing checkpoint are delivered; next work starts from user
 feedback, without reopening old plans.

## Historical roster checkpoint evidence

## Final gate

`npm run verify` exits0: lint, TypeScript, **222 tests in73 files** and ordinary
production build pass. Vitest18.77s; build630ms on this host. Final `dist/` is a
normal root production build, not the E2E build. Phaser bundle warning is nonfatal:
1570.89kB minified/416.06kB gzip; no engine/dependency/backend was added.

## Actual browser evidence

Focused runs, not a rerun of every historical Phase C scenario:
- Root:12 distinct revised cases passed across scoped runs: ten-kit selection and
  retry/reload2, compact/all-theme menus3, ballistic keyboard/touch2, revised role
  switch1, interrupted mobile/tablet Hunt2, summit RPG/boss1 and host performance1.
- `/Sandstrike/`: `survival-game.spec.ts` plus `ascent-boss.spec.ts`:5/5 pass29.9s.
- Normal production smoke: root1/1 pass6.2s, Pages1/1 pass6.2s. Test bridge absent;
  failed requests, HTTP400+ assets, fatal page/console errors are rejected.
- Desktop1366x768 and1440x900; synthetic touch844x390/tablet1024x768; portrait
  390x844 pauses ticks and landscape resume restores play.44px touch targets checked.
- Real keyboard Space/Q selects each kit's active skill; touch skill and jump tested.
  Held upward steering reaches a compact apex, falls and re-enters. The domain
  regression measures70-210px bounds; target ordinary arc is approximately100-160px.
- Selected character/environment survive retry/reload; fresh role clears skill
  projectiles/decoy. Save3 separates current records and validated legacyRecords.

Captures in `docs/verification/`: all ten `character-*.png`, three themes and compact
menus, `survival-building-breach.png`, `survival-hunt-844.png`,
`survival-hunt-1024.png`, and refreshed `survival-boss.png`. They were visually
inspected. Mobile HUD/skill sizes are readable; rooftop camera now contains player
and marked crate. Buried boss geometry clips against the current hazard surface.

An initial new browser test wrongly read `snapshot.result` (not an exposed field);
it now checks the actual save envelope and role reset. A performance case exposed
a replacement delay after deeply buried support retirement; prompt safe replacement
fixed that failure. Only failed/affected cases were rerun.

## One final review and rulings

Read-only whole-range review: `073b9d9..b1bac82` plus roster working tree. No Critical,
four Important. Each reproduced RED and corrected with focused GREEN regressions:
1. Moving surface through rendering, clipping, cues, tracking, aim, Rifle/RPG rays
   and hidden feedback filtering.
2. A lethal shot no longer erases an already committed fatal Hunt impact. Sources
   alive at resolution start remain eligible for committed impacts; Hunter defeat
   wins simultaneous terminal priority. Rampage dead-source feeding stays blocked.
3. Ground support spawns on safe platforms; deeply buried units expire and are
   promptly replaced; dead controller history pruned and caps retained.
4. Sensed Engineer decoy remains useful beyond60s; ascent targeting no longer uses
   relay-objective utility or hidden live Hunter coordinates as its fallback.

Minor marked crate/clipped shield feedback implemented. Visual inspection also
found legacy camera bounds clipping the rooftop; ascent camera and sky now use
world bounds, with a real browser player-visibility assertion and unit regression.
No second review cycle. One traversal fixture waited beyond the movement window
into a changed live AI attack; shortened to the actual landing/drop window, then
the final222-test gate passed. A boss fixture's long-term full-health assertion
became invalid once allies could contribute; it checks boss maxHealth/liveness,
while initial full-health spawn remains separately covered.

Weapon ruling: loaded RPG has priority; starter firearm can fire during reload.
Pending burst cancels before RPG resumes. Ordinary enemy per-hit protection is0;
explicit boss shield still blocks3s. Focused damage/ownership regressions pass.

## Host performance and remaining release work

Final5s headless boss sample in `SURVIVAL_PERFORMANCE.json`:241 samples,
frame median20ms/p9524.99ms, simulation maximum1.5ms,3actors/16particles,
one allied unit. This short sample excludes later full support population and
does **not** establish60fps on physical devices. Projectile metric counts the
combat projectile system; bounded character-skill projectiles have separate tests.

Natural5-6min whole-run pacing,1-2min boss feel, difficulty, physical
phone/tablet/gamepad/audio/haptics and sustained performance remain playtest gates.
Animated art is original procedural prototype geometry, not photorealistic/GOTY
production assets. No music track/campaign/backend/runtimeLLM. Next work is actual
player/device feedback, focused pacing/control tuning, then presentation polish.
Do not replay completed plans or claim these release gates are already proven.

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
Final dist remains normal root production. Next action remains user feedback.
