import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
import { RampageHudModel } from "./RampageHudModel";

export class RampageHud {
  private readonly root: HTMLDivElement;
  private lastAnnouncementTick = -120;
  constructor(container: HTMLElement, pause: () => void, settings: () => void, private readonly debug = false) {
    this.root = document.createElement("div"); this.root.className = "rampage-hud"; this.root.dataset.rampageHud = "true";
    this.root.innerHTML = `<div class="hud-top"><div class="hud-stat hud-stat--gauge"><span data-hud-health></span><i class="hud-gauge" data-hud-gauge="health"></i></div><div class="hud-stat" data-hud-score></div><div class="hud-stat hud-combo" data-hud-combo></div><div class="hud-actions"><button type="button" data-hud-settings>Settings</button><button type="button" data-hud-pause>Pause</button></div></div><div class="hud-threat" data-hud-threat></div><div class="hud-cooldowns"><span class="hud-chip"><span data-hud-bite></span><i class="hud-gauge" data-hud-gauge="bite"></i></span><span class="hud-chip"><span data-hud-burst></span><i class="hud-gauge" data-hud-gauge="burst"></i></span></div><span class="sr-only" data-hud-announcement aria-live="polite"></span>`;
    this.root.querySelector("[data-hud-pause]")?.addEventListener("click", pause);
    this.root.querySelector("[data-hud-settings]")?.addEventListener("click", settings);
    container.append(this.root);
  }
  update(snapshot: SessionSnapshot, reducedMotion = false): void {
    const model = RampageHudModel.fromSnapshot(snapshot, reducedMotion);
    this.text("health", `${model.health <= 25 ? "Low health" : "Health"} ${String(model.health)} / ${String(snapshot.actors.find(a => a.id === "worm")?.maxHealth ?? 100)}`); this.text("score", `Score ${model.score.toLocaleString("en-US")}`);
    this.text("combo", model.comboLabel); this.text("threat", model.threatLabel); this.text("bite", model.biteLabel); this.text("burst", model.burstLabel);
    this.gauge("health", model.healthFraction); this.gauge("bite", model.biteReadiness); this.gauge("burst", model.burstReadiness);
    const threat = this.root.querySelector<HTMLElement>("[data-hud-threat]");
    if (threat) threat.hidden = !this.debug && snapshot.threat.warningTicksRemaining === 0;
    this.root.dataset.lowHealth = String(model.health <= 25);
    this.root.dataset.decay = String(snapshot.combo.phase === "decay");
    this.root.style.setProperty("--combo-progress", String(model.comboProgress));
    if (snapshot.tick - this.lastAnnouncementTick >= 120) { this.text("announcement", `${model.status}. ${model.threatLabel}. Score ${String(model.score)}. ${model.comboLabel}`); this.lastAnnouncementTick = snapshot.tick; }
  }
  destroy(): void { this.root.remove(); }
  private text(key: string, value: string): void { const element = this.root.querySelector(`[data-hud-${key}]`); if (element && element.textContent !== value) element.textContent = value; }
  private gauge(key: string, value: number): void { const element = this.root.querySelector<HTMLElement>(`[data-hud-gauge="${key}"]`); if (element) element.style.setProperty("--fill", value.toFixed(3)); }
}
