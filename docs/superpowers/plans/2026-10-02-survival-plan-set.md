# Sandstrike Survival Revision Plan Set

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. Preserve the user's root workflow. Steps use checkbox tracking.

**Goal:** Deliver the approved high-breach, ten-character, multi-theme game with
Hunter ascent followed by a rooftop RPG boss fight.
**Architecture:** Extend the current shared simulation and focused domain systems.
Three child plans deliver playable checkpoints in dependency order.
**Tech Stack:** Existing pinned Phaser 4.2.1, TypeScript, Vite, Vitest, Playwright.
**Spec:** `../specs/2026-10-02-sandstrike-survival-redesign.md` (approved 2026-10-02).

## Global Constraints

- Root `C:/Users/Adrian/Games/Sandstrike`, branch `phase-b-ready`; no worktree/push/merge.
- Desktop/touch share simulation/action interfaces; landscape touch targets >=44px.
- Original visuals only; external/generated assets require ASSET_LICENSES provenance.
- No new dependency/backend/runtime LLM; root and `/Sandstrike/` static builds remain.
- Ten playable characters: five worms and five hunters. Do not reduce this to five total.
- Worms feed automatically through the mouth; Space is a worm skill, Shift is Burst.
- Ordinary ascent worm death returns after 600 ticks; summit entry cancels respawn,
  freezes rising hazard and starts a boss fight. Boss immunity is 180 ticks.
- Successful climb plus boss targets 5-6 minutes; no forced five-minute unlock or boss timeout.
- Initial themes: `desert`, `ruins`, `frozen`, shared geometry and hazard logic.
- Tests repeat only after relevant changes/failures; one final integrated gate/reviewer.

## Review Focus

- Space/quick taps and simultaneous movement/aim retain intended actions (Batch 1/2).
- Mouth/body separation and same-tick contacts cannot duplicate reward/heal (Batch 1).
- Moving terrain cannot invalidate attack warnings or strand a landing (Batch 2).
- Summit entry during a return/kill cannot create two worms or revive an ended run (Batch 2).
- Character/theme retry and old/future saves cannot leak state or erase records (Batch 3).

## Ordered delivery

1. `2026-10-02-survival-foundation.md`: compact menus, three themes, arcade worm
   profile, automatic mouth feeding and Dune Maw Sandguard. Playable Rampage first.
2. `2026-10-02-survival-ascent.md`: vertical Hunter, platforms/hazard, worm lives,
   allied NPC/heli, summit/RPG/boss, clear HUD and stage-specific victory.
3. `2026-10-02-survival-roster.md`: complete ten kits and animated identities,
   selection, save migration and final integrated evidence.

Keep old laboratory/Phase C fixture physics explicit for historical regression;
normal revised runs use new profiles. Interim revised runs are practice runs until
new record buckets are migrated in Batch 3, preventing incompatible score mixing.
No empty character buttons: expose only functioning selections at each checkpoint.

## Execution and resume

User approved the design and continuation, with native/root execution preferences.
Foundation and Ascent are committed; user resumed after playtest. Latest player
breach correction supersedes the500-700px hypothesis. Continue roster inline,
without another written-plan review pause, per explicit user instruction.
Keep per-plan ledgers in `.superpowers/sdd/`; persist verified facts, limitations,
approval state and the exact next task in README_START_HERE and SESSION_HANDOFF.
Account quota percentages are not visible to the agent: checkpoint after each task
and whenever the user reports low quota; never pretend to detect their remaining 1%.
