// @vitest-environment jsdom
// The corrected answers from the curriculum review, through the real answer check and the real lesson.
// Expected results here are review decisions the owner approved. A test can hold them in place; it can't prove the English.
import { createHash } from "node:crypto";
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LESSONS, PASS_MARK, SOUNDS, type Lesson, type PracticeItem } from "@/content";
import placement from "@/content/data/placement.json";
import { lessonWords } from "@/content/lesson-words";
import { isRight, LessonView } from "./lesson-view";
import { StudyProvider } from "./study-context";

const actions = vi.hoisted(() => ({
  saveAttempt: vi.fn(async () => false),
  addLessonCards: vi.fn(async () => 0),
  addCard: vi.fn(async () => "signed-out"),
}));
vi.mock("@/app/actions", () => actions);
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => createElement("a", { href, ...rest }, children) }));

const ALL = [...SOUNDS, ...LESSONS];
const lesson = (id: string) => ALL.find((l) => l.id === id)!;
const item = (id: string, i: number) => lesson(id).practice[i];
const fingerprint = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** An answer built from the exercise's own tiles; null when the tiles can't make it. */
function picked(it: Extract<PracticeItem, { t: "order" }>, tokens: string[]) {
  const left = it.w.map((w, i) => ({ w, i }));
  const out: number[] = [];
  for (const t of tokens) {
    const at = left.findIndex((x) => x.w === t);
    if (at < 0) return null;
    out.push(left[at].i);
    left.splice(at, 1);
  }
  return left.length ? null : out;
}
function order(id: string, i: number, text: string) {
  const it = item(id, i) as Extract<PracticeItem, { t: "order" }>;
  const tiles = picked(it, text.split(" "));
  if (!tiles) throw new Error(`"${text}" can't be built from ${it.w.join(" / ")}`);
  return isRight(it, { choice: null, picked: tiles, value: "" });
}
const typed = (id: string, i: number, value: string) => isRight(item(id, i), { choice: null, picked: [], value });

describe("accepted alternatives", () => {
  it.each([
    ["a2-9", 3, "I'll call you if I'm late", "if I'm late I'll call you"],
    ["a2-6", 0, "I usually start at 9", "usually I start at 9"],
    ["a1-8", 6, "Could you help me please ?", "Could you please help me ?"],
    ["1-1", 1, "I check email every day", "every day I check email"],
  ])("%s#P%i keeps its answer and takes the approved order", (id, i, canonical, alternative) => {
    expect(order(id, i, canonical)).toBe(true);
    expect(order(id, i, alternative)).toBe(true);
  });

  it.each([
    ["a2-9", 3, "if I'll call you I'm late"],
    ["a2-9", 3, "I'm late if I'll call you"],
    ["a2-9", 3, "you I'll call if I'm late"],
    ["a2-6", 0, "I start usually at 9"],
    ["a2-6", 0, "I start at 9 usually"],
    ["a2-6", 0, "at 9 I usually start"],
    ["a1-8", 6, "Could please you help me ?"],
    ["a1-8", 6, "you Could help me please ?"],
    ["a1-8", 6, "please Could you help me ?"],
    ["1-1", 1, "I every day check email"],
    ["1-1", 1, "every I day check email"],
    ["1-1", 1, "I check every day email"],
  ])("%s#P%i still rejects \"%s\"", (id, i, wrong) => {
    expect(order(id, i, wrong)).toBe(false);
  });

  it("1-7#P6 takes the full form, and the mistake stays wrong in it", () => {
    expect(typed("1-7", 6, "I didn't go to work.")).toBe(true);
    expect(typed("1-7", 6, "I didn’t go to work")).toBe(true);
    expect(typed("1-7", 6, "I did not go to work.")).toBe(true);
    for (const wrong of ["I did not went to work.", "I didn't went to work.", "I went to work.", "I didn't go work.", "I do not go to work."]) {
      expect(typed("1-7", 6, wrong)).toBe(false);
    }
  });

  it("only the four approved exercises have alternatives", () => {
    const withAlt = ALL.flatMap((l) => l.practice.flatMap((p, i) => (p.t === "order" && p.alt ? [`${l.id}#P${i}`] : [])));
    expect(withAlt.sort()).toEqual(["1-1#P1", "a1-8#P6", "a2-6#P0", "a2-9#P3"]);
  });

  it("every accepted answer can be built from the exercise's tiles", () => {
    const strip = (s: string) => s.toLowerCase().match(/[a-z0-9']+/g)!.sort();
    for (const l of ALL) {
      for (const p of l.practice) {
        if (p.t !== "order") continue;
        const tiles = strip(p.w.join(" "));
        for (const answer of [p.a, ...(p.alt ?? [])]) expect(strip(answer), `${l.id}: ${answer}`).toEqual(tiles);
      }
    }
  });
});

describe("corrected practice content", () => {
  it("b2-3#P4 no longer stacks two negatives, and can't stays the answer", () => {
    const it4 = item("b2-3", 4) as Extract<PracticeItem, { t: "fill" }>;
    expect(it4.q).toBe("The lights are off. They ___ be home. (แน่ใจว่าไม่อยู่)");
    expect(it4.a).toEqual(["can't", "cannot"]);
    expect(it4.th).toBe("ไฟปิดหมด พวกเขาไม่น่าจะอยู่บ้าน");
    expect(typed("b2-3", 4, "can't")).toBe(true);
    expect(typed("b2-3", 4, "CANNOT")).toBe(true);
    for (const wrong of ["can", "must", "might", "mustn't", ""]) expect(typed("b2-3", 4, wrong)).toBe(false);
  });

  it("a2-5#P1 states the meaning, and only much is accepted", () => {
    const p = item("a2-5", 1) as Extract<PracticeItem, { t: "fill" }>;
    expect(p.q).toBe("We don't have ___ time. (มีเวลาไม่มาก)");
    expect(p.a).toEqual(["much"]);
    expect(p.th).toContain("ไม่มาก");
    expect(typed("a2-5", 1, " MUCH ")).toBe(true);
    for (const wrong of ["any", "a lot of", "many", "some", "enough", ""]) expect(typed("a2-5", 1, wrong)).toBe(false);
  });

  it("1-1 no longer says open always needs an object, and shows both uses", () => {
    const theory = lesson("1-1").theory;
    expect(theory).not.toContain("send, open, need");
    expect(theory).toContain("<b>I open the door.</b>");
    expect(theory).toContain("<b>The office opens at 8.</b>");
    expect(theory).toContain("<b>I sent it.</b>");
  });

  it("1-1 describes send and need in this lesson without calling it a rule for every sentence", () => {
    const theory = lesson("1-1").theory;
    expect(theory).not.toContain("send และ need ต้องบอก");
    expect(theory).not.toContain("<s>I sent.</s>");
    expect(theory).toContain("ในบทนี้ send ใช้บอกว่าส่งอะไร และ need ใช้บอกว่าต้องการอะไร");
    expect(theory).toContain("<b>I need help.</b>");
    expect(theory).toContain("แต่กริยาภาษาอังกฤษอาจมีโครงสร้างต่างกันตามบริบท");
  });
});

describe("quiz wording", () => {
  it("revised questions keep their choices and answer", () => {
    const b14 = lesson("b1-4").quiz[2];
    expect(b14.q).toBe("คำไหนเติมได้ทั้งสองประโยค: The man ___ works here is kind. · The file ___ I sent is big.");
    expect(b14).toMatchObject({ o: ["that", "whose", "which"], a: 0 });
    expect(b14.why).toContain("whose ต้องมีคำนามตาม");
    const b16 = lesson("b1-6").quiz[0];
    expect(b16.q).toBe('"I can help." → She said she ___ help. (เล่าแบบถอย tense)');
    expect(b16).toMatchObject({ o: ["can", "could"], a: 1 });
    expect(b16.why).toContain("can → could");
  });

  it("a2-8#Q0 is unchanged until a subject-matter reviewer decides", () => {
    expect(lesson("a2-8").quiz[0]).toEqual({ q: '"Has the ship arrived ___?"', o: ["already", "yet"], a: 1, why: "คำถามใช้ yet" });
  });
});

// Hashes taken from main at 95f40d6, before this change.
describe("what must not move", () => {
  it("every quiz's choices and answers", () => {
    expect(fingerprint(ALL.map((l) => [l.id, l.quiz.map((q) => [q.o, q.a])]))).toBe("389dd35905b9bc3a48b90fc772c473ef770c92e77721339a1a307ecbb81d2e55");
  });
  it("every practice exercise's main answer", () => {
    expect(fingerprint(ALL.map((l) => [l.id, l.practice.map((p) => (p.t === "pick" ? [p.o, p.a] : p.t === "order" ? [p.w, p.a] : p.a[0]))]))).toBe("1e1ec846aa0c261b29d1951be6cc5c332197dd025890c4c98f1d554df34b593d");
  });
  it("the placement test", () => {
    expect(fingerprint(placement)).toBe("9c76d4c0f7fbdd1b5344190ec0be495e359f2a1a29f165bfb58c64a55713316b");
  });
  it("the new words each lesson hands to the flashcards", () => {
    expect(fingerprint(ALL.map((l) => [l.id, lessonWords(l.id).fresh.map((x) => x.word.id)]))).toBe("a40b13ac2a3dd8cf74952bbe9d63bfda9dad04db7e437276a63ed4483d4e8043");
  });
  it("the pass mark", () => {
    expect(PASS_MARK).toBe(80);
  });
  it("every listed answer in the course still passes the check", () => {
    for (const l of ALL) {
      for (const p of l.practice) {
        if (p.t === "fill" || p.t === "fix") for (const a of p.a) expect(isRight(p, { choice: null, picked: [], value: a }), `${l.id}: ${a}`).toBe(true);
        if (p.t === "pick") expect(isRight(p, { choice: p.a, picked: [], value: "" })).toBe(true);
      }
    }
  });
});

// The learner's side: real clicks in the real lesson.
describe("in the lesson", () => {
  let host: HTMLDivElement;
  let root: Root;
  const panel = () => host.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')!;
  const click = (el: Element | undefined | null) => act(async () => { if (!el) throw new Error("nothing to click"); (el as HTMLElement).click(); });
  const buttons = () => [...panel().querySelectorAll<HTMLButtonElement>("button")];
  const open = async (l: Lesson, tab: string) => {
    await act(async () => root.render(createElement(StudyProvider, null, createElement("div", { id: "lesson-content" }, createElement(LessonView, { key: l.id, lesson: l, words: lessonWords(l.id), passMark: PASS_MARK })))));
    await click([...host.querySelectorAll('[role="tab"]')].find((t) => t.textContent?.includes(tab)));
  };
  const goTo = (n: number) => click(buttons().find((b) => b.getAttribute("aria-label")?.startsWith(`ข้อ ${n}:`)));
  const tap = async (tokens: string[]) => {
    for (const t of tokens) await click(buttons().find((b) => b.textContent?.trim() === t && !b.disabled && !b.getAttribute("aria-label")));
  };
  const check = () => click(buttons().find((b) => b.textContent?.includes("ตรวจคำตอบ")));
  const answerQuiz = async (l: Lesson, wrong: number[] = []) => {
    const groups = [...panel().querySelectorAll('[role="radiogroup"]')];
    for (let i = 0; i < groups.length; i++) {
      const pick = wrong.includes(i) ? (l.quiz[i].a + 1) % l.quiz[i].o.length : l.quiz[i].a;
      await click(groups[i].querySelectorAll('[role="radio"]')[pick]);
    }
  };

  beforeEach(() => {
    actions.saveAttempt.mockClear();
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    Element.prototype.scrollIntoView = () => {};
    vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
  });

  it("the other order is marked right, and the feedback still shows the main answer", async () => {
    await open(lesson("a2-9"), "Practice");
    await goTo(4);
    await tap(["if", "I'm", "late", "I'll", "call", "you"]);
    await check();
    expect(panel().textContent).toContain("ถูกต้อง");
    expect(panel().textContent).toContain("คำตอบ: I'll call you if I'm late.");
  });

  it("a near match is marked wrong and doesn't reveal the answer", async () => {
    await open(lesson("a2-9"), "Practice");
    await goTo(4);
    await tap(["if", "I'll", "call", "you", "I'm", "late"]);
    await check();
    expect(panel().textContent).toContain("ยังไม่ถูก");
    expect(panel().textContent).not.toContain("คำตอบ:");
  });

  it("a hint on an exercise with an alternative still names the main answer's first word", async () => {
    await open(lesson("a2-9"), "Practice");
    await goTo(4);
    await click(buttons().find((b) => b.textContent?.includes("คำใบ้")));
    expect(panel().textContent).toContain(`คำแรกคือ "I'll"`);
  });

  it("the revised quiz question scores as before: one miss is 83% and passes, two miss and don't", async () => {
    const l = lesson("b1-4");
    await open(l, "Quiz");
    expect(panel().textContent).toContain("The man ___ works here is kind.");
    await answerQuiz(l, [2]);
    await click(buttons().find((b) => b.textContent?.includes("ส่งคำตอบ")));
    expect(panel().textContent).toContain("83%");
    expect(panel().textContent).toContain("ผ่านแล้ว");
    expect(actions.saveAttempt).toHaveBeenCalledTimes(1);
    expect(actions.saveAttempt).toHaveBeenCalledWith("b1-4", 83, true, [expect.objectContaining({ correct: "that" })]);

    const again = lesson("b1-6");
    await open(again, "Quiz");
    await answerQuiz(again, [0, 1]);
    await click(buttons().find((b) => b.textContent?.includes("ส่งคำตอบ")));
    expect(panel().textContent).toContain("67%");
    expect(panel().textContent).toContain("ยังไม่ผ่าน");
  });
});
