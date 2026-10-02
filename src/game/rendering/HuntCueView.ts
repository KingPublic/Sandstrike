import type Phaser from "phaser";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
export class HuntCueView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) { this.graphics = scene.add.graphics().setDepth(42); this.label = scene.add.text(0, -90, "", { fontFamily: "Arial", fontSize: "15px", color: "#ffe5a4", backgroundColor: "#211a27" }).setOrigin(.5).setDepth(43); }
  render(snapshot: SessionSnapshot): void {
    const h = snapshot.hunt; this.graphics.clear(); this.label.setVisible(Boolean(h)); if (!h) return;
    const t = h.tracking, pulse = .5 + Math.sin(snapshot.tick * .12) * .2;
    this.graphics.lineStyle(3, t.breachBracket ? 0xff9370 : 0xe1bf84, pulse);
    this.graphics.lineBetween(t.cueX - 60, 5, t.cueX + 60, 5);
    if (t.breachBracket) {
      const b = t.breachBracket; this.graphics.fillStyle(0xff7759, .14).fillRect(b.left, -8, b.right - b.left, 16);
      for (const x of [b.left, b.right]) this.graphics.lineBetween(x, -28, x, 10);
      this.label.setPosition((b.left + b.right) / 2, -100).setText("! BREACH SECTOR !");
    } else this.label.setPosition(t.cueX, -80).setText(t.band === "near" ? "SHALLOW TREMOR" : t.band === "deep" ? "DEEP TREMOR" : "EXPOSED");
    if (h.snare.position) {
      const p = h.snare.position; this.graphics.lineStyle(2, h.snare.phase === "arming" ? 0xffc66c : 0x8af1db, .8).strokeEllipse(p.x, p.y, 300, 35);
      this.graphics.fillStyle(0x8af1db).fillTriangle(p.x - 9, -4, p.x + 9, -4, p.x, -18);
    }
    if (h.shot) this.graphics.lineStyle(2, 0xfff4d2, .9).lineBetween(h.shot.from.x, h.shot.from.y, h.shot.to.x, h.shot.to.y);
  }
  destroy(): void { this.graphics.destroy(); this.label.destroy(); }
}
