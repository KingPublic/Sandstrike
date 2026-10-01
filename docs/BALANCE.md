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

Status: provisional domain fixtures; browser combat/feedback gate pending.
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

Domain tests pass; visual/audio telegraph feedback remains for presentation.
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
hypotheses; browser playtesting and presentation readability remain to be checked.

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
