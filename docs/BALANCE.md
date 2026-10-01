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
