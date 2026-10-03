import { characterForRole, type CharacterId } from "../data/characters";
import { themes, type ThemeId } from "../data/themes";
/** Original key art; the selected kit is described separately from the scene. */
export function characterPreview(mode: "rampage" | "hunt", themeId: ThemeId, id: CharacterId): string {
  const selected = characterForRole(mode, id);
  if (!selected) return "";
  return `<div class="menu-art__scene"><img src="${import.meta.env.BASE_URL}art/sandstrike-outpost.jpg" alt="An armored burrowing worm breaches beside a weathered desert outpost" width="1672" height="940" fetchpriority="high"></div><div class="menu-art__caption"><span>${mode === "hunt" ? "SURVIVE THE ASCENT" : "BECOME THE THREAT"}</span><strong>${selected.name}</strong><p>${themes[themeId].name} / ${selected.skill.name}</p></div>`;
}
