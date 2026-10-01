import { describe, expect, it } from "vitest";
import { SaveCoordinator } from "../../src/game/application/SaveCoordinator";
import { MemorySaveRepository } from "../../src/game/infrastructure/storage/MemorySaveRepository";
import { GameSession } from "../../src/game/domain/session/GameSession";
import { movementBalance } from "../../src/game/data/movementBalance";
import { FlatTerrainProfile } from "../../src/game/domain/terrain/FlatTerrainProfile";
import { neutralActionFrame } from "../../src/game/input/ActionFrame";

class CountingRepository extends MemorySaveRepository {
  primaryWrites = 0;
  override replace(key: string, value: string): void { if (key.endsWith(".v1")) this.primaryWrites += 1; super.replace(key, value); }
}

describe("authoritative result persistence", () => {
  it("accepts a lethal-plus-exit result once and updates records only for improvements", () => {
    const repo = new CountingRepository(); const save = new SaveCoordinator(repo, "test"); save.load();
    const session = new GameSession({ seed: 1, movement: movementBalance, terrain: new FlatTerrainProfile(0), playerHealth: 10, initialProjectiles: [{ position: { x: -26, y: 180 }, direction: { x: 1, y: 0 } }] });
    session.queueCommand({ type: "RequestEnd", reason: "player-ended", requestedTick: 0 });
    const result = session.step(neutralActionFrame(1)).result; if (!result) throw new Error("Expected result.");
    expect(save.acceptRunResult(result).accepted).toBe(true); expect(save.acceptRunResult(result).accepted).toBe(false);
    expect(repo.primaryWrites).toBe(1);
    expect(save.acceptRunResult({ ...result, sessionId: "next", score: 500 }).newRecord).toBe(true);
    expect(save.acceptRunResult({ ...result, sessionId: "lower", score: 100 }).newRecord).toBe(false);
    expect(save.snapshot().rampage.bestScore).toBe(500);
    expect(save.acceptRunResult({ ...result, sessionId: "higher", score: 1000 }).newRecord).toBe(true);
    expect(new SaveCoordinator(repo, "test").load().data.rampage.bestScore).toBe(1000);
  });
});
