# BALANCE

Central record for gameplay tuning decisions.

Do not scatter magic numbers across scene classes.

## Phase A status

No runtime balance value is accepted yet. The ranges in
`docs/GAME_DESIGN.md` section 17 are prototype hypotheses. Move a value here only
after Phase B or C measurement records the tested device/build, observed outcome,
reason for the choice, and date.

Suggested categories:
- worm acceleration / turn rate / max speed
- body segment spacing / follow smoothing
- breach impulse
- hunter movement
- weapon damage
- cooldowns
- AI utility weights
- spawn rates
- enemy health/damage
- combo decay
- score values
- difficulty scaling

Whenever a value changes materially, note why.

## Phase B movement prototype hypothesis (2026-10-01)

Status: **provisional, automated-domain evidence only**. These values establish a
coherent first playable motion model. They are not accepted feel targets until
the desktop and touch checks in the movement-feel gate are recorded.

| System | Initial value | Hypothesis |
|---|---:|---|
| Segment count | 14 total (head + 13 followers) | Reads as a substantial creature while keeping the path inexpensive. |
| Segment spacing | 24 px | Preserves a continuous silhouette without excessive overlap. |
| Path history | 128 samples | Covers the full body with margin through tight turns. |
| Path sampling | 4 px or 4 ticks | Captures fast curvature and refreshes tangent state while nearly stationary. |
| Initial / minimum speed | 120 / 90 px/s | Avoids a dead-feeling start and keeps the worm alive under neutral input. |
| Underground acceleration | 260 px/s^2 | Reaches cruise speed quickly enough for a short arcade run. |
| Underground cruise cap | 360 px/s | Provides readable terrain approach at the initial camera scale. |
| Low-speed turn cap | 2.4 rad/s | Allows decisive course changes without instant heading snaps. |
| High-speed turn factor | 0.45 | Gives speed perceptible weight while retaining control. |
| Air steering factor | 0.35 | Lets the player shape an arc without cancelling launch commitment. |
| Gravity | 720 px/s^2 | Produces short, legible breach arcs at cruise speed. |
| Burst | +100 px/s, 460 px/s cap | Adds mobility timing without invulnerability. |
| Burst cooldown | 1.8 s | Prevents continuous boosted travel. |
| Surface hysteresis | 6 px | Prevents phase chatter at the terrain line. |
| Forced re-entry recovery | 0.25 s maximum | Restores underground steering promptly after impact. |
| Camera look-ahead | 180 px horizontal, 120 px vertical | Reveals the intended trajectory while retaining nearby terrain. |
| Camera smoothing half-life | 0.12 s | Targets responsive tracking without visible snapping. |

The model carries velocity through the surface rather than adding a separate
breach impulse. Unit evidence covers acceleration/caps, speed-dependent turning,
Burst cooldown, deterministic replay, ballistic gravity, ordered swept phase
transitions, path wrap/reset, and finite poses at a zero-speed ballistic apex.

## Phase B movement-feel gate (2026-10-01)

Status: **accepted for the Rampage vertical slice**. The prototype values above
remain the working Phase B baseline. This ruling covers the movement system, not
final campaign balance.

Tested build and environment:

- branch/worktree: `phase-b-vertical-slice` in
  `.worktrees/phase-b-vertical-slice`, implementation baseline `4cf964c` plus the
  movement-gate tuning recorded in the checkpoint containing this entry;
- Chromium through Playwright on Windows, keyboard input, synthetic independent
  touch pointers, and deterministic scripted fixtures;
- desktop canvas at a 1440x900 browser viewport;
- mobile/tablet landscape viewports 915x412, 844x390, and 1024x768;
- portrait interruption at 390x844 and simulated visibility interruption;
- root, `/Sandstrike/`, E2E, and ordinary production builds.

Observed measurements:

| Check | Result |
|---|---|
| Repeated breach fixture | 10 airborne entries and 10 completed returns underground over 2,274 simulation ticks |
| Numerical stability | All head/follower positions and tangents finite; no console, page, or request failure |
| Maximum head travel | 7.573 px per 60 Hz simulation tick |
| Browser sampling | Up to 9 ticks observed between browser samples; 64.842 px aggregate movement remained continuous |
| Follower chord spacing | Maximum 27.8 px; exact retraced vertical paths can spatially self-intersect to near 0 px without a pose discontinuity |
| Automated fixture depth | 390.5 px during the repeated breach run |
| Deep-travel check | Finite 14-pose worm at approximately 1,711 px depth with the full body retained on screen |
| Responsive controls | 54.6-144 px joystick/action regions stayed inside each tested landscape viewport; simultaneous steer + Burst passed |
| Interruption safety | Portrait and hidden-page pauses froze ticks, cleared held input, and required deliberate resume |

Tuning ruling:

- The original locomotion values are accepted unchanged for the next slice.
- Camera near-surface look-ahead and 0.12 s smoothing remain unchanged.
- Deep framing now scales from 1.0 down to 0.45 zoom, recenters gradually after
  480 px depth, and favors a readable full worm when a compact canvas cannot also
  retain the surface. The procedural underground backdrop and camera bounds now
  extend to 3,200 px.
- Active landscape play at widths through 1,100 px uses the full viewport. This
  prevents page chrome and document scroll from displacing touch controls.

Known evidence limits:

- Gamepad behavior is unit-tested through the shared action layer but was not
  exercised with physical hardware in this environment.
- Touch checks use Chromium synthetic pointers rather than a physical phone or
  tablet. Safe-area insets are covered by deterministic layout tests.
- Audio and haptics are outside this movement plan and remain untested.
- The intentionally repeated straight-up/straight-down fixture can place two
  adjacent rendered samples at the same world point when the path retraces
  itself. No jitter, NaN, phase chatter, or segment-order reversal was observed;
  later visual polish may add self-occlusion treatment without changing motion.

## Phase B combat prototype hypothesis (2026-10-01)

Status: provisional tuning, now covered by built-browser combat/feedback checks.
Baseline: contact pipeline `cd43855`; fixtures cover Bite, impact, simultaneous
contacts, capped healing, armor, and tick-based invulnerability.

| Parameter | Value | Intended effect |
|---|---:|---|
| Worm / prey health | 100 / 1 | Prey provides reliable sustain without a drawn-out fight. |
| Bite | 6 active ticks, 24 cooldown ticks, 15 damage | Intentional short-range attack with a readable rhythm. |
| Bite logical shape | 34 px circle, 20 px forward offset | Forgiving reach independent of the visual head. |
| Prey healing | 8, capped at maximum health | Encourages returning to the surface under pressure. |
| Impact | 220 px/s threshold; 10-40 damage through 460 px/s | Rewards committed momentum and Burst timing. |
| Post-hit protection | 30 simulation ticks | Prevents simultaneous projectiles from erasing health unfairly. |

Consumption, removal and healing occur once per actor even when Bite and impact
share one tick. Infantry yields no healing. Attack-offset sweeps use both previous
and current poses to retain turning hits.

## Phase B infantry hypothesis (2026-10-01)

Domain and browser presentation tests pass; physical audio remains unverified.
Infantry has 25 health, repositions at 90 px/s for 24 ticks, locks perceived aim
for a 36-tick telegraph, and waits 53 recovery ticks after its one-tick fire state
(90 ticks between shots). Visibility is limited to 900 px and 18 px below the
surface; remembered positions expire after 60 ticks. Named seeded AI streams
cannot consume the spawn stream.

Projectiles travel at 480 px/s, expire after 2.5 seconds or leaving world bounds,
deal 10 damage, and use 24 reusable logical slots. Swept relative contacts retire
each projectile after one hit; the worm's 30-tick protection blocks simultaneous
hits. The 400-tick seed-70 encounter reproduces events and diagnostics exactly.
Fresh checkpoint: 89/89 domain tests, typecheck and lint pass.

## Phase B Rampage pacing hypothesis (2026-10-01)

Prototype bounds: 4,800 px wide, head limited to x ±2,382, y -1,182 to 3,182.
Boundary contact reflects momentum without rebuilding the follower history.
Prey yields 100 base points, infantry 250. Alternating categories adds 25%;
repeating a category yields half score and half chain credit. Additional targets
within a breach add 25% of their base value. Awards round down after multiplying.
Chain 3 / 6 grants 2x / 3x, capped at 3x; grace lasts 180 ticks followed by 45
visible decay ticks. Target IDs are credited once; untyped removals award nothing.

Spawns stay 60 px apart and beyond the 600 px camera half-width plus 60 px lead,
with 40 px arena margins. Caps are 8 prey / 4 infantry; replacement cadence is
120 / 300 ticks. Health below 40 prioritizes food until two prey are available.
Band 1 triggers at tick 2,700 (45 seconds) or 1,000 base points, with a 120-tick
warning before military spawns. No health inflation or band above 1 is present.

The seed-811 fixture runs 5,400 ticks with circular steering and Bite every 25
ticks. Two runs reproduce all snapshots/events, preserve caps and legal head
positions, announce once, activate band 1 at tick 2,820, and overflow no events.
Fresh checkpoint: 103/103 tests, typecheck/lint pass. These are mechanical pacing
hypotheses; browser presentation checks now pass, while broader player tuning
still needs physical device playtesting.

## Phase B presentation checkpoint (2026-10-01)

Original procedural views are pooled per actor ID. Feedback retains shape and
text when muted; commands cap at 32 and 48 particles, with 16 reusable text views.
Reduced motion disables particles/shake, reduced flashes gates flash policy,
and critical health/response cues remain text-readable. Web Audio is optional
and unlocks only after a user gesture. No music track or physical haptic/audio
measurement is claimed.

Fresh verification: 108/108 unit/integration tests, lint/typecheck/production build
pass; 11 root Chromium E2E pass. Layout and actor-view identity checks cover
1440x900, 1280x720, 1024x768, 915x412 and 844x390. Settings pause the simulation and
do not change its snapshot. Combat-breach captures verify prey/infantry silhouettes,
aim-lock shapes/text and the full segmented worm. Capture waits for fixture/Phaser
readiness; optional bridge calls before installation had initially skipped setup.

## Phase B encounter measurement (2026-10-01)

Environment: Windows Chromium 153.0.8010.12 through Playwright, one browser
worker, optimized E2E build, seed 811, 12 seconds of scripted steering/Bite/Burst
per viewport. This is automated host evidence, not a physical phone benchmark.
Raw observations are in `docs/PHASE_B_PERFORMANCE.json`.

| Measurement | 1440x900 | 844x390 |
|---|---:|---:|
| Simulation ticks / render samples | 622 / 370 | 654 / 421 |
| Frame median / p95 / p99, ms | 31.66 / 33.35 / 39.99 | 28.33 / 30.00 / 35.00 |
| Frames above 33.34 ms | 22 | 9 |
| Simulation per tick median / p95, ms | 0.20 / 0.40 | 0.20 / 0.40 |
| Peak actors / logical shapes | 6 / 6 | 7 / 7 |
| Peak projectiles / particles | 0 / 24 | 0 / 24 |
| Dropped catch-up time / event overflow | 0 / 0 | 0 / 0 |
| Exposed JS heap before / after, MB | 19.3 / 19.3 | 18.2 / 18.2 |
| End score / health | 250 / 100 | 200 / 100 |

Median frame pacing is about 32–35 fps on this automated host; the provisional
60 fps target on documented physical hardware is **not verified**. Simulation
cost fits the initial desktop budget; heap readings are coarse browser counters,
not proof of absence of leaks. The short encounter is band 0 and does not exercise
rifle pressure. A separate combined-boundary fixture exercises two live projectiles,
seven overlapping targets, damage protection, three heals, four infantry kills,
one warning and band 1. Its first hit is tick 1 (16.67 ms); target credits/healing
occur at tick 2 (33.33 ms). This deliberate density is not normal spawn spacing.

Ten independent 120-tick stress replays have identical finite outcomes. The
earlier ten-cycle breach/return camera check remains recorded above. Audio and
gamepad adapters are covered by logic tests; real audio, haptics, phone/tablet
touch, GPU performance and human movement-feel tuning remain explicit limits.

Final review corrections: pause input stops before the requested simulation tick
and suppresses later catch-up ticks; lethal health cannot be restored by an attack
later in the same tick; menu/Results interruption never exposes run controls.

## Phase C Ranger/AI hypotheses (2026-10-02)
Ranger moves 180 px/s; dodge 420 px/s for 12 ticks with 120-tick cooldown.
Rifle: 8 damage, 30-tick cadence, six shots, 90-tick reload; exposed logical
regions only, including above-surface followers when the head is buried.
Snare: 42-tick arm, 150px radius, <=100px depth, 600-tick cooldown; force
1200px/s² and turn scale .25 for 48 ticks, reveal for 120 ticks. Deep traps
remain untriggered and can be recovered. AI locks a sector with 60-tick warning;
12-tick decisions and expired 120-tick Hunter sightings. These are provisional.
Evidence: 5 kit/contact tests and 8 AI/tracking/locomotion tests passed; two
5400-tick replays identical, repeated warned breaches, finite bounded poses.

## Phase C advanced response hypotheses (2026-10-02)
Vehicle: 80 HP, armor 4, lateral speed 75 px/s, shell damage 15.
Aerial: 50 HP, altitude -220px, lateral speed 96px/s, round damage 10.
Both use a 60-tick locked aim warning and 180-tick firing cadence; no firing
without an allowed current sighting. Population caps: prey 8, infantry 4,
vehicles 2, aerial 1, projectiles 24. Bands 2/3 activate at 7200/12600 ticks
or 3000/6000 base score, each after a separate 120-tick warning. New rewards
500/750 base points retain existing variety/repetition and breach modifiers.
Evidence: advanced kit/contact checks passed; two 18000-tick replays identical
with all bands, finite bounded motion, caps and zero event overflow. Replay
runtime on this host ~13 seconds, so this test uses a specific 30-second limit.

## Phase D summit boss hypotheses (2026-10-02)

Status: **provisional; deterministic and browser evidence, no human timing yet**.
Summit entry freezes the hazard at least 420px below the summit arena and starts
one 600 HP boss with a 90-tick entrance warning. Boss immunity cycles: 30-tick
visible windup, 180-tick (3s) immunity, 900-tick cooldown; immunity cannot revive
the boss, freeze timers or bypass the existing per-hit worm protection. Objective
RPG: 80 damage, 1400px range, 72-tick cadence, two rockets, 120-tick reload,
restocked when the player stands in the 180px-wide summit crate zone every 240
ticks. The starter rifle stays at 8 damage/30-tick cadence. The boss approaches
260px under the frozen surface instead of the ascent's 760px so its breach arc
still reaches the summit arena. Victory bonus 2000 plus 2 per Hunter HP. Evidence:
7 boss tests (transition, absent-worm summit entry, exact shield ticks, RPG
magazine/reload/restock, shield-blocked objective fire, one-result victory rules,
21600-tick finite run), 197 total tests, and the ascent-boss browser case. The
1-2 minute fight length and the 5-6 minute whole-run target remain unverified; the
existing per-hit worm immunity can consume late RPG shots and needs playtest tuning.

## Phase D support hypotheses (2026-10-02)

Bounded support: at most two ground allies and one helicopter, replaced every 420
ticks when a slot is empty. Ground ally 60HP, 150px/s, damage 6 on a 48-tick
cadence within 640px, jump 620 with the shared 1800 gravity; helicopter 80HP,
130px/s, damage 7 on a 60-tick cadence within 900px, holding the hazard surface
minus 320px. Allies fire only at exposed worm regions while unburied and stop
entirely while the worm is absent; they cannot target the player. Evidence: 4 ally
tests (buried/deep-worm hold fire, climb and altitude, capped population with 5400
simulated ticks generating ally hits and zero friendly fire, retry independence),
190 total tests, and hunt-controls browser cases at four viewports. Visual polish
of the ally art and long-match support balance remain unverified.

## Phase D pursuit hypotheses (2026-10-02)

An ordinary ascent kill removes the worm for 600 ticks (10s) and increments the
kill count; the next worm returns with fresh health/followers/AI at the hazard
line +900px, never resetting the Hunter, hazard, tick or ammunition. Escalation by
generation (cap 5): recovery 120/106/91/77/62/48 ticks, AI decisions 12→8 ticks,
extra breach boost from generation 3; AI approach depths and breach targets are
now relative to the moving surface and the forecast projects the same rising
surface. Evidence: 5 director/pursuit tests, 186 total tests, and browser runs
(hunt-flow 5, hunt-controls 4, hunt-warning 1) with no console errors; a real
browser kill/return case takes 12.2s wall clock. Difficulty feel and long-match
escalation remain unverified.

## Phase D ascent hypotheses (2026-10-02)

Status: **provisional, domain/browser evidence only**. Survival runs share one
world clock: the hazard starts at y=200 (below the base outpost), rises 5px/s and
freezes once the summit stage starts (at least 420px below the summit arena).
Summit arena y=-1600, arena bounds -2400..2400 x -2800..3200. Buried Hunters get
90 ticks of grace, then 20HP/s; a Hunter more than 1200px below the surface is
lost immediately. Hunter vertical kit: run 180, jump 660, gravity 1800, max fall
1200, coyote/buffer 6 ticks, half-height 16; 17 ledges 90px apart (jump apex
121px) plus the 1400px-wide summit platform. Evidence: platform-contact and
hunter-ascent tests (9) plus 181 total tests, lint/typecheck/build green; browser
checks at 1440x900, 1024x768, 915x412, 844x390 (movement, jump, pause, rotate
prompt) with no console errors. Human feel of the climb and the 3-4 minute target
remain unverified.

## Phase D survival foundation hypotheses (2026-10-02)

Status: **provisional, automated-domain and headless-browser evidence only**.
Revised normal Rampage uses `arcadeMovementBalance`; historical fixtures and Hunt
keep the legacy `movementBalance` profile.
Arcade worm: initial speed 360, underground acceleration 1600 px/s², cruise 800,
low-speed turn 6 rad/s with .8 high-speed factor, gravity 640, burst gain 150 with
950 cap, camera look-ahead 250/200. A full-speed turn now reacts within about .5s
and a natural vertical cruise breach rises near 500px (boosted near 705px).
Automatic feeding: swept forward mouth circle radius 16 offset 24px from the head
along travel direction, 15 damage, independent of speed; body-only contacts do not
feed and no manual Bite input is required. Sandguard: 180 active ticks (3s) on a
1200-tick (20s) cooldown; activation extends `invulnerableUntilTick` with
max(existing, activeUntil) and never restores health. Menu fits 1366x768, 1440x900
and 720x450/844x390/390x844 inside a bounded panel with no document overflow.
Evidence: themes 4 tests, automatic feeding/movement integration 3 tests, timed
skill and role input tests passed; menu and arcade-controls browser cases (5)
passed with console-error checks; `npm run verify` lint/typecheck/build passed with
171 tests in 58 files. Human feel, physical devices and match duration unverified.

### Phase C review correction

The former 160px AI approach depth could not accommodate the cruise-speed turn
radius (about 333px). Reposition now targets depth 960px and recovery 1200px;
preparation requires depth above 760px. The attack approaches the locked target
immediately during warning and boosts after 60 ticks. Warning lead is at least
60 ticks and can be longer; the earlier 0.6-1.2 second feel target is not established.
A bounded forecast of shared locomotion sets the actual crossing sector, quantized
to 120px cells. Edge approaches choose the inward side. Every natural crossing is
checked on four 5400-tick replay cases, including both arena edges, plus the normal
GameSession start seed. Final suite: 160 tests pass. Snare lift can interrupt the
forecast intentionally. Human timing, target pressure and match duration need tuning.
