import { expect, it } from "vitest";
import { RunFactory } from "../../src/game/application/RunFactory";
import { huntCameraTarget, assistExposedAim, visibleHuntPoses } from "../../src/game/rendering/HuntPresentation";
it("hidden exact poses cannot change camera or aim assistance", () => {
  const a = new RunFactory().create({ seed: 1, mode: "hunt" }).snapshot();
  const b = { ...a, worm: { ...a.worm, head: { ...a.worm.head, position: { x: 999, y: 800 } }, followers: [] } };
  expect(huntCameraTarget(a, 1280, 720)).toEqual(huntCameraTarget(b, 1280, 720));
  expect(assistExposedAim({ x: 0, y: -16 }, { x: 1, y: 0 }, b.worm, .35)).toEqual({ x: 1, y: 0 });
  expect(visibleHuntPoses(b)).toHaveLength(0);
});
