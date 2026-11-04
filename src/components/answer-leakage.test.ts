// @vitest-environment jsdom
// Renders the real pages' components with real words, and reads everything a learner or a screen reader could reach:
// text, alt, aria-*, title, href and class. Only server actions, next/link and server data are replaced.
import { act, createElement, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSONS, PHOTOS, SOUNDS, VERBS, VERB_GROUPS, WORDS, withImages, type Lesson, type Verb, type Word } from "@/content";
import { verbFormOk } from "@/content/lookup";
import { LearnSession } from "@/app/learn/session/learn-session";
import VerbsPage from "@/app/verbs/page";
import { LessonShell } from "./lesson-shell";
import { LessonFocus } from "./lesson-focus";
import { LessonView } from "./lesson-view";
import { lessonWords } from "@/content/lesson-words";
import { StudyProvider } from "./study-context";
import { VerbsView } from "./verbs-view";
import { VocabView } from "./vocab-view";

const actions = vi.hoisted(() => ({
  saveAttempt: vi.fn(async () => false),
  addLessonCards: vi.fn(async () => 0),
  addCard: vi.fn(async () => "signed-out"),
  reviewCard: vi.fn(async () => null),
}));
const learn = vi.hoisted(() => ({
  gradeCard: vi.fn(async () => ({ ok: false, reason: "signed-out" })),
  startSession: vi.fn(),
  resumeSession: vi.fn(),
}));
vi.mock("@/app/actions", () => actions);
vi.mock("@/app/learn/actions", () => learn);
vi.mock("server-only", () => ({}));
vi.mock("@/lib/data", () => ({ getLessonBest: vi.fn(async () => ({})), bangkokToday: () => "2026-11-02", getUser: async () => null, getCards: async () => ({}) }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => createElement("a", { href, ...rest }, children) }));
vi.mock("next/image", () => ({ default: ({ alt, src }: { alt: string; src: string }) => createElement("img", { alt, src }) }));

const DECKS = [{ id: "all", name: "ชุดทดสอบ", pre: "" }];
const word = (id: string) => withImages(WORDS).find((w) => w.id === id)!;
const verb = (id: string) => withImages(VERBS).find((v) => v.id === id)!;

let host: HTMLDivElement;
let root: Root;

const render = (el: ReactNode) => act(async () => root.render(createElement(StudyProvider, null, el)));
const click = (el: Element | undefined | null) => act(async () => { if (!el) throw new Error("nothing to click"); (el as HTMLElement).click(); });
async function type(el: Element | null, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, value);
    el!.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const buttons = (scope: Element = host) => [...scope.querySelectorAll<HTMLElement>("button")];
const byText = (re: RegExp, scope: Element = host) => buttons(scope).find((b) => re.test(b.textContent?.trim() ?? ""));
const modeRadio = (label: string) => click([...host.querySelectorAll('[role="radio"]')].find((r) => r.textContent === label));

/** Everything in an element that sight, a screen reader, a keyboard or a hover can reach. */
function exposed(scope: Element) {
  const parts = [scope.textContent ?? ""];
  for (const el of scope.querySelectorAll("*")) {
    for (const a of el.attributes) if (/^(alt|title|href|src|aria-label|aria-description|aria-describedby)$/.test(a.name)) parts.push(a.value);
    // Of the class names, only an icon's holds a word from the data; the rest are CSS such as "text-left".
    parts.push(...[...el.classList].filter((c) => c.startsWith("lucide-")));
  }
  return parts.join(" \n ").toLowerCase().replace(/[-_/]/g, " ");
}
const shows = (scope: Element, term: string) => new RegExp(`(^|[^a-z])${term.toLowerCase().replace(/[-_/]/g, " ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`).test(exposed(scope));
const card = () => host.querySelector("article")!;
const img = () => card().querySelector("img");
const credit = () => card().querySelector('a[target="_blank"]');
/** The drill or review above the word table, which is a reference list on purpose. */
function reviewArea() {
  const copy = host.cloneNode(true) as HTMLElement;
  copy.querySelector('section[aria-labelledby="word-table"]')?.remove();
  return copy;
}
const focusables = (scope: Element) => [...scope.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')];

/** The word first in the queue; others are harder, so the queue's level order puts them later. */
function vocab(first: Word, ...rest: Word[]) {
  const words = [{ ...first, level: "A1" as const }, ...rest.map((w) => ({ ...w, level: "B2" as const }))];
  return createElement(VocabView, { words, decks: DECKS, cards: {}, signedIn: false, today: "2026-11-02" });
}
const verbsView = (...list: Verb[]) => createElement(VerbsView, { verbs: list, groups: VERB_GROUPS, cards: {}, signedIn: false, today: "2026-11-02" });
const answerType = async (value: string) => {
  await type(host.querySelector('input[aria-label="คำตอบภาษาอังกฤษ"]'), value);
  await click(byText(/^ตรวจ$/));
};
const nextQ = () => click(byText(/^ข้อต่อไป/));
const answerDrill = async (v2: string, v3: string) => {
  await type(host.querySelector('input[aria-label^="V2"]'), v2);
  await type(host.querySelector('input[aria-label^="V3"]'), v3);
  await click(byText(/^ตรวจ$/));
};
const formsOf = (v: Verb) => [...new Set([v.v2, v.v3].flatMap((f) => f.split("/").map((x) => x.trim())))];
/** Every word reachable in scope that the checker would accept as this verb's V2 or V3, e.g. "gotten" for get. */
const acceptedShown = (scope: Element, v: Verb) =>
  [...new Set(exposed(scope).match(/[a-z]+/g) ?? [])].filter((w) => w !== v.v1 && (verbFormOk(w, v.v2, "v2") || verbFormOk(w, v.v3, "v3")));

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollBy = vi.fn() as typeof window.scrollBy;
  window.matchMedia = vi.fn((query: string) => ({ matches: query.includes("reduced-motion") })) as unknown as typeof window.matchMedia;
  vi.stubGlobal("speechSynthesis", { cancel: vi.fn(), speak: vi.fn() });
  vi.stubGlobal("SpeechSynthesisUtterance", class { lang = ""; rate = 1; constructor(public text: string) {} });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  localStorage.clear();
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe("/vocab typing: L-01 alt, L-02 written answers, L-04 diagrams", () => {
  it("L-01: a picture whose alt holds the answer is not on the page before answering", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    expect(PHOTOS.c243.alt).toContain("coffee");
    expect(img()).toBeNull();
    expect(shows(reviewArea(), "coffee")).toBe(false);
  });

  it("L-01: the credit and its link wait too, and the keyboard cannot reach them", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    expect(credit()).toBeNull();
    expect(card().textContent).not.toContain("ภาพ:");
    expect(focusables(card())).toHaveLength(0);
  });

  it("L-02: the picture with ASK written on it is not shown before answering", async () => {
    await render(vocab(word("v14")));
    await modeRadio("พิมพ์ตอบ");
    expect(host.querySelector('img[src*="v14"]')).toBeNull();
  });

  it.each(["v14", "c69", "c130", "c169", "c207", "c208", "c267", "c272", "c316", "c360", "v25", "v53", "a3", "n47", "i36", "c78", "c380", "l11", "c132", "n50", "c226"])("L-02: %s, a picture with words in it, stays hidden", async (id) => {
    await render(vocab(word(id)));
    await modeRadio("พิมพ์ตอบ");
    expect(img()).toBeNull();
  });

  it.each([["c13", "try again"], ["c312", "most recent"], ["c376", "the whole working day"], ["a26", "previous email"]])("L-04: %s keeps its label %s back until the answer", async (id, label) => {
    await render(vocab(word(id)));
    await modeRadio("พิมพ์ตอบ");
    expect(card().querySelector("figure")).toBeNull();
    expect(card().textContent).not.toContain(label);
    await answerType("zzz");
    expect(card().querySelector("figure")?.textContent).toContain(label);
  });

  it("every word in the course: nothing reachable names the answer before answering", async () => {
    const leaks: string[] = [];
    for (const w of withImages(WORDS)) {
      await render(createElement("div", { key: w.id }, vocab(w)));
      await modeRadio("พิมพ์ตอบ");
      if (shows(card(), w.en)) leaks.push(w.id);
    }
    expect(leaks).toEqual([]);
  }, 120_000);

  it("after a wrong answer: answer, picture, meaningful alt and credit all come back", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    await answerType("zzz");
    expect(card().querySelector("h3")?.textContent).toBe("coffee");
    expect(host.textContent).toContain("คำตอบคือ");
    expect(img()?.getAttribute("alt")).toBe(PHOTOS.c243.alt);
    expect(credit()?.getAttribute("href")).toBe(PHOTOS.c243.url);
  });

  it("after a right answer: the same", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    await answerType("coffee");
    expect(host.textContent).toContain("ถูกต้อง");
    expect(img()?.getAttribute("alt")).toBe(PHOTOS.c243.alt);
    expect(credit()).not.toBeNull();
  });

  it("the next card starts covered, with an empty box", async () => {
    await render(vocab(word("c243"), word("c152")));
    await modeRadio("พิมพ์ตอบ");
    await answerType("coffee");
    await nextQ();
    expect(img()).toBeNull();
    expect(card().querySelector("h3")).toBeNull();
    expect(credit()).toBeNull();
    expect((host.querySelector('input[aria-label="คำตอบภาษาอังกฤษ"]') as HTMLInputElement).value).toBe("");
    expect(shows(reviewArea(), "street")).toBe(false);
  });

  it("a wrong word comes back covered when it is the only one left", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    await answerType("zzz");
    await nextQ();
    expect(img()).toBeNull();
    expect(shows(reviewArea(), "coffee")).toBe(false);
  });

  it("switching modes never carries an open answer into typing", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    await answerType("coffee");
    await modeRadio("นึกในใจ");
    await click(byText(/^ดูความหมาย$/));
    await modeRadio("พิมพ์ตอบ");
    expect(img()).toBeNull();
    expect(shows(reviewArea(), "coffee")).toBe(false);
  });

  it("the prompt and the part of speech, which the question gives on purpose, stay", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    expect(card().textContent).toContain("กาแฟ");
    expect(card().textContent).toContain("n.");
  });
});

describe("/vocab typing with Thai off: L-03", () => {
  beforeEach(() => localStorage.setItem("es-show-thai", "0"));

  it("the meaning button is named without the answer", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    const b = byText(/^ดูความหมาย$/, card())!;
    expect(b.getAttribute("aria-label")).toBeNull();
    expect(shows(b, "coffee")).toBe(false);
    expect(shows(reviewArea(), "coffee")).toBe(false);
  });

  it("the button still opens the meaning, and only the meaning", async () => {
    await render(vocab(word("c243")));
    await modeRadio("พิมพ์ตอบ");
    await click(byText(/^ดูความหมาย$/, card()));
    expect(card().textContent).toContain("กาแฟ");
    expect(shows(reviewArea(), "coffee")).toBe(false);
  });

  it("a new card closes the meaning again, and its button is safe too", async () => {
    await render(vocab(word("c243"), word("c152")));
    await modeRadio("พิมพ์ตอบ");
    await click(byText(/^ดูความหมาย$/, card()));
    await answerType("coffee");
    await nextQ();
    expect(byText(/^ดูความหมาย$/, card())).toBeDefined();
    expect(shows(reviewArea(), "street")).toBe(false);
  });

  it("where the English word is the question, the button may name it", async () => {
    await render(createElement(VerbsView, { verbs: [verb("vb-go")], groups: VERB_GROUPS, cards: {}, signedIn: false, today: "2026-11-02" }));
    expect(byText(/^ดูความหมาย$/, card())?.getAttribute("aria-label")).toBe("ดูความหมายของ go");
  });
});

describe("/vocab recall and listening keep their behaviour", () => {
  it("recall hides the meaning and keeps the picture, as decided in D5", async () => {
    await render(vocab(word("c243")));
    expect(card().textContent).not.toContain("กาแฟ");
    expect(img()?.getAttribute("alt")).toBe(PHOTOS.c243.alt);
    expect(credit()).not.toBeNull();
    expect(card().querySelector("h3")?.textContent).toBe("coffee");
  });

  it("recall opens the meaning on request", async () => {
    await render(vocab(word("c243")));
    await click(byText(/^ดูความหมาย$/));
    expect(card().textContent).toContain("กาแฟ");
  });

  it("listening hides the word, the meaning, and the picture until a choice is made", async () => {
    await render(vocab(word("c243"), word("c152"), word("c31"), word("c69")));
    await modeRadio("ฟังแล้วเลือก");
    expect(img()).toBeNull();
    expect(shows(card(), "coffee")).toBe(false);
    expect(card().textContent).not.toContain("กาแฟ");
    await click([...host.querySelectorAll('[aria-label="เลือกความหมาย"] [role="radio"]')].find((r) => r.textContent === "กาแฟ"));
    expect(img()).not.toBeNull();
    expect(card().querySelector("h3")?.textContent).toBe("coffee");
  });
});

describe("/verbs drill: L-01 and D2", () => {
  it.each([["vb-break", "broken"], ["vb-steal", "stolen"]])("L-01: %s has no picture, alt or credit naming %s before checking", async (id, form) => {
    await render(verbsView(verb(id)));
    expect(PHOTOS[id].alt).toContain(form);
    expect(img()).toBeNull();
    expect(credit()).toBeNull();
    expect(shows(host, form)).toBe(false);
  });

  it("D2: every verb's timeline stands in with no V2 or V3 on it", async () => {
    const unsafe: string[] = [];
    for (const v of withImages(VERBS)) {
      await render(createElement("div", { key: v.id }, verbsView(v)));
      const fig = card().querySelector("figure");
      if (!fig || !/V3 \?/.test(fig.textContent ?? "") || !/V2 \?/.test(fig.textContent ?? "")) unsafe.push(v.id + ": no safe timeline");
      for (const f of formsOf(v)) if (f !== v.v1 && shows(fig ?? card(), f)) unsafe.push(`${v.id}: ${f}`);
    }
    expect(unsafe).toEqual([]);
  }, 60_000);

  it("after checking: the answer, the examples, and a way to the picture with its alt and credit", async () => {
    const v = verb("vb-break");
    await render(verbsView(v));
    await answerDrill("zzz", "zzz");
    expect(host.textContent).toContain("broke");
    expect(card().querySelector("figure")?.textContent).toContain("broken");
    await click(byText(/^ภาพ$/, card()));
    expect(img()?.getAttribute("alt")).toBe(PHOTOS["vb-break"].alt);
    expect(credit()?.getAttribute("href")).toBe(PHOTOS["vb-break"].url);
  });

  it("the next verb starts covered", async () => {
    await render(verbsView({ ...verb("vb-break"), level: "A1" }, { ...verb("vb-steal"), level: "B2" }));
    await answerDrill("broke", "broken");
    await click(byText(/^ข้อต่อไป/));
    expect(img()).toBeNull();
    expect(shows(host, "stolen")).toBe(false);
    expect((document.activeElement as HTMLInputElement | null)?.getAttribute("aria-label")).toMatch(/^V2 ของ/);
  });
});

describe("/verbs drill: L-05 groups", () => {
  const go = () => verb("vb-go");

  it("the group buttons do not spell out the forms during a drill", async () => {
    await render(verbsView(go(), verb("vb-send"), verb("vb-cut"), verb("vb-run"), verb("vb-work")));
    for (const form of ["went", "gone", "sent", "worked", "ran"]) expect(shows(host, form)).toBe(false);
    expect(host.textContent).not.toContain("cut cut cut");
  });

  it.each(["vb-go", "vb-send", "vb-work", "vb-cut", "vb-run"])("%s: its answer is nowhere before checking", async (id) => {
    const v = verb(id);
    await render(verbsView(v, verb("vb-put"), verb("vb-think")));
    const before = host.textContent ?? "";
    expect(before).not.toContain(`${v.v1} ${v.v2} ${v.v3}`);
    for (const f of formsOf(v)) if (f !== v.v1) expect(shows(host, f)).toBe(false);
  });

  it.each(["vb-put", "vb-come"])("%s: the mixed list does not name its group before checking", async (id) => {
    const v = verb(id);
    await render(verbsView(v));
    expect(host.querySelector("form")?.textContent).not.toContain(VERB_GROUPS[v.g].name);
  });

  it("every verb, mixed or in its chosen group: no form reaches the page before checking", async () => {
    const leaks: string[] = [];
    const all = withImages(VERBS);
    for (const v of all) {
      const pool = [{ ...v, level: "A1" as const }, ...all.filter((x) => x.id !== v.id).map((x) => ({ ...x, level: "B2" as const }))];
      await render(createElement("div", { key: v.id }, verbsView(...pool)));
      for (const f of formsOf(v)) if (f !== v.v1 && shows(host, f)) leaks.push(`all ${v.id}: ${f}`);
      for (const w of acceptedShown(host, v)) leaks.push(`all ${v.id}: accepted ${w}`);
      await click(buttons().find((b) => b.getAttribute("aria-pressed") !== null && b.querySelector("b")?.textContent === (v.g === "REG" ? "-ed" : v.g)));
      for (const f of formsOf(v)) if (f !== v.v1 && shows(host, f)) leaks.push(`group ${v.id}: ${f}`);
      for (const w of acceptedShown(host, v)) leaks.push(`group ${v.id}: accepted ${w}`);
    }
    expect(leaks).toEqual([]);
  }, 180_000);

  it("the group's name comes with the answer in the mixed list", async () => {
    const v = verb("vb-put");
    await render(verbsView(v));
    await answerDrill("put", "put");
    expect(host.querySelector("form")?.textContent).toContain(VERB_GROUPS.AAA.name);
  });

  it("choosing a group on purpose keeps its name during the drill", async () => {
    await render(verbsView(verb("vb-put"), go()));
    await click(buttons().find((b) => b.querySelector("b")?.textContent === "AAA"));
    expect(host.querySelector("form")?.textContent).toContain(VERB_GROUPS.AAA.name);
    expect(host.textContent).toContain(VERB_GROUPS.AAA.name);
  });

  it("the table keeps the samples and the group tip", async () => {
    await render(verbsView(go(), verb("vb-put")));
    await click([...host.querySelectorAll('[role="tab"]')].find((t) => t.textContent === "ตาราง"));
    expect(host.textContent).toContain("go went gone");
    await click(buttons().find((b) => b.querySelector("b")?.textContent === "ABC"));
    expect(host.textContent).toContain(VERB_GROUPS.ABC.tip);
  });
});

describe("lesson Learn keeps its pictures", () => {
  it("the word card shows word, meaning, picture, alt, credit, and steps back and forth", async () => {
    const lesson = LESSONS.find((l) => l.id === "1-1")!;
    const words = lessonWords(lesson.id);
    const withPhoto = [...words.fresh, ...words.review].findIndex((x) => x.photo);
    const Focus = LessonFocus as ComponentType<{ className: string; children?: ReactNode }>;
    await render(createElement(Focus, { className: "x" }, createElement(LessonView, { lesson, words, passMark: 80 })));
    for (let i = 0; i < withPhoto; i++) await click(byText(/^คำถัดไป/));
    const first = card().querySelector("h3")?.textContent;
    expect(first).toBeTruthy();
    expect(img()?.getAttribute("alt")).toBeTruthy();
    expect(credit()).not.toBeNull();
    await click(byText(/^คำถัดไป/));
    await click(byText(/^← คำก่อน/));
    expect(card().querySelector("h3")?.textContent).toBe(first);
    expect(img()).not.toBeNull();
  });
});

describe("/learn/session keeps its behaviour", () => {
  const session = (ids: string[]) => ({ day: "2026-11-02", ids, newIds: ids, xpToday: 0, guest: true, words: ids.map(word), schedules: {} });
  const start = async (ids: string[]) => {
    learn.startSession.mockReset().mockResolvedValue(session(ids));
    await render(createElement(LearnSession, { mode: "new", userKey: "guest", explicit: true }));
  };

  it("before opening: no meaning, no example, no picture by default", async () => {
    await start(["c243", "c152"]);
    expect(card().querySelector("h3")?.textContent).toBe("coffee");
    expect(card().textContent).not.toContain("กาแฟ");
    expect(img()).toBeNull();
  });

  it("opening shows the meaning, picture and credit, and moves focus to the answer", async () => {
    await start(["c243", "c152"]);
    await click(byText(/^เปิดเฉลย/));
    expect(card().textContent).toContain("กาแฟ");
    expect(img()?.getAttribute("alt")).toBe(PHOTOS.c243.alt);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("เฉลย: coffee แปลว่า กาแฟ");
  });

  it("grading leads to a covered next card", async () => {
    await start(["c243", "c152"]);
    await click(byText(/^เปิดเฉลย/));
    await click(byText(/^จำได้/));
    expect(card().querySelector("h3")?.textContent).toBe("street");
    expect(img()).toBeNull();
  });

  it("the learner's own choice to show the picture still works, and the meaning stays covered", async () => {
    await start(["c243"]);
    await click(byText(/ซ่อนภาพก่อนเฉลย/));
    expect(img()).not.toBeNull();
    expect(card().textContent).not.toContain("กาแฟ");
  });
});

describe("quiz: L-06 Learning Tips", () => {
  const tips = () => host.querySelector('section[aria-labelledby="coach-tip"]');
  const tabTo = (label: string) => click([...host.querySelectorAll('[role="tab"]')].find((t) => t.textContent?.includes(label)));
  const shell = (lesson: Lesson, kind: "grammar" | "sounds" = "grammar") => createElement(LessonShell, { lesson, kind, passMark: 80 });
  const lesson = LESSONS.find((l) => l.id === "1-1")!;
  const answerAll = async () => {
    for (const g of host.querySelectorAll('[role="tabpanel"]:not([hidden]) [role="radiogroup"]')) await click(g.querySelector('[role="radio"]'));
  };
  const submit = () => click(byText(/^ส่งคำตอบ$/));

  beforeEach(() => {
    actions.saveAttempt.mockReset().mockResolvedValue(false);
    actions.addLessonCards.mockClear();
  });

  it("tips show while learning", async () => {
    await render(shell(lesson));
    expect(tips()?.textContent).toContain("I check email every day.");
  });

  it("tips leave the page, not just the screen, during the quiz", async () => {
    await render(shell(lesson));
    await tabTo("Quiz");
    expect(tips()).toBeNull();
    expect(host.querySelector("aside:last-of-type")?.textContent ?? "").not.toContain("I check email every day.");
  });

  it.each([["1-1", "I check email every day."], ["1-2", "send"], ["1-5", "an"], ["a2-8", "sent"], ["b2-4", "Although it was late, we continued."], ["0-1", "worked"]])("%s: the box that held %s is gone during the quiz", async (id) => {
    const l = [...LESSONS, ...SOUNDS].find((x) => x.id === id)!;
    await render(createElement("div", { key: id }, shell(l, SOUNDS.includes(l) ? "sounds" : "grammar")));
    expect(tips()).not.toBeNull();
    await tabTo("Quiz");
    expect(tips()).toBeNull();
  });

  it("tips come back after submitting, and leave again on a retake", async () => {
    await render(shell(lesson));
    await tabTo("Quiz");
    await answerAll();
    expect(tips()).toBeNull();
    await submit();
    expect(tips()).not.toBeNull();
    await click(byText(/^ทำใหม่/));
    expect(tips()).toBeNull();
  });

  it("leaving an unfinished quiz for another tab brings them back; returning hides them and keeps the answers", async () => {
    await render(shell(lesson));
    await tabTo("Quiz");
    await click(host.querySelector('[role="tabpanel"]:not([hidden]) [role="radiogroup"] [role="radio"]'));
    await tabTo("Learn");
    expect(tips()).not.toBeNull();
    await tabTo("Quiz");
    expect(tips()).toBeNull();
    expect(host.querySelectorAll('[role="tabpanel"]:not([hidden]) [aria-checked="true"]')).toHaveLength(1);
  });

  it("the score sent is unchanged by all this", async () => {
    await render(shell(lesson));
    await tabTo("Quiz");
    const groups = [...host.querySelectorAll('[role="tabpanel"]:not([hidden]) [role="radiogroup"]')];
    for (const [i, g] of groups.entries()) await click(g.querySelectorAll('[role="radio"]')[lesson.quiz[i].a]);
    await submit();
    expect(actions.saveAttempt).toHaveBeenCalledWith("1-1", 100, true, []);
  });

  it("the quiz explanation still waits for the submit", async () => {
    await render(shell(lesson));
    await tabTo("Quiz");
    const panel = host.querySelector('[role="tabpanel"]:not([hidden])')!;
    for (const q of lesson.quiz) if (q.why) expect(panel.textContent).not.toContain(q.why);
  });

  it("tips stay away while the score is being saved, and come back with the result", async () => {
    let finish: (saved: boolean) => void = () => {};
    actions.saveAttempt.mockImplementation(() => new Promise<boolean>((resolve) => { finish = resolve; }));
    try {
      await render(shell(lesson));
      await tabTo("Quiz");
      await answerAll();
      await submit();
      expect(tips()).toBeNull();
      await act(async () => finish(false));
      expect(tips()).not.toBeNull();
    } finally {
      await act(async () => { finish(false); });
    }
  });
});

describe("/verbs page around an active drill: L-05 and D4", () => {
  /** Every word outside the drill's own card and form, as text or as an accessible name, that the checker would accept as some verb's V2 or V3. */
  function acceptedAnswersAround(scope: Element) {
    const copy = scope.cloneNode(true) as Element;
    copy.querySelectorAll("article, form").forEach((e) => e.remove());
    const parts = [copy.textContent ?? ""];
    for (const el of copy.querySelectorAll("*")) for (const a of ["aria-label", "aria-description", "title", "alt"]) if (el.hasAttribute(a)) parts.push(el.getAttribute(a)!);
    const words = new Set(parts.join(" ").toLowerCase().match(/[a-z]+/g) ?? []);
    const found: string[] = [];
    for (const v of VERBS) for (const w of words) {
      // A form spelled like the verb's own V1 (cut, run) tells nothing the drill does not show anyway.
      if (w === v.v1) continue;
      if (verbFormOk(w, v.v2, "v2")) found.push(`${v.id} V2 ${w}`);
      if (verbFormOk(w, v.v3, "v3")) found.push(`${v.id} V3 ${w}`);
    }
    return [...new Set(found)];
  }
  const showPage = async () => {
    await render(createElement(VerbsPage));
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    expect(host.querySelector("form input[aria-label^='V2']")).not.toBeNull();
  };

  it("the header, introduction and controls hold no accepted V2 or V3 while drilling", async () => {
    await showPage();
    expect(acceptedAnswersAround(host)).toEqual([]);
  });

  it("the same holds with each group chosen", async () => {
    await showPage();
    for (const g of ["-ed", "AAA", "ABB", "ABC", "ABA"]) {
      await click(buttons().find((b) => b.getAttribute("aria-pressed") !== null && b.querySelector("b")?.textContent === g));
      expect(acceptedAnswersAround(host)).toEqual([]);
    }
  });

  it("the introduction still teaches V2 and V3 with an example", async () => {
    await showPage();
    const intro = host.querySelector("header")?.textContent ?? host.textContent ?? "";
    expect(intro).toContain("V2 ใช้เล่าเรื่องที่จบแล้ว");
    expect(intro).toMatch(/I have \w+ it\./);
  });

  it("the table, which is for learning, still shows the forms", async () => {
    await showPage();
    await click([...host.querySelectorAll('[role="tab"]')].find((t) => t.textContent === "ตาราง"));
    expect(host.textContent).toContain("go went gone");
  });
});

describe("/verbs drill: a note that names a form waits for the answer (vb-get, vb-read)", () => {
  it("vb-get before checking: the meaning is shown, gotten is nowhere", async () => {
    await render(verbsView(verb("vb-get")));
    expect(card().textContent).toContain("ได้รับ");
    expect(acceptedShown(host, verb("vb-get"))).toEqual([]);
  });

  it("vb-get with Thai off: opening the meaning shows the meaning, still without gotten", async () => {
    localStorage.setItem("es-show-thai", "0");
    await render(verbsView(verb("vb-get")));
    expect(byText(/^ดูความหมาย$/, card())?.getAttribute("aria-label")).toBe("ดูความหมายของ get");
    await click(byText(/^ดูความหมาย$/, card()));
    expect(card().textContent).toContain("ได้รับ");
    expect(acceptedShown(host, verb("vb-get"))).toEqual([]);
  });

  it.each([["got", "got", true], ["got", "gotten", true], ["gotten", "gotten", false], ["got", "getted", false]])(
    "vb-get: V2 %s and V3 %s are marked %s, as before",
    async (v2, v3, ok) => {
      await render(verbsView(verb("vb-get")));
      await answerDrill(v2, v3);
      expect(host.textContent).toContain(ok ? "✓ ถูกต้อง" : "✗ ยังไม่ใช่");
    },
  );

  it("vb-get after checking, right or wrong: the note joins the meaning", async () => {
    await render(verbsView(verb("vb-get")));
    await answerDrill("zzz", "zzz");
    expect(card().textContent).toContain("ได้รับ (US: V3 = gotten)");
  });

  it("vb-read: the pronunciation note waits for the answer, then shows", async () => {
    await render(verbsView(verb("vb-read")));
    expect(card().textContent).toContain("อ่าน");
    expect(card().textContent).not.toContain("เร็ด");
    await answerDrill("read", "read");
    expect(host.textContent).toContain("✓ ถูกต้อง");
    expect(card().textContent).toContain("อ่าน (V2/V3 อ่านว่า เร็ด)");
  });

  it("the table, which shows every form, keeps the notes", async () => {
    await render(verbsView(verb("vb-get"), verb("vb-read")));
    await click([...host.querySelectorAll('[role="tab"]')].find((t) => t.textContent === "ตาราง"));
    expect(host.textContent).toContain("ได้รับ (US: V3 = gotten)");
    expect(host.textContent).toContain("อ่าน (V2/V3 อ่านว่า เร็ด)");
  });

  it("verbs without a note show exactly their meaning, before and after checking", async () => {
    const v = verb("vb-go");
    await render(verbsView(v));
    expect(card().textContent).toContain(v.th);
    await answerDrill("went", "gone");
    expect(card().textContent).toContain(v.th);
    expect(card().textContent).not.toContain(`${v.th} (`);
  });
});
