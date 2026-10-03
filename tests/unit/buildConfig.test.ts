import { describe, expect, it } from "vitest";

import { normalizeBasePath } from "../../src/game/config/buildConfig";

describe("normalizeBasePath", () => {
  it.each([
    [undefined, "/"],
    ["", "/"],
    ["/", "/"],
    ["////", "/"],
    ["Sandstrike", "/Sandstrike/"],
    ["/Sandstrike/", "/Sandstrike/"],
    ["//Sandstrike///preview//", "/Sandstrike/preview/"],
  ])("normalizes %s to %s", (raw, expected) => {
    expect(normalizeBasePath(raw)).toBe(expected);
  });

  it.each([
    "../Sandstrike",
    "/Sandstrike/../escape",
    "/Sandstrike?preview=true",
    "/Sandstrike#preview",
  ])("rejects unsafe base path %s", (raw) => {
    expect(() => normalizeBasePath(raw)).toThrow(/invalid base path/i);
  });
});
