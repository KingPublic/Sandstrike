# Player feedback - major corrections

Recorded 2026-10-02 after the user's playtest. Applies after checkpoint 1ffe038
and workflow preference commit 34a5971.
Status: **items 1-5 reproduced and fixed in commit a9f0615; item 6 remains open
and is a subjective quality judgement for the next playtest.** Passing automated
tests still does not establish satisfactory feel.

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

## Resume from these issues

On the next request to continue, start with a short real-game reproduction of
aiming and missing soldiers, then execute focused corrections and weapon/skill
audio-feel improvements. Follow with worm AI and UI/art polish. This is an issue
record, not a requirement to write another lengthy plan or start a new phase.

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
