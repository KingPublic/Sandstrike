import type { SoundVoice } from "../../rendering/FeedbackController";

interface Profile { readonly duration: number; readonly crack: number; readonly body: number; readonly frequency: number; readonly decay: number; readonly air?: number; readonly mechanical?: number }
const profiles: Readonly<Record<SoundVoice, Profile>> = {
  rifle: { duration: .46, crack: .95, body: .62, frequency: 115, decay: 22, mechanical: .16 },
  carbine: { duration: .64, crack: 1, body: .9, frequency: 78, decay: 16, mechanical: .22 },
  smg: { duration: .22, crack: .8, body: .38, frequency: 150, decay: 32, mechanical: .2 },
  burst: { duration: .32, crack: .9, body: .5, frequency: 125, decay: 26, mechanical: .18 },
  sidearm: { duration: .36, crack: .92, body: .53, frequency: 135, decay: 25, mechanical: .23 },
  rpg: { duration: 1.15, crack: .32, body: 1, frequency: 46, decay: 5, air: .8 },
  ally: { duration: .35, crack: .55, body: .28, frequency: 110, decay: 24 },
  shield: { duration: .45, crack: .1, body: .5, frequency: 95, decay: 14, mechanical: .7 },
  heal: { duration: .45, crack: 0, body: .1, frequency: 200, decay: 18, air: .4, mechanical: .25 },
  mark: { duration: .18, crack: 0, body: .18, frequency: 880, decay: 18, mechanical: .12 },
  grapple: { duration: .55, crack: .5, body: .16, frequency: 220, decay: 18, air: .48, mechanical: .45 },
  decoy: { duration: .3, crack: .04, body: .15, frequency: 660, decay: 22, mechanical: .5 },
  fire: { duration: .65, crack: .12, body: .32, frequency: 75, decay: 8, air: .65 },
  venom: { duration: .55, crack: .08, body: .32, frequency: 90, decay: 10, air: .35 },
  shock: { duration: .9, crack: .5, body: 1, frequency: 42, decay: 7, mechanical: .35 },
  surge: { duration: .6, crack: .03, body: .24, frequency: 85, decay: 9, air: .7 },
  leap: { duration: .75, crack: .25, body: .66, frequency: 65, decay: 7, air: .7 },
  boss: { duration: 1.5, crack: .25, body: 1, frequency: 38, decay: 3, air: .5 },
  impact: { duration: .42, crack: .4, body: .6, frequency: 70, decay: 18, mechanical: .2 },
  hit: { duration: .16, crack: .35, body: .4, frequency: 95, decay: 34 },
  warning: { duration: .22, crack: 0, body: .25, frequency: 540, decay: 12 },
  neutral: { duration: .16, crack: .1, body: .18, frequency: 180, decay: 20 },
  pickup: { duration: .3, crack: .05, body: .22, frequency: 190, decay: 22, mechanical: .6 },
  reload: { duration: .7, crack: 0, body: .08, frequency: 160, decay: 25, mechanical: .9 },
  step: { duration: .15, crack: .02, body: .35, frequency: 85, decay: 32, air: .22 },
  wind: { duration: .9, crack: 0, body: 0, frequency: 50, decay: 0, air: .28 },
  rotor: { duration: .6, crack: 0, body: .12, frequency: 35, decay: 0, air: .12 },
};

/** Original sample synthesis: pressure transient, filtered air, body resonance and mechanical clicks. */
export function synthesizeSound(voice: SoundVoice, sampleRate: number): Float32Array {
  const p = profiles[voice], samples = new Float32Array(Math.ceil(p.duration * sampleRate));
  let seed = 0x632be59b, low = 0, mid = 0, phase = 0;
  for (let i = 0; i < samples.length; i++) {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    const noise = (seed >>> 0) / 0x80000000 - 1, t = i / sampleRate;
    low += (noise - low) * .035; mid += (noise - mid) * .24;
    const attack = Math.min(1, t / .0008), tail = Math.min(1, (p.duration - t) / .025);
    phase += 2 * Math.PI * p.frequency * (1 + .5 * Math.exp(-t * 35)) / sampleRate;
    let signal = p.crack * (noise - mid) * Math.exp(-t * 135)
      + p.body * (Math.sin(phase) * .55 + low * 2.2) * Math.exp(-t * p.decay);
    if (p.air) {
      const envelope = voice === "wind" ? Math.sin(Math.PI * t / p.duration) : voice === "rotor" ? (.35 + .65 * Math.max(0, Math.sin(t * Math.PI * 32))) * Math.sin(Math.PI * t / p.duration) : Math.sin(Math.PI * Math.min(1, t / .035)) * Math.exp(-t * 5) + .3 * Math.exp(-t * 4);
      signal += p.air * (mid - low) * envelope;
    }
    if (p.mechanical) for (const click of voice === "reload" ? [.03, .23, .49] : [.018, .065]) {
      const age = t - click;
      if (age >= 0 && age < .055) signal += p.mechanical * (noise * .7 + Math.sin(age * 2 * Math.PI * 2300) * .15) * Math.exp(-age * 140);
    }
    samples[i] = Math.tanh(signal * 1.35) * attack * tail * .7;
  }
  // Sparse reflected energy gives guns an outdoor tail without a synthetic note.
  if (["rifle", "carbine", "smg", "burst", "sidearm", "ally", "rpg", "shock"].includes(voice)) {
    for (const [delay, gain] of [[.065, .1], [.13, .045]] as const) {
      const offset = Math.round(delay * sampleRate);
      for (let i = samples.length - 1; i >= offset; i--) samples[i] = Math.max(-.95, Math.min(.95, (samples[i] ?? 0) + (samples[i - offset] ?? 0) * gain));
    }
  }
  return samples;
}
