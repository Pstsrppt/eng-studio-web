// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonLoading } from "./lesson-loading";
import { LessonRouteError } from "./lesson-route-error";
import { PlayableProse } from "./playable-prose";
import { Sentence } from "./sentence";
import { SpeakButton } from "./speak-button";
import { StudyProvider } from "./study-context";

vi.mock("@/app/actions", () => ({ addCard: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => createElement("a", { href, ...rest }, children) }));

const source = (f: string) => readFileSync(f, "utf8");
const tidy = (s: string) => s.replace(/\r\n/g, "\n");

let host: HTMLDivElement;
let root: Root;
const render = (node: ReactNode) => act(async () => root.render(node));

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe("waiting for a lesson", () => {
  const box = () => {
    const div = document.createElement("div");
    div.innerHTML = renderToStaticMarkup(createElement(LessonLoading));
    return div.firstElementChild as HTMLElement;
  };

  it("has a clear name and says so on screen", () => {
    expect(box().getAttribute("role")).toBe("status");
    expect(box().getAttribute("aria-label")).toBe("กำลังเปิดบทเรียน");
    expect(box().textContent).toContain("กำลังเปิดบทเรียน");
  });

  it("offers a way out of a wait that never ends: a real reload of this page", () => {
    const link = box().querySelector(".lesson-loading-hint a");
    expect(link?.getAttribute("href")).toBe("");
    expect(link?.className).toContain("min-h-11");
  });

  it("hides its placeholder shapes from assistive tech", () => {
    expect(box().querySelector(".animate-pulse")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("is what both lesson routes wait with, and is visible against the page", () => {
    for (const page of ["src/app/grammar/[id]/page.tsx", "src/app/sounds/[id]/page.tsx"]) {
      expect(source(page)).toContain("<Suspense fallback={<LessonLoading />}>");
      expect(source(page)).not.toContain("animate-pulse bg-page");
    }
    expect(box().querySelector(".animate-pulse")?.innerHTML).toContain("bg-sunken");
  });

  it("skips the flash on a quick navigation, and keeps that timing under reduced motion", () => {
    const css = tidy(source("src/app/globals.css"));
    expect(css).toContain(".lesson-loading { animation: od-appear var(--od-base) var(--od-ease) 180ms both; }");
    expect(css).toContain(".lesson-loading-hint { animation: od-late 0s linear 8s both; }");
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toContain(".lesson-loading { animation: od-appear 0s linear 180ms both !important; }");
    expect(reduced).toContain(".lesson-loading-hint { animation: od-late 0s linear 8s both !important; }");
  });

  it("uses no script timers", () => {
    expect(source("src/components/lesson-loading.tsx")).not.toMatch(/setTimeout|setInterval|use client/);
  });
});

describe("waiting for the Roadmap", () => {
  it("uses the same visible state, under its own name", () => {
    expect(source("src/app/roadmap/page.tsx")).toContain('<Suspense fallback={<LessonLoading label="กำลังเปิด Roadmap" />}>');
    expect(source("src/app/roadmap/page.tsx")).not.toContain("animate-pulse bg-(--ac-bg)");
    const div = document.createElement("div");
    div.innerHTML = renderToStaticMarkup(createElement(LessonLoading, { label: "กำลังเปิด Roadmap" }));
    expect(div.querySelector('[role="status"]')?.getAttribute("aria-label")).toBe("กำลังเปิด Roadmap");
    expect(div.textContent).toContain("กำลังเปิด Roadmap");
  });
});

describe("a lesson that fails", () => {
  it("says so instead of waiting, and retries when asked", async () => {
    const retry = vi.fn();
    await render(createElement(LessonRouteError, { retry }));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("เปิดบทเรียนไม่สำเร็จ");
    expect(host.querySelector('a[href="/roadmap"]')).toBeTruthy();
    await act(async () => host.querySelector("button")!.click());
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("is caught on both lesson routes", () => {
    for (const f of ["src/app/grammar/[id]/error.tsx", "src/app/sounds/[id]/error.tsx"]) {
      expect(source(f)).toContain('"use client"');
      expect(source(f)).toContain("LessonRouteError as default");
    }
  });
});

describe("flashcard grade contrast", () => {
  const css = source("src/app/globals.css");
  const hex = (name: string) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1] ?? css.match(new RegExp(`--od-${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  const lum = (h: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const session = source("src/app/learn/session/learn-session.tsx");

  it("does not fade the text under the grades", () => {
    const start = session.indexOf('role="group" aria-label="ให้คะแนนความจำ"');
    const block = session.slice(start, session.indexOf("</div>", start));
    expect(block).not.toMatch(/opacity-(?!50)/);
    expect(block).toContain("disabled:opacity-50");
  });

  it("keeps every tone at 4.5:1 or better, at rest and on hover", () => {
    const tones = [...session.matchAll(/tone: "([^"]+)"/g)].map((m) => m[1]);
    expect(tones).toHaveLength(3);
    for (const tone of tones) {
      const color = (re: RegExp) => {
        const v = tone.match(re)?.[1] ?? "";
        return v.startsWith("#") ? v : hex(v);
      };
      const text = color(/(?:^|\s)text-\[?(#[0-9a-f]{6}|[a-z-]+)\]?/i)!;
      const rest = color(/(?:^|\s)bg-\[?(#[0-9a-f]{6}|[a-z-]+)\]?/i)!;
      const hover = color(/hover:bg-\[?(#[0-9a-f]{6}|[a-z-]+)\]?/i)!;
      expect(text, tone).toMatch(/^#/);
      expect(ratio(text, rest), tone).toBeGreaterThanOrEqual(4.5);
      expect(ratio(text, hover), tone).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("names match what is on screen", () => {
  it("names the brand link by its visible text, without an override", () => {
    const header = source("src/components/site-header.tsx");
    expect(header).not.toContain('aria-label="Odyssey');
    expect(header).toContain('<span className="sr-only">หน้าแรก</span>');
  });

  const prose = '<div class="ex">The customer called.<div class="th">ลูกค้าโทรมา</div></div><p><b>to go</b></p>';

  it("names a playable example by all its visible text, and still speaks only the English", async () => {
    await render(createElement(PlayableProse, { html: prose }));
    const ex = host.querySelector(".ex")!;
    expect(ex.getAttribute("aria-label")).toContain("The customer called.");
    expect(ex.getAttribute("aria-label")).toContain("ลูกค้าโทรมา");
    expect(ex.getAttribute("aria-label")).toMatch(/^ฟังเสียง: /);
    expect(ex.getAttribute("data-say")).toBe("The customer called.");
    expect(host.querySelector("b")?.getAttribute("aria-label")).toBe("ฟังเสียง: to go");
  });

  it("still plays from the keyboard", async () => {
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { cancel: vi.fn(), speak });
    vi.stubGlobal("SpeechSynthesisUtterance", class { lang = ""; rate = 1; constructor(public text: string) {} });
    await render(createElement(PlayableProse, { html: prose }));
    const ex = host.querySelector(".ex")!;
    expect(ex.getAttribute("role")).toBe("button");
    expect(ex.getAttribute("tabindex")).toBe("0");
    for (const key of ["Enter", " "]) await act(async () => { ex.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); });
    expect(speak).toHaveBeenCalledTimes(2);
    expect(speak.mock.calls[0][0].text).toBe("The customer called.");
  });
});

describe("touch targets", () => {
  it("moves the speak buttons below the sentence when there is no room beside it, so they don't cover its words", () => {
    expect(source("src/components/sentence.tsx")).toContain("justify-between gap-3 cramped:flex-wrap");
    expect(source("src/components/sentence.tsx")).toContain('"min-w-0 cramped:basis-full"');
    expect(source("src/components/photo-word-card.tsx")).toContain("ring-line cramped:flex-wrap");
    expect(source("src/components/photo-word-card.tsx")).toContain('"min-w-0 flex-1 cramped:basis-full"');
  });

  it("gives every word at least a 24px wide box, as separate buttons with text between them", async () => {
    await render(createElement(StudyProvider, null, createElement(Sentence, { en: "I am a user." })));
    const words = [...host.querySelectorAll("p button")];
    expect(words.map((w) => w.textContent)).toEqual(["I", "am", "a", "user."]);
    for (const w of words) expect(w.className).toContain("min-w-[24px]");
    expect(host.querySelector("p")?.textContent).toBe("I am a user.");
    expect(words[0].className).toContain("-ml-[8px]");
    expect(words[2].className).not.toContain("-ml-[8px]");
  });

  it("gives the small speak button a 44px hit area without changing its 32px size", async () => {
    await render(createElement(SpeakButton, { text: "Hello" }));
    const cls = host.querySelector("button")!.className;
    expect(cls).toContain("size-8");
    expect(cls).toContain("after:-inset-[7px]");
    expect(cls).toContain("relative");
  });
});
