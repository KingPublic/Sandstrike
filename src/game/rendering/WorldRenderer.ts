import Phaser from "phaser";
import { drawTowerDetails, drawWeather } from "./WorldDetails";
import { drawUndergroundDetails } from "./UndergroundDetails";
import { UndergroundRockView } from "./UndergroundRockView";
import { themes, type ThemeId } from "../data/themes";
import type { AscentWorldSnapshot } from "../domain/world/AscentWorld";
import type { Platform } from "../domain/world/PlatformContacts";

const LEFT = -20_000, RIGHT = 20_000, TOP = -1_200, BOTTOM = 3_200;
const HAZARD_BAND_DEPTH = 1_600;
export class WorldRenderer {
  readonly bounds = Object.freeze({ left: LEFT, right: RIGHT, top: TOP, bottom: BOTTOM });
  private backdrop: Phaser.GameObjects.Graphics | undefined;
  private hazard: Phaser.GameObjects.Graphics | undefined;
  private weather: Phaser.GameObjects.Graphics | undefined;
  private undergroundRocks: UndergroundRockView | undefined;
  private hazardY = Number.NaN;
  constructor(private readonly scene: Phaser.Scene, private themeId: ThemeId = "desert") {}
  setTheme(themeId: ThemeId): void { this.themeId = themeId; this.create(); }
  create(): void { this.draw(true); }

  /** Survival rendering: skyline plus authored platforms and a moving hazard band. */
  createAscent(world: AscentWorldSnapshot): void {
    this.draw(false, world.bounds.top);
    const g = this.scene.add.graphics().setDepth(-60);
    drawTowerDetails(g, world, themes[this.themeId]);
    for (const platform of world.platforms) this.platform(g, platform);
    const theme = themes[this.themeId];
    const hazard = this.scene.add.graphics().setDepth(-50);
    drawGroundGradient(hazard, theme.ground, LEFT, RIGHT, HAZARD_BAND_DEPTH);
    drawGroundGrain(hazard, theme.surface, theme.structure, -3600, 3600, HAZARD_BAND_DEPTH);
    this.undergroundDetails(hazard, HAZARD_BAND_DEPTH, -49);
    hazard.lineStyle(6, theme.surface, .95); hazard.lineBetween(LEFT, 0, RIGHT, 0);
    hazard.lineStyle(2, theme.light, .3); hazard.lineBetween(LEFT, 10, RIGHT, 10);
    this.hazard = hazard;
    this.updateWorld(world);
  }

  updateWorld(world: AscentWorldSnapshot): void {
    if (!this.hazard || world.surfaceY === this.hazardY) return;
    this.hazardY = world.surfaceY;
    this.hazard.y = world.surfaceY;
    if (this.undergroundRocks) this.undergroundRocks.layer.y = world.surfaceY;
  }

  updateAtmosphere(tick: number, view: Readonly<{ left: number; right: number; top: number; bottom: number }>, reducedMotion: boolean): void {
    this.weather ??= this.scene.add.graphics().setDepth(-25);
    if (reducedMotion) { this.weather.clear(); return; }
    drawWeather(this.weather, this.themeId, themes[this.themeId].light, tick, view);
  }

  private platform(g: Phaser.GameObjects.Graphics, platform: Platform): void {
    const theme = themes[this.themeId];
    const height = platform.id === "summit" ? 46 : 26;
    g.fillStyle(theme.structure, .95); g.fillRect(platform.left, platform.y, platform.right - platform.left, height);
    g.fillStyle(theme.surface, .85); g.fillRect(platform.left, platform.y - 5, platform.right - platform.left, 6);
    g.lineStyle(2, theme.light, .35); g.strokeRect(platform.left, platform.y, platform.right - platform.left, height);
    g.fillStyle(0x09101b, .3).fillRect(platform.left + 4, platform.y + height - 8, platform.right - platform.left - 8, 8);
    for (let x = platform.left + 12; x < platform.right - 8; x += 40) {
      g.fillStyle(theme.light, .25).fillCircle(x, platform.y + 10, 2);
      g.lineStyle(2, theme.light, .12).lineBetween(x, platform.y + 16, x + 20, platform.y + 16);
      g.lineStyle(1, 0x201e18, .42).lineBetween(x - 6, platform.y + 3, x + 9, platform.y + 8);
      if (Math.floor(x / 40) % 4 === 0) g.fillStyle(0x8d6040, .45).fillRect(x, platform.y + 14, 9, 4);
    }
    g.lineStyle(1, 0xf3e6c9, .5).lineBetween(platform.left, platform.y - 4, platform.right, platform.y - 4);
    if (platform.id === "summit") { g.lineStyle(4, theme.light, .4).lineBetween(platform.left, platform.y - 8, platform.right, platform.y - 8); }
  }

  private draw(withGround: boolean, top = TOP): void {
    this.backdrop?.destroy();
    this.undergroundRocks?.destroy(); this.undergroundRocks = undefined;
    this.hazard?.destroy(); this.hazard = undefined; this.hazardY = Number.NaN;
    const g = this.scene.add.graphics().setDepth(-100); this.backdrop = g;
    const theme = themes[this.themeId], bands = 80;
    for (let i = 0; i < bands; i++) {
      const progress = i / (bands - 1) * (theme.sky.length - 1), index = Math.floor(progress);
      const a = theme.sky[index] ?? 0, b = theme.sky[Math.min(theme.sky.length - 1, index + 1)] ?? a;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.ValueToColor(a), Phaser.Display.Color.ValueToColor(b), 1, progress - index);
      g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b)).fillRect(LEFT, top + i * -top / bands, RIGHT - LEFT, -top / bands + 2);
    }
    if (!withGround) g.fillStyle(theme.sky.at(-1) ?? theme.structure).fillRect(LEFT, 0, RIGHT - LEFT, BOTTOM);
    for (let i = 0; i < 60; i++) {
      const x = -3700 + i * 130, y = top * .6 + Math.sin(i * 1.7) * 170;
      g.fillStyle(0xe4d9c2, .035).fillEllipse(x, y, 440 + i % 4 * 90, 35 + i % 3 * 20);
    }
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
      drawGroundGradient(g, theme.ground, LEFT, RIGHT, BOTTOM);
      g.lineStyle(5, theme.surface, .9); g.lineBetween(LEFT, 0, RIGHT, 0);
      g.lineStyle(2, theme.light, .26); g.lineBetween(LEFT, 8, RIGHT, 8);
      for (let i = 0; i < 180; i++) { g.fillStyle(theme.surface, .18); g.fillCircle(LEFT + (i * 977) % (RIGHT - LEFT), 36 + (i * 193) % 3050, 1 + i % 4); }
      drawGroundGrain(g, theme.surface, theme.structure, -3600, 3600, BOTTOM);
      this.undergroundDetails(g, BOTTOM, -99);
    }
    this.structures(g);
  }
  private undergroundDetails(g: Phaser.GameObjects.Graphics, depth: number, renderDepth: number): void {
    const rocks = new UndergroundRockView(this.scene, this.themeId, depth, renderDepth);
    this.undergroundRocks = rocks;
    drawUndergroundDetails(g, this.themeId, themes[this.themeId], depth, rocks.available ? rock => { rocks.add(rock); } : undefined);
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

function drawGroundGradient(g: Phaser.GameObjects.Graphics, colors: readonly number[], left: number, right: number, depth: number): void {
  const bands = 64;
  for (let i = 0; i < bands; i++) {
    const progress = i / (bands - 1) * (colors.length - 1), index = Math.floor(progress), amount = progress - index;
    const a = colors[index] ?? 0, b = colors[Math.min(colors.length - 1, index + 1)] ?? a;
    const channel = (shift: number) => Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount);
    g.fillStyle((channel(16) << 16) | (channel(8) << 8) | channel(0)).fillRect(left, i * depth / bands, right - left, depth / bands + 2);
  }
}

function drawGroundGrain(g: Phaser.GameObjects.Graphics, light: number, dark: number, left: number, right: number, depth: number): void {
  for (let i = 0; i < 1300; i++) {
    const x = left + (i * 719.37) % (right - left), y = 8 + (i * 193.71) % (depth - 8);
    g.fillStyle(i % 3 === 0 ? light : dark, .12 + i % 3 * .035).fillEllipse(x, y, 2 + i % 5, 1 + i % 3);
  }
  for (let row = 0; row < 10; row++) {
    for (let x = left; x < right; x += 90) {
      const y = 28 + row * depth / 11 + Math.sin(x / 260 + row) * 10;
      g.lineStyle(1, light, .065).lineBetween(x, y, x + 75, y + Math.sin(x / 100) * 4);
    }
  }
}
