export interface RandomStream {
  float(): number;
  integer(minimum: number, maximum: number): number;
}

class SeededStream implements RandomStream {
  constructor(private state: number) { this.state = state >>> 0 || 0x9e3779b9; }
  float(): number {
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state / 0x1_0000_0000;
  }
  integer(minimum: number, maximum: number): number {
    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || maximum < minimum) throw new RangeError("Invalid random integer range.");
    return minimum + Math.floor(this.float() * (maximum - minimum + 1));
  }
}

export class RandomSource {
  private readonly streams = new Map<string, RandomStream>();
  constructor(private readonly seed: number) {
    if (!Number.isSafeInteger(seed)) throw new RangeError("Invalid random seed.");
  }
  stream(name: string): RandomStream {
    const existing = this.streams.get(name);
    if (existing) return existing;
    let hash = (this.seed >>> 0) ^ 0x811c9dc5;
    for (const character of name) hash = Math.imul(hash ^ character.charCodeAt(0), 0x01000193);
    const stream = new SeededStream(hash);
    this.streams.set(name, stream);
    return stream;
  }
}
