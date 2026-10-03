import { expect, it } from "vitest";
import { queryExposedWormContacts } from "../../src/game/domain/hunt/ExposedWormContacts";
import { WormLocomotion } from "../../src/game/domain/movement/WormLocomotion";
import { movementBalance } from "../../src/game/data/movementBalance";
it("hits an exposed follower with a buried head once and rejects underground hits", () => {
  const worm = new WormLocomotion(movementBalance).snapshot();
  const pose = { position: { x: 100, y: -20 }, tangent: { x: 1, y: 0 } };
  const exposed = { ...worm, head: { ...worm.head, position: { x: 300, y: 200 } }, followers: [pose, { ...pose, position: { x: 120, y: -20 } }, { ...pose, position: { x: 140, y: -20 } }] };
  expect(queryExposedWormContacts({ x: 0, y: -20 }, { x: 400, y: -20 }, exposed, 0, false)).toHaveLength(1);
  const buried = { ...exposed, followers: exposed.followers.map(p => ({ ...p, position: { x: p.position.x, y: 40 } })) };
  expect(queryExposedWormContacts({ x: 0, y: 40 }, { x: 400, y: 40 }, buried, 0, true)).toHaveLength(0);
});
