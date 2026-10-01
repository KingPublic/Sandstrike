# Phase B verification — 2026-10-01

## Scope and gate

**GO for the Phase B prototype and Phase C planning.** Foundation, movement and
Rampage plans are implemented. This is not a complete two-role game or a claim
of production art/60 fps hardware readiness. Phase C adds Ranger, AI worm, Hunt
and response bands 2–3 using the approved design.

Verified implementation: original desert/worm, path-history followers, breach/
re-entry, swept combat, prey sustain, telegraphed seeded infantry and pooled
projectiles, bounded spawns, score/combo, response bands 0–1, responsive HUD,
feedback/accessibility, menu/pause/restart/Results/retry and versioned local saves.

## Evidence

- Final `npm run verify`: lint/typecheck/build exit 0; 129 tests in 38 files pass.
- Root browser suite: 24 distinct scenarios covered across runs. Initial 16 pass;
  nine concurrent WebGL workers cause shared-resource timeouts in seven scenarios.
  Six repaired scenarios pass with one worker; remaining 1440 HUD check reveals
  delayed Phaser parent polling and is fixed by explicit scale refresh.
- After the final review fixes, all 12 affected browser scenarios pass in one
  worker: menu/Results interruption, desktop/touch movement, portrait/visibility,
  simultaneous steering/Burst, combined combat/save/retry, defeat, full run flow
  and five HUD sizes. Unchanged storage/performance/boot checks are not rerun.
- Pages E2E: 4/4 pass; root and Pages ordinary production smoke: 1/1 each pass.
  Production output has no E2E bridge; no captured fatal console/page/asset errors.
- Storage browser checks cover empty, valid, backup, corrupt, future, unavailable
  and reload/reset. Domain tests cover duplicate accepted results and write policy.
- Visual inspection: current desktop 1440x900 and touch 844x390 captures show worm,
  prey, infantry aim-lock, critical HUD and touch controls. Layout checks also
  cover 1280x720, 915x412 and 1024x768; portrait 390x844 safely pauses.
- Earlier movement gate: ten breach/return cycles over 2,274 ticks, finite poses,
  maximum 7.573 px/tick; full-body deep framing at approximately 1,711 px.
- New combined combat fixture: ten identical finite 120-tick runs; no duplicate
  credits/heals; warning once; band 1 at tick 122; no event overflow.
- Domain dependency restrictions pass ESLint. Inspection finds no Phaser, DOM,
  storage, audio or wall-clock access inside the domain. Tunables remain in typed
  data; scene composes application/domain services and presentation adapters.
- Build entry: approximately 1,483 kB minified, 390 kB gzip. Phaser chunk-size
  warning remains visible and nonfatal. Vercel/Pages are static compatible;
  no remote deployment has been performed.

## One fresh independent review

Reviewed base `0524b46` through `74586e8` plus final Task 8 files. No Critical or
Minor findings. Three Important findings were reproduced before one fix pass:

1. Catch-up pause edge disappeared from the last sampled action: regression RED
   then GREEN; pause now stops before that tick and clears remaining catch-up.
2. Fatal rifle damage followed by Bite revived the worm: regression RED then
   GREEN; dead non-projectile sources cannot attack, heal or earn rewards.
3. Title/menu/Results blur or visibility exposed run controls: browser regression
   RED then GREEN; interruption and overlays require an active session.

Final deterministic suite is 129/129; affected browser suite is 12/12. Additional
1440 canvas sizing regression is GREEN after refreshing parent bounds at start.

## Limits

`PHASE_B_PERFORMANCE.json` and `BALANCE.md` record 12-second, seed-811 automated
host measurements. Median render pacing is approximately 32–35 fps and simulation
p95 is 0.4 ms/tick. The provisional physical-hardware 60 fps target is unverified.
These short band-0 runs do not profile sustained rifle pressure; separate stress
fixtures cover projectile/combat correctness. Heap counters are coarse observations.
Physical touch/gamepad, audible quality, haptics and hardware GPU profiling remain
unavailable. Art/animation are original procedural prototypes, not photorealistic
production assets. No music, Hunter, progression or bands beyond 1 ship in Phase B.

## Execution decisions

The complete chronological ledger rulings, including costs if wrong, follow.
- Pre-flight: Task 6 E2E fixture-before-start contradicts movement bridge's current immediate configure semantics; Ruling: preserve current laboratory fixture behavior until menu/RunFactory exists, then configuration is staged before start; cost if wrong: old laboratory tests need an explicit restart/setup path.
- Setup Ruling: use PowerShell equivalents of SDD artifact scripts because Git-for-Windows C:/ root handling previously failed; brief text and ledger contract retained.
- Task 3: Ruling: existing read-only bridge snapshot already exposes AI decisions/projectile count and recent event history lives in scene; preserve its API rather than adding duplicate accessors â€” cost if wrong: diagnostics consumer needs an accessor later.
- Task 4: Ruling: unspecified repeat credit becomes half score/chain; multi-target breach bonus becomes additive 25% base per target after first; use sorted target IDs for simultaneous credit â€” provisional BALANCE hypothesis, cost if wrong: retune reward policy after playtest.
- Task 4: Ruling: laboratory sessions remain unbounded without directors; mode=rampage enables bounded momentum reflection and directors, preserving movement fixtures â€” cost if wrong: menu RunFactory must explicitly select mode.
- Task 5: Ruling: active landscape play fills viewport at all sizes; hidden menu Focus game check becomes real HUD pause/resume check â€” cost if wrong: players may prefer an optional windowed mode later.
- Task 6: Ruling: focused MenuView owns menu markup beside ResultsView; SessionController replaces scene-owned session/pipeline without rebuilding domain systems â€” cost if wrong: additional view boundary may need adjustment for Phase C.
- Task 7: Ruling: v1 is the initial schema; unsupported earlier/future schemas are rejected rather than inventing a migration. Future data switches this session to memory, preserving disk until explicit reset; reset clears primary and backup â€” cost if wrong: a future import/migration tool is needed.
- Task 8: Ruling: phase-b-smoke deliberately overlaps seven targets and two projectiles to stress simultaneous combat, protection and credit; it is not normal spawn density. Cost if wrong: this fixture alone could mask ordinary encounter spacing/feel; normal seeded replay remains separate.
- Task 8: Ruling: expose read-only render metrics through the existing E2E presentation accessor; keep timing outside the domain and remove the API from production. Cost if wrong: instrumentation overhead affects measured timings.
- Task 8: Ruling: pin browser tests to one worker; nine concurrent WebGL pages caused shared GPU contention/timeouts and invalid measurements. Rerun only failed/affected checks per user instruction. Cost if wrong: serial tests take longer, but isolate actual game behavior.
- Final: Ruling: Hunter/AI worm, bands 2-3/vehicles/aircraft, economy/production art remain Phase C/D; reasonable Phase B users get a playable original worm slice with visibly planned Hunter mode. Cost if wrong: broader game expectations need further planned work.
- Final: Ruling: remote deployment/merge/push were outside runtime review; user will push/merge, and root switch is separately authorized. Cost if wrong: hosted release remains unverified until deployment.
- Final: Ruling: automated headless host measures 32-35 fps, not verified physical-hardware 60 fps; initial ARCHITECTURE budgets are explicitly provisional. GO is for the functional Phase B prototype/Phase C planning, with real GPU/mobile profiling retained as an MVP gate. Cost if wrong: hardware performance may require optimization before release.
