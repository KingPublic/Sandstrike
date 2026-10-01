import { describe, expect, it } from "vitest";
import { migrateSave } from "../../src/game/save/SaveMigrations";
import valid from "../fixtures/save/v1-valid.json";

describe("initial schema migration gate", () => {
  it("validates current v1 without mutating the source", () => {
    const before = JSON.stringify(valid); expect(migrateSave(valid).settings.reducedMotion).toBe(true); expect(JSON.stringify(valid)).toBe(before);
  });
  it("rejects unsupported past/future envelopes instead of guessing a migration", () => {
    expect(() => migrateSave({ ...valid, schemaVersion: 0 })).toThrow(); expect(() => migrateSave({ ...valid, schemaVersion: 99 })).toThrow();
  });
});
