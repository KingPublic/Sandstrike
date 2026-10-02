import { freezeRecord } from "../domain/actors/Actor";

export type WormId = "dune-maw" | "cinder-wyrm" | "iron-burrower" | "storm-serpent" | "rift-spitter";
export type HunterId = "ranger" | "siegebreaker" | "scout" | "engineer" | "field-medic";
export type CharacterId = WormId | HunterId;
export interface WeaponDefinition { readonly id: string; readonly name: string; readonly damage: number; readonly cadence: number; readonly magazine: number; readonly reloadTicks: number; readonly range: number; readonly burst: number }
export interface CharacterDefinition {
  readonly id: CharacterId; readonly name: string; readonly role: "worm" | "hunter";
  readonly health: number; readonly armor: number; readonly speed: number; readonly weapon?: WeaponDefinition;
  readonly skill: Readonly<{ id: string; name: string; description: string; activeTicks: number; cooldownTicks: number }>;
  readonly visual: Readonly<{ body: number; plate: number; light: number; silhouette: "maw" | "horns" | "armor" | "fins" | "fangs" | "cap" | "visor" | "hood" | "pack" | "medic" }>;
}
export const weapons: readonly WeaponDefinition[] = freezeRecord([
  { id: "rifle", name: "Rifle", damage: 8, cadence: 30, magazine: 6, reloadTicks: 90, range: 1200, burst: 1 },
  { id: "carbine", name: "Heavy carbine", damage: 14, cadence: 42, magazine: 6, reloadTicks: 108, range: 1300, burst: 1 },
  { id: "smg", name: "SMG", damage: 5, cadence: 9, magazine: 18, reloadTicks: 96, range: 950, burst: 1 },
  { id: "burst-rifle", name: "Burst rifle", damage: 6, cadence: 48, magazine: 12, reloadTicks: 102, range: 1200, burst: 3 },
  { id: "sidearm", name: "Sidearm", damage: 12, cadence: 36, magazine: 8, reloadTicks: 78, range: 1000, burst: 1 },
]);
export function weaponById(id?: string): WeaponDefinition { const weapon = weapons.find(w => w.id === (id ?? "rifle")); if (!weapon) throw new RangeError("Unknown weapon."); return weapon; }
const skill = (id: string, name: string, description: string, activeTicks: number, cooldownTicks: number) => ({ id: `skill.${id}`, name, description, activeTicks, cooldownTicks });
export const characters: readonly CharacterDefinition[] = freezeRecord([
  { id: "dune-maw", name: "Dune Maw", role: "worm", health: 100, armor: 0, speed: 1, skill: skill("sandguard", "Sandguard", "Ignore incoming attacks for 3 seconds.", 180, 1200), visual: { body: 0xc85b38, plate: 0x6a2930, light: 0xffc36e, silhouette: "maw" } },
  { id: "cinder-wyrm", name: "Cinder Wyrm", role: "worm", health: 85, armor: 0, speed: 1.05, skill: skill("fire-fan", "Fire fan", "Launch three burning projectiles from the jaws.", 24, 720), visual: { body: 0xc74137, plate: 0x3b202d, light: 0xffe09a, silhouette: "horns" } },
  { id: "iron-burrower", name: "Iron Burrower", role: "worm", health: 140, armor: 3, speed: .9, skill: skill("shock-breach", "Shock breach", "Crush and knock back nearby surface enemies.", 24, 960), visual: { body: 0x819296, plate: 0x263f4f, light: 0xd5eff4, silhouette: "armor" } },
  { id: "storm-serpent", name: "Storm Serpent", role: "worm", health: 90, armor: 0, speed: 1.12, skill: skill("sky-surge", "Sky surge", "A controlled aerial thrust for 1.5 seconds.", 90, 960), visual: { body: 0x588abd, plate: 0x263652, light: 0x96f4ff, silhouette: "fins" } },
  { id: "rift-spitter", name: "Rift Spitter", role: "worm", health: 95, armor: 1, speed: 1, skill: skill("venom-volley", "Venom volley", "Spit venom that continues damaging its targets.", 24, 840), visual: { body: 0x8b609e, plate: 0x343345, light: 0xc2fba2, silhouette: "fangs" } },
  { id: "ranger", name: "Ranger", role: "hunter", health: 100, armor: 0, speed: 1, weapon: weaponById("rifle"), skill: skill("target-mark", "Target mark", "Coordinate stronger allied fire against an exposed worm for 4 seconds.", 240, 840), visual: { body: 0x63b8ad, plate: 0x334b58, light: 0xd9fff2, silhouette: "cap" } },
  { id: "siegebreaker", name: "Siegebreaker", role: "hunter", health: 100, armor: 2, speed: 1, weapon: weaponById("carbine"), skill: skill("shield", "Shield", "Block incoming attacks for 3 seconds.", 180, 1080), visual: { body: 0x94a8bf, plate: 0x32475b, light: 0xe2f3ff, silhouette: "visor" } },
  { id: "scout", name: "Scout", role: "hunter", health: 100, armor: 0, speed: 1, weapon: weaponById("smg"), skill: skill("grapple", "Grapple", "Pull onto a visible ledge within reach.", 30, 720), visual: { body: 0xc7b66f, plate: 0x384f47, light: 0xffedac, silhouette: "hood" } },
  { id: "engineer", name: "Engineer", role: "hunter", health: 100, armor: 1, speed: 1, weapon: weaponById("burst-rifle"), skill: skill("decoy", "Decoy", "Deploy a beacon that attracts a nearby sensing worm for 5 seconds.", 300, 960), visual: { body: 0xcc965e, plate: 0x4b414d, light: 0xffe2ab, silhouette: "pack" } },
  { id: "field-medic", name: "Field Medic", role: "hunter", health: 100, armor: 0, speed: 1, weapon: weaponById("sidearm"), skill: skill("field-heal", "Field heal", "Restore 30 health to yourself and nearby surviving allies.", 36, 1200), visual: { body: 0xe5dfd3, plate: 0x45746d, light: 0x9ef5be, silhouette: "medic" } },
]);
export function characterForRole(mode: "rampage" | "hunt", id?: string): CharacterDefinition | undefined {
  const role = mode === "hunt" ? "hunter" : "worm";
  return characters.find(c => c.id === (id ?? (role === "worm" ? "dune-maw" : "ranger")) && c.role === role);
}
export function isCharacterId(id: unknown): id is CharacterId { return characters.some(c => c.id === id); }
