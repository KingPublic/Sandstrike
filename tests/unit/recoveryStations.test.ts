import { expect, it } from "vitest";
import { RecoveryStations } from "../../src/game/domain/hunt/RecoveryStations";
import { actor } from "../fixtures/actors";

it("collects each medical cache once, caps healing and excludes dead or allied actors", () => {
  const stations = new RecoveryStations([{ id: "ledge.1", left: -3000, right: 3000, y: -180 }]);
  const player = { ...actor("hunter", 0, -196), health: 90, maxHealth: 100 };
  expect(stations.collect({ ...player, id: "ally" })).toBe(0);
  expect(stations.collect({ ...player, health: 0 })).toBe(0);
  expect(stations.collect({ ...player, health: 100 })).toBe(0);
  expect(stations.collect(player)).toBe(10);
  expect(stations.collect({ ...player, health: 20 })).toBe(0);
  expect(stations.snapshot().find(s => s.position.x === 0)?.claimed).toBe(true);
});
