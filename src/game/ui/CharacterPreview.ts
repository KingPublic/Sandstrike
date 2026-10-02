import { characterForRole, type CharacterId } from "../data/characters";
import { themes, type ThemeId } from "../data/themes";

const hex = (color: number): string => `#${color.toString(16).padStart(6, "0")}`;

/** Original inline artwork; no asset download or canvas/game instance in menus. */
export function characterPreview(mode: "rampage" | "hunt", themeId: ThemeId, id: CharacterId): string {
  const selected = characterForRole(mode, id); if (!selected) return "";
  const theme = themes[themeId], worm = mode === "rampage" ? selected : characterForRole("rampage");
  if (!worm) return "";
  const v = worm.visual, human = mode === "hunt" ? selected.visual : characterForRole("hunt")?.visual;
  const segments = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14, x = 140 + t * 385, y = 360 - Math.sin(t * Math.PI * .5) * 185;
    const r = 10 + t * 27;
    return `<g><circle cx="${String(x)}" cy="${String(y)}" r="${String(r + 3)}" fill="${hex(v.plate)}"/><circle cx="${String(x - 2)}" cy="${String(y - 3)}" r="${String(r)}" fill="url(#worm-skin)"/><path d="M${String(x - r * .6)} ${String(y - r * .62)} Q${String(x)} ${String(y - r * 1.2)} ${String(x + r * .5)} ${String(y - r * .6)}" fill="none" stroke="${hex(v.light)}" stroke-opacity=".32" stroke-width="3"/></g>`;
  }).join("");
  const buildings = Array.from({ length: 11 }, (_, i) => {
    const x = i * 87 - 30, h = 50 + (i * 43) % 180;
    return `<path d="M${String(x)} 340V${String(340 - h)}h50v${String(h)}" fill="${hex(theme.structure)}" opacity=".7"/><path d="M${String(x + 8)} ${String(350 - h)}h28m-28 20h28m-28 20h28" stroke="${hex(theme.light)}" stroke-opacity=".18" stroke-width="4"/>`;
  }).join("");
  return `<div class="menu-art__scene"><svg viewBox="0 0 800 480" role="img" aria-label="${selected.name} in ${theme.name}" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="preview-sky" x2="0" y2="1"><stop stop-color="${hex(theme.sky[1] ?? 0x17101f)}"/><stop offset="1" stop-color="${hex(theme.sky[4] ?? 0x754232)}"/></linearGradient><linearGradient id="worm-skin" x2=".3" y2="1"><stop stop-color="${hex(v.light)}"/><stop offset=".35" stop-color="${hex(v.body)}"/><stop offset="1" stop-color="${hex(v.plate)}"/></linearGradient><radialGradient id="preview-glow"><stop stop-color="${hex(theme.light)}" stop-opacity=".28"/><stop offset="1" stop-color="${hex(theme.light)}" stop-opacity="0"/></radialGradient></defs>
    <rect width="800" height="480" fill="url(#preview-sky)"/><circle cx="620" cy="100" r="170" fill="url(#preview-glow)"/><circle cx="620" cy="100" r="42" fill="${hex(theme.light)}" opacity=".8"/>
    <path d="M0 270Q150 210 320 265T800 210V480H0Z" fill="${hex(theme.skyline[0] ?? 0x44313b)}" opacity=".7"/>${buildings}
    <path d="M0 356Q210 300 390 355T800 325V480H0Z" fill="${hex(theme.ground[0] ?? 0x71382f)}"/><path d="M0 420Q290 350 540 420T800 394V480H0Z" fill="${hex(theme.ground[2] ?? 0x402938)}"/>
    <g class="menu-art__worm">${segments}<path d="M493 188Q485 145 526 133Q570 126 590 158L560 197Q521 209 493 188Z" fill="${hex(v.plate)}"/><path d="M502 183Q496 153 529 142Q565 139 580 158L554 186Q525 201 502 183Z" fill="url(#worm-skin)"/><path d="M550 164L599 150L574 190Z" fill="#170f1e"/><path d="M556 164L575 162L565 175M563 183L582 166L575 187" fill="#fff0c3"/><path d="M532 150l18 -3l-8 8Z" fill="${hex(v.light)}"/><path d="M506 157l-18 -26l35 13" fill="${hex(v.plate)}"/></g>
    <g transform="translate(678 308)" fill="${hex(human?.body ?? 0x63b8ad)}"><path d="M-12 5l-8 37h10l10 -27l10 27h10L12 5Z" fill="${hex(human?.plate ?? 0x334b58)}"/><rect x="-15" y="-33" width="30" height="42" rx="7"/><circle cy="-45" r="11" fill="#ddb798"/><path d="M-14 -44v-15h27v15" fill="${hex(human?.plate ?? 0x334b58)}"/><path d="M-3 -18l-26 -5l-14 -11" fill="none" stroke="#ddb798" stroke-width="8"/><path d="M-13 -31l-40 -16" stroke="#18232e" stroke-width="8"/></g>
    <path d="M110 386l-25 -23m60 20l-7 -29m436 -169l30 -8m-7 27l23 4" stroke="${hex(theme.light)}" stroke-opacity=".5" stroke-width="3"/>
  </svg></div><div class="menu-art__caption"><span>${mode === "hunt" ? "SURVIVE THE ASCENT" : "BECOME THE THREAT"}</span><strong>${selected.name}</strong><p>${theme.name} / ${selected.skill.name}</p></div>`;
}
