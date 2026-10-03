import type { SessionSnapshot } from "../domain/session/SessionSnapshot";
export { assistExposedAim } from "../domain/hunt/HuntAiming";
export function huntCameraTarget(snapshot: SessionSnapshot, width: number, height: number) {
  const hunter = snapshot.hunt?.hunter.position ?? { x: 0, y: -16 }, relay = snapshot.actors.find(a => a.id === "relay")?.position ?? { x: 0, y: -30 };
  if (snapshot.world) {
    return Object.freeze({ centerX: hunter.x, centerY: clamp(hunter.y - 40, snapshot.world.summit.y - 240, 400), zoom: clamp(Math.min(width / 1400, height / 720), .5, 1.2) });
  }
  const bracket = snapshot.hunt?.tracking.breachBracket;
  const points = [hunter.x, relay.x, ...(bracket ? [bracket.left, bracket.right] : [])];
  const left = Math.min(...points), right = Math.max(...points);
  return Object.freeze({ centerX: (left + right) / 2, centerY: -40, zoom: Math.max(.45, Math.min(1.25, width / (right - left + 680), height / 540)) });
}
export function visibleHuntPoses(snapshot: SessionSnapshot) {
  const surfaceY = snapshot.world?.surfaceY ?? 0;
  const poses = [snapshot.worm.head, ...snapshot.worm.followers];
  return Object.freeze(poses.filter((pose, index) => snapshot.hunt?.tracking.exactTrace !== undefined || pose.position.y < surfaceY + (index === 0 ? 18 : 12)));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
