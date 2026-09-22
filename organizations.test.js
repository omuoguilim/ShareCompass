import { describe, expect, it } from "vitest";
import { EXTRA_ORGS } from "./organizations.js";

describe("organization catalog", () => {
  it("contains more than 50 additional real organizations", () => {
    expect(EXTRA_ORGS.length).toBeGreaterThan(50);
    expect(EXTRA_ORGS.every((item) => item.real && item.website.startsWith("https://"))).toBe(true);
  });

  it("uses stable unique identifiers and official-looking domains", () => {
    expect(new Set(EXTRA_ORGS.map((item) => item.id)).size).toBe(EXTRA_ORGS.length);
    expect(EXTRA_ORGS.every((item) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(item.handle))).toBe(true);
  });
});
