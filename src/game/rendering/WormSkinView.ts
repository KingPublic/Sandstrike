import Phaser from "phaser";
import type { Vec2 } from "../domain/math/Vector2";

/** Textured skin follows the same interpolated path and surface mask as the logical worm. */
export class WormSkinView {
  private readonly pieces: Phaser.GameObjects.Image[] = [];
  private readonly clip: Phaser.GameObjects.Graphics;
  private readonly mask: Phaser.Display.Masks.GeometryMask;
  private readonly layer: Phaser.GameObjects.Container;
  private readonly webglMask: Phaser.Filters.Mask | undefined;
  constructor(private readonly scene: Phaser.Scene, private readonly tint: number) {
    this.clip = scene.add.graphics();
    this.clip.removeFromDisplayList();
    this.mask = this.clip.createGeometryMask();
    this.layer = scene.add.container(0, 0).setDepth(31);
    if (scene.game.renderer.type === Phaser.WEBGL) {
      this.layer.enableFilters();
      this.webglMask = this.layer.filters?.external.addMask(this.clip, false, scene.cameras.main);
    }
  }
  get available(): boolean { return this.scene.textures.exists("worm-head") && this.scene.textures.exists("worm-segment"); }
  render(poses: readonly Readonly<{ position: Vec2; tangent: Vec2 }>[], radii: readonly number[], surfaceOnly: boolean, surfaceY: number): void {
    this.clip.clear();
    if (surfaceOnly) this.clip.fillStyle(0xffffff).fillRect(-20000, -20000, 40000, 20000 + surfaceY);
    if (this.webglMask) this.webglMask.active = surfaceOnly;
    poses.forEach((pose, index) => {
      let piece = this.pieces[index];
      if (!piece) { piece = this.scene.add.image(0, 0, index === 0 ? "worm-head" : "worm-segment").setTint(this.tint); this.layer.addAt(piece, 0); this.pieces[index] = piece; }
      const r = radii[index] ?? 10;
      piece.setVisible(true).setDepth(31 + (poses.length - index) * .01).setPosition(pose.position.x, pose.position.y).setRotation(Math.atan2(pose.tangent.y, pose.tangent.x));
      piece.setOrigin(index === 0 ? .43 : .5, .5).setDisplaySize(index === 0 ? r * 4 : r * 2.45, index === 0 ? r * 2.8 : r * 2.5);
      if (!this.webglMask) { if (surfaceOnly) piece.setMask(this.mask); else piece.clearMask(); }
    });
    for (let index = poses.length; index < this.pieces.length; index++) this.pieces[index]?.setVisible(false);
  }
  hide(): void { for (const piece of this.pieces) piece.setVisible(false); }
  destroy(): void { this.layer.destroy(true); this.mask.destroy(); this.clip.destroy(); }
}
