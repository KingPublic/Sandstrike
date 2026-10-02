import type { RunResult } from "../domain/modes/RunResult";

export class ResultsView {
  private readonly root: HTMLElement;
  constructor(container: HTMLElement, result: RunResult, actions: Readonly<{ retry: () => void; changeMode: () => void; menu: () => void }>, recordLabel = "Record tracking available after save setup") {
    this.root = document.createElement("section"); this.root.className = "results-overlay"; this.root.dataset.runResult = result.sessionId;
    this.root.setAttribute("role", "dialog"); this.root.setAttribute("aria-modal", "true"); this.root.setAttribute("aria-labelledby", "result-title");
    const stats = result.mode === "rampage" ? [["Maximum chain", result.maximumCombo], ["Prey consumed", result.preyConsumed], ["Infantry destroyed", result.infantryDestroyed], ["Health recovered", result.healthRecovered], ["Vehicles destroyed", result.vehiclesDestroyed ?? 0], ["Aerial destroyed", result.aerialDestroyed ?? 0], ["Highest response", result.highestBand]] : [["Hunter health", Math.ceil(result.hunterHealth)], ["Relay integrity", Math.ceil(result.relayIntegrity)], ["Snare triggers", result.trapTriggers], ["Breach interruptions", result.breachInterruptions], ["Shots hit / fired", `${String(result.shotsHit)} / ${String(result.shotsFired)}`], ["Exposure windows used", result.exposureWindowsUsed]];
    const reason = result.reason === "victory" ? "Worm defeated - relay secured" : result.reason === "defeated" ? "Worm defeated" : result.reason === "hunter-defeated" ? "Ranger defeated" : result.reason === "relay-destroyed" ? "Relay destroyed" : "Run ended by player";
    this.root.innerHTML = `<div class="results-card"><p class="preview__kicker">${reason}</p><h2 id="result-title">Run complete</h2><p class="result-score">${result.score.toLocaleString("en-US")}</p><p data-record-status></p><dl><div><dt>Duration</dt><dd>${result.durationSeconds.toFixed(1)} s</dd></div>${stats.map(([label, value]) => `<div><dt>${String(label)}</dt><dd>${String(value)}</dd></div>`).join("")}</dl><div class="result-actions"><button type="button" data-result-retry>Retry</button><button type="button" data-result-change>Change mode</button><button type="button" data-result-menu>Main menu</button></div></div>`;
    const status = this.root.querySelector("[data-record-status]"); if (status) status.textContent = recordLabel;
    this.root.querySelector("[data-result-retry]")?.addEventListener("click", actions.retry);
    this.root.querySelector("[data-result-change]")?.addEventListener("click", actions.changeMode);
    this.root.querySelector("[data-result-menu]")?.addEventListener("click", actions.menu);
    this.root.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const buttons = [...this.root.querySelectorAll<HTMLButtonElement>("button")]; const first = buttons[0]; const last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    container.append(this.root); queueMicrotask(() => this.root.querySelector<HTMLButtonElement>("button")?.focus());
  }
  destroy(): void { this.root.remove(); }
}
