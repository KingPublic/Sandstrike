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
  desert: Object.freeze({ name: "Desert Outpost", hazard: "Sand", sky: [0x110c19, 0x1d1022, 0x3a1b2d, 0x6b302f, 0xb45d3c], ground: [0x9f5138, 0x71382f, 0x4c2930, 0x291b27], skyline: [0x7f3d36, 0xa9513a, 0xc96f45], surface: 0xf2b866, light: 0xffc470, structure: 0x503d3b }),
  ruins: Object.freeze({ name: "Urban Ruins", hazard: "Debris", sky: [0x080e1c, 0x132038, 0x24394b, 0x435064, 0x726272], ground: [0x555461, 0x383c4a, 0x272e3d, 0x151e2c], skyline: [0x243347, 0x384658, 0x4e5061], surface: 0xffba77, light: 0xe1aabe, structure: 0x28384c }),
  frozen: Object.freeze({ name: "Frozen Facility", hazard: "Snow", sky: [0x061822, 0x0c303e, 0x18566b, 0x3c8594, 0x85bec5], ground: [0xb5d7de, 0x7da7b9, 0x476980, 0x1b344c], skyline: [0x315f77, 0x52889a, 0x83b2be], surface: 0xe7ffff, light: 0xbef9ee, structure: 0x294d68 }),
});
export function isThemeId(value: string): value is ThemeId { return Object.hasOwn(themes, value); }
