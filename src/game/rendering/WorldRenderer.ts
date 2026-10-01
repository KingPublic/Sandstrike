import Phaser from "phaser";

const WORLD_LEFT = -20_000;
const WORLD_RIGHT = 20_000;
const WORLD_TOP = -1_200;
const WORLD_BOTTOM = 3_200;

export class WorldRenderer {
  readonly bounds = Object.freeze({
    left: WORLD_LEFT,
    right: WORLD_RIGHT,
    top: WORLD_TOP,
    bottom: WORLD_BOTTOM,
  });

  constructor(private readonly scene: Phaser.Scene) {}

  create(): void {
    const backdrop = this.scene.add.graphics();
    backdrop.setDepth(-100);

    const skyBands = [0x110c19, 0x1d1022, 0x3a1b2d, 0x6b302f, 0xb45d3c];
    const bandHeight = Math.abs(WORLD_TOP) / skyBands.length;
    skyBands.forEach((color, index) => {
      backdrop.fillStyle(color, 1);
      backdrop.fillRect(
        WORLD_LEFT,
        WORLD_TOP + index * bandHeight,
        WORLD_RIGHT - WORLD_LEFT,
        bandHeight + 2,
      );
    });

    this.drawSun(backdrop);
    this.drawDistantDunes(backdrop);

    const groundBands = [
      { y: 0, height: 170, color: 0x9f5138 },
      { y: 170, height: 260, color: 0x71382f },
      { y: 430, height: 390, color: 0x4c2930 },
      { y: 820, height: 2_380, color: 0x291b27 },
    ];
    for (const band of groundBands) {
      backdrop.fillStyle(band.color, 1);
      backdrop.fillRect(
        WORLD_LEFT,
        band.y,
        WORLD_RIGHT - WORLD_LEFT,
        band.height,
      );
    }

    backdrop.lineStyle(5, 0xf2b866, 0.9);
    backdrop.lineBetween(WORLD_LEFT, 0, WORLD_RIGHT, 0);
    backdrop.lineStyle(2, 0xffd58b, 0.26);
    backdrop.lineBetween(WORLD_LEFT, 8, WORLD_RIGHT, 8);

    for (let index = 0; index < 180; index += 1) {
      const x = WORLD_LEFT + ((index * 977) % (WORLD_RIGHT - WORLD_LEFT));
      const y = 36 + ((index * 193) % 3_050);
      const radius = 1 + (index % 4);
      backdrop.fillStyle(index % 3 === 0 ? 0xe29756 : 0xb96b46, 0.22);
      backdrop.fillCircle(x, y, radius);
    }
  }

  private drawSun(graphics: Phaser.GameObjects.Graphics): void {
    for (let radius = 150; radius >= 38; radius -= 16) {
      graphics.fillStyle(0xffc470, 0.025 + (150 - radius) / 900);
      graphics.fillCircle(620, -610, radius);
    }
    graphics.fillStyle(0xffc878, 0.72);
    graphics.fillCircle(620, -610, 38);
  }

  private drawDistantDunes(graphics: Phaser.GameObjects.Graphics): void {
    const colors = [0x7f3d36, 0xa9513a, 0xc96f45];
    colors.forEach((color, layer) => {
      const points: Phaser.Math.Vector2[] = [
        new Phaser.Math.Vector2(WORLD_LEFT, 0),
      ];
      for (let x = WORLD_LEFT; x <= WORLD_RIGHT; x += 160) {
        const y =
          -85 -
          layer * 38 +
          Math.sin((x + layer * 270) / (520 + layer * 90)) * (45 + layer * 8) +
          Math.sin(x / 173) * 12;
        points.push(new Phaser.Math.Vector2(x, y));
      }
      points.push(new Phaser.Math.Vector2(WORLD_RIGHT, 0));
      graphics.fillStyle(color, 0.7 + layer * 0.1);
      graphics.fillPoints(points, true);
    });
  }
}
