import { describe, expect, it } from "vitest";
import { US_CITIES_BY_STATE, US_CITY_COUNT, US_STATES } from "./usCities.js";

describe("U.S. location catalog", () => {
  it("covers every state and the District of Columbia", () => {
    expect(US_STATES).toHaveLength(51);
    expect(US_STATES).toContain("Georgia");
    expect(US_STATES).toContain("District of Columbia");
  });

  it("includes Census places by selected state", () => {
    expect(US_CITY_COUNT).toBeGreaterThan(30000);
    expect(US_CITIES_BY_STATE.Georgia).toContain("Atlanta");
    expect(US_CITIES_BY_STATE.California).toContain("Los Angeles");
    expect(US_CITIES_BY_STATE["New York"]).toContain("New York");
  });
});
