# Playtest feedback fixes - progress (commit a9f0615)

Base: 1a9dc7d. Root phase-b-ready. Source of truth: docs/PLAYER_FEEDBACK.md.

## Reproduction (evidence, not guess)
Scripted 7200-tick ascent run + browser case:
- Ground allies existed but drifted to x~-3130 while the Hunter was near x=0
  (off camera) and the first ones died early; spawn used fixed world offsets and the
  controller had no anchor to the player.
- `hunt.aim` was the aim-assist output (18-degree cone) and only updated while
  firing, so the arm could point at a target the player never aimed at.
- No feedback cue existed for `rifle-fired` or `ability-activated`: shots and skills
  had no sound or muzzle effect at all.
- Crossings occurred in `reposition` at y=1..3 with no warning (3 of 10 in a 5400
  tick replay) because the worm cruised just under the surface.

## Fixes
1. Allies: escort leash 200px / stand-off 130px, spawn beside the Hunter on their
   ledge, regroup when lagging, climb with the player, 90 HP, 240-tick refill,
   tracer from the drawn muzzle.
2. Aim: assist cone 18deg -> 6deg; stored aim == shot direction; muzzle flash and
   tracer drawn from the muzzle to the real hit point.
3. Audio: one `SoundVoice` per weapon/skill/ally with distinct procedural synth
   voices; ally shots are quiet and shake-free.
4. Worm: seismic bearing (80px cells, 20-tick cadence), crossing lead 0.55s of
   Hunter travel, surface dive guard, immediate re-acquire after a breach.
5. Rebalance: RPG 80 -> 200 damage; Hunter impact scale 0.5.
6. Decoy: the Engineer beacon now diverts the seismic bearing (was ignored).

## Tests updated (intentional behaviour changes)
- `tests/unit/wormController.test.ts`: seismic delay documented, crossing accuracy
  asserted within 420px of the Hunter, crossings >= 3.
- `tests/integration/huntAllies.test.ts`: new perception shape, escort/regroup/
  helicopter-patrol expectations.
- `tests/unit/feedbackController.test.ts`: command cap 32 -> 40 (ally/shot cues).
- `tests/integration/huntSession.test.ts`: legacy relay fixture assertion relaxed to
  >= 1 crossing (repeated warned crossings are covered by wormController.test.ts).
- New: `tests/e2e/hunt-clarity.spec.ts`.

## Verified
231 tests / 76 files pass; eslint and tsc clean; e2e hunt-clarity, hunt-controls (4
viewports) and ascent-boss pass. Seed-33 completion runs: Ranger 412.5s,
Siegebreaker 393.6s, Scout 405.4s, Engineer 413.2s, Field Medic 409.4s, all Victory.

## Open
- Item 6 (UI/art quality) needs the user's playtest judgement.
- Human listening test for the new audio voices; physical devices; boss fight length
  sits at the top of the 240-420s band.
