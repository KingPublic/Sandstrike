# ASSET LICENSES

Record every non-original asset used in the project.

| Asset | File/path | Source URL/tool | Author/provider | License/usage terms | Attribution required? | Notes |
|---|---|---|---|---|---|---|
| Procedural worm, desert, prey, infantry, projectiles and effects | `src/game/rendering/` | Original project TypeScript/Phaser code, 2026-10-01 | Project Sandstrike | Original project work | No third-party asset attribution | Prototype presentation; no external bitmap pack or reference-game art. |
| Generated effect tones | `src/game/infrastructure/phaser/PhaserAudioAdapter.ts` | Original Web Audio oscillators, 2026-10-01 | Project Sandstrike | Original project work | No third-party audio attribution | Gesture-unlocked sound effects; no music recording. |

Rules:
Phase C Ranger, relay, snare, tracking sectors, vehicle/aerial silhouettes and
verification captures are original project procedural TypeScript/Phaser work
(2026-10-02). No external image/audio pack or reference-game asset was added.

- Do not add ripped Death Worm assets.
- Generated assets should record the generating tool and date.
- External packs must have compatible terms for the intended deployment.

## Survival roster presentation (2026-10-02)
All ten character silhouettes, plates/fins/horns/fangs, articulated Hunter limbs,
weapon poses, skill projectiles/trails/shields/heal crosses, summit crate and UI
are original project TypeScript/Phaser geometry in src/game/rendering/. No external
image/audio, generated bitmap, reference-game sprite or additional asset pack.
Browser captures document this original prototype, not production art.

## Latest presentation (2026-10-02)
CharacterPreview.ts SVG illustration, WorldDetails.ts architecture/weather,
reworked worm head/carapace and Hunter limb/armor geometry are original project
code. No external bitmap, reference-game art, audio pack or generated image added.

## Original generated and procedural assets (2026-10-03)
| Asset | File/path | Source/tool | Provider | Usage/provenance | Attribution | Notes |
|---|---|---|---|---|---|---|
| Desert outpost key art | public/art/sandstrike-outpost.jpg | Built-in OpenAI imagegen, 2026-10-03 | OpenAI, generated for this project | Original generated output; no reference images used | No third-party pack attribution | Common menu scene, JPEG87; exact prompt in ART_GENERATION.md. |
| Worm head/body textures | public/art/worm-head.png; worm-segment.png | Built-in OpenAI imagegen, 2026-10-03 | OpenAI, generated for this project | Original generated transparent sheet; cropped/resized copies | No third-party pack attribution | Native alpha retained, no copied game sprite; prompts in ART_GENERATION.md. |
| Weapon/foley/ambient samples | SoundSynthesis.ts | Original deterministic synthesis code | Project Sandstrike | Original project work | None | No external recording or audio pack. |
| Equipment crates, material details and favicon | rendering/; public/favicon.svg | Original project code | Project Sandstrike | Original project work | None | Earlier no-bitmap notes describe prior checkpoints only. |
| Underground rock atlas | public/art/underground-rocks.png | Built-in OpenAI imagegen, 2026-10-03 | OpenAI, generated for this project | Original generated output; no input/reference images | No third-party pack attribution | Four transparent rocks; resized to 768x512 with alpha preserved. Exact prompt in ART_GENERATION.md. |
| Underground sediment, roots, veins, fossils, debris, ice and grain | UndergroundDetails.ts; UndergroundRockView.ts | Original project TypeScript/Phaser/canvas code, 2026-10-03 | Project Sandstrike | Original project work | None | Decorative geology, no external texture pack or game asset. |

## Web Analytics dependency (2026-10-03)

@vercel/analytics2.0.1: official npm package / https://github.com/vercel/analytics,
Vercel Inc., MIT license (2026 copyright in the installed package LICENSE).
Package/lock pin the SDK; retain its MIT notice with distributed SDK copies.
The production collector script is served by Vercel's Web Analytics service.
No external art/audio or reference-game assets were added by this integration.
