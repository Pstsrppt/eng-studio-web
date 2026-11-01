import { describe, expect, it } from "vitest";
import verbs from "./data/verbs.json";
import { normalize, verbFormOk } from "./lookup";

describe("verbFormOk", () => {
  it("get: V2 is got, V3 is got or gotten", () => {
    expect(verbFormOk("got", "got", "v2")).toBe(true);
    expect(verbFormOk("gotten", "got", "v2")).toBe(false);
    expect(verbFormOk("got", "got", "v3")).toBe(true);
    expect(verbFormOk("gotten", "got", "v3")).toBe(true);
  });

  it("get: the base form and made-up forms are wrong in both fields", () => {
    expect(verbs.find((v) => v.v1 === "get")).toMatchObject({ v2: "got", v3: "got" });
    for (const form of ["v2", "v3"] as const) {
      for (const wrong of ["get", "getted", "gots", "gotton"]) expect(verbFormOk(wrong, "got", form)).toBe(false);
    }
  });

  it("every verb's own forms still pass, in the field they belong to", () => {
    for (const v of verbs) {
      expect(verbFormOk(v.v2, v.v2, "v2")).toBe(true);
      expect(verbFormOk(v.v3, v.v3, "v3")).toBe(true);
    }
  });

  it("gotten is the only extra form, and only for get", () => {
    for (const v of verbs.filter((x) => x.v1 !== "get")) {
      expect(verbFormOk("gotten", v.v2, "v2")).toBe(false);
      expect(verbFormOk("gotten", v.v3, "v3")).toBe(false);
    }
  });

  it("forms in the wrong field stay wrong", () => {
    expect(verbFormOk("gone", "went", "v2")).toBe(false);
    expect(verbFormOk("went", "gone", "v3")).toBe(false);
    expect(verbFormOk("written", "wrote", "v2")).toBe(false);
    expect(verbFormOk("wrote", "written", "v3")).toBe(false);
    expect(verbFormOk("been", "was/were", "v2")).toBe(false);
    expect(verbFormOk("goed", "went", "v2")).toBe(false);
    expect(verbFormOk("cutted", "cut", "v2")).toBe(false);
  });

  it("be keeps its two past forms", () => {
    for (const ok of ["was", "were", "was/were", "was / were", "was or were"]) expect(verbFormOk(ok, "was/were", "v2")).toBe(true);
  });

  it("case and spaces don't matter, and an empty answer is wrong", () => {
    expect(verbFormOk("  PUT ", "put", "v3")).toBe(true);
    expect(verbFormOk("GOT", "got", "v2")).toBe(true);
    expect(verbFormOk("", "got", "v2")).toBe(false);
    expect(verbFormOk("   ", "got", "v3")).toBe(false);
  });
});

describe("normalize", () => {
  it("ignores case, repeated spaces, curly apostrophes and . , ! ?", () => {
    expect(normalize("  It’s   RAINING. ")).toBe("it's raining");
    expect(normalize("Could you help me, please?")).toBe("could you help me please");
  });

  it("keeps the apostrophe that separates its from it's", () => {
    expect(normalize("its")).not.toBe(normalize("it's"));
  });
});
