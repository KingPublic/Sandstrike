import type { ActorState } from "../actors/Actor";
import type { Vec2 } from "../math/Vector2";
import type { Platform } from "../world/PlatformContacts";

export interface RecoveryStation { readonly id: string; readonly position: Vec2; readonly claimed: boolean }
/** One-use medical caches on the long catwalks, collected only by the player. */
export class RecoveryStations {
  private readonly claimed = new Set<string>();
  private readonly stations: readonly Omit<RecoveryStation, "claimed">[];
  constructor(platforms: readonly Platform[]) {
    this.stations = platforms.filter(p => p.id.startsWith("ledge.") && p.right - p.left > 1000)
      .flatMap(p => [-1, 0, 1].map(index => Object.freeze({ id: `medical.${p.id}.${String(index)}`, position: Object.freeze({ x: index * (p.right - p.left) / 3, y: p.y - 16 }) })));
  }
  collect(owner: ActorState): number {
    if (owner.id !== "hunter" || owner.health <= 0 || owner.health >= owner.maxHealth || owner.lifecycle !== "active") return 0;
    const station = this.stations.find(s => !this.claimed.has(s.id) && Math.abs(owner.position.x - s.position.x) < 64 && Math.abs(owner.position.y - s.position.y) < 30);
    if (!station) return 0;
    this.claimed.add(station.id);
    return Math.min(35, owner.maxHealth - owner.health);
  }
  snapshot(): readonly RecoveryStation[] { return Object.freeze(this.stations.map(s => Object.freeze({ ...s, claimed: this.claimed.has(s.id) }))); }
}
