import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FocusBar, LessonFocus } from "./lesson-focus";
import { TABS, sectionLabel } from "./lesson-tabs";

const Page = LessonFocus as ComponentType<{ className: string; children?: ReactNode }>;
const page = (bar = true) => renderToStaticMarkup(createElement(Page, { className: "x" },
  bar ? createElement(FocusBar, { title: "Present Simple", level: "A1", section: "Practice" }) : createElement("p", null, "lesson")));

describe("focus mode, first render", () => {
  it("starts off, with the button that enters it", () => {
    const html = page();
    expect(html).toContain('data-focus="off"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("เข้าโหมดโฟกัส");
    expect(html).not.toContain("ออกจากโหมดโฟกัส");
  });

  it("keeps the context row out of normal mode (shown only through the focus class)", () => {
    expect(page()).toContain("hidden min-w-0 flex-[1_1_15rem] group-data-[focus=on]/lesson:block");
  });

  it("says only the real title, level and section: no percentages, bands or saved-progress claims", () => {
    const row = page().replace(/<[^>]+>/g, " ");
    for (const part of ["Present Simple", "A1", "Practice"]) expect(row).toContain(part);
    expect(row).not.toMatch(/%|Band|บันทึก|mastery/i);
  });

  it("has no button at all on a page without the bar, as on pronunciation lessons", () => {
    expect(page(false)).not.toContain("<button");
  });
});

describe("sectionLabel", () => {
  it("names each section as its tab does", () => {
    expect(TABS.map((t) => sectionLabel(t.id))).toEqual(["Learn", "Practice", "Quiz", "Real-life", "Summary"]);
  });
});
