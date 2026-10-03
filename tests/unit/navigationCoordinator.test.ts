import { describe, expect, it } from "vitest";
import { NavigationCoordinator } from "../../src/app/NavigationCoordinator";
import { PauseCoordinator } from "../../src/app/PauseCoordinator";

describe("static application navigation", () => {
  it("requires confirmation for restart/quit and routes browser back through pause", () => {
    const nav = new NavigationCoordinator();
    nav.go("menu"); nav.go("selection"); nav.go("preview"); nav.go("run");
    expect(nav.back()).toBe("pause");
    expect(nav.request("quit")).toBe("confirm-quit");
    nav.cancel(); expect(nav.state).toBe("pause");
    nav.request("restart"); expect(nav.confirm()).toBe("run");
    nav.go("pause"); nav.request("quit"); expect(nav.confirm()).toBe("results");
    nav.go("selection"); nav.go("preview"); nav.go("run"); nav.go("results"); nav.go("menu");
    expect(nav.state).toBe("menu");
  });
  it("restores the prior route/focus for instructions, settings and credits", () => {
    const nav = new NavigationCoordinator(); nav.go("menu");
    for (const route of ["how-to-play", "settings", "credits"] as const) { nav.open(route, "menu-start"); expect(nav.close()).toEqual({ state: "menu", focusId: "menu-start" }); }
    expect(() => { nav.go("results"); }).toThrow();
  });
  it("keeps independent interruption reasons stacked", () => {
    const pause = new PauseCoordinator(); pause.add("user"); pause.add("visibility"); pause.remove("visibility");
    expect(pause.paused).toBe(true); expect(pause.reasons).toEqual(["user"]);
  });
});
