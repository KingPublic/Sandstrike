# Phase C verification - 2026-10-02

Base `35d3ec7`; root checkout `phase-b-ready`. Approved scope: Ranger/Hunt,
seeded AI worm, relay defense, mode records, vehicle/aerial response and bands 2-3.
No new dependency, backend, runtime LLM, remote publish/merge or new worktree.

## Evidence actually observed

- Combined `npm run verify`: lint/typecheck/build passed; 156 tests in 53 files.
- Two 5,400-tick AI replays and two 18,000-tick Rampage replays matched, with
  finite bounded motion, population caps and zero event overflow.
- Hunt root: four flow cases plus four control/viewport cases passed across
  1440x900, 915x412, 844x390 and 1024x768; portrait 390x844 safely pauses.
- Hunt Pages flow 4/4 passed. Integrated root Rampage-to-Hunt flow 1/1 passed.
- Production root and Pages smoke 1/1 each passed; no test bridge or fatal errors.
- Short host performance check 1/1 passed; raw data `PHASE_C_PERFORMANCE.json`.
  Six seconds per mode: natural Hunt, staged band-3 Rampage with a breach/boost.
- Desktop/phone captures visually inspected. An underground render leak was
  found visually and corrected with surface-clipped polygons before Hunt GO.
  GeometryMask is Canvas-only in Phaser 4's local primary documentation.

## Final gate work in progress

One Pages integration case needs its quick keypress sampled over a simulation
boundary. One fresh whole-branch review is pending; its rulings/fixes will be
recorded here. Added browser/performance test files need final lint/typecheck.

## Limits

Functional prototype evidence does not establish physical phone 60 fps or human
feel. Physical touch/gamepad/audio/haptics, sustained GPU/memory profiling, long
natural matches and provisional 3-7 minute / 4-7 exposure targets remain pending.
Host Hunt frame median 30ms, p95 36.67ms, simulation p95 .7ms/tick; staged Rampage
median 16.67ms, p95 35.01ms, simulation p95 .6ms/tick, up to 3 projectiles and 32
particles. Neither capture reports catch-up drops; they do not prove 60 fps.
Procedural presentation is original prototype art, not photorealistic production
art. Nonfatal Phaser bundle warning remains (~1,514kB minified / 400kB gzip).

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
