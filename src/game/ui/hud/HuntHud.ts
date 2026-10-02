import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
import { HuntHudModel } from "./HuntHudModel";
import type { HudPort } from "./HudPort";
export class HuntHud implements HudPort {
  private readonly root: HTMLDivElement;
  constructor(container: HTMLElement, pause: () => void, settings: () => void) {
    this.root = document.createElement("div"); this.root.className = "rampage-hud hunt-hud"; this.root.dataset.huntHud = "true";
    this.root.innerHTML = `<div class="hud-top"><div class="hud-stat" data-hunt-health></div><div class="hud-stat" data-hunt-relay></div><div class="hud-stat" data-hunt-worm></div><div class="hud-actions"><button type="button" data-hud-settings>Settings</button><button type="button" data-hud-pause>Pause</button></div></div><div class="hunt-status"><span data-hunt-ammo></span><span data-hunt-score></span></div><div class="hud-threat" data-hunt-tracking></div><div class="hud-cooldowns"><span data-hunt-snare></span><span data-hunt-dodge></span></div>`;
    this.root.querySelector("[data-hud-pause]")?.addEventListener("click", pause); this.root.querySelector("[data-hud-settings]")?.addEventListener("click", settings); container.append(this.root);
  }
  update(snapshot: SessionSnapshot): void { const model = HuntHudModel.fromSnapshot(snapshot); for (const [key, value] of Object.entries(model)) { const element = this.root.querySelector(`[data-hunt-${key}]`); const text = key === "score" ? `Score ${String(value)}` : String(value); if (element && element.textContent !== text) element.textContent = text; } }
  destroy(): void { this.root.remove(); }
}
