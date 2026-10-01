import type { RunResult } from "../domain/modes/RunResult";

export class ResultsView {
  private readonly root: HTMLElement;
  constructor(container: HTMLElement, result: RunResult, actions: Readonly<{ retry: () => void; changeMode: () => void; menu: () => void }>, recordLabel = "Record tracking available after save setup") {
    this.root = document.createElement("section"); this.root.className = "results-overlay"; this.root.dataset.runResult = result.sessionId;
    this.root.setAttribute("role", "dialog"); this.root.setAttribute("aria-modal", "true"); this.root.setAttribute("aria-labelledby", "result-title");
    this.root.innerHTML = `<div class="results-card"><p class="preview__kicker">${result.reason === "defeated" ? "Worm defeated" : "Run ended by player"}</p><h2 id="result-title">Run complete</h2><p class="result-score">${result.score.toLocaleString("en-US")}</p><p data-record-status></p><dl><div><dt>Duration</dt><dd>${result.durationSeconds.toFixed(1)} s</dd></div><div><dt>Maximum chain</dt><dd>${String(result.maximumCombo)}</dd></div><div><dt>Prey consumed</dt><dd>${String(result.preyConsumed)}</dd></div><div><dt>Infantry destroyed</dt><dd>${String(result.infantryDestroyed)}</dd></div><div><dt>Health recovered</dt><dd>${String(result.healthRecovered)}</dd></div><div><dt>Highest response</dt><dd>${String(result.highestBand)}</dd></div></dl><div class="result-actions"><button type="button" data-result-retry>Retry</button><button type="button" data-result-change>Change mode</button><button type="button" data-result-menu>Main menu</button></div></div>`;
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
