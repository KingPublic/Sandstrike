# Reference Research Ledger

> Living evidence ledger for Project Sandstrike. Reference mechanics may inform an
> original design; reference art, audio, text, code, branding, and level layouts
> must not ship in this project.

Last researched: 2026-10-01

## Method and evidence labels

This pass used publisher/store listings, contemporary reviews, archival catalogues,
and official store screenshots. Every material claim names its era and evidence
quality.

- **Direct publisher/store evidence:** a developer-uploaded page, official store
  listing, release note, or official store asset.
- **Contemporary observation:** a dated review or report from someone who played
  the relevant build near its release.
- **Secondary/archival evidence:** a catalogue, community wiki, later review, or
  indexed page. Useful, but not proof of every build detail.
- **Inference:** a design interpretation rather than a fact about the reference.

Confidence describes support for the stated claim, not approval to reproduce its
expression.

## Access limits for this pass

- The original JTR executable and the 2011 SWF were not run.
- The Google Play text and five official landscape store images were inspected.
  The images are promotional composites without gameplay HUD or touch controls;
  they do not prove runtime layout, camera behavior, or timing.
- The Google Play trailer could not be played because no browser surface was
  available in the research environment.
- The TIGSource article and TIG Wiki page returned access errors when opened
  directly. Indexed text was available and is labeled accordingly.
- MobyGames screenshot files could not be downloaded from its CDN. Indexed image
  descriptions were treated as secondary evidence, not direct visual inspection.
- No current mobile build was installed or played. Current control mapping, HUD,
  result flow, camera motion, enemy density, animation timing, and audio cues
  remain unverified.

## Era map and chronology correction

The bootstrap phrase “2007 JTR original” is too imprecise. Evidence shows that the
JTR game was public by August 2006; 2007 is a later update/publicity point. Pages
inspected in 2009 document a 1.04-labeled build, but they do not establish when
that version was first released.

| Era | Working label | Evidence-backed boundary |
|---|---|---|
| A0 | JTR original | Publicly reviewed on 2006-08-11; MobyGames catalogues a 2006-06-09 Windows release, although that exact date relies on a community catalogue. |
| A1 | JTR 2007 exposure/update | Independent Gaming reported a harder-difficulty update on 2007-04-11; TIGSource covered the game on 2007-06-27. |
| A2 | Later JTR reporting | GameMakerBlog reviewed the game in October 2009 without naming a build. Caiman and Softpedia pages inspected/updated in April 2009 label a 1.04 build, but do not prove its release date. Features documented only by these later pages must not be projected backward automatically. |
| B | PlayCreek Flash | Developer uploads dated 2011-05-19 (Kongregate) and 2011-05-20 (Newgrounds). |
| C | PlayCreek mobile | Current store copyright/version history documents a mobile lineage from 2010 onward; this research treats it as a separate evolving product. |

## Era A — JTR original and later Windows builds

### What is supported

| Topic | Observation | Evidence | Confidence | Sandstrike implication |
|---|---|---|---|---|
| Core loop | The player hides below the surface, accelerates and angles a breach, eats or strikes surface targets, dives back into safety, and survives growing retaliation. | Independent Gaming (2006), TIGSource indexed article (2007), later JTR reviews | High for the loop | Preserve the preparation → breach → impact → re-entry rhythm. |
| Controls | Left/right steer and holding Up accelerates. | Contemporary Independent Gaming review; later 1.04 control list agrees | High | Keep steering and thrust as continuous actions, independent of physical input device. |
| Momentum | A deeper/faster approach produces a more useful launch; gravity dominates above ground and air control is limited in a later review. | Contemporary control description plus GameMakerBlog (2009) | Medium; detailed physics are from a later build | Make entry speed and angle consequential, then tune original values through playtesting. |
| Surface composition | Later reporting describes a readable cross-section with sand below and sky above. | GameMakerBlog (2009) | Medium | Both underground route planning and surface targets must remain legible. Exact split is an original camera decision. |
| Physical interaction | Vehicles can be launched when hit at a suitable angle. Later 1.04 reporting also mentions rocks that can be thrown by impacts. | Independent Gaming (2006); Caiman (1.04) | High for vehicles; medium for rocks/build scope | Reward attack geometry and environmental chain reactions without copying content layouts. |
| Escalation | Harmless wildlife gives way to armed humans, helicopters, tanks, and sustained pursuit. | TIGSource indexed article; GameMakerBlog; Caiman | High for the pattern; medium for exact order | Threat response should escalate in readable capability tiers rather than HP-only scaling. |
| Scoring | Eating contributes to score; contemporary player commentary mentions combos, and later reporting describes multi-target breach combos. | Archival catalogue; 2006 comment; GameMakerBlog (2009) | Medium for combo existence; low for formula | Reward planned multi-target arcs and varied risky actions; derive a new scoring formula. |
| Survival | Health can be restored by eating in contemporary reporting. The exact model differs across later descriptions. | Independent Gaming (2006); later catalogues/reviews | High for some eat-to-heal behavior; low for exact rule | Healing can support risk/reward, but its amount and conditions require original balancing. |
| Feedback | The Caiman page labeled 1.0.4 reports particles on eating/damage, whole-screen shake on breach, impact-propelled rocks, and functional weapon/explosion sounds. | Caiman page last updated in 2009; it labels the game “1.0.4 2007” | Medium and build-specific | Breach needs layered feedback, with shake strength capped and accessibility options. |
| Pacing and quick recovery | The same later review says pressure becomes formidable after a few minutes. Its control list includes immediate restart plus toggles for music and screen shake. | Caiman page labeled 1.0.4 | Medium; reported rather than measured in this pass | Build a clear ramp, fast restart, and independent motion/audio comfort controls; exact timing remains unknown. |
| Structure | Evidence supports a compact single-player survival/high-score experience. Reliable evidence for campaign levels, upgrades, Nitro, or Fireball was not found in the early JTR game. | TIG Wiki index, later review, absence from contemporary feature descriptions | Medium | Treat campaign progression and active abilities as later/reference-derived or original additions, not core A0 facts. |

### IP-relevant observation

The 2007 TIGSource article says the reference used music from *Streets of Rage*.
Regardless of the historical context, Sandstrike must use only original or properly
licensed music and audio.

## Era B — PlayCreek Flash (2011)

### What is supported

| Topic | Observation | Evidence | Confidence | Sandstrike implication |
|---|---|---|---|---|
| Release identity | PlayCreek described the upload as a Flash version of the original game. | Developer uploads on Kongregate and Newgrounds | High | Keep this era distinct from JTR and mobile. |
| Scope | The developer advertised 15 levels, 30 enemy types, leaderboards, and achievements. | Kongregate and Newgrounds developer descriptions | High that these were official claims | Do not copy counts; use the evidence to support short objective stages and escalating variety. |
| Controls | Up accelerates, Left/Right steer, Space fires a Fireball, N uses Nitro, and Esc pauses. | Developer instructions | High | Map steering, boost, attack, and pause to a shared action layer. |
| Targets | Categories include people, animals, birds, cars, tanks, planes, helicopters, army forces, and aliens. | Developer description | High for categories | Use original threat silhouettes and behaviors, introduced by tactical role rather than copied order. |
| Momentum and combo | Diving deeper builds a stronger launch; large breach sequences produce combos and higher scores. | Contemporary Jay is Games review | Medium-high | Preserve the risk/reward of committing to a deep run-up for a valuable exposed arc. |
| Stage goals | Most stages use target counts; at least some require consecutive kills without damage and reset the count when hit. | Contemporary Jay is Games review | Medium-high | Short explicit goals add pacing, but objectives should be original and avoid repetitive kill quotas. |
| Progression | Abilities can be upgraded between levels; Nitro and Fireball appear as power-ups/abilities. | Contemporary review plus developer control list | Medium-high for existence | Keep upgrade choices small and legible; avoid importing unverified stats or exact values. |
| Escalation | The review moves from prey to tigers, soldiers, helicopters, and detonators. | Contemporary Jay is Games review | Medium | Escalate by attack pattern and spatial pressure, not only durability. |
| Presentation | The contemporary review describes a substantial visual upgrade over the JTR game. | Jay is Games | Medium, qualitative | Sandstrike needs its own visual identity; “more polished” is not a style target. |

### Claims retained only as leads

The Flash Gaming Wiki lists Size, Speed, Skin Strength, Nitro Duration, and
Fireball Level upgrades and gives detailed pickup effects. Its chronology contains
an apparent error by treating the 2010 mobile release as a port of the 2011 Flash
release. Those details remain **low-to-medium confidence** until a dated Flash build
or recording is inspected. A single 2011 Kongregate comment suggests that an
upgrade choice offered two options; this is anecdotal and not a design requirement.

## Era C — current PlayCreek mobile product

### What is supported by current listings

| Topic | Observation | Evidence | Confidence | Sandstrike implication |
|---|---|---|---|---|
| Modes | Current store text names Campaign, Survival, Blitz, and Mini Games. The iOS text advertises 60 campaign levels, three mini-games, and three survival variants, but store copy may span multiple versions. | Google Play and Apple App Store publisher text | High for mode categories; medium for current exact counts | MVP needs only its two defining modes; more modes belong after the core roles work. |
| Progression | XP, coins, unlockable locations, worm leveling/upgrades, achievements, and cloud saves are advertised. | Current store listings and version history | High for existence | Use versioned local persistence for MVP; omit service-dependent economy/cloud features. |
| Character differentiation | Publisher release notes say each worm has a unique super ability; later updates added worms, animation, locations, and a revised UI. | Google Play “What’s new”; dated App Store history | High for existence; low for ability details | Distinct kits may support replayability, but that effect is a hypothesis to test; Sandstrike abilities must be original and deferred until the two-role foundation works. |
| Enemy scale | Google Play advertises more than 40 enemy types and names ground and air targets. | Publisher store copy | High that this is the claim; medium for audited count | Prefer a few behaviorally distinct enemies in MVP over a large roster. |
| Device support | The listings identify phone/tablet play, offline single-player, finger control, and compatible game controllers. | Google Play and App Store | High | Desktop, touch, and gamepad should feed one action interface; exact touch mapping remains a Sandstrike design problem. |
| Monetization | The free listings contain ads and in-app purchases; iOS lists passes, currency, and ad removal. | Current store listings | High | Do not adopt this economy for the static MVP. |
| Current Android date | Google Play showed “Updated on Aug 6, 2026” when checked. Its “What’s new” list aggregates older features, so that date cannot be assigned to every bullet. | Google Play | High for displayed date; medium for feature chronology | Date individual claims through App Store history when possible. |

### Direct visual observation of official store images

Five official landscape assets from the current Google Play carousel were inspected
at 1052×592. Their asset age is unknown.

- All five are marketing compositions, not unobstructed gameplay captures: large
  promotional copy or staged key art is present, and none shows the gameplay HUD,
  touch controls, or a result screen.
- Four images use a side-on cross-section that keeps surface threats and a large
  underground region visible at once. Ground and aerial enemies appear together;
  some scenes also show an underground mechanical threat.
- The images span desert, ice, jungle, and city settings and use strong silhouette
  separation between sky, ground line, strata, worm, and targets.
- These observations support cross-section readability and biome variety only.
  They do not establish runtime camera framing, UI safe areas, typical density,
  animation timing, or mobile ergonomics.

## Cross-era comparison

| Dimension | JTR A0/A1 (2006–07) | Later JTR reporting (pages inspected in 2009) | Flash B (2011) | Mobile C (current listing) |
|---|---|---|---|---|
| Primary shape | Compact survival/high-score loop | Same lineage with later documented options/feedback | 15 objective levels plus score chase | Multiple modes and long-term unlock progression |
| Locomotion | Steer + accelerate; breach from below | 360° movement, gravity, limited air control described | Same core, with deeper approach emphasized | Finger control and controller support advertised; exact feel unverified |
| Combat verbs | Eat, collide, launch objects | Later reviews mention wider threats and feedback | Eat/collide plus Nitro and Fireball | Multiple worms and unique abilities advertised |
| Escalation | Wildlife → armed response/waves | Wildlife → infantry → air/armor described | Broader enemy roster and stage goals | More than 40 enemies claimed across modes/locations |
| Progression | No reliable early upgrade/campaign evidence | Save/load and high-score controls documented for 1.04 | Between-level upgrades, achievements, leaderboards | XP, currency, unlocks, upgrades, seasons/cloud features |
| Presentation evidence | Sparse text and inaccessible archived images | Simple text HUD and functional effects described | Visual upgrade reported; direct HUD inspection unavailable | Official marketing images inspected; gameplay HUD and runtime flow unavailable |

## Reference mechanics worth carrying forward

These are research conclusions for design review, not approved implementation
requirements.

1. **Continuous momentum-based steering.** Success comes from shaping a path, not
   pressing a contextual “breach” button.
2. **Readable underground-to-surface commitment.** The player builds speed and
   chooses an exit angle before becoming exposed.
3. **Breach as a payoff event.** Collision, camera, particles, sound, and scoring
   should reinforce one decisive moment without obscuring control.
4. **Escalation as world response.** Harmless targets attract increasingly capable
   opposition, creating a natural run arc.
5. **Risk-and-variety scoring.** Multi-target arcs, aerial hits, and chained varied
   actions should outperform safe repetition.
6. **Short replayable runs.** A fast restart and clear results loop fit both browser
   sessions and mobile interruptions.

## Deliberate departures proposed for design review

- Make Hunter play a complete prediction/protection game; no reference era proves
  this asymmetric role.
- Use original fiction, naming, environments, silhouettes, UI, text, audio, VFX,
  abilities, enemy designs, and scoring values.
- Replace sheer content count with a small behaviorally distinct MVP roster.
- Avoid copied kill quotas as the dominant objective structure; mix protection,
  tracking, interruption, survival, and spatial objectives.
- Use a shared action layer with responsive desktop/mobile HUD layouts and safe-area
  handling; do not reproduce any reference control overlay.
- Use versioned local saves and no ads, premium currency, cloud dependency, season
  pass, or mandatory backend in MVP.
- Give screen shake, flashes, and intense motion accessibility controls from the
  start.

## Evidence log

| Date checked | Era | Source | Observation | Evidence type | Confidence | Implication |
|---|---|---|---|---|---|---|
| 2026-10-01 | A0 | https://indygamer.blogspot.com/2006/08/death-worm.html | Dated 2006-08-11; JTR; Up accelerates, Left/Right steer, eating restores health, angled hits launch vehicles. | Contemporary observation | High | Correct chronology; preserve angle/momentum-driven interaction. |
| 2026-10-01 | A0 | https://www.mobygames.com/game/28908/death-worm/releases/ | Catalogues a worldwide Windows release on 2006-06-09. | Secondary catalogue | Medium | The game predates 2007; exact first-release date still needs primary confirmation. |
| 2026-10-01 | A1 | https://indygamer.blogspot.com/2007/04/ | Entry dated 2007-04-11 says Death Worm was updated with harder difficulty. | Contemporary news item | High for the reported update; low for unspecified changes | Confirms a 2007 update point without dating the original release. |
| 2026-10-01 | A1 | https://www.tigsource.com/2007/06/27/death-worm/ | Indexed article dated 2007-06-27 praises hiding, breaching, timing, strategy, and waves of hunters; it also reports music taken from *Streets of Rage*. | Indexed contemporary article; direct open blocked | Medium-high for the article’s claims | Treat 2007 as coverage/update era, and never reuse the referenced audio. |
| 2026-10-01 | A0/A1 | https://tig.fandom.com/wiki/Death_Worm | Indexed community page identifies Windows, single-player, keyboard play, and survival framing; direct page access failed. | Secondary community index | Low-medium | Corroboration only; do not use for precise mechanics. |
| 2026-10-01 | A2 | https://gamemakerblog.com/2009/10/23/game-review-death-worm/ | Describes cross-section, gravity, limited air control, escalating threats, simple HUD, and breach combos; the build number is not stated. | Later observation | Medium | Useful feel evidence; do not assign it specifically to 1.04 or backport every detail to A0. |
| 2026-10-01 | A2 | https://caiman.us/scripts/fw/f2942.html | Page last updated 2009-04-20 labels the game “1.0.4 2007”; reports particles, breach shake, propelled rocks, escalation after a few minutes, restart, pause/save/load, and feedback toggles. | Later observation/distribution page | Medium | Useful build-specific evidence; listing date is not the version release date. |
| 2026-10-01 | A2 | https://games.softpedia.com/get/Freeware-Games/Death-Worm.shtml | Lists version 1.04 with page/update date 2009-04-16 and describes momentum, retaliation, health, and combo play. | Secondary distribution/review | Medium | Confirms later-build reporting, not its release date or original-release content. |
| 2026-10-01 | B | https://www.kongregate.com/en/games/playcreek/death-worm | Developer listing dated 2011-05-19: 15 levels, 30 enemies, controls, leaderboards, achievements. | Direct developer upload | High | Establishes Flash scope and action vocabulary. |
| 2026-10-01 | B | https://www.newgrounds.com/portal/view/570320 | Developer upload dated 2011-05-20 repeats scope and controls. | Direct developer upload | High, but not independent copy | Corroborates release identity/date. |
| 2026-10-01 | B | https://jayisgames.com/review/2011/05/ | Contemporary 2011-05-19 review describes momentum, objectives, upgrades, power-ups, escalation, no-damage stages, and combo scoring. | Contemporary observation | Medium-high | Supports structured short stages and risk scoring. |
| 2026-10-01 | B | https://flashgaming.fandom.com/wiki/Death_Worm | Detailed upgrade/power-up claims, but includes an apparent chronology error. | Secondary community documentation | Low-medium | Verification lead only. |
| 2026-10-01 | C | https://play.google.com/store/apps/details?id=com.playcreek.DeathWorm_Free&hl=en | Current modes, XP/coins, upgrades, enemy-count claim, device support, update date, release-note features, ads/IAP. | Direct publisher/store evidence | High for listed claims | Separate current live-product features from earlier eras and from MVP needs. |
| 2026-10-01 | C | https://apps.apple.com/gb/app/death-worm/id408657000 | Campaign/survival/mini-game copy, controller support, monetization, and dated version history for abilities/UI/worm additions. | Direct publisher/store evidence | High for listed features; medium for current counts | Better chronology than aggregated Android notes. |
| 2026-10-01 | C | https://www.playcreek.com/deathworm/ | Publisher page advertises three locations, abilities, achievements, and mobile products; copyright footer ends in 2022. | Direct but apparently stale publisher page | Medium | Do not use it as the current feature authority where stores conflict. |
| 2026-10-01 | C | Google Play screenshot carousel at the listing above | Five inspected promotional assets use surface/underground cross-sections and multiple biomes but show no gameplay HUD/control overlay. | Direct visual observation of store assets | High for visible composition; low for runtime implications | Preserve readability, then design and test original runtime framing. |

## Highest-value unresolved research

1. Identify and inspect a trustworthy recording or executable of the 2006–07 JTR
   build, distinct from 1.04, from title screen through game over.
2. Inspect the 2011 PlayCreek SWF or a version-identified recording for HUD,
   camera, upgrade/result flow, combo rules, Nitro/Fireball timing, and audio.
3. Record a current 2026 mobile session through Campaign and Blitz to measure
   surface/underground framing, touch ergonomics, telegraph timing, enemy density,
   result flow, and interruption behavior.
4. Verify the original JTR forum/patch history to assign features to A0, A1, or the
   later JTR builds discussed by 2009 sources.
5. Treat all precise balance values as unknown until Sandstrike prototypes are
   tested on desktop and representative phones.
