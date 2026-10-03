import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
import { HuntHudModel } from "./HuntHudModel";
import type { HudPort } from "./HudPort";
export class HuntHud implements HudPort {
  private readonly root: HTMLDivElement;
  constructor(container: HTMLElement, pause: () => void, settings: () => void, private readonly debug = false) {
    this.root = document.createElement("div"); this.root.className = "rampage-hud hunt-hud"; this.root.dataset.huntHud = "true";
    const field = (key: string, className = ""): string => `<span class="${className}" data-hunt-field="${key}"></span>`;
    this.root.innerHTML = `<div class="hud-top"><div class="hud-stat hud-stat--gauge"><span data-hunt-field="health"></span><i class="hud-gauge" data-hunt-gauge="health"></i></div><div class="hud-stat">${field("height")}</div><div class="hud-stat">${field("stage")}</div><div class="hud-stat">${field("relay")}</div><div class="hud-stat">${field("worm")}</div><div class="hud-actions"><button type="button" data-hud-settings>Settings</button><button type="button" data-hud-pause>Pause</button></div></div><div class="hunt-status"><span class="hud-chip">${field("ammo")}<i class="hud-gauge" data-hunt-gauge="ammo"></i></span>${field("rpg")}${field("score")}${field("support")}</div><div class="hud-threat">${field("boss")}<meter class="boss-health-meter" data-boss-health aria-label="Boss health" min="0" max="600" value="600" hidden></meter><progress class="ascent-progress" data-ascent-progress aria-label="Summit progress" max="100" value="0"></progress>${field("tracking")}${field("route")}</div><div class="hud-cooldowns">${field("danger")}${field("supply", "hud-supply")}<span class="hud-chip">${field("snare")}<i class="hud-gauge" data-hunt-gauge="snare"></i></span><span class="hud-chip">${field("skill")}<i class="hud-gauge" data-hunt-gauge="skill"></i></span><span class="hud-chip">${field("dodge")}<i class="hud-gauge" data-hunt-gauge="dodge"></i></span></div>`;
    this.root.querySelector("[data-hud-pause]")?.addEventListener("click", pause); this.root.querySelector("[data-hud-settings]")?.addEventListener("click", settings); container.append(this.root);
  }
  update(snapshot: SessionSnapshot): void {
    const model = HuntHudModel.fromSnapshot(snapshot, this.debug);
    const boss = snapshot.hunt?.boss;
    const meter = this.root.querySelector<HTMLMeterElement>("[data-boss-health]");
    if (meter) { meter.hidden = boss?.stage !== "boss"; meter.max = Math.max(1, boss?.maxHealth ?? 600); meter.value = Math.max(0, boss?.health ?? 0); meter.classList.toggle("boss-health-meter--shield", boss?.shieldActive === true); }
    const progress = this.root.querySelector<HTMLProgressElement>("[data-ascent-progress]");
    if (progress) { progress.hidden = !snapshot.world || snapshot.world.stage === "boss"; progress.value = snapshot.world ? Math.max(0, Math.min(100, -(snapshot.hunt?.hunter.position.y ?? 0) / -snapshot.world.summit.y * 100)) : 0; }
    for (const [key, value] of Object.entries({ health: model.healthFraction, snare: model.snareReadiness, skill: model.skillReadiness, dodge: model.dodgeReadiness, ammo: model.ammoFraction })) {
      const fill = (typeof value === "number" ? value : 1).toFixed(3);
      for (const gauge of this.root.querySelectorAll<HTMLElement>(`[data-hunt-gauge="${key}"]`)) gauge.style.setProperty("--fill", fill);
    }
    for (const element of this.root.querySelectorAll<HTMLElement>("[data-hunt-field]")) {
      const key = element.dataset.huntField ?? "";
      const value = model[key];
      element.hidden = value === undefined;
      if (element.parentElement?.classList.contains("hud-stat")) element.parentElement.hidden = value === undefined;
      const chip = element.closest<HTMLElement>(".hud-chip");
      if (chip) chip.hidden = value === undefined;
      const text = value === undefined ? "" : key === "score" ? `Score ${String(value)}` : String(value);
      if (element.textContent !== text) element.textContent = text;
    }
  }
  destroy(): void { this.root.remove(); }
}
