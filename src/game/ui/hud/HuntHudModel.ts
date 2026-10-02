import { themes } from "../../data/themes";
import { characterForRole, weaponById } from "../../data/characters";
import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
export type HuntHudFields = Readonly<Record<string, string | number | undefined>>;

function wormLifeText(snapshot: SessionSnapshot): string | undefined {
  const life = snapshot.wormLife;
  if (!life) return undefined;
  if (life.phase === "absent") return `Maw returns ${(life.returnInTicks / 60).toFixed(1)}s`;
  return `Maw gen ${String(life.generation)} · kills ${String(life.kills)}`;
}
export const HuntHudModel = {
  fromSnapshot(snapshot: SessionSnapshot, debug = false): HuntHudFields {
    const h = snapshot.hunt; if (!h) throw new Error("Hunt HUD requires Hunt snapshot.");
    const remaining = (tick: number) => `${Math.max(0, (tick - snapshot.tick) / 60).toFixed(1)}s`;
    const character = characterForRole("hunt", snapshot.characterId);
    const skill = snapshot.skill?.ability;
    const skillLabel = skill ? `${character?.skill.name ?? "Skill"} · ${skill.active ? "active" : skill.cooldownTicksRemaining > 0 ? `${(skill.cooldownTicksRemaining / 60).toFixed(1)}s` : "ready · Q"}` : "Skill ready · Q";
    const ammo = h.rifle.reloadUntilTick > snapshot.tick ? `Reload ${remaining(h.rifle.reloadUntilTick)}` : `Ammo ${String(h.rifle.ammo)} / ${String(weaponById(h.rifle.weaponId).magazine)}`;
    const dodge = h.hunter.dodgeReadyTick > snapshot.tick ? `Dodge ${remaining(h.hunter.dodgeReadyTick)}` : "Dodge ready · Shift";
    const world = snapshot.world;
    if (world) {
      const next = world.platforms.filter(p => p.y < h.hunter.position.y - 4 && h.hunter.position.y + 16 - p.y <= 122).sort((a,b) => b.y - a.y)[0];
      const nextX = next ? Math.max(next.left + 30, Math.min(next.right - 30, h.hunter.position.x)) : h.hunter.position.x;
      const walk = nextX - h.hunter.position.x;
      const route = Math.abs(walk) > 30 ? `${walk < 0 ? "\u2190" : "\u2192"} Next stairs${debug ? ` ${String(Math.round(Math.abs(walk)))}px` : ""}` : "Jump to the next ledge";
      const gap = Math.round(world.surfaceY - (h.hunter.position.y + 16));
      return Object.freeze({
      route: world.stage === "ascent" ? route : h.boss.shieldActive ? "SHIELD ACTIVE \u00b7 reposition" : "Defeat the Titan Maw \u00b7 RPG fire",
      support: debug ? `Squad ${String(h.allies.filter(a => a.kind === "ally.ground").length)} / Air ${String(h.allies.filter(a => a.kind === "ally.air").length)}` : undefined,
      health: `Hunter ${String(Math.ceil(h.hunterHealth))} / 100`,
      height: debug ? `Height ${String(Math.max(0, Math.round(-h.hunter.position.y)))}` : undefined,
      stage: debug ? world.stage === "boss" ? "Boss stage" : "Ascent stage" : undefined,
      danger: debug ? gap >= 0 ? `${themes[snapshot.themeId ?? "desert"].hazard} gap ${String(gap)}` : `BURIED ${String(-gap)}` : gap < 0 ? "Get above the hazard!" : undefined,
      ammo: h.rpg.owned && !h.rpg.reloading ? undefined : ammo,
      worm: debug ? wormLifeText(snapshot) : undefined,
      boss: h.boss.stage === "boss"
        ? `Boss ${String(Math.max(0, Math.ceil(h.boss.health)))} / ${String(h.boss.maxHealth)}${h.boss.shieldActive ? " · SHIELD" : h.boss.shieldPhase === "windup" ? " · shield charging" : ""}`
        : debug ? `Summit ${String(Math.max(0, Math.round(h.hunter.position.y + 16 - world.summit.y)))}px above` : "Reach the rooftop",
      rpg: h.rpg.owned
        ? h.rpg.reloading ? "RPG reloading · firearm ready" : `RPG ${String(h.rpg.rockets)} / 2 · LMB fire`
        : world.stage === "ascent" ? debug ? "RPG at rooftop" : undefined : h.rpg.inCrateZone ? "RPG crate · picking up" : h.rpg.crateReady ? "RPG crate ready · reach the summit" : "RPG crate restocking",
      skill: skillLabel,
      dodge,
      tracking: debug ? h.tracking.text : undefined,
      score: debug ? h.score : undefined,
      });
    }
    return Object.freeze({ health: `Ranger ${String(Math.ceil(h.hunterHealth))} / 100`, worm: `Maw ${String(Math.ceil(h.wormHealth))} / 100`, relay: `Relay ${String(Math.ceil(h.relayIntegrity))} / 200`, ammo, snare: h.snare.phase !== "none" ? `Snare ${h.snare.phase}` : h.snare.readyTick > snapshot.tick ? `Snare ${remaining(h.snare.readyTick)}` : "Snare ready · Q", dodge, tracking: h.tracking.text, score: h.score });
  }
};
