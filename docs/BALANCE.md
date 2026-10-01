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
