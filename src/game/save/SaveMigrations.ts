import { validateSave } from "./SaveValidation";
import type { SaveData } from "./SaveData";

export function migrateSave(value: unknown): SaveData {
  // V1 is the first shipped format; unsupported schemas are preserved externally.
  return validateSave(value);
}
