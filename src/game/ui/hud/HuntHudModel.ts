import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
export const HuntHudModel = {
  fromSnapshot(snapshot: SessionSnapshot) {
    const h = snapshot.hunt; if (!h) throw new Error("Hunt HUD requires Hunt snapshot.");
    const remaining = (tick: number) => `${Math.max(0, (tick - snapshot.tick) / 60).toFixed(1)}s`;
    return Object.freeze({ health: `Ranger ${String(Math.ceil(h.hunterHealth))} / 100`, worm: `Maw ${String(Math.ceil(h.wormHealth))} / 100`, relay: `Relay ${String(Math.ceil(h.relayIntegrity))} / 200`, ammo: h.rifle.reloadUntilTick > snapshot.tick ? `Reload ${remaining(h.rifle.reloadUntilTick)}` : `Ammo ${String(h.rifle.ammo)} / 6`, snare: h.snare.phase !== "none" ? `Snare ${h.snare.phase}` : h.snare.readyTick > snapshot.tick ? `Snare ${remaining(h.snare.readyTick)}` : "Snare ready · Q", dodge: h.hunter.dodgeReadyTick > snapshot.tick ? `Dodge ${remaining(h.hunter.dodgeReadyTick)}` : "Dodge ready · Shift", tracking: h.tracking.text, score: h.score });
  }
};
