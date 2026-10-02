# Player feedback - major corrections

Recorded 2026-10-02 after the user's playtest. Applies after checkpoint 1ffe038
and workflow preference commit 34a5971. Status: **OPEN, user-reported; not yet
reproduced or fixed**. Passing automated tests does not establish satisfactory feel.
The user requested recording these changes in this turn, not implementing them yet.

## Requested corrections

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
