# Player feedback - major corrections

Recorded 2026-10-02 after the user's playtest. Applies after checkpoint 1ffe038
and workflow preference commit 34a5971.
Status: **items 1-5 fixed in commit a9f0615; item 7 (weak Rampage worm jump) fixed
in the leap commit; item 8 (mouse controls, UI/art pass, mobile skill buttons) fixed
in the control/UI commit recorded below; item 6 (art/UI quality) is partly addressed
but still a subjective judgement for the next playtest.** Passing automated tests
still does not establish satisfactory feel.

## Fix log (2026-10-02, mouse controls and UI/control presentation)

User request: continue the UI/art work, and add mouse control for the Shift action
(right click should also work), while keeping desktop skill bindings (`Q`, grapple
included) and making sure mobile buttons exist, are responsive and actually work.

Implemented:
- Mouse: `PointerInput` now reports `boost` from the right button in both modes
  (worm Burst, Hunter Dodge) next to the left-button aim/fire, suppresses the canvas
  context menu, and latches a press for one sample so a fast click is never missed.
  Browser proof: `tests/e2e/mouse-controls.spec.ts` (right click bursts in Rampage
  and clears the helicopter altitude; right click dodges in Hunt).
- UI/art: filled gauges for health, skill, dodge, ammo and Burst on both HUDs, plus
  readiness rings on the touch Burst/skill buttons and the Hunter fire button while
  reloading. `ui/ControlReadiness.ts` is the single readiness source, so the rings and
  gauges cannot disagree with the simulation cooldowns. Verified at five viewports in
  `rampage-hud.spec.ts` (gauge present and filled) and in `hunt-controls.spec.ts`
  (mobile skill button fires the skill and then reports not-ready).
- Mobile skill coverage: the ability button already carries the selected kit's skill
  name; a new browser case selects the Scout and confirms the touch button reads
  "Grapple", fires it and starts its cooldown ring. Desktop grapple stays on `Q`.
- Repaired a stale expectation: the worm return countdown is real player information
  and is visible in normal Hunt play again (generation/kill counters stay debug-only),
  which also un-breaks `tests/e2e/hunt-flow.spec.ts` (it failed on the pre-change
  baseline, confirmed by stashing).

## Fix log (2026-10-02, Rampage leap)

User report: in Rampage the worm's jump feels far too weak - even boosting upward
the worm cannot climb high enough to eat a helicopter - and they asked for a more
comfortable experience on mobile and desktop.

Reproduced deterministically: with the real arcade movement profile the best-timed
upward Burst peaked 159px above the surface, and a plain breach 104px. The mouth
reaches contact with a 220px helicopter from about 164px of head clearance, so the
target was literally just out of reach. Fixed:
- Upward Burst is now an intent-based leap: holding up (`moveY <= -0.5`) or already
  rising faster than 180px/s converts the Burst into a 1050px/s vertical launch
  (apex 275px at the arcade gravity of 2000) instead of a tangent sprint. Works
  from underground or mid-air, so timing is forgiving on both input schemes, and
  RunFactory scales the lift with character speed so every worm gets the same apex.
- Verified reach: `tests/integration/arcadeWorm.test.ts` runs real arcade sessions:
  a 200-tick leap destroys the `actor.aerial` at y=-220 (score aerialDestroyed 1), and
  Dune Maw, Storm Serpent and Iron Burrower all keep a 275px apex because RunFactory
  scales `burstLiftSpeed` with character speed exactly like gravity.
  `tests/unit/ballisticBreach.test.ts` pins the leap apex band and proves the leap
  clears the patrol altitude while a plain breach still falls short.
- Feel: `worm-burst` had no cue at all before; it now has a rising `leap` audio voice
  and dust via FeedbackController/PhaserAudioAdapter.
- Mobile comfort: the worm's Burst button is a full-size thumb target (same size as
  the skill button, previously half) and shows a readiness ring so a tap during the
  1.8s cooldown is visibly explained. Desktop keeps reading the HUD text, which now
  says `Burst - hold up to leap` while an air target is alive.
- Browser proof: `tests/e2e/worm-leap.spec.ts` (2 cases) - desktop keyboard leap and
  phone-viewport touch leap both measure a peak above helicopter altitude + 20px, no
  page errors; capture `docs/verification/worm-leap-mobile.png`.
- Campaign (Hunt) worm movement is deliberately unchanged: `huntMovementBalance`
  keeps `burstLiftSpeed = 0`. Only real player Rampage (arcade) gets the leap.
- The leap is reachable from the mouse too: the right button is the same Burst/
  Dodge action as Shift (see the mouse/UI fix log below).

## Fix log (2026-10-02, commit a9f0615)
Reproduction used a 7200-tick scripted ascent run and a browser case:
- Missing soldiers was real: ground allies existed but ended up ~3000px from the
  Hunter (x~-3130 while the player was near x=0), i.e. permanently off camera.
  Cause: no anchor to the player, spawn at fixed world offsets, and a climb rule
  that walked them to the arena edge. Now they spawn beside the Hunter on their
  ledge, escort within a 200px leash with a 130px stand-off, regroup when lagging
  and climb with the player. Verified: browser case `hunt-clarity.spec.ts` holds
  every ground ally within 460x320px of the Hunter for 25s (`hunt-squad.png`).
- Strange allied fire: tracers now start at the drawn muzzle and the rifle follows
  the real aim direction (recoil, muzzle flash), instead of a generic line.
- Wrong aim/shot: `hunt.aim` was the aim-assist result (18-degree cone), so the pose
  and the shot could point somewhere the player never aimed. The cone is now 6
  degrees, the stored aim is exactly what the shot uses, and the tracer is drawn
  from the muzzle to the real hit point. Verified: `dot(aim, shot direction) > 0.96`.
- Weak weapon/skill audio: no shot or skill had any sound at all (no cue existed for
  `rifle-fired` or `ability-activated`). Each weapon (rifle, carbine, SMG, burst,
  sidearm, RPG), each skill (shield, heal, mark, grapple, decoy, fire, venom, shock,
  surge) and allied fire now has its own procedural voice.
- Stupid worm: it aimed at a static objective and cruised just under the surface, so
  crossings were random and sometimes un-warned. It now senses the Hunter by
  seismic bearing (80px cells, 20-tick cadence), leads the crossing by the Hunter's
  travel, dives away from the surface outside an attack, and re-acquires immediately
  after each breach. Crossings now land on the player with a >=490-tick warning.
  Rebalanced for the stronger AI: RPG 200 damage, Hunter impact scale 0.5.
  Deterministic 5-kit full runs still finish (ascent ~248s, total 393-413s).

Still open (item 6, and feel): art/UI quality is subjective and needs the user's
next playtest. The Hunt HUD already shows weapon name, skill name/cooldown, route
cue, boss meter and objective after the earlier presentation pass; no further
speculative art change was made without feedback.

## Requested corrections (original record)

1. **Weapon audio and shooting feel:** ordinary firearms/pistol and RPG currently
   feel weak and insufficiently different. Give RPG a clearly heavier firing and
   impact identity; ordinary guns must also feel responsive and satisfying. Audio,
   muzzle effects, weapon animation and hit feedback must match the actual attack.
   Each weapon type and each activated skill needs a recognizable, distinct sound;
   allied gunfire must also sound and feel appropriate rather than generic.
2. **Hunter aiming and presentation:** the arm/hand pose sometimes points incorrectly
   relative to the aim, and the shot direction also appears wrong. Align aim,
   shoulder/hand/gun pose, muzzle origin, projectile or tracer and actual hit path
   in both directions and while moving/jumping; include touch aim. Improve the
   UI/assets' visual quality and clarity, preserving a clean non-debug playfield.
3. **Enemy worm intelligence:** the user finds the worm bot too stupid. Improve
   pursuit, breach selection, prediction and recovery so it presents credible
   pressure during both climbing and the boss fight. Keep attacks readable and
   fair; do not substitute more health/damage for better behavior or use runtime LLMs.
4. **Allied soldier presence:** the user sees repeated helicopters but no allied
   foot soldiers spawning. Reproduce in an ordinary run and check actual spawn,
   replacement, positions, camera visibility and hazard survival before deciding
   the cause. Soldiers should be visibly present and useful near the Hunter.
   Do not close this issue merely because a registry population test passes.
5. **Allied firing:** NPC shots look strange and lack impact/audio. Correct allied
   weapon pose, muzzle/tracer alignment, target choice and firing feedback for
   both soldiers and helicopters. They must fire convincingly at exposed targets.
6. **(partly addressed) UI and art quality:** subjective. This pass added filled
   health/ammo/cooldown gauges and touch readiness rings plus a visible worm return
   countdown; whether the art direction is good enough still needs the user's verdict.
7. **Weak Rampage worm jump (fixed):** boosting upward barely lifted the worm, so it
   could never reach and eat a helicopter. Fixed with the intent-based upward Burst
   leap described in the leap fix log above. User also asked for a more comfortable
   mobile and desktop experience; the leap now has audio/dust feedback, a full-size
   touch Burst button and a readiness ring, and the HUD advertises the leap whenever
   an air target is alive.
8. **Mouse controls and mobile skill buttons (fixed):** the right mouse button now
   mirrors Shift (worm Burst / Hunter Dodge) and keeps left click for aim and fire;
   desktop skill bindings stay (`Q`, grapple included). Mobile keeps a button for
   every action with a readiness ring, and the Scout grapple button is verified in a
   browser on a phone viewport.

## Resume from these issues

On the next request to continue, start with a short real-game reproduction of the
reported problem, then execute focused corrections. This is an issue record, not a
requirement to write another lengthy plan or start a new phase. Remaining open:
item 6 (art quality, user judgement) and the human feel of the earlier fixes
(sound identity, aim alignment, soldier presence, worm pressure, leap feel, the new
right-click control and the HUD gauges).

Relevant entry points (inspect only the current issue's files):
- Aiming/rendering: HunterCharacterView.ts, ActorViews.ts, HuntSystems.ts,
  RifleSystem.ts, RpgSystem.ts under src/game/.
- Sound/feedback: src/game/infrastructure/phaser/PhaserAudioAdapter.ts and
  src/game/rendering/FeedbackController.ts / EffectsRenderer.ts.
- Enemy behavior: src/game/domain/ai/WormController.ts and its sensing/forecast.
- Allies: HuntSystems.ts, AlliedHunterController.ts, SupportHelicopterController.ts.
- UI: src/game/ui/, src/styles/main.css; external assets require ASSET_LICENSES.md.

Work directly in the root/current branch. Default to no Superpowers, no repeated
planning/review loops, and only necessary affected tests. Record what was actually
checked and what remains open; user judgment of feel is the acceptance gate.
