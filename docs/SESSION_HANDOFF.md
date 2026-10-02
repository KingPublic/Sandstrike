# SESSION HANDOFF - Project Sandstrike

Updated 2026-10-02, resumed session. Root C:/Users/Adrian/Games/Sandstrike.
Branch phase-b-ready. No extra worktree, branch switch, push or merge; user handles
remote integration. Communicate in Bahasa Indonesia.

## Resume rules
Read AGENTS, this file, the approved survival spec/plan-set, relevant design,
architecture, decisions, balance, assets and reference research before source.
README_START_HERE is the entry point. Check actual git state; earlier Phase A/B/C
plans and relay objectives are historical, not a request to rebuild.
User approved ten-kit survival design and asks immediate execution with only
necessary tests; don't reopen settled plan/design approvals. Latest correction:
player breaches only building-height, held upward input must not defeat gravity.
A short "lanjutkan" resumes the exact next action below.
Account quota cannot be observed. User earlier reported18%; don't invent a usage
reading. Checkpoint continuously; if user says1%, save exact state and ask when to resume.

## Current state
Foundation and Ascent committed:287afc2,ef34688,ee44d17,59e9589,26d3b5b.
Latest physics commit:b1bac82. Final local roster checkpoint subject:
`feat: complete survival roster and revised saves` (resolve SHA with git log).
All implementation/evidence committed in root; no remote action.
- Compact menus: desert, ruins, frozen; one physics/world with frozen per-run theme.
- Rampage automatic swept-mouth feeding; Space selected skill, Shift Burst.
- Player profile650 cruise/800burst/2000gravity; ballistic vy preserved under steering.
  Kit speed changes scale gravity by speed squared. Hunt AI uses separate800/950/640
  profile for tower pursuit; historical fixtures retain legacy physics.
- Ten kits via characters.ts: DuneSandguard, Cinderfire, Ironshock/armor,
  Stormcontrolledsurge, Riftvenom; Rangermark, Siegeshield, Scoutgrapple,
  Engineerdecoy, Medicfriendlyheal. All immediately selectable, no placeholders.
- Original procedural animation/silhouettes in WormView, HunterCharacterView,
  CharacterSkillView; five firearms have different cadence/magazine/damage/burst.
- Hunt vertical jump/drop/one-way ledges, rising hazard5px/s initiallyy200,
  ordinary worm600tick return/fiercer generation, two ground allies/one helicopter.
- Summit freezes hazard at arena clearance420, one600HP boss,90tick entrance,
 30/180/900 shield windup/immunity/cooldown. RPG80damage/tworockets, crate restock.
  Loaded RPG takes firing priority; firearm fallback during reload, pending burst
  cancels on RPG priority. AI enemy per-hit recovery0, explicit shield preserved.
- Revised result metadata gameplayVersion3/characterId/themeId; save3 selection,
  current buckets and legacyRecords. Genuinev1/v2 bytes backed up; future schemas
  stay untouched with memory fallback. Debug Hunt remains practice.

## Final review corrections
One read-only fresh whole-range review073b9d9..b1bac82+roster working tree.
Four Important confirmed and reproduced RED then fixed:
1. surfaceY through CPU clipping, tracking, aim, Rifle/RPG rays, cue/feedback.
2. Hunt impacts already emitted by live sources remain eligible if the source dies
   earlier in the same resolution. Hunter fatal damage wins terminal priority.
   Rampage dead-source feeding/healing restrictions remain unchanged.
3. Ground replacement uses safe ledge; deeply buried support expires, is promptly
   replaced and dead controller records are pruned; population remains capped.
4. Ascent sensed target/decoy no longer loses to legacy relay utility after60s;
   fallback fixed arenax0 does not read hidden live Hunter coordinates.
Also added clipped visible boss shield and original summit crate marker.
Visual inspection found camera bounds still started-1200, cutting off summit-1600;
CameraController/sky use world bounds, with a real browser visibility assertion.
No second review loop; four defects have focused regression evidence.

## Final evidence
npm run verify exits0:222tests in73files, lint/typecheck/build pass;18.77s tests,
630ms normal production build. dist is ordinary root production without test bridge.
12distinct root revised browser cases pass across scoped runs,5Pages cases pass;
normal production root/Pages smoke1each pass. All ten selections/active skills,
retry/reload, role reset, compact menu, keyboard/touch ballistic arc, mobile/tablet
jump/skill/pause/portrait interruption, actual rooftop camera and RPG/boss checked.
Five review regressions demonstrated RED then GREEN; four Important corrected.
Final camera regression and prior Rampage death restrictions pass. Captures visually
inspected in docs/verification, including building-breach,10characters,mobileHUD,
rooftop player/markedcrate. SURVIVAL_VERIFICATION.md records exact gates and limitations.
SURVIVAL_PERFORMANCE.json:5s host boss sample241frames,median20ms/p9524.99ms,
simulationmax1.5ms,3actors/16particles/1ally; not physical-device60fps evidence.
No need to rerun unchanged passing checks merely to resume.

## Exact next action
Natural run pacing/control playtest, then focused tuning and presentation polish.
Use the current game, record actual player/device observations, and adjust only
observed defects: player building-height arc, platform climb readability, target5-6min
whole run, boss shield/RPG timing and surviving allied support. Every Hunter must
finish without traversal skill. Do not add arbitrary timers or rebuild systems.
Physical phone/tablet/gamepad and audio/haptics need human checks; no AAA art promise.
Current functional redesign plans are implemented. Follow existing shared interfaces
and save3; root branch staysphase-b-ready, user controls push/merge.

## Known limits
Procedural original prototype art, not photorealistic/GOTY production assets.
Natural5-6min total/1-2min boss, difficulty, real hardware/audio/haptics and sustained
60fps not established. Host samples are short and don't prove physical performance.
No backend/runtimeLLM/music/campaign/new dependency. Nonfatal Phaser bundle warning.
Static Vercel and GitHub Pages builds remain required; E2E bridge must be absent in
normal builds. Historical evidence remains in PHASE_B/PHASE_C_VERIFICATION docs.
