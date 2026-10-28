import { describe, expect, it } from "vitest";
import { STUDY_HOME, STUDY_LINKS, TOOL_LINKS, ariaCurrent, navGroup, studyPage } from "./nav-groups";

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

describe("ariaCurrent (tab bar and header links)", () => {
  // The phone tabs as the tab bar builds them: destination and the group that lights the tab.
  const TABS = [["/", "home"], [STUDY_HOME, "study"], ["/roadmap", "roadmap"], ["/account", "account"]] as const;
  const states = (pathname: string) => TABS.map(([href, g]) => ariaCurrent(pathname, href, navGroup(pathname) === g));

  it("announces the เรียน tab as the page only on /today", () => {
    expect(states("/today")).toEqual([undefined, "page", undefined, undefined]);
  });

  it("marks เรียน as the selected item, not the page, on the other study routes", () => {
    for (const p of ["/grammar", "/grammar/1-7", "/learn", "/learn/session", "/vocab"]) {
      expect(states(p), p).toEqual([undefined, "true", undefined, undefined]);
    }
  });

  it("never gives two tabs aria-current, and never says page for a link that goes elsewhere", () => {
    for (const p of ["/", "/today", "/grammar/1-7", "/roadmap", "/account", "/login", "/verbs", "/placement", "/ielts"]) {
      const s = states(p);
      expect(s.filter(Boolean).length, p).toBeLessThanOrEqual(1);
      TABS.forEach(([href], i) => { if (s[i] === "page") expect(href, p).toBe(p); });
    }
  });

  it("handles the account tab the same way", () => {
    expect(states("/account")).toEqual([undefined, undefined, undefined, "page"]);
    expect(states("/login")).toEqual([undefined, undefined, undefined, "true"]);
  });

  it("leaves a link alone when its group is not active", () => {
    expect(ariaCurrent("/roadmap", "/today", false)).toBeUndefined();
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
