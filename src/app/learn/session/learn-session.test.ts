// @vitest-environment jsdom
// Renders the real flashcard session, with only its server actions and next/link replaced.
import { readFileSync } from "node:fs";
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Word } from "@/content";
import { StudyProvider } from "@/components/study-context";
import { LearnSession } from "./learn-session";

const LONG: Word = { id: "w1", en: "I look forward to hearing from you", th: "หวังว่าจะได้รับการติดต่อกลับจากคุณในเร็ว ๆ นี้", ex: "See you soon.", exTh: "แล้วพบกัน" } as Word;
const NEXT: Word = { id: "w2", en: "always", th: "เสมอ" } as Word;

const actions = vi.hoisted(() => ({
  startSession: vi.fn(),
  resumeSession: vi.fn(),
  gradeCard: vi.fn(),
}));
vi.mock("../actions", () => actions);
vi.mock("@/app/actions", () => ({ addCard: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => createElement("a", { href, ...rest }, children) }));

let host: HTMLDivElement;
let root: Root;

const scrolled = () => vi.mocked(Element.prototype.scrollIntoView);
const button = (re: RegExp) => [...host.querySelectorAll("button")].find((b) => re.test(b.textContent ?? ""));
const click = (el: Element | undefined) => act(async () => { if (!el) throw new Error("nothing to click"); (el as HTMLElement).click(); });
const answerBlock = () => host.querySelector("article h3")!.parentElement!.parentElement!;

beforeEach(async () => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  actions.startSession.mockResolvedValue({ ids: [LONG.id, NEXT.id], newIds: [LONG.id, NEXT.id], words: [LONG, NEXT], schedules: {}, day: "2026-10-31", xpToday: 0, guest: true });
  await act(async () => root.render(createElement(StudyProvider, null, createElement(LearnSession, { mode: "new", userKey: "guest", explicit: true }))));
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe("flashcard answer", () => {
  it("brings the word and meaning clear of the bars when the answer opens, and moves no further than that", async () => {
    scrolled().mockClear();
    await click(button(/^เปิดเฉลย/));
    expect(scrolled()).toHaveBeenCalledTimes(1);
    expect(scrolled().mock.contexts[0]).toBe(answerBlock());
    expect(answerBlock().textContent).toContain(LONG.en);
    expect(answerBlock().textContent).toContain(LONG.th);
    expect(scrolled().mock.calls[0][0]).toMatchObject({ block: "nearest", behavior: "auto" });
  });

  it("animates that scroll only when the learner allows motion", async () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);
    scrolled().mockClear();
    await click(button(/^เปิดเฉลย/));
    expect(scrolled().mock.calls[0][0]).toMatchObject({ behavior: "smooth" });
  });

  it("brings the next word into view after grading", async () => {
    await click(button(/^เปิดเฉลย/));
    scrolled().mockClear();
    await click(button(/^จำได้/));
    expect(host.querySelector("article h3")?.textContent).toBe(NEXT.en);
    expect(scrolled().mock.contexts[0]).toBe(answerBlock());
  });

  it("offers all three grades once open, and still tells a guest nothing is saved", async () => {
    await click(button(/^เปิดเฉลย/));
    for (const label of [/^จำไม่ได้/, /^ยังไม่แม่น/, /^จำได้/]) expect(button(label)).toBeTruthy();
    expect(host.textContent).toContain("ผลรอบนี้ไม่ถูกบันทึก");
    await click(button(/^จำไม่ได้/));
    expect(host.textContent).toContain("โหมดทดลอง ไม่บันทึก");
    expect(actions.gradeCard).not.toHaveBeenCalled();
  });

  it("does not scroll on a tap that changes nothing about the card", async () => {
    await click(button(/^เปิดเฉลย/));
    scrolled().mockClear();
    await click(button(/ซ่อนภาพก่อนเฉลย/));
    expect(scrolled()).not.toHaveBeenCalled();
  });
});

describe("keyboard and screen-reader focus", () => {
  const press = (key: string, target: EventTarget = document.body) => act(async () => { target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); });

  it("leaves focus alone when the first card opens, and names only the word", () => {
    expect(document.activeElement).toBe(document.body);
    expect(answerBlock().getAttribute("role")).toBe("group");
    expect(answerBlock().getAttribute("aria-label")).toBe(LONG.en);
  });

  it("moves focus to the answer on reveal, named by both the word and its meaning", async () => {
    await click(button(/^เปิดเฉลย/));
    expect(document.activeElement).toBe(answerBlock());
    expect(answerBlock().getAttribute("aria-label")).toContain(LONG.en);
    expect(answerBlock().getAttribute("aria-label")).toContain(LONG.th);
    expect(answerBlock().closest("[aria-live]")).toBeNull();
  });

  it("lets the scroll decide how far the page moves, and only once", async () => {
    const focus = vi.spyOn(HTMLElement.prototype, "focus");
    scrolled().mockClear();
    await click(button(/^เปิดเฉลย/));
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrolled()).toHaveBeenCalledTimes(1);
    focus.mockRestore();
  });

  it("moves focus to the next word after grading, without giving its meaning away", async () => {
    await click(button(/^เปิดเฉลย/));
    await click(button(/^จำได้/));
    expect(document.activeElement).toBe(answerBlock());
    expect(answerBlock().getAttribute("aria-label")).toBe(NEXT.en);
    expect(answerBlock().getAttribute("aria-label")).not.toContain(NEXT.th);
  });

  it("works from the keyboard alone: Space opens the answer from the word, a number grades it", async () => {
    await press(" ");
    expect(document.activeElement).toBe(answerBlock());
    expect(answerBlock().getAttribute("aria-label")).toContain(LONG.th);
    await press("3", document.activeElement!);
    expect(host.querySelector("article h3")?.textContent).toBe(NEXT.en);
    await press(" ", document.activeElement!);
    expect(answerBlock().getAttribute("aria-label")).toContain(NEXT.th);
  });
});

describe("large browser text", () => {
  const source = (f: string) => readFileSync(f, "utf8");

  it("switches layout by rem width, which a 320px phone at normal text does not reach", () => {
    expect(source("src/app/globals.css")).toContain("@custom-variant cramped (@media (width < 20rem));");
  });

  it("drops the header's wordmark and keeps its name and the tab bar's 48px targets", () => {
    const header = source("src/components/site-header.tsx");
    expect(header).toContain('leading-none cramped:hidden');
    expect(header).toContain('aria-label="Odyssey หน้าแรก"');
    expect(source("src/components/nav.tsx")).toContain("cramped:min-h-[48px]");
  });

  it("wraps a graded quiz choice instead of pushing the page wider", () => {
    const view = source("src/components/lesson-view.tsx");
    expect(view).toContain("cramped:flex-wrap");
    expect(view).toContain("min-w-0 flex-1 cramped:basis-1/2");
    expect(view).toContain("mt-4 grid grid-cols-1");
  });

  it("wraps rows only in the narrow layout, so normal text keeps its one-line rows", () => {
    expect(source("src/components/photo-word-card.tsx")).toContain("mt-auto flex items-center gap-4 cramped:flex-wrap");
    expect(source("src/components/lesson-view.tsx")).toContain("flex w-fit rounded-xl cramped:max-w-full cramped:flex-wrap");
    expect(source("src/components/lesson-words-step.tsx")).toContain("flex gap-2 cramped:flex-wrap");
  });

  it("gives a short word the smaller display size too, and lets any word wrap inside the card", () => {
    expect(host.querySelector("article h3")?.className).toContain("max-w-full");
    expect(source("src/components/photo-word-card.tsx")).toContain("text-5xl leading-none cramped:text-3xl");
  });
});

describe("long answers", () => {
  it("gives a long word a smaller size on phones and leaves a short one alone", async () => {
    expect(host.querySelector("article h3")?.className).toContain("text-3xl");
    await click(button(/^เปิดเฉลย/));
    await click(button(/^จำได้/));
    expect(host.querySelector("article h3")?.textContent).toBe(NEXT.en);
    expect(host.querySelector("article h3")?.className).toContain("text-5xl");
  });
});

describe("the grading panel", () => {
  const panel = () => button(/^เปิดเฉลย/)!.parentElement!;

  it("keeps scrolling and keyboard focus above the measured bars", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    expect(css).toContain("scroll-padding-bottom: calc(var(--tabbar-h) + var(--action-panel-h)");
  });

  it("sits on the tab bar's measured height, not an assumed one", () => {
    expect(panel().className).toContain("bottom-(--tabbar-h)");
    expect(panel().className).not.toMatch(/bottom-\[calc\(\d/);
  });

  it("joins the page on short screens", () => {
    expect(panel().className).toContain("short:static");
  });

  it("reserves room for itself by its measured height", () => {
    expect(panel().parentElement!.className).toContain("var(--action-panel-h)");
  });
});
