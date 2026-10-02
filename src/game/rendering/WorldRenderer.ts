import Phaser from "phaser";
import { themes, type ThemeId } from "../data/themes";
import type { AscentWorldSnapshot } from "../domain/world/AscentWorld";
import type { Platform } from "../domain/world/PlatformContacts";

const LEFT = -20_000, RIGHT = 20_000, TOP = -1_200, BOTTOM = 3_200;
const HAZARD_BAND_DEPTH = 1_600;
export class WorldRenderer {
  readonly bounds = Object.freeze({ left: LEFT, right: RIGHT, top: TOP, bottom: BOTTOM });
  private backdrop: Phaser.GameObjects.Graphics | undefined;
  private hazard: Phaser.GameObjects.Graphics | undefined;
  private hazardY = Number.NaN;
  constructor(private readonly scene: Phaser.Scene, private themeId: ThemeId = "desert") {}
  setTheme(themeId: ThemeId): void { this.themeId = themeId; this.create(); }
  create(): void { this.draw(true); }

  /** Survival rendering: skyline plus authored platforms and a moving hazard band. */
  createAscent(world: AscentWorldSnapshot): void {
    this.draw(false);
    const g = this.scene.add.graphics().setDepth(-60);
    for (const platform of world.platforms) this.platform(g, platform);
    const theme = themes[this.themeId];
    const hazard = this.scene.add.graphics().setDepth(-50);
    theme.ground.forEach((color, index) => { hazard.fillStyle(color); hazard.fillRect(LEFT, index * HAZARD_BAND_DEPTH / theme.ground.length, RIGHT - LEFT, HAZARD_BAND_DEPTH / theme.ground.length + 2); });
    hazard.lineStyle(6, theme.surface, .95); hazard.lineBetween(LEFT, 0, RIGHT, 0);
    hazard.lineStyle(2, theme.light, .3); hazard.lineBetween(LEFT, 10, RIGHT, 10);
    this.hazard = hazard;
    this.updateWorld(world);
  }

  updateWorld(world: AscentWorldSnapshot): void {
    if (!this.hazard || world.surfaceY === this.hazardY) return;
    this.hazardY = world.surfaceY;
    this.hazard.y = world.surfaceY;
  }

  private platform(g: Phaser.GameObjects.Graphics, platform: Platform): void {
    const theme = themes[this.themeId];
    const height = platform.id === "summit" ? 46 : 26;
    g.fillStyle(theme.structure, .95); g.fillRect(platform.left, platform.y, platform.right - platform.left, height);
    g.fillStyle(theme.surface, .85); g.fillRect(platform.left, platform.y - 5, platform.right - platform.left, 6);
    g.lineStyle(2, theme.light, .35); g.strokeRect(platform.left, platform.y, platform.right - platform.left, height);
  }

  private draw(withGround: boolean): void {
    this.backdrop?.destroy();
    this.hazard?.destroy(); this.hazard = undefined; this.hazardY = Number.NaN;
    const g = this.scene.add.graphics().setDepth(-100); this.backdrop = g;
    const theme = themes[this.themeId], skyHeight = -TOP / theme.sky.length;
    theme.sky.forEach((color, i) => { g.fillStyle(color); g.fillRect(LEFT, TOP + i * skyHeight, RIGHT - LEFT, skyHeight + 2); });
    for (let radius = 150; radius >= 38; radius -= 16) { g.fillStyle(theme.light, .025 + (150 - radius) / 900); g.fillCircle(620, -610, radius); }
    g.fillStyle(theme.light, .72); g.fillCircle(620, -610, 38);
    theme.skyline.forEach((color, layer) => {
      const points = [new Phaser.Math.Vector2(LEFT, 0)];
      for (let x = LEFT; x <= RIGHT; x += 100) {
        const wave = Math.sin((x + layer * 270) / (520 + layer * 90));
        const y = -85 - layer * 38 + wave * (45 + layer * 8) + Math.sin(x / 173) * 12;
        points.push(new Phaser.Math.Vector2(x, this.themeId === "frozen" ? y - Math.abs(Math.sin(x / 290)) * 110 : y));
      }
      points.push(new Phaser.Math.Vector2(RIGHT, 0)); g.fillStyle(color, .7 + layer * .1); g.fillPoints(points, true);
    });
    if (withGround) {
      const levels = [0, 170, 430, 820, BOTTOM];
      theme.ground.forEach((color, i) => { g.fillStyle(color); g.fillRect(LEFT, levels[i] ?? 0, RIGHT - LEFT, (levels[i + 1] ?? BOTTOM) - (levels[i] ?? 0)); });
      g.lineStyle(5, theme.surface, .9); g.lineBetween(LEFT, 0, RIGHT, 0);
      g.lineStyle(2, theme.light, .26); g.lineBetween(LEFT, 8, RIGHT, 8);
      for (let i = 0; i < 180; i++) { g.fillStyle(theme.surface, .18); g.fillCircle(LEFT + (i * 977) % (RIGHT - LEFT), 36 + (i * 193) % 3050, 1 + i % 4); }
    }
    this.structures(g);
  }
  private structures(g: Phaser.GameObjects.Graphics): void {
    const theme = themes[this.themeId];
    for (let x = -2600, i = 0; x < 2800; x += 340, i++) {
      const height = this.themeId === "desert" ? 45 + i % 3 * 16 : this.themeId === "ruins" ? 90 + i % 5 * 45 : 65 + i % 3 * 40;
      const width = this.themeId === "ruins" ? 120 : 100;
      g.fillStyle(theme.structure, .85); g.fillRect(x, -height, width, height);
      g.lineStyle(2, theme.surface, .3); g.strokeRect(x, -height, width, height);
      if (this.themeId === "desert") {
        g.fillStyle(theme.light, .3); g.fillRect(x - 8, -height - 8, width + 16, 8);
        g.lineStyle(2, theme.structure); g.lineBetween(x + 80, -height, x + 80, -height - 50);
      } else if (this.themeId === "ruins") {
        g.fillStyle(theme.light, .5);
        for (let y = 20; y < height - 8; y += 30) for (let column = 16; column < width - 8; column += 28) if ((y + column + i) % 3) g.fillRect(x + column, -height + y, 9, 13);
        g.fillStyle(theme.structure); g.fillTriangle(x + 12, -height, x + 46, -height - 40, x + 70, -height);
      } else {
        g.fillStyle(theme.surface, .9); g.fillRect(x - 6, -height - 6, width + 12, 8);
        g.fillStyle(theme.light, .6); g.fillRect(x + 12, -height + 20, 76, 14);
        g.lineStyle(3, theme.surface, .7); g.lineBetween(x + 50, -height, x + 50, -height - 50); g.strokeCircle(x + 50, -height - 60, 12);
      }
    }
  }
}
