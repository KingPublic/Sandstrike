import type Phaser from "phaser";
import type { FeedbackCommand } from "./FeedbackController";

interface Effect { command: FeedbackCommand; age: number; x: number; y: number }
export class EffectsRenderer {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly labels: Phaser.GameObjects.Text[];
  private readonly effects: Effect[] = [];
  constructor(private readonly scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(40);
    this.labels = Array.from({ length: 16 }, () => scene.add.text(0, 0, "", { fontFamily: "system-ui", fontSize: "18px", fontStyle: "bold", color: "#fff1cb", stroke: "#170e1a", strokeThickness: 4 }).setOrigin(0.5).setDepth(45).setVisible(false));
  }
  consume(commands: readonly FeedbackCommand[]): void {
    for (const command of commands) {
      if (this.effects.length >= 32) break;
      const camera = this.scene.cameras.main;
      this.effects.push({ command, age: 0, x: command.position?.x ?? camera.midPoint.x, y: command.position?.y ?? camera.midPoint.y - 100 });
    }
  }
  update(dt: number, reducedMotion: boolean): void {
    this.graphics.clear();
    for (const label of this.labels) label.setVisible(false);
    let particleBudget = 48;
    for (let index = this.effects.length - 1; index >= 0; index -= 1) {
      const effect = this.effects[index];
      if (!effect) continue;
      effect.age += Math.min(0.05, Math.max(0, dt));
      if (effect.age >= 0.65) { this.effects.splice(index, 1); continue; }
      const { command, x, y, age } = effect;
      const alpha = Math.min(1, (0.65 - age) * 4);
      const radius = reducedMotion ? 24 : 16 + age * 45;
      this.graphics.lineStyle(2.5, command.color, alpha);
      if (command.shape === "ring") this.graphics.strokeCircle(x, y, radius);
      else if (command.shape === "cross") this.graphics.lineBetween(x - 9, y, x + 9, y).lineBetween(x, y - 9, x, y + 9);
      else this.graphics.strokeTriangle(x, y - radius, x - radius, y + radius * 0.6, x + radius, y + radius * 0.6);
      const count = Math.min(particleBudget, reducedMotion ? 0 : command.particles);
      particleBudget -= count;
      for (let particle = 0; particle < count; particle += 1) {
        const angle = particle * 2.39996;
        this.graphics.fillStyle(command.color, alpha * 0.7).fillCircle(x + Math.cos(angle) * age * 100, y + Math.sin(angle) * age * 75 + age * age * 100, 2);
      }
      const label = this.labels[index];
      label?.setVisible(true).setText(command.label).setPosition(x, y - 38 - (reducedMotion ? 0 : age * 30)).setAlpha(alpha);
    }
  }
  reset(): void { this.effects.length = 0; this.graphics.clear(); for (const label of this.labels) label.setVisible(false); }
  destroy(): void { this.graphics.destroy(); for (const label of this.labels) label.destroy(); }
}
