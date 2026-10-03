import { validateSave } from "./SaveValidation";
import type { SaveData } from "./SaveData";

export function migrateSave(value: unknown): SaveData {
  // Validate legacy fields before adding v2 defaults; unsupported schemas stay external.
  return validateSave(value);
}
