import { expect, it } from "vitest";
import { InputRouter } from "../../src/game/input/InputRouter";
import { TouchInput } from "../../src/game/input/TouchInput";
import { PointerInput } from "../../src/game/input/PointerInput";
it("keeps held movement independent from newer aim and fire", () => {
  const keyboard = new TouchInput(), mouse = new TouchInput();
  keyboard.setMove(1, 0); mouse.setAim(.5, -.5, { x: 400, y: -100 }); mouse.setButton("primary", true);
  const router = new InputRouter([keyboard, mouse]); const action = router.sample(1);
  expect(action.moveX).toBe(1); expect(action.aimWorld).toEqual({ x: 400, y: -100 }); expect(action.primary.pressed).toBe(true);
  router.clear(); expect(router.sample(2).primary.held).toBe(false);
});
it("maps client coordinates through the injected projection and clears on cancel", () => {
  const target = new EventTarget() as HTMLCanvasElement;
  const input = new PointerInput(target, (x, y) => ({ x: (x - 100) * 2 + 400, y: (y - 50) * 2 - 200 }));
  const event = new Event("pointerdown"); Object.assign(event, { pointerType: "mouse", pointerId: 1, button: 0, clientX: 150, clientY: 80 }); target.dispatchEvent(event);
  expect(input.sample().aimWorld).toEqual({ x: 500, y: -140 }); expect(input.sample().buttons?.primary).toBe(true);
  const cancel = new Event("pointercancel"); Object.assign(cancel, { pointerId: 1 }); target.dispatchEvent(cancel);
  expect(input.sample().aimWorld).toBeUndefined(); expect(input.sample().buttons?.primary).toBe(false);
  input.destroy(); target.dispatchEvent(event); expect(input.sample().aimWorld).toBeUndefined();
});
