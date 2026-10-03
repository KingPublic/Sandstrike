export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export function isFiniteVec2(value: Vec2): boolean {
  return Number.isFinite(value.x) && Number.isFinite(value.y);
}

export function freezeVec2(x: number, y: number): Vec2 {
  return Object.freeze({ x, y });
}
