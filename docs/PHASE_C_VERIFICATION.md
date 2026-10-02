# Phase C verification - 2026-10-02

Base `35d3ec7`; root checkout `phase-b-ready`. Approved scope: Ranger/Hunt,
seeded AI worm, relay defense, mode records, vehicle/aerial response and bands 2-3.
No new dependency, backend, runtime LLM, remote publish/merge or new worktree.

## Evidence actually observed

- Combined `npm run verify` after the review fix: lint/typecheck/build passed;
  160 tests in 53 files (17.54 seconds for the deterministic suite).
- Two 5,400-tick AI replays and two 18,000-tick Rampage replays matched, with
  finite bounded motion, population caps and zero event overflow.
- Hunt root: four flow cases plus four control/viewport cases passed across
  1440x900, 915x412, 844x390 and 1024x768; portrait 390x844 safely pauses.
- Hunt Pages flow 4/4 passed. Integrated root and Pages Rampage-to-Hunt flow
  1/1 each passed. Q is held across a simulation boundary in the Pages test.
- Production root and Pages smoke 1/1 each passed; no test bridge or fatal errors.
- Short host performance check 1/1 passed; raw data `PHASE_C_PERFORMANCE.json`.
  Six seconds per mode: natural Hunt, staged band-3 Rampage with a breach/boost.
- Desktop/phone captures visually inspected. An underground render leak was
  found visually and corrected with surface-clipped polygons before Hunt GO.
  GeometryMask is Canvas-only in Phaser 4's local primary documentation.

## Final review and ruling

One fresh read-only whole-branch review covered `35d3ec7..1dc10d0`: Hunt/AI,
input, clipping/rendering, lifecycle/results, save v2, projectiles and escalation.
The reviewer did not rerun the full suite. Initial verdict: With fixes.
Critical: none. Important: one. Minor: none. Declined to judge: none.
Accepted correction and regression checkpoint: `073b9d9`.

**Accepted Important finding:** the pre-attack waypoint at depth 160px was shallower
than the worm's turn radius. Momentum could breach during reposition/accelerate;
the warning also described the target sector instead of the physical crossing.
Normal Hunt seed 376940 breached at tick 134, x=544.925 while its bracket was
[-60,180], then at tick 399, x=-238.702 without a prediction. An idle Ranger
started taking damage at tick 445 and lost at 451. Controller replay found 14/18
crossings unannounced or early; seed 881 found 7/15. The old test's persistent
`warned` boolean concealed later violations. This affects prediction and snare
placement, so it requires a fix before prototype GO.

**One fix pass:** replaced that boolean with assertions for every natural crossing:
a new warning, at least 60 ticks of lead, and an actual crossing inside its sector.
Four cases first failed on the 484.925px sector error. Approach/recovery waypoints
now allow the shared turn radius, edge approaches point inward, and one bounded
forecast at attack preparation uses WormLocomotion with the live movement config,
terrain, locked target and timed boost. The published sector quantizes its projected
physical crossing to a 120px cell. Live motion is still ordinary ActionFrame
steering, not teleportation or a separate gameplay simulation. Forced snare lift
can interrupt that forecast; the regression contract covers natural attacks.
Four replay cases include start seed 376940 and observed Hunters near both edges;
the real RunFactory/GameSession regression also checks every breach until the run
ends. Focused regressions passed, then the final deterministic suite passed 160/160.
Post-fix browser: natural warning/crossing, snare/exposed hit and 844x390 controls
passed. Live warning and breach captures were visually inspected and preserved at
`verification/phase-c-warning.png` and `verification/phase-c-breach.png`: the buried
worm stays hidden and the exposed head emerges inside the marked sector.
The short-Q test was changed to await sampled placement, as in the Pages flow.
Only the affected snare case was rerun. The new warning case was recaptured because
the first images showed the opaque pause UI instead of live gameplay; those pause
images were not accepted as visual evidence. No unchanged full browser suite or
performance suite was repeated for that capture correction.

## Completion decision

GO for the **functional Phase C two-role prototype**: both roles, Hunt objectives,
records/migration, advanced Rampage bands and shared static builds are implemented.
The accepted Important finding is resolved and its regressions are green; no
Critical/Important finding remains open. One final review and one product fix pass
were used. The complete-game release gate stays pending for the limits below.

## Limits

Functional prototype evidence does not establish physical phone 60 fps or human
feel. Physical touch/gamepad/audio/haptics, sustained GPU/memory profiling, long
natural matches and provisional 3-7 minute / 4-7 exposure targets remain pending.
Host Hunt frame median 30ms, p95 36.67ms, simulation p95 .7ms/tick; staged Rampage
median 16.67ms, p95 35.01ms, simulation p95 .6ms/tick, up to 3 projectiles and 32
particles. Neither capture reports catch-up drops; they do not prove 60 fps.
Procedural presentation is original prototype art, not photorealistic production
art. Nonfatal Phaser bundle warning remains (~1,514kB minified / 400kB gzip).
The raw short performance sample predates the review fix. The new bounded AI
forecast runs once per prepared attack; post-fix physical and sustained performance
remain unmeasured. Earlier host measurements are not presented as post-fix results.

## Workflow rulings

Adjacent domain tasks were committed together when they shared interfaces. One
combined verify replaced duplicate full Hunt/Rampage gates; focused tests and real
build/browser/visual evidence established the earlier Hunt GO. PowerShell records
replace POSIX skill scripts on Windows. Deep worms cannot trigger the shallow-only
snare; a contradictory plan test yields to its explicit 100px limit. Original
v1 bytes remain backup, future schemas remain protected, and debug Hunt runs cannot
write records/onboarding. Initial browser failures were diagnosed and only affected
cases rerun. The correct long replay measured ~13 seconds and therefore uses a
specific 30-second test limit. Markdown encoding was normalized after PowerShell
appended legacy-encoded punctuation; no content was intentionally discarded.
Final scratch-ledger facts are preserved here and in SESSION_HANDOFF; the two owned
execution scratch directories may be removed after the local checkpoint is committed.
