import { describe, expect, it } from "vitest";

import { WORM_GENERATION_CAP, WORM_RETURN_TICKS, WormLifeDirector, aggressionProfile } from "../../src/game/domain/hunt/WormLifeDirector";

const alive = { wormDead: false, summitReached: false, ended: false };

describe("WormLifeDirector", () => {
  it("keeps one live worm until an ordinary kill starts a 600-tick absence", () => {
    const life = new WormLifeDirector();
    expect(life.step(1, alive)).toMatchObject({ phase: "alive", generation: 0, kills: 0 });
    const killed = life.step(100, { ...alive, wormDead: true });
    expect(killed).toMatchObject({ phase: "absent", kills: 1, returnTick: 100 + WORM_RETURN_TICKS, returnInTicks: WORM_RETURN_TICKS });
    expect(life.consumeSpawnRequest()).toBe(false);
    expect(life.step(100 + WORM_RETURN_TICKS - 1, alive).phase).toBe("absent");
    expect(life.step(100 + WORM_RETURN_TICKS - 1, alive).returnInTicks).toBe(1);
    const returned = life.step(100 + WORM_RETURN_TICKS, alive);
    expect(returned).toMatchObject({ phase: "alive", generation: 1, kills: 1, returnInTicks: 0 });
    expect(life.consumeSpawnRequest()).toBe(true);
    expect(life.consumeSpawnRequest()).toBe(false);
  });

  it("caps escalation and never spawns twice for one return", () => {
    const life = new WormLifeDirector();
    let tick = 0;
    for (let kill = 0; kill < WORM_GENERATION_CAP + 3; kill += 1) {
      life.step(tick, { ...alive, wormDead: true });
      tick += WORM_RETURN_TICKS;
      life.step(tick, alive);
      expect(life.consumeSpawnRequest()).toBe(true);
      expect(life.consumeSpawnRequest()).toBe(false);
    }
    expect(life.snapshot(tick).generation).toBe(WORM_GENERATION_CAP);
    expect(aggressionProfile(0).recoverTicks).toBe(120);
    expect(aggressionProfile(WORM_GENERATION_CAP).recoverTicks).toBe(48);
    expect(aggressionProfile(99).recoverTicks).toBe(48);
    expect(aggressionProfile(4).breachBoost).toBe(true);
  });

  it("cancels a pending return at the summit and never spawns after the run ends", () => {
    const life = new WormLifeDirector();
    life.step(10, { ...alive, wormDead: true });
    expect(life.step(20, { wormDead: false, summitReached: true, ended: false }).phase).toBe("boss");
    expect(life.step(1000, alive).phase).toBe("boss");
    expect(life.consumeSpawnRequest()).toBe(false);
    const ended = new WormLifeDirector();
    ended.step(10, { ...alive, wormDead: true });
    expect(ended.step(1000, { wormDead: false, summitReached: false, ended: true }).phase).toBe("absent");
    expect(ended.consumeSpawnRequest()).toBe(false);
  });
});
