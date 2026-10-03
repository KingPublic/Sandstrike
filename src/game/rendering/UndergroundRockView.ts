import type Phaser from "phaser";
import type { ThemeId } from "../data/themes";
import type { UndergroundRock } from "./UndergroundDetails";

/** Static rock images share the terrain's local coordinates and never get bodies. */
export class UndergroundRockView {
  readonly layer: Phaser.GameObjects.Container;
  readonly available: boolean;
  constructor(private readonly scene: Phaser.Scene, private readonly themeId: ThemeId, terrainDepth: number, renderDepth: number) {
    this.layer = scene.add.container(0, 0).setDepth(renderDepth);
    createGrain(scene);
    this.layer.add(scene.add.tileSprite(-3600, 0, 7200, terrainDepth, "underground-grain").setOrigin(0, 0).setAlpha(.42));
    this.available = scene.textures.exists("underground-rocks");
    if (!this.available) return;
    const texture = scene.textures.get("underground-rocks"), source = texture.getSourceImage();
    const width = Math.floor(source.width / 2), height = Math.floor(source.height / 2);
    for (let i = 0; i < 4; i++) {
      const name = `rock-${String(i)}`;
      if (!texture.has(name)) texture.add(name, 0, i % 2 * width, Math.floor(i / 2) * height, width, height);
    }
  }
  add(rock: UndergroundRock): void {
    const tint = this.themeId === "frozen" ? 0xc3d6d9 : this.themeId === "ruins" ? 0xc3c3ad : 0xdec39c;
    const image = this.scene.add.image(rock.x, rock.y, "underground-rocks", `rock-${String(rock.variant)}`)
      .setDisplaySize(rock.radius * 3.15, rock.radius * 2.1).setTint(tint).setAlpha(.67)
      .setRotation(Math.sin(rock.x * .07) * .12).setFlipX(Math.sin(rock.x) > 0);
    this.layer.add(image);
  }
  destroy(): void { this.layer.destroy(true); }
}

function createGrain(scene: Phaser.Scene): void {
  if (scene.textures.exists("underground-grain")) return;
  const texture = scene.textures.createCanvas("underground-grain", 256, 256);
  if (!texture) return;
  const pixels = texture.context.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) {
    let hash = i + 13837;
    hash = Math.imul(hash ^ (hash >>> 16), 0x7feb352d);
    hash = Math.imul(hash ^ (hash >>> 15), 0x846ca68b);
    hash = (hash ^ (hash >>> 16)) >>> 0;
    const color = hash % 3 ? 24 : 238;
    pixels.data[i * 4] = color;
    pixels.data[i * 4 + 1] = color;
    pixels.data[i * 4 + 2] = color;
    pixels.data[i * 4 + 3] = 16 + (hash >>> 16) % 38;
  }
  texture.context.putImageData(pixels, 0, 0); texture.refresh();
}
