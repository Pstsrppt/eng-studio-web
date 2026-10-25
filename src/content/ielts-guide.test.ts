import { describe, expect, it } from "vitest";
import { BANDS, FAQ, TEST_TYPES } from "./ielts-guide";
import { STAGES } from "./stages";

describe("ielts guide", () => {
  it("covers bands 5.0 to 8.0 in half steps, each with study focus and a real roadmap stage", () => {
    expect(BANDS.map((b) => b.band)).toEqual(["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0"]);
    const stages = new Set(STAGES.map((s) => s.id));
    for (const b of BANDS) {
      expect(b.focus.length).toBeGreaterThan(0);
      expect(stages.has(b.stage)).toBe(true);
    }
  });

  it("quotes the official scale for whole bands and invents nothing for half bands", () => {
    expect(BANDS.find((b) => b.band === "6.0")).toMatchObject({ level: "Competent" });
    expect(BANDS.find((b) => b.band === "7.0")?.official).toMatch(/^The test taker has operational command of the language/);
    const half = BANDS.find((b) => b.band === "6.5")!;
    expect(half.official).toBeUndefined();
    expect(half.level).toBe("Between Competent and Good");
  });

  it("has two test types and the six FAQ questions, all in English and Thai", () => {
    expect(TEST_TYPES.map((t) => t.id)).toEqual(["academic", "general"]);
    expect(FAQ).toHaveLength(6);
    for (const f of FAQ) expect(f.a.en && f.a.th).toBeTruthy();
  });
});
