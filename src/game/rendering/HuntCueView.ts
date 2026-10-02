import type Phaser from "phaser";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
export class HuntCueView {
  private readonly crateGraphics: Phaser.GameObjects.Graphics;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly crateLabel: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, private readonly debug = false) { this.crateGraphics = scene.add.graphics().setDepth(15); this.crateLabel = scene.add.text(0, 0, "RPG CRATE", { fontFamily: "Arial", fontSize: "14px", color: "#b7fff0", backgroundColor: "#183b3a" }).setOrigin(.5).setDepth(43); this.graphics = scene.add.graphics().setDepth(42); this.label = scene.add.text(0, -90, "", { fontFamily: "Arial", fontSize: "15px", color: "#ffe5a4", backgroundColor: "#211a27" }).setOrigin(.5).setDepth(43); }
  render(snapshot: SessionSnapshot): void {
    const h = snapshot.hunt; this.graphics.clear(); this.crateGraphics.clear(); this.crateLabel.setVisible(Boolean(snapshot.world)); this.label.setVisible(Boolean(h) && this.debug); if (!h) return;
    for (const cache of h.medical) {
      if (cache.claimed) continue;
      const p = cache.position, g = this.crateGraphics;
      g.fillStyle(0x284b48).fillRoundedRect(p.x - 16, p.y - 10, 32, 24, 4);
      g.lineStyle(2, 0x94e5b9).strokeRoundedRect(p.x - 16, p.y - 10, 32, 24, 4);
      g.fillStyle(0xcaffda).fillRect(p.x - 2, p.y - 6, 4, 16).fillRect(p.x - 7, p.y, 14, 4);
    }
    const surfaceY = snapshot.world?.surfaceY ?? 0;
    if (snapshot.world) {
      const y = snapshot.world.summit.y, crate = this.crateGraphics;
      crate.fillStyle(0x254f50).fillRoundedRect(-30, y - 30, 60, 30, 4);
      crate.lineStyle(3, h.rpg.crateReady ? 0x8af1db : 0xc4a778).strokeRoundedRect(-30, y - 30, 60, 30, 4);
      crate.lineStyle(4, 0x8af1db).lineBetween(-10, y - 15, 10, y - 15).lineBetween(0, y - 25, 0, y - 5);
      this.crateLabel.setPosition(0, y - 52);
    }
    const t = h.tracking, pulse = .5 + Math.sin(snapshot.tick * .12) * .2;
    this.graphics.lineStyle(3, t.breachBracket ? 0xff9370 : 0xe1bf84, pulse);
    this.graphics.lineBetween(t.cueX - 60, surfaceY + 5, t.cueX + 60, surfaceY + 5);
    if (t.breachBracket) {
      const b = t.breachBracket; this.graphics.fillStyle(0xff7759, .14).fillRect(b.left, surfaceY - 8, b.right - b.left, 16);
      for (const x of [b.left, b.right]) this.graphics.lineBetween(x, surfaceY - 28, x, surfaceY + 10);
      this.label.setPosition((b.left + b.right) / 2, surfaceY - 100).setText("! BREACH SECTOR !");
    } else this.label.setPosition(t.cueX, surfaceY - 80).setText(t.band === "near" ? "SHALLOW TREMOR" : t.band === "deep" ? "DEEP TREMOR" : "EXPOSED");
    if (h.snare.position) {
      const p = h.snare.position; this.graphics.lineStyle(2, h.snare.phase === "arming" ? 0xffc66c : 0x8af1db, .8).strokeEllipse(p.x, p.y, 300, 35);
      this.graphics.fillStyle(0x8af1db).fillTriangle(p.x - 9, p.y - 4, p.x + 9, p.y - 4, p.x, p.y - 18);
    }
    if (h.shot) this.graphics.lineStyle(2, 0xfff4d2, .9).lineBetween(h.shot.from.x, h.shot.from.y, h.shot.to.x, h.shot.to.y);
  }
  destroy(): void { this.crateGraphics.destroy(); this.graphics.destroy(); this.label.destroy(); this.crateLabel.destroy(); }
}
