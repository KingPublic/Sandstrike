import { bossBalance } from "../data/bossBalance";
import { characterForRole } from "../data/characters";
import { huntBalance } from "../data/huntBalance";
import type { SessionSnapshot } from "../domain/session/SessionSnapshot";

/** How usable each action control is right now: 0 = busy, 1 = fully ready. */
export interface ControlReadiness {
  readonly boost: number;
  readonly ability: number;
  readonly primary: number;
}

const READY = 1;

function fraction(elapsedTicks: number, totalTicks: number): number {
  if (!Number.isFinite(elapsedTicks) || totalTicks <= 0) {
    return READY;
  }
  return Math.min(1, Math.max(0, elapsedTicks / totalTicks));
}

function skillReadiness(remainingTicks: number, totalTicks: number): number {
  return fraction(totalTicks - remainingTicks, totalTicks);
}

export function controlReadiness(snapshot: SessionSnapshot): ControlReadiness {
  const worm = snapshot.worm;
  const burstTotal = worm.burstCooldownTotalSeconds * 60;
  const boost = fraction(burstTotal - worm.burstCooldownSeconds * 60, burstTotal);
  const hunt = snapshot.hunt;
  if (!hunt) {
    const ability = snapshot.abilities[0];
    const skill = characterForRole("rampage", snapshot.characterId)?.skill;
    return Object.freeze({
      boost,
      ability: ability === undefined ? READY : skillReadiness(ability.cooldownTicksRemaining, skill?.cooldownTicks ?? 0),
      primary: READY,
    });
  }
  const skill = snapshot.skill?.ability;
  const characterSkill = characterForRole("hunt", snapshot.characterId)?.skill;
  const reloading = hunt.rifle.reloadUntilTick > snapshot.tick;
  const rpgReloading = hunt.rpg.owned && hunt.rpg.reloading;
  return Object.freeze({
    boost: fraction(huntBalance.dodgeCooldown - (hunt.hunter.dodgeReadyTick - snapshot.tick), huntBalance.dodgeCooldown),
    ability: skill === undefined ? READY : skillReadiness(skill.cooldownTicksRemaining, characterSkill?.cooldownTicks ?? 0),
    primary: rpgReloading
      ? fraction(bossBalance.rpgReloadTicks - hunt.rpg.reloadTicksRemaining, bossBalance.rpgReloadTicks)
      : reloading ? fraction(huntBalance.reloadTicks - (hunt.rifle.reloadUntilTick - snapshot.tick), huntBalance.reloadTicks) : READY,
  });
}
