import { createActor, type ActorId, type ActorState, type RemovalCause } from "./Actor";

export class ActorRegistry {
  private readonly actors = new Map<ActorId, ActorState>();
  private readonly removals = new Map<ActorId, RemovalCause>();
  private readonly spawns = new Map<ActorId, ActorState>();

  constructor(initial: readonly ActorState[] = []) {
    for (const actor of initial) {
      if (this.actors.has(actor.id)) throw new Error(`Duplicate actor ${actor.id}.`);
      this.actors.set(actor.id, createActor(actor));
    }
  }

  get(id: ActorId): ActorState | undefined { return this.actors.get(id); }

  snapshot(): readonly ActorState[] {
    return Object.freeze([...this.actors.values()].sort((a, b) => a.id.localeCompare(b.id)));
  }

  update(actor: ActorState): void {
    if (!this.actors.has(actor.id)) throw new Error(`Unknown actor ${actor.id}.`);
    this.actors.set(actor.id, createActor(actor));
  }

  deferSpawn(actor: ActorState): void {
    if (this.actors.has(actor.id) || this.spawns.has(actor.id)) throw new Error(`Duplicate spawn ${actor.id}.`);
    this.spawns.set(actor.id, createActor(actor));
  }

  markForRemoval(id: ActorId, cause: RemovalCause): boolean {
    const actor = this.actors.get(id);
    if (!actor || actor.lifecycle !== "active") return false;
    this.removals.set(id, cause);
    this.actors.set(id, createActor({ ...actor, lifecycle: "pending-removal" }));
    return true;
  }

  commit(): { readonly spawned: readonly ActorState[]; readonly removed: readonly Readonly<{ actor: ActorState; cause: RemovalCause }>[] } {
    const removed = [...this.removals].sort(([a], [b]) => a.localeCompare(b)).map(([id, cause]) => {
      const actor = this.actors.get(id)!;
      this.actors.delete(id);
      return Object.freeze({ actor, cause });
    });
    const spawned = [...this.spawns.values()].sort((a, b) => a.id.localeCompare(b.id));
    for (const actor of spawned) this.actors.set(actor.id, actor);
    this.removals.clear();
    this.spawns.clear();
    return Object.freeze({ spawned: Object.freeze(spawned), removed: Object.freeze(removed) });
  }
}
