// @vitest-environment jsdom
// Renders the real lesson, with only the server actions and next/link replaced.
import { act, createElement, type ComponentType, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSONS, SOUNDS, type Lesson } from "@/content";
import { lessonWords } from "@/content/lesson-words";
import { LessonFocus } from "./lesson-focus";
import { LessonView } from "./lesson-view";
import { StudyProvider } from "./study-context";

const actions = vi.hoisted(() => ({
  saveAttempt: vi.fn(async () => false),
  addLessonCards: vi.fn(async () => 0),
  addCard: vi.fn(async () => "signed-out"),
}));
vi.mock("@/app/actions", () => actions);
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => createElement("a", { href, ...rest }, children) }));

const lessonA = LESSONS.find((l) => l.id === "1-1")!;
const lessonB = LESSONS.find((l) => l.id === "1-7")!;
const withDrill = SOUNDS.find((l) => l.speak?.length) as Lesson;

let host: HTMLDivElement;
let root: Root;

const Focus = LessonFocus as ComponentType<{ className: string; children?: ReactNode }>;
const tree = (lesson: Lesson, focusable = true) =>
  createElement(StudyProvider, null, createElement(Focus, { className: "x" }, createElement("div", { id: "lesson-content" },
    createElement(LessonView, { key: lesson.id, lesson, words: lessonWords(lesson.id), passMark: 80, focusable }))));
const show = (lesson: Lesson, focusable = true) => act(async () => root.render(tree(lesson, focusable)));

const panel = () => host.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')!;
const buttons = (scope: Element = panel()) => [...scope.querySelectorAll<HTMLElement>("button")];
const byText = (re: RegExp, scope: Element = panel()) => buttons(scope).find((b) => re.test(b.textContent ?? ""));
const click = (el: Element | undefined | null) => act(async () => { if (!el) throw new Error("nothing to click"); (el as HTMLElement).click(); });
const tab = (label: string) => click([...host.querySelectorAll('[role="tab"]')].find((t) => t.textContent?.includes(label)));
const focusToggle = () => click(byText(/โหมดโฟกัส/, host));
const press = (key: string) => act(async () => { document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); });
async function type(el: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
const question = () => panel().textContent?.match(/ข้อ \d+ จาก \d+/)?.[0];
const nextQuestion = () => click(buttons().filter((b) => b.textContent?.startsWith("ข้อต่อไป") && !(b as HTMLButtonElement).disabled).pop());
const practiceInput = () => panel().querySelector("input") as HTMLInputElement;
const groups = () => [...panel().querySelectorAll('[role="radiogroup"]')];
const chosen = () => groups().filter((g) => g.querySelector('[aria-checked="true"]')).length;
const card = () => panel().textContent?.match(/คำที่ \d+\/\d+/)?.[0];
async function goToTypedQuestion() {
  for (let i = 0; i < 8 && !practiceInput(); i++) await nextQuestion();
}
async function answerAll() {
  for (const g of groups()) await click(g.querySelector('[role="radio"]'));
}

beforeEach(async () => {
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
  actions.saveAttempt.mockReset().mockResolvedValue(false);
  actions.addLessonCards.mockClear();
  await show(lessonA);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe("switching tabs keeps the lesson's work", () => {
  it("keeps the vocabulary card", async () => {
    await click(byText(/^คำถัดไป/));
    await click(byText(/^คำถัดไป/));
    expect(card()).toMatch(/^คำที่ 3\//);
    await tab("Practice");
    await tab("Learn");
    expect(card()).toMatch(/^คำที่ 3\//);
  });

  it("keeps the card across Words → Theory → Words", async () => {
    await click(byText(/^คำถัดไป/));
    await click(byText(/ทฤษฎีและตัวอย่าง/));
    expect(panel().querySelector("article")?.closest<HTMLElement>('[style*="display: none"]')).toBeTruthy();
    await click(byText(/คำศัพท์ของบท/));
    expect(panel().querySelector("article")?.closest<HTMLElement>('[style*="display: none"]')).toBeNull();
    expect(card()).toMatch(/^คำที่ 2\//);
  });

  it("keeps the Learn step", async () => {
    await click(byText(/ทฤษฎีและตัวอย่าง/));
    await tab("Quiz");
    await tab("Learn");
    expect(byText(/ทฤษฎีและตัวอย่าง/)?.getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps the Quick Check", async () => {
    await click(byText(/^เช็คตัวเอง/));
    await click(panel().querySelector('[role="radiogroup"][aria-label="เลือกความหมาย"] [role="radio"]'));
    await click(byText(/^ข้อต่อไป/));
    expect(panel().textContent).toContain("ข้อ 2 จาก");
    await tab("Summary");
    await tab("Learn");
    expect(panel().textContent).toContain("ข้อ 2 จาก");
  });

  it("keeps a half-typed practice answer and its question", async () => {
    await tab("Practice");
    await goToTypedQuestion();
    const at = question();
    await type(practiceInput(), "She go to");
    await tab("Quiz");
    await tab("Practice");
    expect(question()).toBe(at);
    expect(practiceInput().value).toBe("She go to");
  });

  it("keeps practice feedback and the hint", async () => {
    await tab("Practice");
    await goToTypedQuestion();
    await type(practiceInput(), "wrong answer");
    await click(byText(/^ตรวจ/));
    const after = panel().textContent;
    await tab("Summary");
    await tab("Practice");
    expect(panel().textContent).toBe(after);
  });

  it("keeps quiz choices", async () => {
    await tab("Quiz");
    for (const g of groups().slice(0, 3)) await click(g.querySelector('[role="radio"]'));
    expect(chosen()).toBe(3);
    await tab("Learn");
    await tab("Quiz");
    expect(chosen()).toBe(3);
  });

  it("keeps the result of a submitted quiz and does not submit again", async () => {
    await tab("Quiz");
    await answerAll();
    await click(byText(/^ส่งคำตอบ/));
    expect(actions.saveAttempt).toHaveBeenCalledTimes(1);
    const score = panel().textContent?.match(/ถูก \d+ จาก \d+ ข้อ/)?.[0];
    expect(score).toBeTruthy();
    await tab("Summary");
    await tab("Quiz");
    expect(panel().textContent).toContain(score!);
    expect(actions.saveAttempt).toHaveBeenCalledTimes(1);
  });

  const scrolled = () => vi.mocked(Element.prototype.scrollIntoView);
  const result = () => panel().querySelector<HTMLElement>("section[tabindex]");

  it("brings the result into view and to assistive tech when the quiz is on show", async () => {
    await tab("Quiz");
    await answerAll();
    scrolled().mockClear();
    await click(byText(/^ส่งคำตอบ/));
    expect(scrolled()).toHaveBeenCalledTimes(1);
    expect(scrolled().mock.contexts[0]).toBe(result());
    expect(scrolled().mock.calls[0][0]).toMatchObject({ block: "start" });
    expect(document.activeElement).toBe(result());
  });

  it("keeps the desktop scroll to the lesson's top in a roomy window", async () => {
    window.matchMedia = vi.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia;
    await tab("Quiz");
    await answerAll();
    scrolled().mockClear();
    await click(byText(/^ส่งคำตอบ/));
    expect(scrolled()).toHaveBeenCalledTimes(1);
    expect(scrolled().mock.contexts[0]).toBe(host.querySelector("#lesson-content"));
    expect(document.activeElement).toBe(result());
  });

  it("names the result by its score and verdict, and announces it only by focus", async () => {
    await tab("Quiz");
    await answerAll();
    await click(byText(/^ส่งคำตอบ/));
    const name = result()!.getAttribute("aria-labelledby")!.split(" ").map((id) => document.getElementById(id)?.textContent).join(" ");
    expect(name).toMatch(/^\d+% (ผ่านแล้ว|ยังไม่ผ่าน)/);
    expect(result()!.closest("[aria-live]")).toBeNull();
    expect(result()!.querySelector("[aria-live]")).toBeNull();
  });

  it("presents the result only once, and again after a retake", async () => {
    await tab("Quiz");
    await answerAll();
    await click(byText(/^ส่งคำตอบ/));
    scrolled().mockClear();
    await tab("Summary");
    const summaryTab = document.activeElement;
    await tab("Quiz");
    expect(scrolled()).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(summaryTab);
    await click(byText(/ทำใหม่/));
    await answerAll();
    await click(byText(/^ส่งคำตอบ/));
    expect(scrolled()).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(result());
  });

  it("does not claim a guest's score was saved", async () => {
    await tab("Quiz");
    await answerAll();
    await click(byText(/^ส่งคำตอบ/));
    expect(panel().textContent).toContain("คะแนนนี้จึงไม่ถูกบันทึก");
    expect(panel().textContent).not.toContain("บันทึกคะแนนแล้ว");
  });

  it("finishes a submission started before leaving the tab, once, without moving the page", async () => {
    let finish: (saved: boolean) => void = () => {};
    actions.saveAttempt.mockImplementation(() => new Promise<boolean>((resolve) => { finish = resolve; }));
    await tab("Quiz");
    await answerAll();
    const submit = byText(/^ส่งคำตอบ/) as HTMLElement;
    // Two clicks before React can disable the button, which is what the guard is for.
    await act(async () => { submit.click(); submit.click(); });
    await tab("Summary");
    const here = document.createElement("button");
    host.append(here);
    here.focus();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    await act(async () => finish(false));
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(here);
    await tab("Quiz");
    expect(panel().textContent).toMatch(/ถูก \d+ จาก \d+ ข้อ/);
    expect(actions.saveAttempt).toHaveBeenCalledTimes(1);
    // First sight of the result, so this is when it is shown and announced.
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(panel().querySelector("section[tabindex]"));
  });

  it("removes the submit panel's height while its tab is hidden", async () => {
    const height = () => document.documentElement.style.getPropertyValue("--action-panel-h");
    await tab("Quiz");
    expect(height()).toBe("0px");
    await tab("Learn");
    expect(height()).toBe("");
    await tab("Quiz");
    expect(height()).not.toBe("");
  });

  it("keeps everything when Focus Mode is switched on and off", async () => {
    await tab("Practice");
    await goToTypedQuestion();
    const input = practiceInput();
    await type(input, "She go to");
    await focusToggle();
    expect(practiceInput()).toBe(input);
    await tab("Quiz");
    await click(groups()[0].querySelector('[role="radio"]'));
    await focusToggle();
    await tab("Practice");
    expect(practiceInput()).toBe(input);
    expect(input.value).toBe("She go to");
    await tab("Quiz");
    expect(chosen()).toBe(1);
  });
});

describe("hidden tabs stay out of the way", () => {
  it("answers shortcuts only in the Practice tab that is showing", async () => {
    await tab("Practice");
    while (!panel().querySelector('[aria-label="ตัวเลือก"], [role="radio"]')) await nextQuestion();
    const at = question();
    const picked = () => panel().querySelectorAll('[aria-checked="true"]').length;

    await tab("Quiz");
    for (const key of ["a", "b", "ArrowRight", "ArrowLeft", "Enter"]) await press(key);
    expect(chosen()).toBe(0);
    await tab("Practice");
    expect(question()).toBe(at);
    expect(picked()).toBe(0);

    await press("a");
    expect(picked()).toBe(1);
    await press("ArrowRight");
    expect(question()).not.toBe(at);
  });

  it("removes the Practice key listener while the tab is hidden", async () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const live = () => add.mock.calls.filter(([t]) => t === "keydown").length - remove.mock.calls.filter(([t]) => t === "keydown").length;
    await tab("Practice");
    await press("ArrowRight");
    expect(live()).toBeGreaterThan(0);
    await tab("Learn");
    expect(live()).toBeLessThanOrEqual(0);
  });

  it("has one of each tab, with only the open one on show", async () => {
    await tab("Practice");
    const panels = [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(panels).toHaveLength(5);
    expect(panels.filter((p) => !p.hidden)).toHaveLength(1);
    expect(host.querySelectorAll('[aria-label="ความคืบหน้าแบบฝึก"]')).toHaveLength(1);
    const ids = [...host.querySelectorAll("[id]")].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("links each tab and its panel, and marks the open one", async () => {
    await tab("Quiz");
    for (const t of host.querySelectorAll('[role="tab"]')) {
      const p = document.getElementById(t.getAttribute("aria-controls")!)!;
      expect(p.getAttribute("role")).toBe("tabpanel");
      expect(p.getAttribute("aria-labelledby")).toBe(t.id);
      expect(t.getAttribute("aria-selected") === "true").toBe(!p.hidden);
    }
  });

  it("makes no sound and saves nothing just by opening a lesson", async () => {
    expect(speechSynthesis.speak).not.toHaveBeenCalled();
    expect(actions.saveAttempt).not.toHaveBeenCalled();
    expect(actions.addCard).not.toHaveBeenCalled();
  });

  it("stops reading aloud when the learner changes tab", async () => {
    vi.mocked(speechSynthesis.cancel).mockClear();
    await tab("Practice");
    expect(speechSynthesis.cancel).toHaveBeenCalled();
  });

  it("closes the microphone when the speaking drill's tab is left", async () => {
    const started = vi.fn();
    const aborted = vi.fn();
    vi.stubGlobal("SpeechRecognition", class { start = started; abort = aborted; });
    await show(withDrill, false);
    expect(started).not.toHaveBeenCalled();
    await tab("Practice");
    await click(panel().querySelector('button[aria-label^="กดแล้วพูด"]'));
    expect(started).toHaveBeenCalledTimes(1);
    await tab("Learn");
    expect(aborted).toHaveBeenCalled();
  });
});

describe("the speaking drill's microphone", () => {
  type Handlers = Pick<FakeRecognition, "onresult" | "onerror" | "onend">;
  // Keeps the handlers it had when it started, the way an event already on its way would still reach them.
  class FakeRecognition {
    static made: FakeRecognition[] = [];
    onresult: ((e: { results: { transcript: string }[][] }) => void) | null = null;
    onerror: ((e: { error: string }) => void) | null = null;
    onend: (() => void) | null = null;
    late: Handlers = this;
    start = vi.fn(() => { this.late = { onresult: this.onresult, onerror: this.onerror, onend: this.onend }; });
    abort = vi.fn();
    constructor() { FakeRecognition.made.push(this); }
  }
  const deliver = (fn: () => void) => act(async () => fn());
  const hears = (r: FakeRecognition, transcript: string) => deliver(() => r.late.onresult?.({ results: [[{ transcript }]] }));
  const fails = (r: FakeRecognition, error: string) => deliver(() => r.late.onerror?.({ error }));
  const ends = (r: FakeRecognition) => deliver(() => r.late.onend?.());

  const mic = () => panel().querySelector<HTMLButtonElement>('button[aria-label^="กดแล้วพูด"]')!;
  const drill = () => mic().closest("section")!.textContent;
  const listening = () => mic().disabled && drill()!.includes("กำลังฟัง");
  const word = (i: number) => withDrill.speak![i].say;

  beforeEach(async () => {
    FakeRecognition.made = [];
    vi.stubGlobal("SpeechRecognition", FakeRecognition);
    await show(withDrill, false);
    await tab("Practice");
  });

  it("ignores a closed session's late callbacks once a new session is listening", async () => {
    await click(mic());
    const [a] = FakeRecognition.made;
    await tab("Learn");
    expect(a.abort).toHaveBeenCalledTimes(1);
    await tab("Practice");
    await click(mic());
    const b = FakeRecognition.made[1];
    expect(b.start).toHaveBeenCalledTimes(1);

    await ends(a);
    expect(listening()).toBe(true);

    await fails(a, "network");
    await hears(a, word(0));
    expect(listening()).toBe(true);
    expect(drill()).toContain("ผ่าน 0/0");
    expect(drill()).not.toContain("เชื่อมต่อบริการแปลงเสียงไม่ได้");
    expect(drill()).not.toContain("ระบบได้ยินเป็น");

    await hears(b, word(0));
    expect(drill()).toContain("ผ่าน 1/1");
    await ends(b);
    expect(listening()).toBe(false);
    expect(mic().disabled).toBe(false);
  });

  it("stops listening when hidden and does not start again on return", async () => {
    await click(mic());
    const [a] = FakeRecognition.made;
    await tab("Learn");
    expect(a.abort).toHaveBeenCalledTimes(1);
    // A browser reports its own abort as an error, then ends. Neither is the learner's problem.
    await fails(a, "aborted");
    await ends(a);
    await tab("Practice");
    expect(FakeRecognition.made).toHaveLength(1);
    expect(a.start).toHaveBeenCalledTimes(1);
    expect(listening()).toBe(false);
    expect(mic().disabled).toBe(false);
    expect(drill()).not.toContain("ฟังเสียงไม่สำเร็จ");
  });

  it("does not score a late result against the next word", async () => {
    await click(mic());
    const [a] = FakeRecognition.made;
    await click(byText(/^คำต่อไป/));
    expect(a.abort).toHaveBeenCalledTimes(1);
    expect(listening()).toBe(false);
    await hears(a, word(0));
    expect(drill()).toContain("คำที่ 2/");
    expect(drill()).toContain("ผ่าน 0/0");
  });

  it("still reports a live session's error, then lets the learner try again", async () => {
    await click(mic());
    const [a] = FakeRecognition.made;
    await fails(a, "not-allowed");
    await ends(a);
    expect(drill()).toContain("เบราว์เซอร์ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน");
    expect(listening()).toBe(false);
    await click(mic());
    expect(listening()).toBe(true);
    expect(drill()).not.toContain("เบราว์เซอร์ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน");
  });

  it("still scores a live session and ends it without aborting", async () => {
    await click(mic());
    const [a] = FakeRecognition.made;
    await hears(a, "not the word");
    await ends(a);
    expect(drill()).toContain("ผ่าน 0/1");
    expect(drill()).toContain("not the word");
    await tab("Learn");
    expect(a.abort).not.toHaveBeenCalled();
  });
});

describe("another lesson", () => {
  it("shares no ids with a lesson Next keeps hidden in the page", async () => {
    await act(async () => root.render(createElement("div", null, tree(lessonA), tree(lessonB))));
    // #lesson-content is this test's own wrapper around each lesson.
    const ids = [...host.querySelectorAll("[id]")].map((e) => e.id).filter((id) => id !== "lesson-content");
    expect(ids.length).toBeGreaterThan(20);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("starts with its own state", async () => {
    await tab("Practice");
    await goToTypedQuestion();
    await type(practiceInput(), "She go to");
    await show(lessonB);
    expect(host.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain("Learn");
    expect(card()).toMatch(/^คำที่ 1\//);
    await tab("Practice");
    expect(question()).toMatch(/^ข้อ 1 /);
    expect(practiceInput()?.value ?? "").toBe("");
  });
});
