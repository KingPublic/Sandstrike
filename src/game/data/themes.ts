export type ThemeId = "desert" | "ruins" | "frozen";
export interface EnvironmentTheme {
  readonly name: string;
  readonly hazard: string;
  readonly sky: readonly number[];
  readonly ground: readonly number[];
  readonly skyline: readonly number[];
  readonly surface: number;
  readonly light: number;
  readonly structure: number;
}
export const themes: Readonly<Record<ThemeId, EnvironmentTheme>> = Object.freeze({
  desert: Object.freeze({ name: "Desert Outpost", hazard: "Sand", sky: [0x35444b, 0x68645c, 0x9c8470, 0xc4a17b, 0xddb582], ground: [0xb3956c, 0x8c7151, 0x5a4d3f, 0x352f29], skyline: [0xa29889, 0x8b7d69, 0x6c6255], surface: 0xd9bc8f, light: 0xf4d5a3, structure: 0x55574e }),
  ruins: Object.freeze({ name: "Urban Ruins", hazard: "Debris", sky: [0x27343c, 0x3e4c52, 0x637171, 0x8b9086, 0xb2aa93], ground: [0x837a68, 0x635e53, 0x484941, 0x2d332f], skyline: [0x79827e, 0x5f6d6b, 0x465451], surface: 0xb4ad96, light: 0xd5c9ac, structure: 0x4c5654 }),
  frozen: Object.freeze({ name: "Frozen Facility", hazard: "Snow", sky: [0x354652, 0x5a727e, 0x839ba4, 0xafc1c3, 0xd7ddd5], ground: [0xc9d4d2, 0x94a8aa, 0x637e87, 0x3b515c], skyline: [0x9daeb0, 0x7d969e, 0x597580], surface: 0xe1e7df, light: 0xe8eee3, structure: 0x4c626b }),
});
export function isThemeId(value: string): value is ThemeId { return Object.hasOwn(themes, value); }
