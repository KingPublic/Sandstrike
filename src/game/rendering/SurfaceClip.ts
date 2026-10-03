import type { Vec2 } from "../domain/math/Vector2";
export function clipAboveSurface(points: readonly Vec2[], surface = 0): readonly Vec2[] {
  const output: Vec2[] = [];
  let previous = points.at(-1); if (!previous) return output;
  for (const current of points) {
    if ((previous.y <= surface) !== (current.y <= surface)) { const t = (surface - previous.y) / (current.y - previous.y); output.push({ x: previous.x + t * (current.x - previous.x), y: surface }); }
    if (current.y <= surface) output.push(current);
    previous = current;
  }
  return Object.freeze(output);
}
export function clippedCircle(center: Vec2, radius: number, surface = 0): readonly Vec2[] {
  if (center.y - radius >= surface) return [];
  return clipAboveSurface(Array.from({ length: 24 }, (_, i) => { const angle = i * Math.PI * 2 / 24; return { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius }; }), surface);
}
