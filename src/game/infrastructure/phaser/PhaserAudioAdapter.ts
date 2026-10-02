import type { FeedbackCommand, PresentationSettings, SoundVoice } from "../../rendering/FeedbackController";

/**
 * Procedural WebAudio voices. Each weapon, skill and ally has its own timbre so
 * firing, impacts and abilities are audibly different instead of one shared beep.
 */
export class PhaserAudioAdapter {
  private context: AudioContext | undefined;
  private noiseBuffer: AudioBuffer | undefined;
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
    const volume = settings.masterVolume * settings.effectsVolume;
    if (!context || !this.ready || volume <= 0) return;
    try {
      playVoice(context, this.noise(context), command.voice, command.tone ?? 220, volume, context.currentTime);
    } catch { /* Audio availability never gates play. */ }
  }

  destroy(): void { this.context?.close().catch(() => undefined); this.context = undefined; this.noiseBuffer = undefined; }

  private noise(context: AudioContext): AudioBuffer {
    this.noiseBuffer ??= createNoiseBuffer(context);
    return this.noiseBuffer;
  }
}

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.5), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  return buffer;
}

interface SoundTarget { readonly context: AudioContext; readonly out: GainNode }

function playVoice(context: AudioContext, noiseBuffer: AudioBuffer, voice: SoundVoice, tone: number, volume: number, now: number): void {
  const mix = context.createGain();
  mix.gain.value = 1;
  mix.connect(context.destination);
  const target: SoundTarget = { context, out: mix };
  switch (voice) {
    case "rifle": crack(target, noiseBuffer, now, .07, volume * 1.15, 1800); tone_(target, "square", 240, 110, now, .09, volume * .5); break;
    case "carbine": crack(target, noiseBuffer, now, .12, volume * 1.3, 1100); tone_(target, "sawtooth", 170, 64, now, .2, volume * .75); break;
    case "smg": crack(target, noiseBuffer, now, .04, volume * .8, 2600); tone_(target, "square", 420, 190, now, .05, volume * .3); break;
    case "burst": for (let shot = 0; shot < 3; shot += 1) { crack(target, noiseBuffer, now + shot * .045, .035, volume * .7, 2400); tone_(target, "square", 360, 180, now + shot * .045, .045, volume * .28); } break;
    case "sidearm": crack(target, noiseBuffer, now, .06, volume * .95, 1500); tone_(target, "square", 300, 120, now, .09, volume * .45); break;
    case "rpg": boom(target, noiseBuffer, now, volume * 1.5); break;
    case "ally": crack(target, noiseBuffer, now, .05, volume * .45, 900); tone_(target, "triangle", 260, 130, now, .06, volume * .16); break;
    case "shield": tone_(target, "sine", 200, 130, now, .35, volume * .7); tone_(target, "triangle", 400, 260, now, .3, volume * .3); break;
    case "heal": for (let note = 0; note < 3; note += 1) tone_(target, "triangle", 520 + note * 130, 640 + note * 130, now + note * .07, .22, volume * .45); break;
    case "mark": tone_(target, "sine", 900, 700, now, .16, volume * .55); tone_(target, "sine", 1350, 1050, now + .08, .12, volume * .3); break;
    case "grapple": tone_(target, "sawtooth", 260, 880, now, .22, volume * .4); break;
    case "decoy": tone_(target, "square", 520, 520, now, .08, volume * .35); tone_(target, "square", 660, 660, now + .12, .1, volume * .35); break;
    case "fire": for (let shot = 0; shot < 3; shot += 1) { crack(target, noiseBuffer, now + shot * .08, .2, volume * .6, 600); } break;
    case "venom": tone_(target, "sawtooth", 240, 110, now, .3, volume * .5); crack(target, noiseBuffer, now, .16, volume * .35, 420); break;
    case "shock": boom(target, noiseBuffer, now, volume * 1.1); break;
    case "surge": tone_(target, "sawtooth", 220, 720, now, .4, volume * .5); break;
    case "boss": tone_(target, "sawtooth", 110, 42, now, .8, volume * .8); crack(target, noiseBuffer, now, .5, volume * .5, 300); break;
    case "impact": crack(target, noiseBuffer, now, .1, volume * .7, 700); tone_(target, "triangle", 150, 80, now, .12, volume * .35); break;
    case "hit": tone_(target, "triangle", 130, 90, now, .1, volume * .45); break;
    case "warning": tone_(target, "square", 480, 620, now, .18, volume * .4); break;
    default: tone_(target, "sine", tone, tone * .6, now, .14, volume * .5); break;
  }
}

function tone_(target: SoundTarget, type: OscillatorType, from: number, to: number, start: number, duration: number, gain: number): void {
  const { context, out } = target;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(30, from), start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(28, to), start + duration);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0005, gain * .16), start + 0.004);
  envelope.gain.exponentialRampToValueAtTime(0.0004, start + duration);
  oscillator.connect(envelope); envelope.connect(out);
  oscillator.start(start); oscillator.stop(start + duration + .02);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
}

function crack(target: SoundTarget, noiseBuffer: AudioBuffer, start: number, duration: number, gain: number, filterHz: number): void {
  const { context, out } = target;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  source.buffer = noiseBuffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(filterHz, start);
  filter.Q.value = 0.8;
  envelope.gain.setValueAtTime(Math.max(0.0005, gain * .22), start);
  envelope.gain.exponentialRampToValueAtTime(0.0004, start + duration);
  source.connect(filter); filter.connect(envelope); envelope.connect(out);
  source.start(start); source.stop(start + duration + .02);
  source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); };
}

function boom(target: SoundTarget, noiseBuffer: AudioBuffer, start: number, gain: number): void {
  crack(target, noiseBuffer, start, .45, gain, 260);
  tone_(target, "sine", 96, 34, start, .5, gain * 1.3);
  tone_(target, "square", 200, 60, start + .02, .25, gain * .5);
}
