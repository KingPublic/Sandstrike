import { expect, it } from "vitest";
import { TouchInput } from "../../src/game/input/TouchInput";
import { InputRouter } from "../../src/game/input/InputRouter";

it("a quick touch skill tap survives until one simulation sample", () => {
  const touch = new TouchInput(), router = new InputRouter([touch]);
  touch.setButton("ability", true);
  touch.setButton("ability", false);
  expect(router.sample(1).ability.pressed).toBe(true);
  expect(router.sample(2).ability.released).toBe(true);
  touch.setButton("ability", true);
  router.clear();
  expect(router.sample(3).ability.held).toBe(false);
});
