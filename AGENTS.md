# AGENTS.md — Project Sandstrike

## Mission

Build and maintain an original browser-first 2D action game inspired by the *mechanical feel* of underground giant-worm arcade games, with a major asymmetric addition: the player can play as either the monster or a human hunter.

The game must be a **first-class experience on both desktop and mobile**. Desktop and touch controls should feed the same gameplay action layer, while UI/HUD layouts adapt responsively.

This repository must remain deployable to Vercel and GitHub Pages.

## Communication

- Communicate progress and decisions to the user in Bahasa Indonesia.
- Keep source code, identifiers, API names and technical comments concise and conventional.
- Do not hide uncertainty. Distinguish verified facts from inference.

## Source of Truth

Before substantial work, read:
1. `AGENTS.md`
2. `docs/REFERENCE_RESEARCH.md`
3. `docs/GAME_DESIGN.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DECISIONS.md`
6. relevant source files/tests

Do not re-derive settled decisions unless new evidence requires revision.

## Reference Research

Primary reference URLs:
- https://tig.fandom.com/wiki/Death_Worm
- https://play.google.com/store/apps/details?id=com.playcreek.DeathWorm_Free&hl=en

Secondary references may include official PlayCreek pages, TIGSource, Kongregate, trailers, screenshots, videos and trustworthy archival material.

Always separate:
- 2007 JTR original;
- later Flash/PlayCreek implementations;
- current PlayCreek mobile game.

For important reference claims, update `docs/REFERENCE_RESEARCH.md` with URL, date, era/version, evidence type and confidence.

## IP / Asset Rules

This is an original game, not a distributable clone.

Never ship:
- Death Worm branding/logo;
- ripped sprites;
- copied UI artwork;
- original audio/music;
- copied text;
- proprietary code;
- pixel-for-pixel levels.

General game mechanics may be studied and reimplemented with original code and original presentation.

All external assets require provenance in `docs/ASSET_LICENSES.md`.

## Stack

Preferred baseline:
- Phaser 4.x stable version, verified before setup and pinned
- TypeScript
- Vite
- npm unless repo already standardizes something else
- localStorage with versioned schema for MVP
- Vitest for deterministic domain logic
- Playwright for browser smoke checks

Avoid React unless DOM-heavy UI complexity clearly justifies it.
Avoid a backend in MVP.

## Architecture Principles

- Small focused modules.
- No god scenes/classes.
- Data-drive characters, enemies, abilities and balancing values.
- Separate game-domain logic from rendering where practical.
- Separate logical hitboxes from sprite dimensions.
- Prefer stable interfaces over cross-module imports into internals.

## Game AI

No LLM calls at runtime.

Use:
- finite state machines;
- utility AI;
- steering/prediction;
- seeded randomness where useful.

Keep AI observable through debug tools.

## Worm Movement

Treat segmented worm locomotion as a first-class system.
The head owns motion; body follows a stable path/history system.
Prioritize feel, smooth curvature, momentum, breach/re-entry and collision stability.

Do not add large amounts of content before movement is convincing.

## Cross-Platform Input / Responsive Design

- Desktop and mobile are both release targets.
- Prefer one simulation and one gameplay codepath.
- Abstract actions such as move, attack, ability, boost and pause away from physical input devices.
- Desktop: keyboard/mouse, gamepad where practical.
- Mobile/tablet: landscape-first touch controls with safe-area-aware adaptive placement.
- Do not shrink the desktop HUD blindly onto mobile.
- Test multiple viewport sizes and orientation changes.
- Avoid browser scroll/zoom conflicts during active touch gameplay.
- Pause safely on visibility interruptions.

## Two-Sided Design

Both roles must be real games:

### Worm role
Burrow, hunt, breach, destroy, chain combos, survive escalating opposition.

### Hunter role
Track underground movement, predict breaches, reposition, trap, shoot, protect objectives and defeat an AI worm.

Hunter mode must not be a reskin of worm mode.

## Persistent Documentation

Maintain:
- `docs/REFERENCE_RESEARCH.md`
- `docs/GAME_DESIGN.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/ASSET_LICENSES.md`
- `docs/BALANCE.md`
- `docs/CHANGELOG.md`

When behavior/design changes, update the relevant document in the same task.

## Update Protocol

When starting a later Codex session:
1. read the docs above;
2. inspect recent commits/diff;
3. identify the exact requested change;
4. reuse existing systems where appropriate;
5. avoid rebuilding already-working systems;
6. document material decisions.

When a reference source changes:
1. append a dated research entry;
2. describe what changed;
3. decide whether the change should influence this game;
4. never automatically copy new reference content.

## Development Workflow

For architectural work:
- research;
- design;
- plan;
- then implement.

For implementation:
- smallest playable increment first;
- test deterministic logic;
- run the actual browser build;
- inspect console;
- visually verify behavior;
- fix before expanding scope.

If Superpowers skills are available, use the relevant workflow:
- brainstorming
- writing-plans
- test-driven-development
- systematic-debugging
- requesting-code-review
- verification-before-completion

## Verification

Never claim completion without evidence.

Run applicable:
- lint
- typecheck
- tests
- production build
- Playwright smoke test
- browser/manual gameplay check
- desktop input check
- touch/mobile input check
- representative desktop/mobile viewport check
- console error inspection

Report what was actually run and any remaining limitations.

## Git / Change Discipline

- Keep commits/task changes focused.
- Do not mass-refactor unrelated code.
- Do not delete working systems just to rewrite them in a preferred style.
- Prefer explicit migrations for saved data.
- Update changelog for meaningful player-visible changes.

## Creative Initiative

You may propose original features that improve replayability, game feel, role asymmetry, AI, progression, accessibility or mobile usability.

For substantial additions:
- explain player value and scope;
- avoid feature creep;
- document the design/decision;
- get approval before major expansion.

Do not copy proprietary expression from the reference game.

## Deployment Constraints

MVP must remain static-host compatible:
- Vercel
- GitHub Pages

No mandatory server runtime.
Handle Vite base paths correctly.
`npm run build` must produce a usable `dist/`.

## Definition of Done

A feature is done only when:
- behavior works in the actual game;
- deterministic logic has tests where appropriate;
- no fatal console errors;
- production build passes;
- docs are updated;
- visual/gameplay behavior has been checked;
- known limitations are stated.
