import type Phaser from "phaser";
import type { EnvironmentTheme, ThemeId } from "../data/themes";

type Point = Readonly<{ x: number; y: number }>;
const LEFT = -3600, RIGHT = 3600;
export interface UndergroundRock {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly variant: number;
}

/** Static, original geology. Decoration never consumes simulation randomness. */
export function drawUndergroundDetails(g: Phaser.GameObjects.Graphics, themeId: ThemeId, theme: EnvironmentTheme, depth: number, rockImage?: (rock: UndergroundRock) => void): void {
  drawStrata(g, theme, depth);
  for (let row = 0; row < Math.ceil(depth / 190); row++) {
    for (let column = 0; column < 33; column++) {
      const seed = row * 73 + column * 17 + 29;
      const x = LEFT + column * 224 + random(seed) * 135;
      const y = 56 + row * 190 + random(seed + 1) * 115;
      if (y + 66 > depth) continue;
      const radius = 12 + random(seed + 2) * 39;
      const color = mix(theme.ground[Math.min(row, 2)] ?? theme.structure, theme.structure, .35 + random(seed + 3) * .4);
      if (rockImage) rockImage({ x, y, radius, variant: Math.floor(random(seed + 4) * 4) });
      else drawRock(g, x, y, radius, color, seed);
      for (let pebble = 0; pebble < 4; pebble++) {
        drawRock(g, x + (random(seed + 30 + pebble) - .5) * 155, Math.max(13, y + (random(seed + 40 + pebble) - .5) * 80), 2 + random(seed + 50 + pebble) * 7, color, seed + 60 + pebble);
      }
      if ((row + column) % 7 === 0) drawVein(g, x + 64, y + 22, themeId === "frozen" ? 0xb5ced0 : themeId === "ruins" ? 0xa5a18f : 0xbdad86, seed);
      if ((row + column) % 11 === 0) drawPocket(g, x - 62, y + 15, seed, color);
    }
  }
  for (let index = 0; index < 17; index++) {
    const x = LEFT + 150 + index * 430 + random(index + 201) * 225;
    drawRoots(g, x, themeId === "frozen" ? 0x626c63 : 0x65503a, index + 201, themeId === "frozen" ? .65 : 1);
    if (themeId === "ruins") drawDebris(g, x + 90, 65 + random(index + 202) * 180, theme, index + 300);
    else if (themeId === "frozen") drawIce(g, x + 80, 58 + random(index + 202) * 195, theme, index + 300);
    else if (index % 3 === 0) drawFossil(g, x + 105, 125 + random(index + 202) * 100, index + 300);
  }
  // Crumbling edge remains inside the hazard, so its contact boundary stays clear.
  for (let x = LEFT; x < RIGHT; x += 13) {
    g.fillStyle(theme.surface, .65).fillTriangle(x, 2, x + 15, 2, x + 7, 4 + random(x + 7001) * 9);
  }
}

function drawStrata(g: Phaser.GameObjects.Graphics, theme: EnvironmentTheme, depth: number): void {
  const boundaries = [42, 115, 245, 440, 700, 1010, 1370, 1810, 2340, 2850];
  boundaries.forEach((base, row) => {
    if (base > depth - 20) return;
    const points: Point[] = [];
    for (let x = LEFT; x <= RIGHT; x += 60) points.push({ x, y: base + Math.sin(x / 233 + row * 1.3) * (9 + row * 2) + Math.sin(x / 91 + row) * 4 });
    const lower = points.map(p => ({ x: p.x, y: p.y + 9 + row * 2 })).reverse();
    g.fillStyle(row % 3 === 0 ? theme.surface : theme.structure, row % 2 ? .13 : .09); polygon(g, [...points, ...lower]);
    g.lineStyle(1, theme.light, .12); line(g, points);
    g.lineStyle(2, 0x211f1a, .12); line(g, lower);
    for (let x = LEFT + row * 51; x < RIGHT; x += 380) {
      const y = base + Math.sin(x / 233 + row * 1.3) * (9 + row * 2);
      g.lineStyle(1, 0x201e19, .2).lineBetween(x, y - 22, x + 13, y + 2).lineBetween(x + 13, y + 2, x + 7, y + 24);
      g.lineBetween(x + 13, y + 2, x + 32, y + 13);
    }
  });
}

function drawRock(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, color: number, seed: number): void {
  const points: Point[] = [], count = radius > 10 ? 9 : 6;
  const squash = .45 + random(seed + 7) * .4;
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2, r = radius * (.75 + random(seed + i * 3) * .25);
    points.push({ x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r * squash });
  }
  g.fillStyle(0x1b1c18, .12).fillEllipse(x + 5, y + radius * squash * .5, radius * 2.2, radius * squash * 1.3);
  g.fillStyle(color, .82); polygon(g, points);
  const center = { x: x - radius * .15, y: y - radius * .13 };
  points.forEach((p, index) => {
    const next = points[(index + 1) % count];
    if (!next) return;
    const faceColor = index >= count / 2 ? mix(color, 0xeadac0, .15) : mix(color, 0x252925, .22);
    g.fillStyle(faceColor, .42).fillTriangle(center.x, center.y, p.x, p.y, next.x, next.y);
  });
  g.lineStyle(1, mix(color, 0x1f241f, .45), .55); line(g, points, true);
  const upper = points.slice(Math.ceil(count / 2));
  g.lineStyle(1, mix(color, 0xe6dbc3, .4), .38); line(g, upper);
  if (radius < 10) return;
  for (let i = 0; i < 19; i++) {
    const dx = (random(seed + 100 + i) - .5) * radius * 1.3, dy = (random(seed + 150 + i) - .5) * radius * squash;
    g.fillStyle(i % 3 ? 0x22281e : 0xe1d7bc, .13).fillEllipse(x + dx, y + dy, 1 + i % 3, 1);
  }
  g.lineStyle(1, 0x171d17, .28).lineBetween(x - radius * .4, y - radius * .28, x + radius * .07, y + radius * .12).lineBetween(x + radius * .07, y + radius * .12, x + radius * .45, y + radius * .18);
  g.lineStyle(1, 0xded2b9, .14).lineBetween(x - radius * .4, y - radius * .28 + 1, x + radius * .07, y + radius * .12 + 1);
}

function drawRoots(g: Phaser.GameObjects.Graphics, x: number, color: number, seed: number, length: number): void {
  const root: Point[] = [{ x, y: 3 }];
  for (let i = 1; i < 7; i++) root.push({ x: x + Math.sin(i * .8 + seed) * (9 + i * 3), y: 3 + i * (13 + random(seed + i) * 8) * length });
  root.forEach((p, i) => {
    const next = root[i + 1];
    if (!next) return;
    g.lineStyle(Math.max(1, 5 - i * .7), color, .65).lineBetween(p.x, p.y, next.x, next.y);
    g.lineStyle(1, 0xceae7f, .2).lineBetween(p.x - 1, p.y, next.x - 1, next.y);
    for (const side of [-1, 1]) {
      const endX = p.x + side * (12 + random(seed + i + 70) * 23), endY = p.y + 24 * length;
      g.lineStyle(Math.max(.6, 2 - i * .2), color, .56).lineBetween(p.x, p.y, endX, endY).lineBetween(endX, endY, endX + side * 9, endY + 10);
      g.lineStyle(.6, color, .45).lineBetween(endX, endY - 4, endX + side * 13, endY + 2);
    }
  });
}

function drawVein(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number, seed: number): void {
  for (let i = 0; i < 7; i++) {
    const px = x + i * 11, py = y + Math.sin(i * .9 + seed) * 12;
    g.lineStyle(4, 0x262b23, .22).lineBetween(px, py, px + 12, py + Math.cos(i) * 7);
    g.lineStyle(2, color, .45).lineBetween(px, py, px + 12, py + Math.cos(i) * 7);
    if (i % 2 === 0) g.fillStyle(color, .5).fillTriangle(px - 3, py + 2, px + 2, py - 5, px + 6, py + 3);
  }
}

function drawPocket(g: Phaser.GameObjects.Graphics, x: number, y: number, seed: number, color: number): void {
  g.fillStyle(0x202720, .35).fillEllipse(x, y, 32 + random(seed) * 40, 16 + random(seed + 8) * 15);
  g.lineStyle(2, color, .65).lineBetween(x - 23, y - 7, x - 3, y - 12).lineBetween(x - 3, y - 12, x + 25, y - 5);
  for (let i = 0; i < 5; i++) drawRock(g, x - 22 + i * 10, y + 7, 3 + i % 3, color, seed + i);
}

function drawDebris(g: Phaser.GameObjects.Graphics, x: number, y: number, theme: EnvironmentTheme, seed: number): void {
  // Broken masonry and a corroded service pipe, embedded rather than collectible.
  for (let i = 0; i < 3; i++) {
    const px = x + i * 19, py = y + (i % 2) * 14;
    g.fillStyle(i % 2 ? 0x796b55 : 0x8b6c51, .72); polygon(g, [{ x: px - 15, y: py - 9 }, { x: px + 10, y: py - 13 }, { x: px + 16, y: py + 5 }, { x: px - 8, y: py + 10 }]);
    g.lineStyle(2, theme.light, .24).lineBetween(px - 15, py - 9, px + 10, py - 13);
    g.lineStyle(1, 0x2a2a24, .35).lineBetween(px - 2, py - 7, px + 4, py + 2).lineBetween(px + 4, py + 2, px + 12, py + 5);
  }
  const pipeY = y + 35 + random(seed) * 15;
  g.lineStyle(13, 0x333b35, .72).lineBetween(x - 42, pipeY, x + 21, pipeY + 12);
  g.lineStyle(8, 0x766d52, .7).lineBetween(x - 42, pipeY - 1, x + 21, pipeY + 11);
  g.lineStyle(2, theme.light, .3).lineBetween(x - 42, pipeY - 4, x + 19, pipeY + 8);
  g.fillStyle(0x252c27, .85).fillEllipse(x + 22, pipeY + 12, 6, 11);
  g.lineStyle(2, 0x584d3c, .8).lineBetween(x + 14, pipeY + 22, x + 65, pipeY + 35).lineBetween(x + 65, pipeY + 35, x + 72, pipeY + 26);
}

function drawIce(g: Phaser.GameObjects.Graphics, x: number, y: number, theme: EnvironmentTheme, seed: number): void {
  const width = 55 + random(seed) * 75;
  const points = [{ x: x - width, y }, { x: x - width * .55, y: y - 14 }, { x: x + width * .3, y: y - 11 }, { x: x + width, y: y + 3 }, { x: x + width * .45, y: y + 15 }, { x: x - width * .7, y: y + 12 }];
  g.fillStyle(0x426b79, .24); polygon(g, points);
  g.fillStyle(theme.light, .23).fillTriangle(x - width, y, x + width * .3, y - 11, x + width * .45, y + 15);
  g.lineStyle(2, theme.light, .45); line(g, points.slice(0, 4));
  g.lineStyle(1, 0x436b78, .4).lineBetween(x - width * .3, y - 8, x - width * .1, y + 4).lineBetween(x - width * .1, y + 4, x + width * .5, y + 7);
  g.lineStyle(1, theme.light, .35).lineBetween(x - width * .1, y + 4, x + width * .2, y - 7);
}

function drawFossil(g: Phaser.GameObjects.Graphics, x: number, y: number, seed: number): void {
  const color = 0xb7a27d, angle = (random(seed) - .5) * .6;
  const point = (dx: number, dy: number) => ({ x: x + dx * Math.cos(angle) - dy * Math.sin(angle), y: y + dx * Math.sin(angle) + dy * Math.cos(angle) });
  for (let i = 0; i < 7; i++) {
    const p = point(-27 + i * 8, Math.sin(i * .4) * 3);
    g.fillStyle(color, .58).fillEllipse(p.x, p.y, 6, 5);
    const a = point(-27 + i * 8, 3), b = point(-30 + i * 8, 9 + Math.sin(i / 6 * Math.PI) * 8), c = point(-34 + i * 8, 17 + Math.sin(i / 6 * Math.PI) * 8);
    g.lineStyle(2, color, .48).lineBetween(a.x, a.y, b.x, b.y).lineBetween(b.x, b.y, c.x, c.y);
    g.lineStyle(1, 0x4a4336, .35).lineBetween(a.x + 2, a.y, b.x + 2, b.y);
  }
  const skull = point(-39, -1);
  g.fillStyle(color, .5).fillEllipse(skull.x, skull.y, 16, 10);
  g.fillStyle(0x514637, .65).fillCircle(skull.x - 2, skull.y - 1, 2);
}

function polygon(g: Phaser.GameObjects.Graphics, points: readonly Point[]): void {
  path(g, points); g.closePath().fillPath();
}

function line(g: Phaser.GameObjects.Graphics, points: readonly Point[], closed = false): void {
  path(g, points); if (closed) g.closePath(); g.strokePath();
}

function path(g: Phaser.GameObjects.Graphics, points: readonly Point[]): void {
  g.beginPath();
  points.forEach((p, index) => { if (index === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y); });
}

function random(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function mix(a: number, b: number, amount: number): number {
  const channel = (shift: number) => Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}
