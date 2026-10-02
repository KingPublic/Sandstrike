import type { NavigationState } from "../../app/NavigationCoordinator";

export class MenuView {
  constructor(private readonly root: HTMLElement, onAction: (action: string) => void) {
    root.addEventListener("click", (event) => { const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-menu-action]") : null; if (button) onAction(button.dataset.menuAction ?? ""); });
  }
  render(state: NavigationState, mode: "rampage" | "hunt" = "rampage"): void {
    let body: string;
    switch (state) {
      case "title": body = `<p class="preview__kicker">The desert is alive</p><h2>Own the breach.</h2><p>Build momentum beneath the dunes. Strike from below. Survive the response.</p>${button("enter", "Enter desert")}`; break;
      case "menu": body = `<p class="preview__kicker">Main menu</p><h2>Your next hunt.</h2>${button("play", "Play")}${button("help", "How to Play")}${button("settings", "Settings")}${button("credits", "Credits")}`; break;
      case "selection": body = `<p class="preview__kicker">Role / mode</p><h2>Choose your side.</h2><p><strong>Rampage</strong> · Burrow, breach, consume prey and survive the response.</p>${button("choose", "Choose Rampage")}<p><strong>Ranger / Hunt</strong> · Read the tremor. Trap the breach. Protect the relay.</p>${button("choose-hunt", "Choose Hunt")}${button("menu", "Main menu")}`; break;
      case "preview": body = mode === "hunt" ? `<p class="preview__kicker">Hunt · Relay defense</p><h2>Read the sand. Hold your ground.</h2><p>Follow broad tremors and breach warnings. Place a Seismic Snare in shallow movement, then shoot the exposed Maw. Dodge committed attacks and protect the relay.</p><p>WASD move · Mouse aim / click fire · Q snare · Shift dodge · R reload. Touch: move, drag Fire to aim, Snare and Dodge.</p>${import.meta.env.DEV ? '<label><input type="checkbox" data-ai-debug> Inspect AI (practice; no records)</label>' : ""}${button("start", "Start Hunt")}${button("help", "How to Play")}${button("selection", "Change mode")}` : `<p class="preview__kicker">Rampage · Desert frontier</p><h2>Momentum is your weapon.</h2><p>Prey restores health. Infantry locks its aim before firing. Vary your targets to build a stronger chain.</p>${button("start", "Start Rampage")}${button("help", "How to Play")}${button("selection", "Change mode")}`; break;
      case "how-to-play": body = `<h2>How to Play</h2><p><strong>Move:</strong> WASD / arrows, left stick, or touch joystick.</p><p><strong>Bite:</strong> Space / right trigger / touch Bite. <strong>Burst:</strong> Shift / right bumper / touch Burst. <strong>Pause:</strong> Escape / Start / Pause.</p><p>Turn upward underground to breach. Consume prey for health, strike infantry with speed or Bite, and re-enter to avoid shots. Aim-lock circles announce danger. Combo grace lasts three seconds, followed by a visible fading warning.</p>${button("close", "Back")}`; break;
      case "credits": body = `<h2>Credits</h2><p>Sandstrike · Original procedural art, character animation, generated audio and game code.</p><p>Built with Phaser, TypeScript and Vite. Mechanical reference research is documented in the repository. No copied branding, art or audio is shipped.</p>${button("close", "Back")}`; break;
      default: body = "";
    }
    this.root.innerHTML = body; this.root.hidden = body === "";
    this.root.querySelector("h2")?.setAttribute("id", "preview-title");
    queueMicrotask(() => this.root.querySelector<HTMLButtonElement>("button")?.focus());
  }
}
function button(action: string, label: string): string { return `<button type="button" class="menu-action" data-menu-action="${action}">${label}</button>`; }
