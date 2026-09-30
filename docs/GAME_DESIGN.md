# GAME DESIGN — Project Sandstrike (Initial Draft)

Status: bootstrap draft; Codex must refine after reference research.

## High Concept

A fast 2D browser arcade-action game where the same ecosystem can be experienced from two opposing roles:

- **Worm:** hunt from underground, breach violently, eat/destroy targets, chain combos and survive escalating military response.
- **Hunter:** read signs of underground movement, predict the monster, deploy traps and weapons, protect objectives and kill the AI worm.

The design takes inspiration from the underground-monster arcade loop of Death Worm while using original code, characters, art, audio, environments, menus and progression.

## Pillars

1. **Movement feels good before content gets large.**
2. **Breaching the surface is the signature moment.**
3. **The world reacts and escalates.**
4. **Worm and Hunter are meaningfully different roles.**
5. **Short runs create strong replayability.**
6. **Browser-first: instant start, low friction.**
7. **Desktop and mobile are equally valid ways to play.**
8. **Original additions are encouraged when they deepen the core loop rather than bloat it.**

## Initial Playable Roster

### Worms
- Dune Maw — balanced
- Cinder Wyrm — projectile/burst
- Iron Burrower — tank/shockwave

### Hunters
- Ranger — mobile rifle/trap specialist
- Siegebreaker — heavy weapons/defense

Names are placeholders.

## MVP

### Rampage
Player = worm.
One desert arena.
Targets escalate from prey → infantry → vehicles → air threats.
Score + combo + survival loop.
One worm character for first vertical slice.

### Hunt
Player = Ranger.
AI worm is the primary enemy.
Player tracks breach indicators, damages the worm, deploys one trap and survives counterattacks.

## Progression

MVP:
- local best score;
- local unlock flags;
- settings;
- basic upgrades;
- achievements.

No account/backend required.

## Combat Principles

- readable telegraphs;
- short feedback loops;
- hitstop/impact effects used carefully;
- combo rewards variety and risk;
- avoid HP sponge difficulty.

## AI

Runtime AI is FSM + utility scoring + prediction, not LLM-based.

Debug overlay must expose decisions to make balancing tractable.

## Environments

First:
- original desert military frontier.

Later:
- ruined city;
- frozen research zone;
- alien quarantine site.

## Non-goals for MVP

- online multiplayer;
- account system;
- global leaderboard;
- destructible voxel terrain;
- large campaign;
- five fully polished characters before movement/AI vertical slice is proven.

## Success Criteria for Vertical Slice

A new player should be able to:
- understand movement quickly;
- feel momentum underground;
- intentionally breach and hit a target;
- see strong impact feedback;
- build a combo;
- encounter an armed threat;
- die/restart cleanly;
- want to play one more run.

The production build must work on Vercel/GitHub Pages-compatible static hosting.


## Cross-Platform UX

### Desktop
- keyboard/mouse primary input;
- optional gamepad;
- adaptive HUD for widescreen and ultrawide.

### Mobile / Tablet
- landscape-first;
- virtual steering control;
- large touch-safe ability buttons;
- safe-area-aware HUD;
- no critical controls under notches/browser chrome;
- pause/resume on visibility interruption;
- adaptive layout instead of a scaled-down desktop UI.

Both platforms share the same gameplay simulation through an input action abstraction.

## Original Feature Backlog

Codex is encouraged to evaluate original additions such as:
- sandstorms / weather modifiers;
- boss encounters;
- hunter sonar / tracking tools;
- worm rage/evolution meter;
- environmental hazards;
- bounty targets;
- escort/rescue hunter objectives;
- challenge mutators;
- seeded daily-style challenges without backend dependency;
- character passives;
- alternate ability loadouts;
- adaptive encounter composition.

These are ideas, not mandatory scope. Any large addition must prove player value and fit the project's performance/scope constraints.
