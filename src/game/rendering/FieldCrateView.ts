import type Phaser from "phaser";

/** Steel field case: recessed lid, corner guards, hinges and a readable equipment icon. */
export function drawFieldCrate(g: Phaser.GameObjects.Graphics, x: number, y: number, kind: "medical" | "supply" | "rpg", ready = true): void {
  const width = kind === "rpg" ? 60 : 36, height = kind === "rpg" ? 30 : 28;
  const left = x - width / 2, top = y - height / 2;
  const accent = ready ? kind === "medical" ? 0xb5cfa5 : kind === "supply" ? 0xe5b974 : 0xc3c9a4 : 0x817f75;
  g.fillStyle(0x10130f, .3).fillEllipse(x + 3, y + height / 2 + 2, width + 8, 7);
  g.fillStyle(0x20261f).fillRoundedRect(left, top, width, height, 3);
  g.fillStyle(0x576054).fillRect(left + 2, top + 2, width - 4, 6);
  g.fillStyle(0x3c4437).fillRect(left + 3, top + 9, width - 6, height - 12);
  g.lineStyle(1, 0xa3a597, .6).lineBetween(left + 3, top + 2, left + width - 3, top + 2);
  for (const side of [-1, 1]) {
    g.fillStyle(0x192019).fillRect(x + side * (width / 2 - 5) - 2, top, 4, height);
    g.fillStyle(0xa3a597).fillRect(x + side * 8 - 2, top + 5, 4, 4);
  }
  g.fillStyle(0x171e18).fillRect(x - 5, top - 2, 10, 3);
  g.fillStyle(accent).fillRect(left + 5, top + height - 4, width - 10, 2);
  if (kind === "medical") g.fillRect(x - 2, y - 3, 4, 12).fillRect(x - 6, y + 1, 12, 4);
  else if (kind === "supply") { g.fillTriangle(x - 6, y + 8, x + 2, y - 3, x + 1, y + 3); g.fillTriangle(x - 1, y + 3, x + 7, y + 3, x - 2, y + 12); }
  else g.fillRoundedRect(x - 13, y + 2, 26, 4, 1).fillTriangle(x + 13, y, x + 19, y + 4, x + 13, y + 8);
}
