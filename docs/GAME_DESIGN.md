# GAME DESIGN — Project Sandstrike

Status: **Phase A specification approved by the user on 2026-10-01.**

Implementation checkpoint (2026-10-02): Phase B and the Phase C two-role prototype
are implemented. Actual evidence and remaining release gates are recorded in
`docs/PHASE_C_VERIFICATION.md`; provisional feel/performance targets remain pending.

Survival revision checkpoint (2026-10-02): the user-approved redesign in
`docs/superpowers/specs/2026-10-02-sandstrike-survival-redesign.md` supersedes the
relay-defense Hunt objective. Implemented so far: compact multi-theme menus, the
arcade worm profile with automatic mouth feeding and Sandguard, the vertical Hunter
ascent with a rising hazard and platforms, 10-second escalating worm returns, two
allied survivors plus a support helicopter, and the summit boss fight with the
objective RPG. Sections of this document describing relay defense as Hunt's main
objective are now historical fixture behaviour, not the default mode. The ten-kit
roster, character selection and save v3 record migration are implemented. Latest
evidence and remaining human/device gates are in SURVIVAL_VERIFICATION.md.

Project Sandstrike is a working title.

Evidence boundary: verified reference observations, confidence, and access limits
live in `docs/REFERENCE_RESEARCH.md`. This document contains original Sandstrike
design decisions derived from that research; it does not turn an inference into a
reference fact. Values explicitly labeled provisional remain prototype hypotheses.

## 1. Product statement

Project Sandstrike is a browser-first 2D arcade action game set in an original
desert frontier. The same conflict is playable from two mechanically different
roles:

- **Worm:** shape a high-momentum path underground, breach through targets,
  sustain through aggressive play, chain varied destruction, and survive an
  escalating response.
- **Hunter:** climb above the rising hazard with allied support, survive escalating
  worm returns, acquire the summit RPG and defeat the boss.

The revised playable prototype contains one shared route, three themes, five worms,
five Hunters with unique skills, and two modes:
**Rampage** and **Hunt**. It is complete only when both roles are playable. The
worm-only vertical slice is an earlier validation milestone, not the finished
MVP.

Reference games inform movement, pacing, and risk/reward. Sandstrike must use
original names, fiction, code, visual design, audio, text, level composition,
characters, abilities, and balance values.

## 2. Design goals

1. Make underground momentum and a well-aimed breach enjoyable before adding
   broad content.
2. Make Hunter a prediction and protection game rather than a reskinned Worm
   mode.
3. Deliver short runs with immediate restarts and a clear arc from opportunity
   to escalating danger.
4. Give players enough information to make deliberate decisions while keeping
   the worm's exact underground position uncertain in Hunt.
5. Make desktop, touch, and gamepad valid ways to play through the same gameplay
   action vocabulary and simulation.
6. Keep the MVP fully local, static-host compatible, and understandable without
   an account, economy, or live service.
7. Keep impact readable and satisfying while allowing players to reduce motion,
   shake, flashes, and haptics.

## 3. MVP non-goals

The following are outside the two-role MVP:

- a campaign or large mission catalogue (the approved roster/themes/boss are in scope);
- permanent power upgrades, currencies, battle passes, or a broad achievement
  system;
- online accounts, cloud saves, global leaderboards, telemetry services, or a
  mandatory backend;
- multiplayer or cooperative play;
- fully deformable or voxel terrain;
- a large inventory, loadout system, crafting, or loot;
- exact reproduction of any reference game's controls, art, UI, level layout,
  wording, audio, progression, or numerical balance;
- runtime LLM calls for NPC behavior.

Cosmetics, additional characters, Campaign, Survival, challenge modifiers, and
deeper metaprogression remain candidates for post-MVP work only after movement
and Hunter AI are validated.

## 4. Core pillars

### 4.1 Path-shaped power

The worm does not trigger a scripted breach attack. The player builds speed,
chooses an approach angle, crosses the surface, and lives with the resulting
air arc and re-entry. Turning remains smooth and rate-limited; input cannot snap
the head instantly to a new direction.

### 4.2 Read, commit, counter

Every strong action creates a readable commitment. A fast worm gains impact but
becomes easier to predict near the surface. A hunter who places a trap can create
an attack window but gives up position and trap availability. Success comes from
reading intent and acting before the payoff moment.

### 4.3 Escalation as world response

The arena reacts to player success. Rampage moves from vulnerable targets to
threats with new attack patterns and spatial pressure. Hunt makes the AI worm
more urgent and less predictable without bypassing its movement rules. Higher
difficulty should change decisions and combinations before it adds health.

### 4.4 Distinct role knowledge

Worm players see their underground body and immediate path clearly. Hunter
players receive surface deformation, sound, dust, and prediction cues instead
of the worm's exact position. A developer-only AI overlay may reveal hidden
state, but normal Hunt runs may not depend on it.

### 4.5 Fast, legible runs

The player reaches the chosen mode quickly, understands the current objective,
and can restart from Results without repeating onboarding. UI and effects must
clarify the next decision rather than compete with the playfield.

## 5. MVP content boundary

| Area | MVP commitment | Deferred |
|---|---|---|
| Arena | One original desert military frontier with surface and underground strata | Ruined city, frozen zone, alien/quarantine zone, procedural arenas |
| Playable Worm | One balanced segmented worm, working name **Dune Maw** | Offensive and armored worms; final roster naming |
| Playable Hunter | One mobile rifle specialist, working name **Ranger** | Heavy hunter and alternate loadouts |
| Modes | Rampage and Hunt | Campaign, Survival variants, Challenge, mini-games |
| Rampage targets | Hunt five Hunter bots up the rising-sand tower; carrion is the only healing | Large enemy catalogue, elite hunters, bosses |
| Hunt opposition | One observable AI worm and one protected surface objective | Allied squads, multiple worms, escorts, rescue missions |
| Worm kit | Steering/thrust, bite/impact, and short burst | Projectiles, elemental trails, evolution trees |
| Hunter kit | Rifle, dodge, and one Seismic Snare | Grenades, shields, alternate traps, weapon inventory |
| Persistence | Versioned local settings, onboarding flags, and per-mode records | Currency, power progression, account/cloud sync |

Names and fiction in this table are placeholders. They do not authorize copied
visual expression from reference material.

## 6. World and presentation

The arena is a side-view cross-section with a strong, stable ground line:

1. distant sky and silhouettes;
2. surface props and protected structures;
3. ground line and readable surface lane;
4. layered underground strata;
5. actors, projectiles, particles, and temporary impact marks;
6. foreground effects;
7. HUD and touch controls.

Terrain may react with dust, cracks, decals, loose rocks, and short-lived impact
effects. These reactions are presentation and lightweight interactions; the MVP
does not require persistent terrain carving or a destructible-terrain solver.

The surface must remain visually identifiable during ordinary play. Background
detail cannot obscure targets, telegraphs, the worm silhouette, the Hunter, or
the Seismic Snare radius. Each threat class needs a distinct silhouette and
attack cue before polished art is introduced.

## 7. Rampage mode

### 7.1 Player promise

The player feels like a massive creature whose route, speed, and exit angle turn
terrain traversal into an attack. Aggression provides score and limited sustain,
but repeated breaches expose the worm to increasingly capable counters.

### 7.2 Run loop

1. **Read:** identify target clusters, incoming threats, health needs, and a safe
   re-entry route.
2. **Build:** dive or travel underground to gain speed and shape an approach.
3. **Commit:** accelerate toward the surface and choose an exit angle.
4. **Breach:** bite or collide with targets; the trajectory continues through
   the air with limited steering.
5. **Chain:** strike another target, launch a physical object into a threat, or
   re-enter quickly enough to preserve the combo.
6. **Recover:** regain underground control, choose between prey for health and
   dangerous targets for score, then respond to the next threat tier.

The loop repeats until the worm is defeated or the player ends the run.

### 7.2b Rampage today: hunting the five (2026-10-02)

Rampage is the mirror of the Hunter mode instead of an endless arena chase. The
worm burrows inside the same rising sand the Hunter climbs, and the sand is what
lifts its reach, so the two modes lean on one ascent language from opposite sides.

- Five Hunter bots (the existing Hunter kits) deploy one at a time as the sand
  climbs; at most two are on the field at once so the pressure stays readable.
- Each rival races for the rooftop crate. Reaching it arms the objective weapon,
  which is the real threat: slower, heavier rounds that punish a stalled worm.
- The worm's only healing is carrion drifting in the sand - it must surface, eat and
  dive again, which is exactly when the rivals get their shots.
- Defeating all five wins the run; running out of health loses it.
- Rivals only shoot at a worm that is out of the sand, so diving is a reliable
  escape, and they keep climbing while the sand closes in rather than standing still.

The older endless arena loop (prey for health, response bands, score chase) is still
available as the classic arena option and is not part of the intended Rampage pitch.

### 7.3 Worm movement rules

- The head owns motion; the body visually follows a stable path without changing
  collision outcomes independently.
- Input expresses steering and thrust intent. Rotation remains continuous and
  bounded by the worm's current state and speed.
- Underground travel provides the most reliable acceleration and turning.
- The short Burst increases commitment and speed; it cannot cancel a poor angle.
- A Burst held *with an upward steer* is a leap instead of a sprint: it converts the
  climb into a strong vertical launch so the worm can leave the ground, reach above
  the surface and strike air targets. The leap is intent-based, so a player who
  steers up and bursts gets height whether they pressed it underground or in the
  air; the campaign (Hunt) pursuit worm keeps Burst as a pure sprint.
- Crossing the ground line emerges from movement. There is no contextual
  "breach" button.
- Air control is weaker than underground control but is not zero.
- Re-entry preserves enough momentum to continue a skilled chain and must not
  produce a long input lock.
- Surface skimming is allowed when physically readable, but it should not become
  the safest dominant strategy.

### 7.4 Worm combat and sustain

- **Bite:** a short active attack around the head for small biological targets
  and precise exposed hits.
- **Impact:** speed and approach angle influence collisions with vehicles,
  structures, and airborne targets.
- **Burst:** a short mobility action governed by a visible cooldown or resource;
  it improves speed, not invulnerability. Steered upward it becomes the leap that
  lets the worm leave the surface far enough to reach and bite air targets.
- Consuming designated biological prey restores a small amount of health.
- Armored threats provide more score and escalation pressure but no routine
  healing.
- The body is dangerous to contact where clearly telegraphed, but body segments
  do not generate accidental full-damage hits merely by jittering through a
  target.

### 7.5 Threat escalation

Rampage uses four MVP response bands:

| Band | Purpose | Example pressure |
|---|---|---|
| 0 — Opportunity | Teach steering, bite, and breach | Desert fauna and non-aggressive targets |
| 1 — Pursuit | Introduce readable retaliation | Infantry fire and lateral repositioning |
| 2 — Containment | Deny repeated safe routes | A light vehicle, concentrated fire, wider spacing |
| 3 — Air response | Test high breaches and re-entry | One aerial archetype and combined ground pressure |

The director considers elapsed time, recent destruction, current health, and
active threat composition. It may increase spawn variety and coordination, but
it must cap simultaneous pressure and provide a readable transition cue. A band
change may not simply multiply every enemy's health.

## 8. Hunt mode

### 8.1 Player promise

The player wins by understanding the worm, not by shooting continuously. Signals
become a hypothesis about its route; positioning and a well-timed trap turn that
hypothesis into an exposure window.

### 8.2 Scenario and states

The Hunter defends one surface relay while attempting to eliminate the AI worm.
The relay prevents passive camping: if ignored, the worm can attack it and end
the run.

- **Victory:** reduce the AI worm's health to zero.
- **Defeat:** the Hunter is incapacitated or the relay is destroyed.
- **Exit:** quitting from Pause records an incomplete run but no victory.

There is no hard match timer in the MVP. Encounter pressure increases over time,
and the AI prioritizes the relay when the Hunter avoids engagement.

### 8.3 Hunt loop

1. **Detect:** watch tremors, dust wakes, displaced props, directional audio, and
   intermittent sensor traces.
2. **Predict:** infer the worm's route, target, speed, and likely breach zone.
3. **Position:** move outside the likely impact line while keeping the relay in
   reach.
4. **Prepare:** place the Seismic Snare where it can intersect a plausible route.
5. **Punish:** fire during a natural breach or the opening created by the trap.
6. **Reset:** dodge the counterattack, reload, retrieve or recharge the trap, and
   interpret the worm's next reposition.

### 8.4 Hunter kit

- **Rifle:** the sole MVP weapon. It is effective against exposed worm regions,
  has a readable cadence and reload window, and cannot damage a deeply buried
  worm.
- **Dodge:** a short surface reposition with a cooldown. It does not grant a
  long invulnerability window and cannot pass through every attack by default.
- **Seismic Snare:** one deployable trap can be active at a time. After a visible
  arm delay, a nearby underground worm triggers it. The trigger reveals the
  worm's immediate trajectory and briefly reduces its steering freedom; a
  shallow worm is pulled into a partial exposure. The trap creates an attack
  opportunity rather than dealing the decisive damage itself.

The trap has a conspicuous placement marker, armed state, trigger radius, and
recovery/cooldown state. A failed placement is a meaningful cost, but the player
must never be left permanently unable to finish the encounter.

### 8.5 Tracking information

Normal Hunt presentation never draws the exact underground worm body
continuously. It combines cues with different precision:

- broad directional audio and surface tremor for early warning;
- dust, small debris, and ground distortion for a probable route;
- stronger local warning before a breach;
- a short exact trace only when the Seismic Snare triggers or another explicit
  reveal condition is met.

Every audio cue has a visual counterpart. Color is never the only distinction
between weak, strong, and imminent warnings.

### 8.6 Fair AI behavior

The AI worm uses the same movement limits, collision rules, health model, and
ability cooldowns as a player-controlled worm. It may know fixed objective
locations, but its action selection must remain inspectable and its attacks must
produce the same player-facing cues.

Its behavioral vocabulary includes underground roam, acquire target, stalk,
accelerate, breach attack, evade, recover, and reposition. Utility selection may
respond to health, relay opportunity, Hunter position, recent trap placement,
and repeated player habits. Seeded variation should prevent exact repetition
without allowing impossible turns or untelegraphed attacks.

A developer overlay exposes at least:

- current state and selected utility action;
- current target;
- relevant utility scores;
- cooldowns and health;
- intended route, breach prediction, and steering target;
- deterministic seed where applicable.

The overlay is off in normal play and its exact-position information is excluded
from score-valid user-facing runs.

## 9. Controls and shared action vocabulary

Gameplay code consumes semantic actions rather than device keys or touch zones:

| Action | Worm interpretation | Hunter interpretation |
|---|---|---|
| Move / steer | Steering and thrust intent | Surface movement |
| Aim | Not required for ordinary movement | Rifle aim direction/point |
| Primary | Bite | Fire rifle |
| Ability | Unassigned in the MVP; slot reserved for later kits | Place/recover Seismic Snare |
| Mobility | Burst | Dodge |
| Pause | Pause safely | Pause safely |
| Confirm / back | Menus | Menus |

Default physical mappings are design baselines and may be tuned during the
vertical slice:

- **Keyboard/mouse:** keyboard movement; mouse aim for Hunter; primary on mouse
  or keyboard fallback; **right mouse button mirrors the Mobility action**
  (worm Burst / Hunter Dodge) so the mouse alone can move, aim, fire and burst;
  nearby keys for Ability (the Hunter's Skill/grapple stays on `Q`) and Mobility;
  `Esc` pauses.
- **Gamepad:** left stick movement/steering, right stick Hunter aim, trigger for
  Primary, face/shoulder buttons for Ability and Mobility, menu button to pause.
- **Touch:** a left-side movement/steering region and large right-side action
  controls. Hunter aim supports a right-side drag/aim region plus configurable
  aim assistance; touch controls may swap sides for handedness. Every action
  offered on desktop has a reachable touch button in the same mode: Burst/Dodge
  and the active skill are always present, and Jump/drop appear in the climbing
  Hunt. Buttons with a cooldown (Burst, skill, and reloading fire) draw a
  readiness ring so a tap during a cooldown is visibly explained rather than
  silently ignored.

Worm steering must feel continuous on every device even if physical gestures
differ. Touch and gamepad input use analog magnitude where available. Keyboard
input is smoothed by the same movement model rather than receiving stronger
instant turns.

The player can view the current mapping before a run. Gameplay suppresses browser
scrolling and zoom gestures only while the active play surface owns the touch.

## 10. Camera and responsive playfield

### 10.1 Camera behavior

- Use a side-on cross-section; never stretch world geometry to fill an aspect
  ratio.
- Horizontal tracking uses a dead zone and speed-based look-ahead so the player
  can see where momentum is carrying them.
- Ordinary framing retains the ground line and enough underground depth to plan
  a route. Limited vertical adjustment is allowed, but deep travel cannot hide
  all surface context for long.
- A breach may receive a short anticipatory shift and optional impact impulse.
  The camera may not seize control, zoom so far that re-entry is unreadable, or
  conceal an incoming threat.
- Hunt framing prioritizes the Hunter, relay, and probable breach zone. It does
  not track the hidden AI worm directly.
- Pause, Results, resize, and orientation changes must not leave the camera in an
  invalid position.

### 10.2 Viewport policy

- Landscape is the gameplay target on desktop, phone, and tablet.
- The canonical composition is tuned around common 16:9 and 16:10 displays.
- Ultrawide views may reveal modest extra context within a defined maximum; they
  may not create an unlimited tracking advantage.
- Narrow landscape layouts reduce decorative space and reposition HUD groups
  before reducing readable text or touch targets.
- Portrait entry keeps menus usable, pauses an active run, and shows a clear
  rotate-device prompt or constrained fallback. The simulation does not continue
  unseen behind that prompt.
- CSS safe-area insets and browser chrome are accounted for dynamically.

## 11. HUD and interaction layout

### 11.1 Shared HUD

The HUD presents only current decisions and run state:

- player health;
- role and mode label;
- score and current multiplier/chain;
- current objective or threat band;
- ability, mobility, ammunition, reload, and cooldown state where relevant;
- pause access.

Rampage emphasizes score, combo, health, and response band. Hunt emphasizes both
health bars, relay integrity, rifle state, trap state, and tracking strength.

### 11.2 Responsive rules

- Critical status stays in safe upper regions; touch controls occupy adaptive
  lower corners or side zones.
- Touch overlays remain translucent but retain visible boundaries and pressed,
  cooldown, and unavailable states.
- No critical warning may appear only beneath a thumb zone.
- Desktop HUD does not reserve empty space for hidden touch controls.
- Menus reflow; the desktop HUD is not uniformly scaled down for phones.
- Text remains readable against all strata through backing, outline, or contrast
  treatment.
- Interactive touch targets aim for 48 CSS pixels in both dimensions and never
  fall below 44 CSS pixels, with spacing that reduces accidental adjacent presses.

## 12. Scoring, combo, and escalation

All exact point values are provisional and belong in `docs/BALANCE.md` once
implementation begins.

### 12.1 Rampage scoring

Score rewards:

- consuming a valid target;
- destroying a more dangerous threat;
- striking an aerial target;
- hitting multiple targets in one breach arc;
- launching one entity or loose object into another target;
- alternating action or target categories;
- maintaining a chain while taking meaningful risk.

A short grace window preserves the combo between related actions. The multiplier
then decays visibly rather than disappearing without warning. Repeating the
lowest-risk target yields less chain value than varied play. Damage does not
automatically erase all progress unless a future challenge explicitly states it.

### 12.2 Hunt scoring

Hunt score rewards a tactical sequence:

- accurately detecting or revealing the worm;
- triggering a Seismic Snare;
- interrupting a committed breach;
- dealing damage during a valid exposure window;
- avoiding relay damage;
- defeating the worm efficiently.

Completion, remaining relay integrity, remaining Hunter health, and elapsed time
contribute to Results. Firing continuously at invulnerable underground space or
farming harmless entities gives no score.

### 12.3 Results

Every completed or failed run reaches a Results screen with:

- outcome and reason;
- final score and new-record state;
- duration;
- maximum combo or tactical chain;
- role-relevant statistics;
- retry, change mode, and main-menu actions.

Rampage statistics include targets by class, highest response band, and health
recovered. Hunt statistics include trap triggers, breach interruptions, hit
accuracy, relay integrity, and worm exposure windows used.

## 13. Progression and persistence

The MVP uses a versioned local save. It stores:

- per-mode best score;
- best Hunt completion result and relevant records;
- settings and accessibility preferences;
- control/handedness preferences;
- onboarding and tutorial-seen flags;
- save schema version.

The MVP does not require permanent stat upgrades, currency, unlock grinding, or
achievements. Runs start from a consistent competitive baseline. If later phases
add progression, migrations must preserve these records and must not make either
role dependent on paid or server-backed resources.

## 14. Menu and run flow

```text
Boot / preload
  -> Title
  -> Main menu
       -> Play
            -> Role + mode selection
            -> Controls / objective preview
            -> Rampage or Hunt
            -> Pause (resume, settings, restart, quit)
            -> Results (retry, change mode, main menu)
       -> How to Play
       -> Settings
       -> Credits
```

With one character per role, the MVP does not need a separate character-select or
loadout screen. Role selection must state **WORM** or **HUNTER** prominently and
preview the different objective, information model, and controls.

The first run may show short contextual prompts. Later runs skip them unless the
player resets onboarding or opens How to Play.

## 15. Feedback and audio

Feedback communicates cause and timing:

- a breach uses original dust/debris, impact sound, restrained hit pause, and an
  optional camera impulse;
- valid hits, armor contact, blocked damage, healing, and trap triggers have
  distinct responses;
- combo grace and expiration are visible and audible;
- each response-band transition is announced before the new pressure is active;
- Hunt differentiates distant movement, nearby movement, imminent breach, trap
  armed, and trap triggered;
- low health and relay danger are signaled without relying on color or sound
  alone.

No reference audio, sampled music, copied voice lines, or traced effects may be
used. Effects that obscure the next input decision are reduced before adding
more spectacle.

## 16. Accessibility and interruption behavior

MVP settings include:

- master, music, and effects volume;
- screen shake intensity including off;
- reduced motion;
- reduced flashes/high-intensity effects;
- high-contrast gameplay telegraphs;
- touch-control handedness and opacity;
- Hunter aim-assist strength or toggle;
- optional supported-device haptics with an off state.

Important cues use at least two of shape, motion, text/icon, color, sound, or
haptics. The game does not require audio, color distinction, or vibration alone.

Losing browser visibility, device focus, or valid landscape layout pauses the
run safely. Resuming requires a deliberate input and a brief readiness cue; the
simulation cannot advance while an interruption overlay is active.

## 17. Provisional tuning targets

These values are test hypotheses, not settled balance. Phase B and C playtests on
desktop and representative phones may change them. Approved values should move
to `docs/BALANCE.md` with rationale.

| Target | Provisional range or rule | Reason |
|---|---|---|
| First intentional breach hit | Within 30–60 seconds for a new player after the prompt | The signature action must be learned quickly |
| Rampage run length | Common runs around 4–8 minutes | Supports browser replay without flattening escalation |
| Hunt completion length | Common wins around 3–7 minutes | Allows multiple prediction cycles without stalling |
| Combo grace | Roughly 2.5–3.5 seconds before visible decay | Supports chaining while preserving urgency |
| Pre-breach warning in Hunt | Roughly 0.6–1.2 seconds at committed approach speed | Gives time to act without revealing the full route |
| Seismic Snare | One active; roughly 0.5–0.9 second arm time and 8–12 second recovery/cooldown | Makes placement anticipatory and mistakes recoverable |
| AI worm defeat | About 4–7 successful exposure windows at baseline skill | Keeps trap and shooting cycles meaningful |
| Burst speed gain | Noticeable but below a reliable escape/kill guarantee; initial test around 25–40% | Adds commitment without bypassing steering |
| Re-entry recovery | Control returns promptly; test below about 0.5 second of forced recovery | Preserves flow and avoids input frustration |
| Touch targets | Target 48×48 CSS pixels; never below 44×44; prefer larger for primary actions | Reduces missed inputs on phones |
| Performance feel | Stable frame pacing at the chosen simulation rate on target laptop and modern phone | Input timing matters more than raw entity count |

No range above should be treated as evidence about a reference game.

## 18. Acceptance criteria

### 18.1 Worm vertical slice gate

Before broad content or Hunt production expands, the vertical slice must show
that:

- the segmented worm turns smoothly with no obvious follower jitter;
- momentum, a deliberate breach, limited air control, and re-entry form one
  understandable movement loop;
- a player can hit one prey target and one armed threat intentionally;
- bite, impact, damage, healing, combo, and failure have distinct feedback;
- the camera retains route and surface context through an ordinary breach;
- keyboard and touch both drive the same movement rules without one receiving an
  unintended speed or turning advantage;
- pause, restart, Results, and local best score work;
- a short browser play session creates no fatal console error and the production
  build remains static-host compatible.

Failure to meet this gate means movement/camera tuning continues before roster,
campaign, or progression work.

### 18.2 Two-role MVP gate

The MVP is ready for completion review only when:

- Rampage supports all four response bands and produces a readable score/combo
  run through Results;
- Hunt supports detection, prediction, positioning, one active Seismic Snare,
  exposed-window rifle damage, relay defense, and explicit victory/defeat;
- a normal Hunt run does not reveal the AI worm's exact underground location;
- the AI worm follows legal player movement constraints and its decisions are
  inspectable in the developer overlay;
- keyboard/mouse, touch, and gamepad where supported feed the shared action layer;
- representative desktop, phone, and tablet landscape layouts preserve critical
  HUD, safe areas, controls, and playfield visibility;
- portrait/orientation change and visibility loss pause safely;
- Results and versioned local records survive reload;
- accessibility settings materially reduce their named effects;
- all shipped art, audio, text, names, and code are original or have documented
  compatible provenance;
- applicable automated checks, production build, browser smoke checks, console
  inspection, and manual desktop/touch gameplay verification pass.

## 19. Open design questions and uncertainties

These questions require prototype evidence or later review; they are not reasons
to broaden Phase A scope.

1. Whether desired-heading or relative-turn touch steering produces the best
   worm precision without weakening momentum.
2. How much of the surface and underground region can remain visible across very
   wide and very short landscape viewports without changing difficulty.
3. The minimum tracking cue set that lets new Hunter players form a useful
   prediction while preserving uncertainty.
4. Whether a shallow Seismic Snare trigger should force partial exposure every
   time or only when approach speed/depth conditions are met.
5. The right relationship between Rampage time, destruction, current health, and
   response-band advancement.
6. Whether Hunter aim assistance should be enabled by default on touch after
   testing target speed and phone ergonomics.
7. Final character, faction, arena, and objective names after the original visual
   and narrative direction is established.
8. Exact scoring, cooldown, damage, camera, hit-stop, and spawn values; reference
   research does not establish suitable Sandstrike values.

## 20. Post-MVP direction

Only after both MVP modes meet their gates should the project consider:

- expanding to the five-character target with distinct, original kits;
- Campaign missions and additional objective types;
- multiple original biomes and encounter compositions;
- permanent upgrades, unlocks, and achievements with explicit balance goals;
- Survival and Challenge modes;
- bosses, weather, hazards, seeded challenges, alternate traps, and loadouts;
- optional PWA or online services through a separate approved decision.

Each substantial addition needs a player-value statement, scope review, and an
updated design/decision record before implementation.

## 21. Latest playtest revision request (2026-10-02)

The user's new direction supersedes the earlier roster and relay scenario as the
next product target: five playable worms plus five Hunters, passive mouth feeding,
active character skills, easier/high worm breaches, compact menus, and Hunt as
vertical survival ascent with allied Hunters/helicopters and rising sand. Ordinary
ascent worm kills are followed by a fiercer return after 10 seconds. Reaching the
summit stops sand and starts a final boss fight: thicker/aggressive worm, high-damage
RPG, visible 3-second boss immunity. Target whole successful run: 5-6 minutes.
This is requested scope, not already shipped behavior. Concrete proposed design
and assumptions: `docs/superpowers/specs/2026-10-02-sandstrike-survival-redesign.md`.
Written design review and implementation planning are the next checkpoints.

## Playtest override 2026-10-02: breach height

Player-controlled worms should breach about one building height, then fall under
gravity. Held upward steering cannot sustain altitude. This supersedes the earlier
500-700px player target; the high-rise Hunt enemy retains a tower pursuit profile.

## Latest survival pacing/presentation (2026-10-02)
The climb now alternates stairs at either end of industrial catwalks instead of
stacking overlapping ledges that allowed a9.9-second straight ascent. Direction
arrows and a next-ledge HUD guide the route. One-use35HP medical supplies are
spread along long walks; first rooftop RPG pickup fully restores a living Hunter.
Hunter impacts grant1s recovery and dodge grants0.2s protection, with a steady
outline. Engineer leaves the beacon behind the escape direction.
Boss health is3600, shield3s unchanged. Seed33 full-run feasibility is measured at
5:46-6:03, not a hard timer or guaranteed human difficulty. Scout grapple remains
an optional shortcut. Menu original SVG artwork, armored tangent worm jaws, limb
animation, industrial supports and bounded dust/snow improve the presentation.

## Gameplay text clarity (2026-10-02)
User explicitly requests a clean playfield. Normal HUD shows only gameplay health,
ammo/skill, objective/direction and boss meter. Height, hazard distance, generation,
AI tracking, support counters and floating event labels belong to explicit debug.
Threat sectors/particles remain graphical; controls are available in How to Play.

## Hunter supply crates and realism pass (2026-10-03)
Touch a random platform supply crate to store one skill from the four other Hunter
kits. E / gamepad X / Supply uses it once. The selected Q skill remains independent.
A full slot leaves crates in place; skills cannot stack while a borrowed effect is
active. A failed grapple keeps its charge. Supplies reset each run and never change
saves. This is player Hunt equipment; rival-AI Stage 2 is separate.
Presentation now favors natural materials, original detailed worm textures and
menu key art, restrained field-equipment UI and noise/foley-based weapon audio.
Procedural humans/environments and kit tints retain readable gameplay at small sizes.

## Underground environment detail (2026-10-03 follow-up)

The underground is a geological cutaway with uneven sediment seams, natural rock
textures, gravel, fractures, shallow roots, mineral veins and small pockets.
Desert has fossils; ruins have buried masonry, corroded pipes and rebar; frozen
soil has ice lenses. Details use restrained natural colors behind the worm,
carrion and equipment, without labels or collectible glows. They are visual
decoration: worm movement and the surface/hazard contact boundary are unchanged.
Ascent details travel with the rising material band; classic geology stays fixed.

## Aggressive AI and Hunter counterplay (2026-10-03)

Maw tracks movement before committing a warned breach, corrects for its own turn
radius/momentum, attacks above ground, then dives/repositions for another pass.
Once a warning appears its target remains committed, preserving escape counterplay.
No ordinary breach may bypass the existing 60-tick minimum warning.

Hunter skills provide distinct signals, including skills borrowed from crates:
- Engineer Attract Maw: a loud five-second beacon takes priority over a recent
  sighting and draws the next attack. A charge already warned finishes first;
  its queued beacon target has an eight-second limit to allow lining up the attack.
- Scout Grapple: landing vibration gives Maw a short pursuit bearing.
- Siegebreaker Shield: Maw shifts to a flank and delays committing while more
  than one second of protection remains. A charge already underway continues.
- Ranger Target Mark: stronger coordinated fire remains; Maw is provoked into
  faster reacquisition when roaming/recovering.
- Field Medic Heal: the recovery pulse briefly reveals its origin to Maw.

Rampage rivals remain real Hunters: shoot during movement/climbing, predict close
contact and dodge away where a ledge offers room, choose reachable nearby landings,
and use kit skills for useful situations with the existing cooldowns. They only
target an exposed worm. A human worm decides whether to pursue an Engineer beacon;
bot skills never take control away from the player. Rooftop rivals approach the
crate, acquire heavy fire after a short ready delay, and lose it on burial/death.
New difficulty is provisional pending the user's playtest.
