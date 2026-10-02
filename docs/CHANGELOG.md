# CHANGELOG

## Unreleased

- Playtest fixes: allied soldiers now escort the Hunter (spawning beside them,
  regrouping when left behind, climbing with them) instead of drifting off camera,
  and their tracers start at the drawn muzzle. Weapon and allied fire plus all ten
  skills are now audible with distinct voices, and firing shows a muzzle flash and
  a tracer along the real shot path. Aim assist no longer redirects shots outside a
  tight 6-degree cone, so the arm, the muzzle and the bullet agree. The worm hunts
  by seismic bearing, leads the Hunter's movement, keeps away from the surface
  between attacks and re-acquires immediately after a breach, so crossings arrive
  on target with a clear warning. RPG damage raised to 200 and a breach costs the
  Hunter half as much, keeping full runs in the 6-7 minute band.

- Alternating industrial catwalk climb with route cues, recovery supplies and a
  stronger3600HP boss; normal seed33 runs finish around5:46-6:03 without a timer.
- Hunter contact recovery/dodge protection prevent frame-by-frame damage; first
  rooftop RPG pickup restores living health once. Engineer leaves its decoy behind.
- Original menu artwork, articulated armored worm jaws, detailed Hunter limbs,
  tower supports, ambient dust/snow, summit progress and accessible boss health bar.

- Ten original playable characters with distinct silhouettes, active skills and five
  Hunter weapons; animated jaws, armor/fins, articulated walk/jump/aim/reload and
  visible skill effects. Character/environment selections persist through retry/reload.
- Save schema3 preserves historical scores in legacyRecords and separates revised
  records with immutable character/theme/version ownership; old/future protections remain.
- Player worm breaches now follow ballistic gravity even while holding upward steer;
  compact building-height arcs replace the floaty oversized jumps. Hunt tower AI
  has its own movement profile.
- Corrected rising-surface clipping/tracking/shot contacts, lethal same-tick boss
  collisions, buried allied support and Engineer decoy targeting after the first minute.
  RPG takes priority while loaded; starting firearm can fire during its reload.
  Objective HUD separates summit/boss cues, and the rooftop RPG crate is marked.


- Summit boss fight: reaching the summit freezes the rising hazard, cancels any
  pending worm return and introduces one warned 3600 HP armored boss (visual
  presence enlarged, logical hitboxes unchanged) with a windup/3s-immunity
  cycle. The rooftop crate hands the player a high-damage RPG (80 damage, two
  rockets, finite cadence) and restocks it so a missed shot never removes the win
  path. A boss defeat wins the run once; a normal worm kill still does not win.
  HUD adds a boss bar, shield state, height/hazard gap and RPG readiness.
- Ascent support: two survivor allies and one helicopter join Hunt with original
  friendly silhouettes, animated rotors and visible aiming lines. Ground allies
  climb toward platforms above the rising hazard and only fire at exposed worm
  regions they can see; the helicopter patrols at a fixed altitude over the sand.
  Populations are capped and replaced on a cadence, allies can damage exposed
  worms, and they never damage the player or take objectives.
- Ascent pursuit: an ordinary worm kill (HP 0) removes it for 600 ticks while the
  Hunt keeps running, then a stronger worm returns at the hazard line with fresh
  health, followers and per-life AI. Recovery shortens from 120 to 48 ticks over
  five generations (capped); the AI senses and attacks relative to the rising
  surface and projects the same future surface when forecasting breaches. The HUD
  shows the return countdown, generation and kill count.
- Hunt is now the survival ascent: a vertical Hunter (run, jump, one-way ledge
  landing, drop-through) climbs an authored outpost route while the hazard surface
  rises from the base toward the summit. Sand does not lift a buried Hunter; after
  a visible grace window burial deals escalating damage. Relay-defense Hunt stays
  available only as historical fixtures (`hunt-relay`, `hunt-victory`, `hunt-trap`,
  `hunter-defeat`, `relay-defeat`). Controls: A/D move, Space or W jump, S drop
  through, mouse fire, Q skill, Shift dodge, R reload; touch gains a Jump button.

- Survival revision foundation: viewport-bound compact menus with a real
  environment choice (desert outpost, urban ruins, frozen facility) that is frozen
  per run and retained on retry. Original per-theme palettes/structures render
  through the world renderer without changing shared physics.
- Revised Rampage uses an arcade worm profile (higher turn authority, cruise and
  breach height) and automatic mouth feeding: prey/actors contacted by the swept
  forward mouth are consumed once, while body brushing does not feed. Manual Bite
  is replaced by the Space/RT/touch **Sandguard** skill (3s immunity, 20s cooldown)
  with visible shield feedback; all earlier laboratory fixtures keep legacy physics.

- Added seeded infantry, telegraphs, swept pooled projectiles, typed scoring and
  combo, legal spawn caps, arena bounds, and response bands 0–1.
- Added original animated procedural actors, capped combat effects, generated
  gesture-unlocked tones, and a semantic responsive HUD with presentation settings.
- Landscape play fills the viewport. Five desktop/touch layout checks pass;
  menu, run confirmation, immutable Results and retry are now implemented.
- Added versioned local best scores and settings, strict validation, valid-save
  backup recovery and memory fallback for unavailable or incompatible storage.
- Added combined combat/defeat browser smoke and read-only performance evidence.
  Production builds remove the test bridge and remain static-host compatible.

- Initialized persistent research/design documentation.
- Defined browser-first Worm-vs-Hunter concept.
- Corrected the reference chronology and separated the 2006–07 JTR lineage,
  2011 Flash release, and current mobile product in the evidence ledger.
- Defined the staged two-role MVP, detailed Rampage and Hunt loops, responsive
  controls/HUD, accessibility, acceptance gates, and post-MVP boundaries.
- Added the Phase A architecture for deterministic domain logic, segmented worm
  path history, observable AI, versioned saves, static deployment, and testing.
- Recorded the accepted MVP decisions and introduced a persistent session
  handoff protocol.
- Marked the Phase A game-design and architecture specifications as user-approved.
- Added the self-reviewed Phase B implementation plan set for the browser
  foundation, worm-movement gate, and Rampage vertical slice, with ordered TDD,
  review, verification, documentation, and persistent handoff steps.
- Pinned the Phaser 4.2.1, TypeScript, Vite, Vitest, and Playwright toolchain and
  added root/GitHub Pages static-host builds with production smoke coverage.
- Added an accessible Phaser application shell with retry-safe boot, one canvas,
  deterministic fixed-step simulation, semantic keyboard/touch/gamepad input,
  and an E2E-only diagnostics bridge.
- Added the first procedural 14-segment worm with momentum, rate-limited turning,
  Burst, ballistic breach/re-entry phases, bounded path-history following,
  velocity-aware camera tracking, and debug visualization.
- Added interruption-safe pause/resume behavior, portrait protection, independent
  multi-touch controls, safe-area-aware responsive layout, and full-viewport
  mobile/tablet landscape play.
- Passed the Phase B movement-feel gate across desktop and representative
  915x412, 844x390, and 1024x768 touch layouts; recorded a GO decision for the
  Rampage vertical slice in `docs/BALANCE.md`.

## 2026-10-02 - Playable Ranger Hunt
- Added original Ranger movement/dodge, six-round rifle, Seismic Snare and relay defense.
- Added seeded worm AI with broad tremors, committed breach-sector warnings and temporary snare reveal.
- Activated Hunt selection, role HUD/Results, mouse aiming and independent touch Fire/Aim, Snare and Dodge.
- Save v2 retains legacy Rampage records/preferences and adds Hunt records/victories.
- Fixed WebGL surface rendering through clipped polygons; ordinary Hunt hides buried poses.
- Phase C also completes vehicle/aerial pressure and response bands 2-3 with individual warnings, caps and compatible records.

- Corrected AI approach depth and predicted crossing sectors so natural Hunt
  breaches receive a complete warning and stay inside the marked sector.

## Playtest correction 2026-10-02

- Reduced player breaches to building height and prevented upward air steering
  from cancelling gravity; retained tower-reaching Hunt boss attacks.

## Latest usability correction (2026-10-02)
- Debug is opt-in in development for both roles. Ordinary play hides debug panels,
 floating combat/tremor labels, technical counters and the recurring controls banner.
 Essential health, ammo, skill, objective and boss meter remain visible.
