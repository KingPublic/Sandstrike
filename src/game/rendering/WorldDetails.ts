import type Phaser from "phaser";
import type { EnvironmentTheme, ThemeId } from "../data/themes";
import type { AscentWorldSnapshot } from "../domain/world/AscentWorld";

export function drawTowerDetails(g: Phaser.GameObjects.Graphics, world: AscentWorldSnapshot, theme: EnvironmentTheme): void {
  for (const x of [-2800, -1500, -520, 520, 1500, 2800]) {
    g.fillStyle(theme.structure, .28).fillRect(x - 110, world.bounds.top, 220, -world.bounds.top);
    g.lineStyle(3, theme.light, .08).lineBetween(x - 105, world.bounds.top, x - 105, 0);
    for (let y = -60; y > world.bounds.top; y -= 120) {
      for (let index = 0; index < 5; index++) g.fillStyle(theme.light, (index + Math.abs(y / 120)) % 3 === 0 ? .22 : .08).fillRect(x - 80 + index * 36, y, 18, 38);
      g.lineStyle(1, 0x222925, .2).lineBetween(x - 108, y + 55, x + 108, y + 55);
      g.lineStyle(1, theme.light, .11).lineBetween(x - 106, y + 57, x + 106, y + 57);
      g.lineStyle(3, theme.structure, .45).lineBetween(x + 84, y - 65, x + 84, y + 55);
      for (let crack = 0; crack < 6; crack++) {
        const cx = x - 95 + (crack * 43 + Math.abs(y)) % 175, cy = y - 40 + crack * 15;
        g.lineStyle(1, theme.light, .12).lineBetween(cx, cy, cx + 5, cy + 2).lineBetween(cx + 5, cy + 2, cx + 13, cy - 3);
      }
    }
  }
  for (const p of world.platforms) {
    if (p.id === "base" || p.id === "summit") continue;
    const height = Math.min(88, -p.y);
    const left = p.left + 18, right = p.right - 18;
    g.fillStyle(0x0b111e, .27).fillRect(p.left + 8, p.y + 10, p.right - p.left - 16, height);
    g.fillStyle(theme.structure, .8).fillRect(left, p.y + 20, 14, height).fillRect(right - 14, p.y + 20, 14, height);
    for (let x = left + 14; x < right - 14; x += 300) {
      const end = Math.min(right - 14, x + 300);
      g.lineStyle(4, theme.structure, .9).lineBetween(x, p.y + 30, end, p.y + height).lineBetween(end, p.y + 30, x, p.y + height);
    }
    g.lineStyle(2, theme.light, .12).lineBetween(left + 5, p.y + 30, left + 5, p.y + height);
    g.lineStyle(1, 0x1b2320, .45).lineBetween(left, p.y + 32, right, p.y + 32);
    g.fillStyle(theme.light, .13).fillRoundedRect((p.left + p.right) / 2 - 28, p.y + 34, 56, 20, 3);
    const next = world.platforms.find(n => n.y === p.y - 90 && n.right - n.left < 1000);
    if (next && p.right - p.left > 1000) {
      const direction = (next.left + next.right) / 2 < 0 ? -1 : 1;
      for (let x = p.left + 160; x < p.right - 160; x += 500) g.lineStyle(3, theme.light, .5).lineBetween(x - direction * 8, p.y - 26, x + direction * 8, p.y - 18).lineBetween(x + direction * 8, p.y - 18, x - direction * 8, p.y - 10);
    }
  }
}

export function drawWeather(g: Phaser.GameObjects.Graphics, themeId: ThemeId, color: number, tick: number, view: Readonly<{ left: number; right: number; top: number; bottom: number }>): void {
  g.clear();
  const width = view.right - view.left, height = view.bottom - view.top;
  if (width <= 0 || height <= 0) return;
  for (let i = 0; i < 24; i++) {
    const x = view.left + ((i * 157.3 + tick * (themeId === "frozen" ? .3 : 1.2)) % width);
    const y = view.top + ((i * 113.7 + tick * (themeId === "frozen" ? .8 : .15)) % height);
    if (themeId === "frozen") g.fillStyle(0xe4ffff, .18 + i % 3 * .08).fillCircle(x, y, 1.5 + i % 2);
    else g.lineStyle(1, color, .1 + i % 4 * .035).lineBetween(x, y, x + 5 + i % 8, y - 2);
  }
}
