import { describe, expect, it } from "vitest";
import { meaningShown } from "./meaning-pref";
import { flagValue } from "./use-local-flag";

describe("meaningShown", () => {
  it("follows the header's Thai toggle for a meaning nobody has asked to see", () => {
    expect(meaningShown({ showThai: true })).toBe(true);
    expect(meaningShown({ showThai: false })).toBe(false);
  });

  it("shows a meaning the learner revealed (answer, เปิดเฉลย, ดูความหมาย) even with Thai off", () => {
    expect(meaningShown({ revealed: true, showThai: false })).toBe(true);
  });

  it("keeps a meaning covered while it is still the answer, whatever the toggle says", () => {
    expect(meaningShown({ covered: true, showThai: true })).toBe(false);
    expect(meaningShown({ covered: true, revealed: true, showThai: true })).toBe(false);
  });
});

describe("flagValue (the saved Thai preference)", () => {
  it("uses the default until the learner has chosen, then what they chose", () => {
    expect(flagValue(null, true)).toBe(true);
    expect(flagValue("0", true)).toBe(false);
    expect(flagValue("1", false)).toBe(true);
  });
});
