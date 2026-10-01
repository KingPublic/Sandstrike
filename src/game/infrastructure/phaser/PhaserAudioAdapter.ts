import type { FeedbackCommand, PresentationSettings } from "../../rendering/FeedbackController";

export class PhaserAudioAdapter {
  private context: AudioContext | undefined;
  get ready(): boolean { return this.context?.state === "running"; }
  unlock(): void {
    if (typeof AudioContext === "undefined") return;
    try {
      this.context ??= new AudioContext();
      this.context.resume().catch(() => undefined);
    } catch { this.context = undefined; }
  }
  play(command: FeedbackCommand, settings: PresentationSettings): void {
    const context = this.context;
    if (!context || !this.ready || command.tone === undefined) return;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = command.shape === "cross" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(command.tone, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, command.tone * 0.6), context.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06 * settings.masterVolume * settings.effectsVolume, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.14);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.15);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Audio availability never gates play. */ }
  }
  destroy(): void { this.context?.close().catch(() => undefined); this.context = undefined; }
}
