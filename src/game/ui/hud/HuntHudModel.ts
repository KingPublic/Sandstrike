import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
export type HuntHudFields = Readonly<Record<string, string | number>>;
export const HuntHudModel = {
  fromSnapshot(snapshot: SessionSnapshot): HuntHudFields {
    const h = snapshot.hunt; if (!h) throw new Error("Hunt HUD requires Hunt snapshot.");
    const remaining = (tick: number) => `${Math.max(0, (tick - snapshot.tick) / 60).toFixed(1)}s`;
    const ammo = h.rifle.reloadUntilTick > snapshot.tick ? `Reload ${remaining(h.rifle.reloadUntilTick)}` : `Ammo ${String(h.rifle.ammo)} / 6`;
    const dodge = h.hunter.dodgeReadyTick > snapshot.tick ? `Dodge ${remaining(h.hunter.dodgeReadyTick)}` : "Dodge ready · Shift";
    const world = snapshot.world;
    if (world) {
      const gap = Math.round(world.surfaceY - (h.hunter.position.y + 16));
      return Object.freeze({
      health: `Hunter ${String(Math.ceil(h.hunterHealth))} / 100`,
      height: `Height ${String(Math.max(0, Math.round(-h.hunter.position.y)))}`,
      stage: world.stage === "boss" ? "Boss stage" : "Ascent stage",
      danger: gap >= 0 ? `Sand gap ${String(gap)}` : `BURIED ${String(-gap)}`,
      ammo,
      skill: "Skill ready · Q",
      dodge,
      tracking: h.tracking.text,
      score: h.score,
      });
    }
    return Object.freeze({ health: `Ranger ${String(Math.ceil(h.hunterHealth))} / 100`, worm: `Maw ${String(Math.ceil(h.wormHealth))} / 100`, relay: `Relay ${String(Math.ceil(h.relayIntegrity))} / 200`, ammo, snare: h.snare.phase !== "none" ? `Snare ${h.snare.phase}` : h.snare.readyTick > snapshot.tick ? `Snare ${remaining(h.snare.readyTick)}` : "Snare ready · Q", dodge, tracking: h.tracking.text, score: h.score });
  }
};
