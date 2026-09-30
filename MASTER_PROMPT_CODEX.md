# MASTER PROMPT — Build an Original Browser Game Inspired by Death Worm

You are the lead game engineer, technical designer, researcher, and QA owner for this project.

Communicate with me in **Bahasa Indonesia** unless code, API names, commit messages, or technical documentation are clearer in English.

## 0. Mission

Build a polished, original, browser-first 2D action game inspired by the *gameplay feel and systems* of Death Worm, but **do not clone copyrighted expression**.

The target is:
- mechanically faithful to the fun of burrowing, breaching, eating/destroying targets, combos, escalation, upgrades, and survival;
- visually and narratively original;
- expanded with a new asymmetric concept where the player can choose to play as either:
  1. a giant underground worm/monster, or
  2. a human hunter/soldier trying to kill the worm;
- playable directly in a browser;
- **fully playable and responsive on both mobile and desktop**, preserving the fast arcade feel of the reference game while adapting controls/UI to each form factor;
- deployable to **Vercel** and **GitHub Pages**;
- maintainable so future Codex sessions can understand the project without rediscovering everything.

Working title: **Project Sandstrike**. Treat it as a placeholder and do not use "Death Worm" as the final product name.

## 1. Mandatory Reference Research — Do This Before Coding

Study the reference game deeply before implementation. Use browser/web/computer-use tools if available. Do not rely only on memory.

Primary references supplied by the user:
- https://tig.fandom.com/wiki/Death_Worm
- https://play.google.com/store/apps/details?id=com.playcreek.DeathWorm_Free&hl=en

Also inspect, when accessible:
- https://www.tigsource.com/2007/06/27/death-worm/
- https://www.playcreek.com/
- https://www.kongregate.com/en/games/playcreek/death-worm
- current PlayCreek pages, screenshots, trailers, gameplay videos, reviews, and other trustworthy sources that materially clarify mechanics.

### Research rules

1. **Separate versions/eras.**
   Do not merge facts from the 2007 JTR original, the later Flash/PlayCreek version, and the current mobile version as if they are one identical build.
2. Record findings in `docs/REFERENCE_RESEARCH.md`.
3. For every important observation, record:
   - source URL;
   - date checked;
   - version/era;
   - what was directly observed vs inferred;
   - confidence: high / medium / low.
4. If a page/video cannot be accessed, say so. Do not invent missing details.
5. Study:
   - core game loop;
   - controls and movement feel;
   - underground/surface transitions;
   - camera behavior;
   - enemy spawning;
   - enemy escalation;
   - collision/combat;
   - score and combo system;
   - upgrades;
   - power-ups;
   - modes;
   - progression;
   - HUD;
   - menu flow;
   - visual hierarchy;
   - level pacing;
   - difficulty curve;
   - audio/VFX cues;
   - game-over/result flow.
6. Where screenshots or video are accessible, analyze layout, spacing, proportions, timing and interaction patterns — not just text descriptions.
7. Do not copy source code, ripped assets, logos, exact UI artwork, audio, text, character art, level layouts, or trademarked branding.

## 2. IP / Originality Guardrail

We want **mechanical fidelity, not copyrighted-asset fidelity**.

Allowed direction:
- recreate general mechanics such as burrowing, breaching, momentum, combos, pickups, waves, upgrades, hunters, tanks, helicopters, survival;
- reproduce the *type* of game loop and responsiveness;
- use reference dimensions/timing only as research baselines and tune independently.

Do NOT:
- ship the Death Worm name/logo;
- copy its sprites, exact menu artwork, backgrounds, sounds, music, text, or proprietary code;
- reproduce entire levels pixel-for-pixel;
- trace screenshots into final art.

All production assets must be:
- original,
- generated specifically for this project,
- self-created,
- or from a compatible licensed source with attribution/license recorded in `docs/ASSET_LICENSES.md`.

## 3. Recommended Technical Stack

This is a new browser-first 2D project. Prefer:

- **Phaser 4.x** — verify the latest stable compatible version before scaffolding and pin it.
- **TypeScript**
- **Vite**
- npm unless the existing repo already standardizes another package manager.
- Phaser Arcade Physics or a similarly lightweight built-in approach unless research proves another physics model is necessary.
- HTML/CSS only where it materially simplifies menus/accessibility; do not introduce React unless the UI complexity justifies the dependency.
- `localStorage` with a versioned save schema for MVP.
- Vitest for deterministic game-domain logic where practical.
- Playwright for browser smoke tests / navigation / deployment-critical flows.

Do not add a backend for MVP.

Optional later:
- Vercel serverless/Supabase only if the user explicitly approves online leaderboards/cloud accounts.
- PWA/offline install.
- online multiplayer only as a future milestone, not part of initial scope.

## 4. Core Product Design

### 4.1 Character roster — initial target: 5 playable characters

Create **five original characters** across two factions.

Recommended starting roster:

#### Worm faction
1. **Dune Maw** — balanced worm
   - bite
   - breach
   - burst/nitro
   - balanced health/speed

2. **Cinder Wyrm** — offensive worm
   - fire projectile
   - burn trail
   - lower armor
   - high burst damage

3. **Iron Burrower** — tank worm
   - armor shell
   - shockwave breach
   - slower acceleration
   - high survivability

#### Hunter faction
4. **Ranger**
   - rifle
   - grenade
   - dodge
   - target marking

5. **Siegebreaker**
   - heavy weapon / launcher
   - mine
   - temporary shield
   - slower movement

These names are placeholders. Improve them if you can produce something more cohesive and original.

### 4.2 Two-sided gameplay

The key differentiator is role switching.

#### When player chooses a Worm
- player controls the worm;
- humans, soldiers, vehicles, aircraft and special hunters are AI-controlled;
- objective: survive, feed, score combos, destroy military escalation, complete mode objectives.

#### When player chooses a Hunter
- player controls a human combatant on the surface;
- the worm is controlled by a smart AI;
- supporting soldiers/vehicles may also be AI-controlled;
- objective: track, predict, expose, damage and ultimately defeat the worm while protecting key targets.

The hunter mode must not feel like a cosmetic inversion. It should have its own tactical loop:
- read underground warning signs;
- predict breach points;
- reposition;
- deploy traps;
- manage ammunition/cooldowns;
- rescue/protect objectives;
- coordinate with AI allies;
- punish the worm when exposed.

## 5. AI Architecture

Do **not** use an LLM at runtime for NPC behavior.

Use deterministic, inspectable game AI:
- finite state machines for macro behavior;
- utility scoring for action selection;
- steering/prediction for movement;
- seeded randomness where useful.

### Worm AI example states
- RoamUnderground
- AcquireTarget
- Stalk
- Accelerate
- BreachAttack
- ProjectileAttack
- Evade
- Recover
- Reposition

### Hunter AI example states
- Patrol
- Detect
- Track
- TakeCover
- Attack
- DeployTrap
- Evade
- ProtectObjective
- Retreat

Create a debug overlay that can display:
- current AI state;
- chosen utility action;
- target;
- key scores;
- cooldowns;
- path/prediction marker.

This makes balancing and debugging far easier.

## 6. Worm Movement — Highest Priority Game-Feel System

Do not treat the worm as one rigid sprite.

Use a segmented body:
- head;
- N body segments;
- tail.

The head owns authoritative motion. Segments follow historical path samples or another stable follow-path algorithm.

Required qualities:
- smooth turning;
- convincing body curvature;
- momentum;
- underground acceleration;
- strong breach arc;
- satisfying re-entry into terrain;
- stable collision behavior;
- no segment jitter.

Build and tune this as an isolated vertical slice before adding large content.

## 7. World / Environment

Initial environment: an original desert/rocky military frontier, not a copy of Death Worm artwork.

Layering:
- sky/background;
- distant parallax silhouettes;
- surface props/buildings;
- ground line;
- underground stratum;
- particles/debris;
- entities/projectiles;
- foreground effects;
- HUD.

The world may visually show underground space via a stylized cross-section, but do not require expensive destructible-terrain simulation for MVP.

Create environment variants later:
- desert outpost;
- ruined city;
- frozen research zone;
- alien quarantine site.

## 8. Modes

Implement in phases.

### MVP modes
1. **Rampage**
   - player = worm;
   - score/combo survival loop.

2. **Hunt**
   - player = hunter;
   - smart AI worm opponent;
   - timed or objective-based hunt.

### Phase 2
3. **Campaign**
   - mission objectives;
   - escalating enemies;
   - upgrade choices;
   - unlocks.

4. **Survival**
   - endless difficulty escalation;
   - high-score focus.

5. **Challenge**
   - short scenario modifiers.

### Optional later
- mini games;
- boss encounters;
- daily seeded challenge;
- local versus/co-op if technically appropriate.

## 9. Enemy / Threat Escalation

Threats should escalate in readable tiers.

Example:
1. civilians / wildlife / light prey;
2. armed infantry;
3. specialist infantry;
4. light vehicles;
5. tanks;
6. helicopters;
7. aircraft;
8. elite hunters;
9. experimental/alien threats.

For hunter mode, the worm AI should also escalate behavior based on:
- health;
- player success;
- time alive;
- threat density;
- recent player patterns.

Avoid fake difficulty that simply multiplies HP.

## 10. Combat, Score and Combo

Create a shared scoring architecture with faction-specific events.

Worm examples:
- consume target;
- destroy vehicle;
- aerial kill;
- multi-kill;
- breach combo;
- no-damage streak;
- risky high-altitude attack.

Hunter examples:
- worm damage;
- segment break;
- objective protected;
- civilian rescue;
- successful trap;
- interrupted breach;
- worm defeat.

Combo should decay over time and reward chaining different actions, not only repeating one easy target.

Add:
- score popups;
- combo multiplier;
- best score;
- end-of-run summary;
- per-character stats.

MVP persistence:
- local best scores;
- unlocks;
- settings;
- upgrades;
- achievements;
- save version.

## 11. Ability System

Use data-driven abilities.

Every ability should expose a stable interface such as:
- id;
- owner restrictions;
- cooldown;
- resource cost if any;
- activation conditions;
- execution;
- telemetry event;
- VFX/SFX hooks.

Avoid giant switch statements tied to specific characters.

## 12. Menu / UX Flow

Target:

Boot
→ Preload
→ Title
→ Main Menu
   - Play
   - Character
   - Upgrades
   - Achievements
   - How to Play
   - Settings
   - Credits
→ Mode Select
→ Character Select
→ Loadout / Ability Preview
→ Game
→ Pause
→ Results
→ progression/unlocks

Add a clear role indicator:
- WORM
- HUNTER

Support from the beginning:
- **desktop:** keyboard + mouse;
- **mobile:** touch controls designed specifically for phones/tablets, not a tiny desktop UI squeezed onto a small screen;
- gamepad where practical;
- landscape-first gameplay, with a graceful orientation message or portrait fallback where necessary;
- responsive scaling for canvas, HUD, menus, buttons, typography, safe areas, notches and varied aspect ratios;
- input abstraction so gameplay logic does not care whether actions come from keyboard, mouse, touch or gamepad.

Mobile controls should be tuned for the same actions as desktop:
- directional / steering control;
- attack;
- ability buttons;
- boost/dash;
- pause;
- context-sensitive interaction where needed.

Do not allow touch controls to obscure important gameplay space. Use adaptive layouts for small screens.

Menus should capture the *clarity and arcade immediacy* of the reference, but use original visual design.

## 12.1 Cross-Platform Responsive Design

Treat desktop and mobile as first-class targets.

### Desktop
- landscape layout;
- keyboard-first controls with clear remapping potential;
- mouse support for menus and optional aiming where appropriate;
- scalable UI for common 16:9, 16:10 and ultrawide viewports.

### Mobile / Tablet
- landscape-first gameplay;
- adaptive virtual joystick / directional control;
- large touch-safe action buttons;
- respect CSS safe-area insets;
- support common mobile aspect ratios without cropping essential gameplay;
- pause/resume correctly when browser visibility changes or the device interrupts the session;
- prevent accidental page scrolling/zoom gestures during active gameplay where appropriate;
- keep menus usable with one-handed taps where practical;
- maintain readable text and minimum touch target sizing.

### Shared
- use one game simulation, not separate mobile and desktop codebases;
- isolate input mapping behind a shared action layer;
- test at representative desktop and phone viewport sizes;
- dynamically adjust HUD placement and control overlays;
- preserve gameplay camera/world proportions as much as possible rather than stretching the scene.

## 13. Art Strategy

Do not block engineering on final art.

Stage 1:
- procedural shapes / simple original placeholders;
- clean silhouettes;
- readable hitboxes.

Stage 2:
- original sprites;
- segmented worm pieces;
- hunter animation sheets;
- vehicles;
- VFX;
- environment layers.

Keep logical hitboxes separate from visual sprite dimensions.

If external/generative assets are introduced, record:
- source;
- license/usage rights;
- prompt/tool if generated;
- any attribution needed.

## 14. Architecture

Prefer focused modules, not god classes.

Suggested structure:

```text
src/
  game/
    config/
    scenes/
    entities/
      worms/
      hunters/
      enemies/
      vehicles/
    ai/
      states/
      utility/
      steering/
    abilities/
    systems/
      combat/
      score/
      spawn/
      progression/
      save/
      audio/
      input/
    ui/
    data/
    debug/
    utils/
  main.ts
```

Use data/config files for:
- characters;
- enemy definitions;
- upgrades;
- abilities;
- mode configuration;
- balancing constants.

Do not hard-code balancing values across scene classes.

## 15. Persistent Project Memory

Create and maintain these files:

- `AGENTS.md` — permanent operating instructions.
- `docs/REFERENCE_RESEARCH.md` — observations from Death Worm and related sources.
- `docs/GAME_DESIGN.md` — current accepted game design.
- `docs/ARCHITECTURE.md` — system/module design.
- `docs/DECISIONS.md` — architectural/design decision log.
- `docs/ASSET_LICENSES.md` — asset provenance/licenses.
- `docs/BALANCE.md` — tunable values and rationale.
- `docs/CHANGELOG.md` — meaningful changes.

Before any substantial new task:
1. read `AGENTS.md`;
2. read relevant docs above;
3. inspect existing code;
4. do not rediscover decisions already documented;
5. update docs when the implementation changes the design.

## 16. Development Method

If the Superpowers skills are available, use them appropriately:
- brainstorming for new systems;
- writing-plans for architectural work;
- test-driven-development for implementable behavior;
- systematic-debugging for failures;
- verification-before-completion before claiming success.

Do not blindly modify the entire repository.

For every milestone:
1. state scope;
2. inspect existing project;
3. write/update design if needed;
4. implement smallest playable increment;
5. test;
6. run the game in browser;
7. inspect actual behavior visually;
8. fix regressions;
9. update docs.

## 17. Testing / Quality Gates

Before claiming a milestone complete, run the applicable checks:

- lint;
- TypeScript typecheck;
- unit tests;
- production build;
- browser smoke test;
- manual visual/gameplay check;
- console error check.

Test deterministic systems such as:
- scoring;
- combo decay;
- upgrade calculations;
- save migration;
- AI state transitions;
- cooldowns;
- spawn progression.

For browser tests verify at minimum:
- app loads;
- main menu renders;
- game starts;
- no fatal console errors;
- pause/resume works;
- results flow works;
- save reload works;
- desktop controls work;
- touch/mobile controls work;
- representative desktop and mobile viewport layouts do not overlap or clip critical UI;
- resizing/orientation changes are handled safely.

## 18. Deployment

Keep the MVP compatible with both:
- Vercel static deployment;
- GitHub Pages.

Requirements:
- no server dependency;
- no absolute local filesystem assumptions;
- correct Vite base-path handling for GitHub Pages;
- production build must work from `dist/`.

Create deployment instructions in the README.

## 19. Performance Targets

Target smooth browser gameplay on both a normal laptop/desktop and a modern phone/tablet. Mobile performance is a core requirement, not an optional afterthought.

Use:
- object pooling for frequent projectiles/particles;
- capped particle counts;
- conservative physics bodies;
- asset atlases where useful;
- no unnecessary per-frame allocations;
- spatial filtering if entity count grows.

Measure before optimizing prematurely.

## 20. First Execution Sequence

Do NOT begin by implementing the whole game.

### Phase A — Research + specification
1. Inspect the supplied references and additional trustworthy sources.
2. Fill `docs/REFERENCE_RESEARCH.md`.
3. Compare the original 2007 concept, later Flash build, and current mobile version.
4. Extract the core feel/mechanics we want.
5. Create/update `docs/GAME_DESIGN.md`.
6. Create `docs/ARCHITECTURE.md`.
7. Present a concise research/design summary to me and identify uncertainties.

### Phase B — Vertical slice
After approval:
1. scaffold Phaser 4 + TypeScript + Vite;
2. build one original desert arena;
3. implement one segmented worm;
4. implement underground movement + breach;
5. add one prey target;
6. add one armed enemy;
7. add score/combo;
8. add basic HUD;
9. add pause/restart;
10. verify production build.

Do not move to five characters before the vertical slice feels good.

### Phase C — Two-sided prototype
1. add Ranger hunter;
2. add Worm AI;
3. add Hunt mode;
4. tune prediction/traps/combat;
5. add AI debug overlay.

### Phase D — Content + progression
Then expand roster, modes, upgrades, environments, achievements, polish and deployment.

## 20.1 Creative Freedom / Agent Initiative

You are explicitly allowed to propose and add **original features that materially improve the game**, provided they:
- fit the core Worm-vs-Hunter fantasy;
- do not dilute the arcade pacing;
- remain feasible for a browser-first project;
- do not introduce unnecessary backend/runtime cost;
- are documented before large implementation;
- are clearly marked as original additions rather than features copied from Death Worm.

You should actively look for opportunities to improve:
- replayability;
- risk/reward decisions;
- enemy variety;
- character identity;
- progression;
- feedback/juice;
- AI behaviors;
- mobile usability;
- accessibility;
- challenge modes.

Examples of acceptable original additions:
- dynamic weather or sandstorm modifiers;
- boss hunters / boss worms;
- destructible mission objectives;
- environmental hazards;
- combo mutations / temporary evolutions;
- procedural challenge modifiers;
- bounty targets;
- rescue/escort objectives for hunters;
- worm scent/noise tracking systems;
- underground sonar/radar tools for hunters;
- rage/evolution meter for worms;
- character-specific passive traits;
- difficulty mutators;
- daily seeded challenges without requiring a backend;
- unlockable cosmetic variants created with original assets;
- local achievement chains;
- smarter adaptive encounter composition.

Do **not** add features merely because they are possible. Prefer additions that make the core loop deeper, clearer or more replayable.

For any substantial new feature:
1. explain the player value;
2. explain the implementation cost/risk;
3. show how it fits the existing architecture;
4. add it to `docs/GAME_DESIGN.md` / `docs/DECISIONS.md`;
5. get approval before major scope expansion.

## 21. Completion Standard

The project is not "done" because it compiles.

Success means:
- worm movement is satisfying;
- both Worm and Hunter roles are genuinely playable;
- AI creates meaningful opposition;
- menu/progression flow is coherent;
- score/combo works;
- five characters have distinct identities;
- no copyrighted Death Worm assets are shipped;
- production build works;
- deployment works;
- docs are current;
- tests and browser checks pass.

Start with **Phase A only**.

Do the research first, update the persistent documentation, then return to me with:
1. what you verified;
2. what differs across Death Worm versions;
3. the mechanics worth preserving;
4. what we should deliberately change;
5. proposed final MVP scope;
6. technical risks;
7. questions that truly require my decision.

Do not scaffold or code the game until that research/design checkpoint is reviewed.
