export type NavigationState = "title" | "menu" | "selection" | "preview" | "run" | "pause" | "results" | "how-to-play" | "settings" | "credits" | "confirm-quit" | "confirm-restart";
const transitions: Record<NavigationState, readonly NavigationState[]> = {
  title: ["menu"], menu: ["selection", "how-to-play", "settings", "credits"], selection: ["preview", "menu"], preview: ["run", "selection", "menu", "how-to-play"], run: ["pause", "results"], pause: ["run", "results", "confirm-quit", "confirm-restart", "settings", "how-to-play"], results: ["run", "selection", "menu"], "how-to-play": ["menu", "pause", "preview"], settings: ["menu", "pause"], credits: ["menu"], "confirm-quit": ["pause", "results"], "confirm-restart": ["pause", "run"],
};
export class NavigationCoordinator {
  private current: NavigationState = "title";
  private returnState: NavigationState = "menu";
  private focusId: string | undefined;
  get state(): NavigationState { return this.current; }
  go(state: NavigationState): void { if (!transitions[this.current].includes(state)) throw new Error(`Illegal navigation ${this.current} -> ${state}.`); this.current = state; }
  back(): NavigationState { if (this.current === "run") this.go("pause"); else if (["selection", "preview", "results"].includes(this.current)) this.go("menu"); return this.current; }
  request(action: "quit" | "restart"): NavigationState { this.go(action === "quit" ? "confirm-quit" : "confirm-restart"); return this.current; }
  cancel(): void { this.go("pause"); }
  confirm(): NavigationState { if (this.current !== "confirm-quit" && this.current !== "confirm-restart") throw new Error("No pending confirmation."); this.go(this.current === "confirm-quit" ? "results" : "run"); return this.current; }
  open(state: "how-to-play" | "settings" | "credits", focusId?: string): void { this.returnState = this.current; this.focusId = focusId; this.go(state); }
  close(): Readonly<{ state: NavigationState; focusId: string | undefined }> { this.go(this.returnState); return Object.freeze({ state: this.current, focusId: this.focusId }); }
}
