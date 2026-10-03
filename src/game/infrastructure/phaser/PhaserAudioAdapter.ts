import type { FeedbackCommand, PresentationSettings, SoundVoice } from "../../rendering/FeedbackController";
import type { SessionSnapshot } from "../../domain/session/SessionSnapshot";
import { synthesizeSound } from "./SoundSynthesis";

/** Cached original samples, spatial attenuation and a bounded, compressed output. */
export class PhaserAudioAdapter {
  private context: AudioContext | undefined;
  private output: DynamicsCompressorNode | undefined;
  private readonly buffers = new Map<SoundVoice, AudioBuffer>();
  private readonly playing = new Set<AudioBufferSourceNode>();
  private listenerX = 0;
  private sessionId = "";
  private lastStep = -1;
  private lastWind = -1;
  private lastRotor = -1;
  private lastReload = 0;
  get ready(): boolean { return this.context?.state === "running"; }

  unlock(): void {
    if (typeof AudioContext === "undefined") return;
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.output = this.context.createDynamicsCompressor();
        this.output.threshold.value = -12; this.output.knee.value = 16;
        this.output.ratio.value = 8; this.output.attack.value = .002; this.output.release.value = .18;
        this.output.connect(this.context.destination);
      }
      this.context.resume().catch(() => undefined);
    } catch { this.context = undefined; }
  }

  play(command: FeedbackCommand, settings: PresentationSettings): void {
    this.emit(command.voice, settings.masterVolume * settings.effectsVolume, command.position?.x);
  }

  updateEnvironment(snapshot: SessionSnapshot, settings: PresentationSettings): void {
    const player = snapshot.actors.find(a => a.id === snapshot.playerActorId);
    this.listenerX = player?.position.x ?? 0;
    if (this.sessionId !== snapshot.sessionId) { this.sessionId = snapshot.sessionId; this.lastStep = -1; this.lastWind = -1; this.lastRotor = -1; this.lastReload = 0; }
    const volume = settings.masterVolume * settings.effectsVolume;
    if (!this.ready || volume <= 0 || !player || player.health <= 0) return;
    const step = Math.floor(snapshot.tick / 18), wind = Math.floor(snapshot.tick / 48), rotor = Math.floor(snapshot.tick / 30);
    if (wind !== this.lastWind) { this.lastWind = wind; this.emit("wind", volume * .13); }
    const helicopter = snapshot.actors.find(a => (a.tags.includes("aerial") || a.tags.includes("ally-air")) && Math.abs(a.position.x - player.position.x) < 750);
    if (helicopter && rotor !== this.lastRotor) { this.lastRotor = rotor; this.emit("rotor", volume * .2, helicopter.position.x); }
    if (snapshot.hunt?.hunter.grounded && Math.abs(player.velocity.x) > 20 && step !== this.lastStep) { this.lastStep = step; this.emit("step", volume * .3); }
    const reload = Math.max(snapshot.hunt?.rifle.reloadUntilTick ?? 0, snapshot.hunt?.rpg.reloading ? snapshot.tick + snapshot.hunt.rpg.reloadTicksRemaining : 0);
    if (reload > snapshot.tick && reload !== this.lastReload) { this.lastReload = reload; this.emit("reload", volume * .65); }
  }

  private emit(voice: SoundVoice, volume: number, x?: number): void {
    const context = this.context, output = this.output;
    if (!context || !output || !this.ready || volume <= 0 || this.playing.size >= 24) return;
    try {
      let buffer = this.buffers.get(voice);
      if (!buffer) { const samples = synthesizeSound(voice, context.sampleRate); buffer = context.createBuffer(1, samples.length, context.sampleRate); buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0); this.buffers.set(voice, buffer); }
      const source = context.createBufferSource(), gain = context.createGain(), pan = context.createStereoPanner();
      const distance = x === undefined ? 0 : x - this.listenerX;
      gain.gain.value = volume * .42 / (1 + Math.abs(distance) / 850);
      pan.pan.value = Math.max(-.8, Math.min(.8, distance / 650));
      source.buffer = buffer; source.connect(gain); gain.connect(pan); pan.connect(output);
      this.playing.add(source);
      source.onended = () => { this.playing.delete(source); source.disconnect(); gain.disconnect(); pan.disconnect(); };
      source.start();
    } catch { /* Audio availability never gates play. */ }
  }

  destroy(): void { this.context?.close().catch(() => undefined); this.context = undefined; this.output = undefined; this.buffers.clear(); this.playing.clear(); }
}
