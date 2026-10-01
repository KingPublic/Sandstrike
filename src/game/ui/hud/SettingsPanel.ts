import { defaultPresentationSettings, type PresentationSettings } from "../../rendering/FeedbackController";

export class SettingsPanel {
  private readonly root: HTMLElement;
  private settings: PresentationSettings;
  private returnFocus: HTMLElement | undefined;
  constructor(container: HTMLElement, private readonly onChange: (settings: PresentationSettings) => void, private readonly onClose: () => void, initial = defaultPresentationSettings) {
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
      row.append(input); fields?.append(row);
    }
    this.root.querySelector("[data-close-settings]")?.addEventListener("click", () => { this.close(); });
    this.root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); this.close(); }
      if (event.key !== "Tab") return;
      const items = [...this.root.querySelectorAll<HTMLElement>("input, button")];
      const first = items[0]; const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    container.append(this.root);
  }
  open(): void { this.returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined; this.root.hidden = false; this.root.querySelector<HTMLInputElement>("input")?.focus(); }
  close(): void { this.root.hidden = true; this.onClose(); this.returnFocus?.focus(); }
  destroy(): void { this.root.remove(); }
}
