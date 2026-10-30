import { describe, expect, it } from "vitest";
import { jumpScroll, withStage } from "./stage-jump";

describe("stage jump helpers", () => {
  it("sets ?stage= and keeps the other parameters", () => {
    expect(withStage("https://x.test/roadmap", "ielts")).toBe("https://x.test/roadmap?stage=ielts");
    expect(withStage("https://x.test/roadmap?stage=grammar&view=list", "foundation")).toBe("https://x.test/roadmap?stage=foundation&view=list");
  });
  it("scrolls without animation when reduced motion is on, smoothly otherwise; always to the top of the path", () => {
    expect(jumpScroll(true)).toEqual({ behavior: "auto", block: "start" });
    expect(jumpScroll(false)).toEqual({ behavior: "smooth", block: "start" });
  });
});
