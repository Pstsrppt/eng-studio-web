import { describe, expect, it } from "vitest";
import { STUDY_LINKS, TOOL_LINKS, navGroup, studyPage } from "./nav-groups";

describe("navGroup", () => {
  it("keeps เรียน active on every study page and its nested routes", () => {
    for (const p of ["/today", "/grammar", "/grammar/1-7", "/grammar/b2-4", "/learn", "/learn/session", "/vocab"]) {
      expect(navGroup(p), p).toBe("study");
    }
  });

  it("puts utility pages under เครื่องมือ, including a pronunciation lesson", () => {
    for (const p of ["/verbs", "/sounds", "/sounds/0-1", "/mistakes", "/guide"]) expect(navGroup(p), p).toBe("tools");
  });

  it("gives each other page at most one group", () => {
    expect(navGroup("/")).toBe("home");
    expect(navGroup("/roadmap")).toBe("roadmap");
    expect(navGroup("/ielts")).toBe("ielts");
    for (const p of ["/account", "/login", "/welcome", "/forgot-password", "/reset-password"]) expect(navGroup(p), p).toBe("account");
    expect(navGroup("/placement")).toBeNull();
  });

  it("does not match a route that only shares a prefix", () => {
    expect(navGroup("/todayx")).toBeNull();
    expect(navGroup("/learning")).toBeNull();
    expect(navGroup("/grammarian")).toBeNull();
  });

  it("lists four study pages and four tools, with no /study link yet", () => {
    expect(STUDY_LINKS.map((l) => l.href)).toEqual(["/today", "/grammar", "/learn", "/vocab"]);
    expect(TOOL_LINKS.map((l) => l.href)).toEqual(["/verbs", "/sounds", "/mistakes", "/guide"]);
    expect([...STUDY_LINKS, ...TOOL_LINKS].some((l) => l.href.startsWith("/study"))).toBe(false);
  });
});

describe("studyPage", () => {
  it("marks the four list pages, not a lesson or a flashcard session", () => {
    expect(studyPage("/grammar")).toBe("/grammar");
    expect(studyPage("/vocab")).toBe("/vocab");
    expect(studyPage("/grammar/1-7")).toBeNull();
    expect(studyPage("/learn/session")).toBeNull();
  });
});
