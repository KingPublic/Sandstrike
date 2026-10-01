import Phaser from "phaser";

import {
  GAME_LIFECYCLE_REGISTRY_KEY,
  type GameBootstrapOptions,
} from "../createGame";

export class GameplayScene extends Phaser.Scene {
  constructor() {
    super("Gameplay");
  }

  create(): void {
    this.drawDesertPreview();

    this.add
      .text(640, 104, "MOVEMENT SLICE PENDING", {
        color: "#fff4d1",
        fontFamily: "system-ui, sans-serif",
        fontSize: "30px",
        fontStyle: "bold",
        letterSpacing: 5,
        shadow: {
          offsetX: 0,
          offsetY: 4,
          color: "#160d1d",
          blur: 10,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.add
      .text(640, 154, "Renderer online / terrain profile reserved", {
        color: "#e3cba0",
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
      })
      .setOrigin(0.5);

    const lifecycle = this.registry.get(
      GAME_LIFECYCLE_REGISTRY_KEY,
    ) as GameBootstrapOptions | undefined;
    lifecycle?.onReady?.();
  }

  private drawDesertPreview(): void {
    const graphics = this.add.graphics();
    const skyBands = [0x17101f, 0x25162a, 0x452334, 0x804233, 0xd07b46];

    skyBands.forEach((color, index) => {
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, index * 82, 1280, 84);
    });

    for (let radius = 90; radius >= 28; radius -= 14) {
      graphics.fillStyle(0xffc873, 0.05 + (90 - radius) / 320);
      graphics.fillCircle(1015, 190, radius);
    }

    this.drawDune(graphics, 0xd08a52, 390, 50, 0.9);
    this.drawDune(graphics, 0xb46a43, 455, 120, 1.15);
    this.drawDune(graphics, 0x7d4436, 525, 18, 0.82);

    graphics.fillStyle(0x4a2c2c, 1);
    graphics.fillRect(0, 575, 1280, 145);
    graphics.lineStyle(3, 0xf2bd72, 0.55);
    graphics.lineBetween(0, 575, 1280, 575);

    for (let index = 0; index < 46; index += 1) {
      const x = (index * 197) % 1280;
      const y = 600 + ((index * 43) % 106);
      graphics.fillStyle(index % 3 === 0 ? 0xd78d54 : 0x8d523c, 0.42);
      graphics.fillCircle(x, y, 1 + (index % 3));
    }
  }

  private drawDune(
    graphics: Phaser.GameObjects.Graphics,
    color: number,
    baseline: number,
    phase: number,
    amplitude: number,
  ): void {
    const points: Phaser.Math.Vector2[] = [new Phaser.Math.Vector2(0, 720)];
    for (let x = 0; x <= 1280; x += 32) {
      const wave = Math.sin((x + phase) / 180) * 34 * amplitude;
      const detail = Math.sin((x + phase * 2) / 71) * 9;
      points.push(new Phaser.Math.Vector2(x, baseline + wave + detail));
    }
    points.push(new Phaser.Math.Vector2(1280, 720));
    graphics.fillStyle(color, 1);
    graphics.fillPoints(points, true);
  }
}
