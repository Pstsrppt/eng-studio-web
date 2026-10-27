import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BANDS, DISCLAIMER, FAQ, FORMAT_UPDATE, OVERALL_RULE, ROUNDING_EXAMPLES, TEST_TYPES, overallBand } from "./ielts-guide";
import { STAGES } from "./stages";

describe("ielts guide", () => {
  it("covers bands 5.0 to 8.0 in half steps, each with a summary, study focus and a real roadmap stage", () => {
    expect(BANDS.map((b) => b.band)).toEqual(["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0"]);
    const stages = new Set(STAGES.map((s) => s.id));
    for (const b of BANDS) {
      expect(b.summary.en && b.summary.th).toBeTruthy();
      expect(b.focus.length).toBeGreaterThan(0);
      expect(stages.has(b.stage)).toBe(true);
    }
  });

  it("keeps the official level names as labels only", () => {
    expect(BANDS.find((b) => b.band === "6.0")).toMatchObject({ level: "Competent" });
    expect(BANDS.find((b) => b.band === "6.5")?.level).toBe("Between Competent and Good");
    expect(BANDS.find((b) => b.band === "8.0")?.level).toBe("Very good");
  });

  it("rounds the overall band the way the scoring page explains it", () => {
    for (const e of ROUNDING_EXAMPLES) expect(overallBand(e.average)).toBe(e.overall);
    expect(ROUNDING_EXAMPLES.map((e) => [e.average, e.overall])).toEqual([[6.25, 6.5], [6.75, 7], [6.125, 6]]);
    expect(overallBand(3.875)).toBe(4); // the example on ielts.org
    expect(overallBand(6.375)).toBe(6.5);
    expect(overallBand(6.625)).toBe(6.5);
    expect(overallBand(6.875)).toBe(7);
    expect(overallBand(7)).toBe(7);
    // Every average of four half-band scores lands on a whole or half band.
    for (let q = 0; q <= 72; q++) expect((overallBand(q / 8) * 2) % 1).toBe(0);
  });

  it("states the .25 and .75 rule and the examples in both languages, and the FAQ says the same", () => {
    for (const text of [OVERALL_RULE.en, OVERALL_RULE.th]) {
      expect(text).toContain(".25");
      expect(text).toContain(".75");
      expect(text).toContain("6.25 → 6.5");
      expect(text).toContain("6.75 → 7.0");
      expect(text).toContain("6.125 → 6.0");
    }
    const scoring = FAQ.find((f) => f.q === "How do IELTS band scores work?")!;
    expect(scoring.a.en).toContain(OVERALL_RULE.en);
    expect(scoring.a.th).toContain(OVERALL_RULE.th);
    for (const f of FAQ) expect(`${f.a.en} ${f.a.th}`).not.toMatch(/nearest half band|ครึ่ง Band ที่ใกล้ที่สุด/);
  });

  it("dates the 2026 format change and sends people to check with their test centre", () => {
    expect(FORMAT_UPDATE.announced).toBe("5 March 2026");
    expect(FORMAT_UPDATE.checked).toMatch(/2026$/);
    const all = FORMAT_UPDATE.points.map((p) => p.en).join(" ");
    expect(all).toMatch(/mid-2026/);
    expect(all).toMatch(/vary by country/);
    expect(all).toMatch(/selected markets only.*Writing on Paper/);
    expect(FORMAT_UPDATE.advice.en).toMatch(/test centre/);
  });

  it("has two test types and the eight FAQ questions, all in English and Thai", () => {
    expect(TEST_TYPES.map((t) => t.id)).toEqual(["academic", "general"]);
    expect(FAQ).toHaveLength(8);
    for (const f of FAQ) expect(f.a.en && f.a.th).toBeTruthy();
    expect(DISCLAIMER.th).toBe("Odyssey เป็นเว็บไซต์เตรียมภาษาอังกฤษและ IELTS อิสระ ไม่ได้เป็นส่วนหนึ่งของหรือได้รับการรับรองโดยผู้จัดสอบ IELTS");
  });
});

/** Every source file a learner can see text from. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|json|md)$/.test(name) && !name.endsWith(".test.ts") ? [path] : [];
  });
}

describe("no official text or endorsement claims", () => {
  const files = sourceFiles(join(__dirname, "..")).map((path) => ({ path, text: readFileSync(path, "utf8") }));

  // Distinctive phrases from the official band descriptors. None of them should come back.
  const OFFICIAL_PHRASES = [
    "partial command of the language",
    "effective command of the language",
    "operational command of the language",
    "fully operational command",
    "unsystematic inaccuracies",
    "copes with overall meaning",
    "handle basic communication in their own field",
    "complex and detailed argumentation",
    "The test taker has",
  ];

  it.each(OFFICIAL_PHRASES)("does not contain %j", (phrase) => {
    expect(files.filter((f) => f.text.toLowerCase().includes(phrase.toLowerCase())).map((f) => f.path)).toEqual([]);
  });

  it("never claims to be official, endorsed, approved or a partner of IELTS", () => {
    const claim = /\b(official(ly)? (IELTS )?(partner|site|website|course|materials?)|endorsed by|approved by|accredited by|in partnership with)\b|IELTS (ที่ได้รับการ)?รับรอง|พันธมิตร(อย่างเป็นทางการ)?(ของ)? ?IELTS/i;
    const hits = files.flatMap((f) => f.text.split("\n").filter((line) => claim.test(line) && !/not (part of, and is not )?endorsed|ไม่ได้เป็นส่วนหนึ่ง|"Is Odyssey an official IELTS website\?"/.test(line)).map((line) => `${f.path}: ${line.trim()}`));
    expect(hits).toEqual([]);
  });
});
