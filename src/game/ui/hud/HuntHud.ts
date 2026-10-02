import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
import { HuntHudModel } from "./HuntHudModel";
import type { HudPort } from "./HudPort";
export class HuntHud implements HudPort {
  private readonly root: HTMLDivElement;
  constructor(container: HTMLElement, pause: () => void, settings: () => void) {
    this.root = document.createElement("div"); this.root.className = "rampage-hud hunt-hud"; this.root.dataset.huntHud = "true";
    const field = (key: string, className = ""): string => `<span class="${className}" data-hunt-field="${key}"></span>`;
    this.root.innerHTML = `<div class="hud-top"><div class="hud-stat">${field("health")}</div><div class="hud-stat">${field("height")}</div><div class="hud-stat">${field("stage")}</div><div class="hud-stat">${field("relay")}</div><div class="hud-stat">${field("worm")}</div><div class="hud-actions"><button type="button" data-hud-settings>Settings</button><button type="button" data-hud-pause>Pause</button></div></div><div class="hunt-status">${field("ammo")}${field("rpg")}${field("score")}</div><div class="hud-threat">${field("boss")}${field("tracking")}</div><div class="hud-cooldowns">${field("danger")}${field("snare")}${field("skill")}${field("dodge")}</div>`;
    this.root.querySelector("[data-hud-pause]")?.addEventListener("click", pause); this.root.querySelector("[data-hud-settings]")?.addEventListener("click", settings); container.append(this.root);
  }
  update(snapshot: SessionSnapshot): void {
    const model = HuntHudModel.fromSnapshot(snapshot);
    for (const element of this.root.querySelectorAll<HTMLElement>("[data-hunt-field]")) {
      const key = element.dataset.huntField ?? "";
      const value = model[key];
      element.hidden = value === undefined;
      const text = value === undefined ? "" : key === "score" ? `Score ${String(value)}` : String(value);
      if (element.textContent !== text) element.textContent = text;
    }
  }
  destroy(): void { this.root.remove(); }
}
