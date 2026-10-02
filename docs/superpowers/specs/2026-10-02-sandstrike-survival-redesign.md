# Sandstrike Survival Redesign

Status: proposed design for written review; no product implementation yet.
Requested: 2026-10-02, following the user's desktop playtest of Phase C.
Baseline: root checkout `phase-b-ready`, product `073b9d9`, handoff `a3a6cd7`.
This revision takes priority over conflicting earlier gameplay targets once approved.

## Intent and acceptance

The user wants immediately understandable arcade play: an agile, high-breaching
worm that eats through its mouth automatically, and a Hunter fleeing upward through
buildings/platforms while rising sand and increasingly aggressive worms pursue them.
Hunt must include other AI hunters and helicopters. The player starts armed, may
kill worms with ordinary weapons, and seeks a high-damage RPG at the summit for the final boss fight.
Ordinary kills buy ten seconds, then a fiercer worm returns. Aim for a 5-6 minute
successful Hunt including its boss fight; failure is player death or burial.
The roster is explicitly **five worms AND five hunters**, ten playable characters,
each with a distinct active skill. This supersedes the old five-total roster.

Confirmed requests: the rules above, desktop menu without excessive page scroll,
high worm jumps, optional character skill on Space, original presentation, root
workflow, efficient testing and persistent records.

Latest explicit clarification: arriving at the summit starts a boss-fight stage;
sand stops rising, the worm becomes more aggressive and has substantially more HP,
and the RPG deals high damage rather than an automatic one-shot. The boss can use
3-second immunity and other visible skills. A successful boss defeat ends the run.
NPC hunters/helicopters being friendly in Hunt and hostile in Rampage remains a
proposed faction interpretation.

## Approach and scope

Recommended: evolve the existing Hunt mode into this survival ascent. Keep the
shared GameSession, input adapters, fixed ticks, head/path worm motion, collision,
events, presentation composition and save recovery. Retain old relay scenarios
as historical regression fixtures during migration, not as the default objective.
Alternative: keep relay Hunt and add a third Ascent mode. That preserves the old
experience but adds menu/rules/testing cost before the requested game is convincing.
Replacing the engine or rebuilding both modes would discard working systems and
is unnecessary.

Deliver in three connected increments, not ten skins before the movement works:
1. Compact menu, easier worm steering/high breach, automatic feeding, first skill.
2. Complete Hunter ascent with platforms, rising sand, allied support, respawn and RPG boss stage.
3. All ten kits, character selection, distinct silhouettes/animation and tuning.
These are delivery batches within Phase D, not new obligatory project phases.
Campaign, achievement economy, extra biomes and online multiplayer are outside
this revision; they do not delay these explicitly requested systems.

## Desktop/mobile menu

Desktop title/main/mode/character screens occupy the available viewport. Replace
the large stacked hero/preview/footer arrangement with a compact title, central
selection, and visible primary actions. Test 1366x768 and 1440x900 at default zoom:
document scroll height must not exceed the viewport by more than 2px; all actions
must be reachable. At 200% zoom or unusually short windows, allow a bounded panel
to scroll rather than clipping keyboard-accessible controls. Do not globally hide
overflow to disguise inaccessible content. Landscape touch controls remain >=44px,
safe-area-aware, with a separate compact menu; portrait keeps a useful rotate prompt.

## Worm feel, feeding and skills

Keep smooth head-authoritative curvature and stable followers. Tune turning so a
full-speed surface approach reacts visibly within roughly 0.3-0.5 seconds. Space
activates the chosen worm's special skill. Shift/right bumper/touch Burst remains
a separate directional thrust action. WASD/left stick/joystick steering remains shared.
Starting tuning hypothesis: higher turn authority and a vertical exit speed that
can reach approximately 500-700px above sand. Validate the actual arc and camera;
do not achieve this by teleporting the head or stretching follower spacing.

Food is consumed automatically on a swept mouth contact, even at low speed.
Maintain a forward logical mouth region separate from body hitboxes. Body brushing
does not count as eating; vehicles/helicopters still obey their health/armor damage
rules, and actors award healing/rewards once. Remove the manual Bite prompt/button.
Every worm has this passive feeding; active skills must change tactics, not rename it.

Proposed roster and initial active-skill hypotheses (names are original working names):

| Worm | Identity | Space skill | Duration / cooldown |
|---|---|---|---|
| Dune Maw | Agile balanced predator | Sandguard: incoming damage immunity | 3s / 20s |
| Cinder Wyrm | Aggressive, lower armor | Fire fan: directional burning projectiles | volley / 12s |
| Iron Burrower | Heavy, high armor | Shock breach: radial surface damage/knockback | pulse / 16s |
| Storm Serpent | Fast aerial pursuit | Sky surge: strong directed thrust with controlled air turn | 1.5s / 16s |
| Rift Spitter | Ranged pressure | Venom volley: damage-over-time projectiles | volley / 14s |

Immunity cannot restore a dead actor, freeze timers, or prevent environmental
out-of-bounds handling. Cooldowns and effects stop advancing while paused and reset
for a fresh run. Color, head shape, body silhouette, feedback and skill cue differ
for every worm; shared animation machinery is allowed, identical recolors are not.

## Hunt: ascent, sand and objectives

Spawn the Hunter with a useful firearm at the base of an original ruined outpost.
The default opening instruction is: "Climb above the rising sand. Survive the
worms. Reach the rooftop RPG and finish the hunt." HUD: health, ammo, skill,
sand danger, height/progress, worm return countdown, stage and RPG readiness.
Remove relay integrity as the main win/loss condition and remove early victory
from an ordinary rifle kill. Keep readable surface attack sectors relative to
the current sand height. Platforms and buildings must communicate viable routes.

Hunter movement includes horizontal run, jump, gravity, grounded state, one-way
platform landing and drop-through. Logical collision uses previous/current poses
so a fast falling Hunter cannot tunnel through a landing. Dedicated Jump and Skill
actions/buttons preserve movement plus aiming; mouse/second stick/Fire drag aims.
Recommended desktop: A/D move, Space or W/Up jump, S/Down drop-through, mouse fire,
Q character skill, Shift dodge, R reload, E interact with the rooftop crate.
Touch has explicit Jump, Fire/Aim, Skill and Dodge controls, with pickup automatic
inside the highlighted crate zone. Final layout must avoid crowded thumb zones.

The world sand surface rises continuously on simulation ticks. Stable platform
geometry does not move with the sand. Buried Hunters take escalating damage after
a short visible grace period; sand does not automatically lift them to safety.
Buried platforms cease to be safe objectives. Pause, focus interruption, portrait
and visibility interruption freeze sand, damage, respawn and encounter timers.
The camera follows ascent and safe landing context, not a hidden worm.

Two explicit gameplay stages:

1. **Ascent:** aim for approximately 3-4 minutes of moving/fighting upward. Sand
   rises; normal worms return after 10s and escalate. Route geometry and encounters,
   not an arbitrary locked rooftop timer, establish the expected climbing duration.
   Summit arrival is the transition trigger even if the player reaches it early.
2. **Boss fight:** sand freezes at a safe level below the summit arena. Show a stage
   banner, a dedicated boss health bar and the RPG pickup/weapon instructions. The
   rooftop is a wider arena with cover and lateral movement; the camera frames the
   encounter. Aim for about 1-2 minutes of intense combat, not further platform ascent.

The 5-6 minute value is a tuning target for the whole successful run, not a forced
300s delivery gate or a hard 360s boss timeout. Faster skilled runs are allowed.
The starting firearm remains usable. The RPG is acquired at the summit and deals
large conventional combat damage with finite cadence/reload; it cannot bypass
immunity. A miss never permanently removes the win path: the summit pickup
replenishes rockets. No NPC can take the player's objective weapon.

On summit entry, cancel any pending ascent respawn and introduce a fresh full-health
boss with an explicit entrance/warning, not a silent heal during an existing shot.
Initial boss tuning hypothesis: 600 HP, RPG damage 80, rifle damage 8; RPG cadence
72 ticks and two-round reload 120 ticks. Keep damage protection compatible with
that cadence. The boss has 3s immunity, a visible 0.5s windup and 15s cooldown;
immune hits spend ammunition but show a clear blocked/shield cue. Attack warning
and airborne exposure duration give enough time to shoot between shields.
These values are provisional, to be adjusted for the 1-2 minute fight.

The first final boss uses an original enlarged armored worm silhouette with
Sandguard and an aggressive high-breach pattern; other worm kits remain playable
and supply later encounter variants. Cap speed/recovery escalation; never remove
telegraphs to manufacture difficulty. A normal-stage kill never wins; a boss-stage
kill wins regardless of which valid weapon deals the last damage, and cannot start
another respawn. Allies may contribute visible damage; they do not collect RPGs.
Lethal Hunter damage wins priority over a simultaneous boss kill.

Proposed Hunter roster; every kit can traverse the authored route without its skill:

| Hunter | Starting weapon | Q skill | Initial cooldown |
|---|---|---|---|
| Ranger | Rifle | Target mark: allies focus an exposed worm for 4s | 14s |
| Siegebreaker | Heavy carbine | Shield: absorbs damage for 3s | 18s |
| Scout | SMG | Grapple to a visible reachable platform, not through geometry | 12s |
| Engineer | Burst rifle | Deploy decoy: attracts a sensed worm away for 5s | 16s |
| Field Medic | Sidearm | Restore 30HP to self and nearby surviving allies | 20s |

Weapons have distinct cadence/damage rather than five identical inventories.
The summit RPG is a special objective weapon for all five, regardless of loadout;
no character starts with the summit RPG. Snare can remain an Engineer
tool/optional pickup, but cannot obscure the primary climb/survive/RPG instructions.

## Worm return, escalating pursuit and support

Only one live AI worm is required at a time. An ascent-stage kill enters a 600-tick
absence state, removes its collision/body/effects safely and displays a return
countdown. Respawn creates fresh health, followers and per-life AI without resetting
the Hunter, sand, NPCs, run tick or ammunition. Track the number of ordinary kills.
Each return shortens recovery/approach intervals and increases breach frequency/
reach up to explicit caps; use behavior escalation before uncontrolled HP growth.
After caps, pressure stays high rather than becoming physically unfair. Boss death
ends the run once; no queued ordinary respawn may survive summit entry or that result.

AI must target elevated Hunters/platform vicinity and obey the same movement,
sensing and collision as the player-controlled worm. Rework the forecast for a
moving sand surface and higher breach arc. Every natural attack retains a distinct
readable warning in the reachable sector. NPC distraction is possible only when
the AI senses or remembers that actor; no reading player inputs or hidden coordinates.

Initial support population: two allied AI hunters and one support helicopter in
Hunt; bounded replacements preserve a visible battle without infinite actors.
Ground allies advance/seek safe platforms, dodge danger and shoot exposed targets.
Helicopters patrol, fire with visible targeting cues and deliver the objective
crate. Allies may damage exposed worms/bosses but cannot pick up the RPG or cause friendly
fire against the player. The same human/air archetypes can oppose a player worm
in Rampage through factions and controller selection, not duplicated simulations.
Air movement uses altitude over the current sand with sensible world limits.

## Presentation revision

Replace stick-figure placeholder Hunters with readable original body/head/weapon
silhouettes, articulated walk/jump/fall/aim/reload/recoil poses and consistent foot
placement on landings. Worm heads have animated jaw opening on automatic feeding,
eyes/teeth/armor identity and stable segmented curves; skills have distinctive
anticipation/active/recovery feedback. Helicopters have animated rotors, visible
weapons and aiming/fire cues. These are required playable presentation improvements,
not a promise that recoloring the existing shapes is final character art.

Use an original outpost skyline, layered dunes and structures, moving sand edge,
limited dust trails/debris and high-contrast platforms/cover. The summit boss stage
changes lighting/composition, enlarges the worm's visual presence while preserving
logical hitboxes, and shows prominent immunity/health/exposure feedback. Keep the
player, projectiles and landing edges readable without full-screen effect noise.
Desktop/mobile use the same art and simulation with camera/layout adaptations;
mobile particle limits and reduced feedback remain. Generated/external assets, if
chosen for production art, are original/licensed and recorded in ASSET_LICENSES.

## Modules and data boundaries

- Character definitions own stats, weapon/skill IDs, visual identity and metadata.
  Ability strategies own behavior; role-wide movement/feeding is not a giant switch.
- World state owns simulation tick, sand height, platform/structure geometry and
  hazard bounds. Terrain queries use that authoritative tick, including forecasts.
- Hunter vertical locomotion consumes collision geometry and emits immutable pose.
- Pursuit/life director owns worm alive/absent/returning state and escalation.
- Allied actor controllers own observable sensing, finite states and target choice.
- HuntRules owns ascent/boss stage, player-death/boss-defeat priority and one immutable result.
- Snapshots expose HUD/objective/life/skill/character state; rendering owns no timers.
- Save migration retains old records as legacy relay results rather than comparing
  incompatible old relay scores with new ascent scores. Keep future-schema protection,
  original backups and once-only persistence. New ascent records are separate.
- Static Vercel/Pages builds and existing pinned stack remain; no mandatory backend,
  runtime LLM or proprietary reference assets. External/generated art needs provenance.

## Focused verification and delivery

Pin actual failure modes: every low-speed mouth feed exactly once; no body-only
feed; skill immunity expiry; smooth high breach/re-entry and followers; swept landing
and drop-through; sand and timers pause; ordinary death cannot end Hunt; 599/600-tick
respawn boundary; repeated kills cap escalation; summit entry cancels return and freezes sand; boss immunity expires after exactly
180 ticks; final boss/death simultaneity gives one result; NPCs cannot steal the RPG; retry clears entities/timers; legacy saves
remain valid. One fast 6-minute deterministic run verifies timing without waiting
six wall-clock minutes in every browser test. Browser checks cover actual menus,
movement, first ascent, one return, summit transition, RPG damage/shield block, boss finish, touch layout and console.

Do not repeatedly rerun unaffected checks. Build/visual checks occur per playable
increment; one integrated final gate and one fresh review cover the complete revision.
Physical feel and a natural 5-6 minute playthrough still need the user's playtest.
Original smooth animated art is a separate production deliverable; this spec does
not claim procedural prototypes are already realistic or award-quality.

## Review checkpoint

Self-review: ten unique kits are named; automatic eating and skills are separate;
ordinary and boss kills differ; rising sand and high breaches share a world clock;
the run has a reachable boss ending and a 5-6 minute tuning target. No product files changed.
Next: user reviews this written design, then a native implementation plan maps
the three increments to exact existing files and focused checks. No worktree/push/merge.
