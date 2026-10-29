// The 7 stages of the IELTS roadmap, built on the course that already exists. A stage lists real
// pages only; stages without content yet say so (`soon`) instead of showing buttons that do nothing.
import { LESSONS, SOUNDS } from "./index";

export type StageItem = {
  id: string;
  title: string;
  href: string;
  /** Grammar and pronunciation lessons count toward progress (a passed quiz); other items are extras. */
  lessonId?: string;
  kind: "lesson" | "page" | "practice";
  minutes: number;
};

export type Stage = {
  n: number;
  id: string;
  title: string;
  th: string;
  blurb: string;
  items: StageItem[];
  /** Planned content that isn't built yet, shown as "coming soon" text only. */
  soon?: string[];
  /** Where the stage sits on the roadmap scene, in % of its width and height. */
  pin: { x: number; y: number };
};

/** A rough guide for learners: theory and examples, plus about a minute per exercise and question. */
const minutesOf = (l: { practice: unknown[]; quiz: unknown[] }) => 10 + l.practice.length + l.quiz.length;
const lessonItem = (l: (typeof LESSONS)[number], base: "grammar" | "sounds"): StageItem => ({
  id: l.id, title: l.title, href: `/${base}/${l.id}`, lessonId: l.id, kind: "lesson", minutes: minutesOf(l),
});
const byLevel = (...levels: string[]) => LESSONS.filter((l) => levels.includes(l.level)).map((l) => lessonItem(l, "grammar"));

export const STAGES: Stage[] = [
  {
    n: 1, id: "ielts", title: "What is IELTS?", th: "รู้จัก IELTS",
    blurb: "รู้ว่าข้อสอบมีอะไร วัดอะไร และคะแนน Band คิดอย่างไร ก่อนเริ่มเตรียมตัว",
    items: [
      { id: "ielts-intro", title: "IELTS คืออะไร: 4 ทักษะ และ Band 0–9", href: "/ielts", kind: "page", minutes: 8 },
      { id: "placement", title: "สอบวัดระดับ: รู้จุดเริ่มต้นของคุณ", href: "/placement", kind: "practice", minutes: 8 },
    ],
    pin: { x: 14, y: 70 },
  },
  {
    n: 2, id: "foundation", title: "English Foundation", th: "พื้นฐานภาษาอังกฤษ",
    blurb: "โครงประโยค Verb to be, Present Simple และคำถาม ฐานที่ทุกทักษะต้องใช้",
    items: byLevel("A1"),
    pin: { x: 30, y: 55 },
  },
  {
    n: 3, id: "grammar", title: "Vocabulary & Grammar", th: "คำศัพท์และไวยากรณ์",
    blurb: "อดีต อนาคต การเปรียบเทียบ Passive และประโยคเงื่อนไข พร้อมคำศัพท์ที่ใช้บ่อย",
    items: [
      ...byLevel("A2", "B1"),
      { id: "flashcards", title: "ฝึกคำศัพท์ด้วย Smart Flashcard", href: "/learn", kind: "practice", minutes: 10 },
      { id: "verbs", title: "V1-V2-V3: กริยาผันไม่ปกติ", href: "/verbs", kind: "practice", minutes: 10 },
    ],
    pin: { x: 46, y: 40 },
  },
  {
    n: 4, id: "skills", title: "Four Skills", th: "ปูพื้น 4 ทักษะ",
    blurb: "ออกเสียงให้ฟังรู้เรื่อง และใช้ไวยากรณ์ระดับ B2 ที่ช่วยให้งานเขียนและการพูดลื่นขึ้น",
    items: [...SOUNDS.map((l) => lessonItem(l, "sounds")), ...byLevel("B2")],
    soon: ["ฝึก Listening 4 Sections", "ฝึก Reading 3 Passages", "Writing Task 1 และ Task 2", "Speaking Part 1–3"],
    pin: { x: 60, y: 30 },
  },
  {
    n: 5, id: "strategy", title: "Exam Strategy", th: "เทคนิคทำข้อสอบ",
    blurb: "เทคนิคจัดเวลาและวิธีรับมือโจทย์แต่ละแบบ เช่น True / False / Not Given",
    items: [],
    soon: ["จัดเวลาในห้องสอบ", "โจทย์ Reading แต่ละแบบ", "โครงเรียงความ Task 2"],
    pin: { x: 72, y: 46 },
  },
  {
    n: 6, id: "practice", title: "Practice & Mock Test", th: "ฝึกและสอบเสมือนจริง",
    blurb: "วัดระดับซ้ำเพื่อดูพัฒนาการ และสอบเสมือนจริงครบ 4 ทักษะ",
    items: [{ id: "placement-again", title: "สอบวัดระดับอีกครั้ง", href: "/placement", kind: "practice", minutes: 8 }],
    soon: ["Mock Test เต็มชุด 4 ทักษะ"],
    pin: { x: 83, y: 32 },
  },
  {
    n: 7, id: "summit", title: "Target Band", th: "ถึงเป้าหมาย",
    blurb: "ทบทวนจุดอ่อนสุดท้ายและเตรียมตัวก่อนวันสอบจริง",
    items: [],
    soon: ["ตั้ง Band เป้าหมายและวันสอบ", "แผนทวนก่อนวันสอบ"],
    pin: { x: 90, y: 14 },
  },
];

export type LessonBest = Record<string, { best: number; passed: boolean }>;

export type StageProgress = Stage & {
  done: number; total: number; percent: number; next?: StageItem; status: "done" | "current" | "todo" | "open" | "soon";
  /** Tracked lessons not passed yet, by kind, so labels can say what is left (e.g. only pronunciation). */
  left: { grammar: number; sounds: number };
};

/** Progress per stage from passed lesson quizzes. The current stage is the first one with lessons left. */
export function stageProgress(best: LessonBest): StageProgress[] {
  let currentFound = false;
  return STAGES.map((s) => {
    const tracked = s.items.filter((i) => i.lessonId);
    const done = tracked.filter((i) => best[i.lessonId!]?.passed).length;
    const total = tracked.length;
    const next = tracked.find((i) => !best[i.lessonId!]?.passed) ?? s.items[0];
    let status: StageProgress["status"];
    // Intro and practice-only stages have nothing to pass: always open, never "done" or "current".
    if (total === 0) status = s.items.length ? "open" : "soon";
    else if (done === total) status = "done";
    else if (!currentFound) status = "current";
    else status = "todo";
    if (status === "current") currentFound = true;
    const open = tracked.filter((i) => !best[i.lessonId!]?.passed);
    const sounds = open.filter((i) => i.href.startsWith("/sounds/")).length;
    return { ...s, done, total, percent: total ? Math.round((done / total) * 100) : 0, next, status, left: { grammar: open.length - sounds, sounds } };
  });
}

/** The stage a lesson belongs to, and its place in that stage. */
export function stageOfLesson(lessonId: string) {
  for (const s of STAGES) {
    const i = s.items.findIndex((x) => x.lessonId === lessonId);
    if (i >= 0) return { stage: s, index: i };
  }
  return null;
}

/** Overall course completion: passed lessons out of all tracked lessons. */
export function courseCompletion(best: LessonBest) {
  const all = STAGES.flatMap((s) => s.items.filter((i) => i.lessonId));
  const done = all.filter((i) => best[i.lessonId!]?.passed).length;
  return { done, total: all.length, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
}
