import { defaultPresentationSettings, type PresentationSettings } from "../../rendering/FeedbackController";

export class SettingsPanel {
  private readonly root: HTMLElement;
  private settings: PresentationSettings;
  private returnFocus: HTMLElement | undefined;
  private readonly inputs = new Map<keyof PresentationSettings, HTMLInputElement>();
  constructor(container: HTMLElement, private readonly onChange: (settings: PresentationSettings) => void, private readonly onClose: () => void, initial = defaultPresentationSettings, onReset?: () => PresentationSettings) {
    this.settings = initial;
    this.root = document.createElement("section"); this.root.className = "settings-overlay"; this.root.hidden = true;
    this.root.setAttribute("role", "dialog"); this.root.setAttribute("aria-modal", "true"); this.root.setAttribute("aria-label", "Presentation settings");
    this.root.innerHTML = `<div class="settings-card"><h2>Settings</h2><p>Make the desert feel right for you.</p><div class="settings-fields"></div><button type="button" data-close-settings>Close settings</button></div>`;
    const fields = this.root.querySelector(".settings-fields");
    for (const [key, label] of Object.entries({ masterVolume: "Master volume", musicVolume: "Music volume", effectsVolume: "Effects volume", shake: "Screen shake", reducedMotion: "Reduced motion", reducedFlashes: "Reduced flashes", highContrast: "High contrast", leftHanded: "Left-handed touch", touchOpacity: "Touch opacity", haptics: "Haptics" })) {
      const name = key as keyof PresentationSettings;
      const row = document.createElement("label"); row.textContent = label;
      const input = document.createElement("input"); const value = initial[name];
      input.type = typeof value === "boolean" ? "checkbox" : "range";
      if (typeof value === "boolean") input.checked = value; else { input.min = name === "touchOpacity" ? "0.25" : "0"; input.max = "1"; input.step = "0.05"; input.value = String(value); }
      input.addEventListener("input", () => { this.settings = Object.freeze({ ...this.settings, [name]: input.type === "checkbox" ? input.checked : Number(input.value) }); this.onChange(this.settings); });
      this.inputs.set(name, input);
      row.append(input); fields?.append(row);
    }
    this.root.querySelector("[data-close-settings]")?.addEventListener("click", () => { this.close(); });
    if (onReset) {
      const reset = document.createElement("div"); reset.className = "reset-controls";
      reset.innerHTML = `<button type="button" data-reset-open>Reset saved data</button><div data-reset-confirmation hidden><p>Clear local records and restore default settings?</p><button type="button" data-reset-confirm>Confirm reset</button><button type="button" data-reset-cancel>Cancel reset</button></div>`;
      const confirmation = reset.querySelector<HTMLElement>("[data-reset-confirmation]");
      reset.querySelector("[data-reset-open]")?.addEventListener("click", () => { if (confirmation) confirmation.hidden = false; reset.querySelector<HTMLButtonElement>("[data-reset-confirm]")?.focus(); });
      reset.querySelector("[data-reset-cancel]")?.addEventListener("click", () => { if (confirmation) confirmation.hidden = true; reset.querySelector<HTMLButtonElement>("[data-reset-open]")?.focus(); });
      reset.querySelector("[data-reset-confirm]")?.addEventListener("click", () => { this.applySettings(onReset()); if (confirmation) confirmation.hidden = true; reset.querySelector<HTMLButtonElement>("[data-reset-open]")?.focus(); });
      this.root.querySelector(".settings-card")?.append(reset);
    }
    this.root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); this.close(); }
      if (event.key !== "Tab") return;
      const items = [...this.root.querySelectorAll<HTMLElement>("input, button")].filter((element) => element.getClientRects().length > 0);
      const first = items[0]; const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    container.append(this.root);
  }
  open(): void { this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined; this.root.hidden = false; this.root.querySelector<HTMLInputElement>("input")?.focus(); }
  close(): void { this.root.hidden = true; this.onClose(); this.returnFocus?.focus(); }
  destroy(): void { this.root.remove(); }
  private applySettings(settings: PresentationSettings): void { this.settings = settings; for (const [key, input] of this.inputs) { const value = settings[key]; if (typeof value === "boolean") input.checked = value; else input.value = String(value); } this.onChange(settings); }
}
