import type { ActorState } from "../actors/Actor";
import { freezeVec2, type Vec2 } from "../math/Vector2";
import type { CollisionShape, Contact } from "./CollisionTypes";

interface Segment { readonly from: Vec2; readonly to: Vec2; readonly radius: number }
interface Box { readonly left: number; readonly right: number; readonly top: number; readonly bottom: number }

export class CollisionWorld {
  query(previous: readonly ActorState[], current: readonly ActorState[]): readonly Contact[] {
    const history = new Map(previous.map((actor) => [actor.id, actor]));
    const contacts: Contact[] = [];
    for (let firstIndex = 0; firstIndex < current.length; firstIndex += 1) {
      const first = current[firstIndex]!;
      if (first.lifecycle !== "active") continue;
      for (let secondIndex = firstIndex + 1; secondIndex < current.length; secondIndex += 1) {
        const second = current[secondIndex]!;
        if (second.lifecycle !== "active" ||
            !(first.collision.mask & second.collision.layer) ||
            !(second.collision.mask & first.collision.layer)) continue;
        const [source, target] = orderActors(first, second);
        if (!overlap(source, target) && !swept(source, target, history)) continue;
        const kind = source.collision.layer === 8 ? "projectile" : source.collision.layer === 1 ? "impact" : "overlap";
        contacts.push(Object.freeze({
          id: `${source.id}:${target.id}:${kind}`,
          sourceId: source.id,
          targetId: target.id,
          kind,
          priority: kind === "projectile" ? 3 : 4,
          position: freezeVec2(target.position.x, target.position.y),
        }));
      }
    }
    contacts.sort((a, b) => a.priority - b.priority || a.targetId.localeCompare(b.targetId) || a.sourceId.localeCompare(b.sourceId) || a.kind.localeCompare(b.kind));
    return Object.freeze(contacts);
  }
}

function orderActors(first: ActorState, second: ActorState): readonly [ActorState, ActorState] {
  const priority = (actor: ActorState): number => actor.collision.layer === 8 ? 0 : actor.collision.layer === 1 ? 1 : 2;
  return priority(first) < priority(second) || (priority(first) === priority(second) && first.id < second.id)
    ? [first, second] : [second, first];
}

function swept(source: ActorState, target: ActorState, history: ReadonlyMap<string, ActorState>): boolean {
  const shape = source.collision.shape;
  if (shape.kind !== "circle") return false;
  const oldSource = history.get(source.id) ?? source;
  const oldTarget = history.get(target.id) ?? target;
  const offset = shape.offset ?? { x: 0, y: 0 };
  const path: Segment = {
    from: { x: oldSource.position.x - oldTarget.position.x + offset.x, y: oldSource.position.y - oldTarget.position.y + offset.y },
    to: { x: source.position.x - target.position.x + offset.x, y: source.position.y - target.position.y + offset.y },
    radius: shape.radius,
  };
  if (target.collision.shape.kind === "box") return segmentBoxDistance(path, boxAt(target.collision.shape, { x: 0, y: 0 })) <= path.radius;
  const targetSegment = segmentAt(target.collision.shape, { x: 0, y: 0 });
  return segmentDistance(path, targetSegment) <= path.radius + targetSegment.radius;
}

function overlap(first: ActorState, second: ActorState): boolean {
  const a = first.collision.shape;
  const b = second.collision.shape;
  if (a.kind === "box" && b.kind === "box") {
    const one = boxAt(a, first.position);
    const two = boxAt(b, second.position);
    return one.left <= two.right && one.right >= two.left && one.top <= two.bottom && one.bottom >= two.top;
  }
  if (a.kind === "box") {
    const segment = segmentAt(b, second.position);
    return segmentBoxDistance(segment, boxAt(a, first.position)) <= segment.radius;
  }
  if (b.kind === "box") {
    const segment = segmentAt(a, first.position);
    return segmentBoxDistance(segment, boxAt(b, second.position)) <= segment.radius;
  }
  const one = segmentAt(a, first.position);
  const two = segmentAt(b, second.position);
  return segmentDistance(one, two) <= one.radius + two.radius;
}

function segmentAt(shape: CollisionShape, position: Vec2): Segment {
  if (shape.kind === "box") throw new Error("Box has no capsule segment.");
  if (shape.kind === "circle") {
    const point = { x: position.x + (shape.offset?.x ?? 0), y: position.y + (shape.offset?.y ?? 0) };
    return { from: point, to: point, radius: shape.radius };
  }
  return { from: { x: position.x + shape.from.x, y: position.y + shape.from.y }, to: { x: position.x + shape.to.x, y: position.y + shape.to.y }, radius: shape.radius };
}

function boxAt(shape: Extract<CollisionShape, { kind: "box" }>, position: Vec2): Box {
  const x = position.x + (shape.offset?.x ?? 0);
  const y = position.y + (shape.offset?.y ?? 0);
  return { left: x - shape.halfWidth, right: x + shape.halfWidth, top: y - shape.halfHeight, bottom: y + shape.halfHeight };
}

function segmentBoxDistance(segment: Segment, box: Box): number {
  const inside = (point: Vec2): boolean => point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
  if (inside(segment.from) || inside(segment.to)) return 0;
  const corners = [{ x: box.left, y: box.top }, { x: box.right, y: box.top }, { x: box.right, y: box.bottom }, { x: box.left, y: box.bottom }];
  let distance = Infinity;
  for (let index = 0; index < 4; index += 1) {
    distance = Math.min(distance, segmentDistance(segment, { from: corners[index]!, to: corners[(index + 1) % 4]!, radius: 0 }));
  }
  return distance;
}

function segmentDistance(first: Segment, second: Segment): number {
  const cross = (a: Vec2, b: Vec2, c: Vec2): number => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const one = cross(first.from, first.to, second.from);
  const two = cross(first.from, first.to, second.to);
  const three = cross(second.from, second.to, first.from);
  const four = cross(second.from, second.to, first.to);
  if (one * two < 0 && three * four < 0) return 0;
  return Math.min(pointSegmentDistance(first.from, second), pointSegmentDistance(first.to, second), pointSegmentDistance(second.from, first), pointSegmentDistance(second.to, first));
}

function pointSegmentDistance(point: Vec2, segment: Segment): number {
  const dx = segment.to.x - segment.from.x;
  const dy = segment.to.y - segment.from.y;
  const denominator = dx * dx + dy * dy;
  const t = denominator > 0 ? Math.max(0, Math.min(1, ((point.x - segment.from.x) * dx + (point.y - segment.from.y) * dy) / denominator)) : 0;
  return Math.hypot(point.x - segment.from.x - t * dx, point.y - segment.from.y - t * dy);
}
