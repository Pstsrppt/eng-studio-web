import { describe, expect, it } from "vitest";
import { LESSONS, SOUNDS } from "@/content";
import { stageOfLesson, stageProgress, type LessonBest } from "@/content/stages";
import { nextLesson } from "./next-lesson";
import { nextStep } from "./next-step";

const first = (level: string) => LESSONS.findIndex((l) => l.level === level);
const ids = (from: number, to = LESSONS.length) => LESSONS.slice(from, to).map((l) => l.id);
const pass = (list: string[]): LessonBest => Object.fromEntries(list.map((id) => [id, { best: 90, passed: true }]));
const step = (best: LessonBest, placement: string | undefined, signedIn = true) =>
  ({ next: nextLesson(LESSONS, best, placement), s: nextStep({ next: nextLesson(LESSONS, best, placement), placement, signedIn, stages: stageProgress(best) }) });

describe("nextStep: the Roadmap's personalised next step", () => {
  it("every lesson state points at exactly the lesson nextLesson() picks (same as Home, /today, /study)", () => {
    const cases: [LessonBest, string | undefined][] = [[{}, undefined], [{}, "A1"], [pass(ids(0, 3)), undefined], [pass(ids(first("A2"), first("A2") + 2)), "A1"], [pass(ids(first("A2"))), "A1"]];
    for (const [best, pl] of cases) {
      const { next, s } = step(best, pl);
      expect(next.kind).toBe("lesson");
      if (next.kind !== "lesson") continue;
      expect(s.cta.href).toBe(`/grammar/${next.lesson.id}`);
      expect(s.title).toBe(next.lesson.title);
      const st = stageOfLesson(next.lesson.id)!.stage;
      expect(s.stage).toBe(`Stage ${String(st.n).padStart(2, "0")} · ${st.title}`);
    }
  });

  it("guest: starting point, placement offered, no progress figures made up", () => {
    const { s } = step({}, undefined, false);
    expect(s.state).toBe("start");
    expect(s.cta.label).toBe("เริ่มบทแรก");
    expect(s.secondary).toEqual({ href: "/placement", label: "สอบวัดระดับก่อน" });
    expect(s.facts.join(" ")).not.toMatch(/\d/);
  });

  it("new signed-in learner: start, with the real 0 of N", () => {
    const { s } = step({}, undefined);
    expect(s.state).toBe("start");
    expect(s.facts).toEqual([`ผ่านแล้ว 0 จาก ${LESSONS.length} บท Grammar`]);
    expect(s.earlier).toBeUndefined();
  });

  it("placement A1 with nothing passed: recommends the placement lesson, says why, and that earlier stages stay open", () => {
    const { s } = step({}, "A1");
    expect(s.state).toBe("placement");
    expect(s.cta.label).toBe("เริ่มบทที่แนะนำ");
    expect(s.reasons[0]).toContain("A1");
    expect(s.facts[0]).toContain("A1");
    const foundation = stageProgress({}).find((x) => x.id === "foundation")!;
    if (stageOfLesson(LESSONS[first("A2")].id)!.stage.id !== "foundation") {
      expect(s.earlier?.text).toContain(`ยังมีอีก ${foundation.total} บท`);
      expect(s.earlier?.stages.map((x) => x.id)).toEqual(["ielts", "foundation"]);
    }
  });

  it("continuing after placement: 'continue', still placement-based, real passed count", () => {
    const best = pass(ids(first("A2"), first("A2") + 2));
    const { s } = step(best, "A1");
    expect(s.state).toBe("placement");
    expect(s.cta.label).toBe("เรียนต่อ");
    expect(s.facts).toContain(`ผ่านแล้ว 2 จาก ${LESSONS.length} บท Grammar`);
  });

  it("saved progress without placement: continue in order", () => {
    const { s } = step(pass(ids(0, 3)), undefined);
    expect(s.state).toBe("progress");
    expect(s.facts).toEqual([`ผ่านแล้ว 3 จาก ${LESSONS.length} บท Grammar`]);
  });

  it("everything from the placement level passed: an easier lesson is left (gap)", () => {
    const { next, s } = step(pass(ids(first("A2"))), "A1");
    expect(next).toMatchObject({ kind: "lesson", reason: "earlier-gap" });
    expect(s.state).toBe("gap");
    expect(s.cta.label).toBe("ไปบทที่ยังไม่ผ่าน");
  });

  it("all Grammar passed, pronunciation left: never says IELTS is finished; points at pronunciation", () => {
    const { s } = step(pass(ids(0)), "B1");
    expect(s.state).toBe("complete");
    expect(s.title).toBe("ผ่าน Grammar ครบทุกบทแล้ว");
    expect(s.facts).toContain(`เหลือบทออกเสียง ${SOUNDS.length} บท`);
    expect(s.cta.label).toBe("ฝึกออกเสียงต่อ");
    expect(s.cta.href).toMatch(/^\/sounds\//);
    expect([s.title, ...s.reasons].join(" ")).not.toMatch(/จบ IELTS|IELTS ครบ/);
  });

  it("all Grammar and pronunciation passed: review flashcards next", () => {
    const { s } = step(pass([...LESSONS, ...SOUNDS].map((l) => l.id)), undefined);
    expect(s.state).toBe("complete");
    expect(s.cta).toEqual({ href: "/learn", label: "ทวน Flashcards" });
    expect(s.facts.some((f) => f.includes("ออกเสียง"))).toBe(false);
  });
});
