export function clampHealth(value: number, maximum: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0) throw new RangeError("Invalid health.");
  return Math.max(0, Math.min(maximum, value));
}

export function healHealth(current: number, amount: number, maximum: number): Readonly<{ health: number; recovered: number }> {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError("Invalid healing amount.");
  const health = clampHealth(current + amount, maximum);
  return Object.freeze({ health, recovered: health - clampHealth(current, maximum) });
}
