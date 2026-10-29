import { describe, expect, it } from "vitest";
import { LESSONS, SOUNDS } from "./index";
import { soundsOnlyLabel } from "@/components/stage-look";
import { courseCompletion, STAGES, stageOfLesson, stageProgress } from "./stages";

describe("stages", () => {
  it("has 7 stages and every grammar and pronunciation lesson in exactly one of them", () => {
    expect(STAGES.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const ids = STAGES.flatMap((s) => s.items.filter((i) => i.lessonId).map((i) => i.lessonId));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set([...LESSONS, ...SOUNDS].map((l) => l.id)));
  });

  it("only links to pages that exist", () => {
    const pages = new Set(["/ielts", "/placement", "/learn", "/verbs"]);
    for (const item of STAGES.flatMap((s) => s.items)) {
      if (item.lessonId) expect(item.href).toMatch(/^\/(grammar|sounds)\/[\w-]+$/);
      else expect(pages.has(item.href)).toBe(true);
    }
  });

  it("a new learner is on stage 2; stages without lessons are open or coming soon, never current", () => {
    const p = stageProgress({});
    expect(p.find((s) => s.status === "current")?.n).toBe(2);
    expect(p[0].status).toBe("open");
    expect(p.find((s) => s.id === "strategy")?.status).toBe("soon");
    expect(p[1].next?.lessonId).toBe(LESSONS.find((l) => l.level === "A1")?.id);
  });

  it("moves to the next stage once every lesson of the current one is passed", () => {
    const a1 = Object.fromEntries(LESSONS.filter((l) => l.level === "A1").map((l) => [l.id, { best: 90, passed: true }]));
    const p = stageProgress(a1);
    expect(p[1]).toMatchObject({ status: "done", percent: 100 });
    expect(p.find((s) => s.status === "current")?.n).toBe(3);
    expect(courseCompletion(a1).done).toBe(Object.keys(a1).length);
  });

  it("a failed attempt doesn't count as passed", () => {
    const first = LESSONS[0].id;
    expect(stageProgress({ [first]: { best: 40, passed: false } })[1].done).toBe(0);
  });

  it("finds a lesson's stage", () => {
    expect(stageOfLesson(LESSONS[0].id)?.stage.n).toBe(2);
    expect(stageOfLesson(SOUNDS[0].id)?.stage.n).toBe(4);
    expect(stageOfLesson("nope")).toBeNull();
  });
});

describe("what is left in a stage: Grammar or only pronunciation", () => {
  const passAll = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { best: 90, passed: true }]));
  it("every Grammar lesson passed: Stage 4 has only Sounds left and says so, never in progress", () => {
    const s = stageProgress(passAll(LESSONS.map((l) => l.id))).find((x) => x.id === "skills")!;
    expect(s.left).toEqual({ grammar: 0, sounds: SOUNDS.length });
    expect(soundsOnlyLabel(s)).toBe(`เหลือบทออกเสียง ${SOUNDS.length} บท`);
  });
  it("Grammar lessons still open: no pronunciation-only label", () => {
    const s = stageProgress({}).find((x) => x.id === "skills")!;
    expect(s.left.grammar).toBeGreaterThan(0);
    expect(soundsOnlyLabel(s)).toBeUndefined();
  });
  it("everything passed: nothing left, no label", () => {
    const s = stageProgress(passAll([...LESSONS, ...SOUNDS].map((l) => l.id))).find((x) => x.id === "skills")!;
    expect(s.status).toBe("done");
    expect(soundsOnlyLabel(s)).toBeUndefined();
  });
});
