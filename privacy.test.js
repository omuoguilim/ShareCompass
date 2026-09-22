import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const rules = readFileSync(new URL("./firestore.rules", import.meta.url), "utf8");

describe("privacy rules", () => {
  it("keeps each private account document owner-only", () => {
    expect(rules).toContain("request.auth.uid == userId");
  });

  it("allows only a sanitized public profile shape", () => {
    expect(rules).toContain("match /publicProfiles/{userId}");
    expect(rules).toContain("keys().hasOnly");
    expect(rules).not.toMatch(/hasOnly\(\[[^\]]*email/s);
    expect(rules).not.toMatch(/hasOnly\(\[[^\]]*phone/s);
  });

  it("limits connection reads to their two participants", () => {
    expect(rules).toContain("resource.data.participants.hasAny([request.auth.uid])");
  });
});
