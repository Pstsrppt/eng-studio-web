// "ก้าวต่อไปของคุณ" on the Roadmap: the one recommended next step, why, and where to go. Pure: it only reads the
// shared nextLesson() result, the latest placement level and the stage progress built from saved results. It never
// changes them and never makes up a number: every figure shown comes from those inputs.
import { soundsOnlyLabel } from "@/components/stage-look";
import { stageOfLesson, type StageProgress } from "@/content/stages";
import { placedLevel, type NextLesson } from "./next-lesson";

export type NextStepState = "start" | "placement" | "progress" | "gap" | "complete";
type Link = { href: string; label: string };
export type NextStep = {
  state: NextStepState;
  eyebrow: string;
  title: string;
  /** The stage of the recommended lesson ("Stage 03 · Vocabulary & Grammar"). */
  stage?: string;
  reasons: string[];
  /** Real figures only (passed counts, placement level, lessons left). */
  facts: string[];
  cta: Link;
  secondary?: Link;
  /** When the recommendation is past a stage that still has lessons: those stages stay open. */
  earlier?: { text: string; stages: { id: string; label: string }[] };
  /** Starting out: Stage 01 is where the whole IELTS roadmap begins, the first Grammar lesson is in a later stage. */
  intro?: { text: string; link: Link };
};

const pad = (n: number) => String(n).padStart(2, "0");
const levelName = (l: string) => (l === "pre-A1" ? "ก่อน A1" : l);

export function nextStep({ next, placement, signedIn, stages }: {
  next: NextLesson<{ id: string; title: string; level: string }>;
  placement?: unknown;
  signedIn: boolean;
  stages: StageProgress[];
}): NextStep {
  const placed = placedLevel(placement);
  const passedFact = signedIn ? [`ผ่านแล้ว ${next.passed} จาก ${next.total} บท Grammar`] : ["ยังไม่ได้เข้าสู่ระบบ ความคืบหน้ายังไม่ถูกบันทึก"];
  const levelFact = placed ? [`ระดับจากการสอบวัดระดับ: ${levelName(placed)} (CEFR ไม่ใช่ Band IELTS)`] : [];

  if (next.kind === "grammar-complete") {
    const sounds = stages.find((s) => soundsOnlyLabel(s));
    return {
      state: "complete",
      eyebrow: "GRAMMAR ผ่านครบ",
      title: "ผ่าน Grammar ครบทุกบทแล้ว",
      reasons: ["ไวยากรณ์เป็นฐานหนึ่งของการเตรียม IELTS ยังมีการทวนคำศัพท์ การออกเสียง และทักษะ 4 ด้านให้ฝึกต่อ เปิดบทเดิมเพื่อทบทวนได้ทุกเมื่อ"],
      facts: [`ผ่าน Grammar ครบ ${next.total} บท`, ...(sounds ? [soundsOnlyLabel(sounds)!] : []), ...levelFact],
      cta: sounds?.next ? { href: sounds.next.href, label: "ฝึกออกเสียงต่อ" } : { href: "/learn", label: "ทวน Flashcards" },
      secondary: { href: "/placement", label: "สอบวัดระดับอีกครั้ง" },
    };
  }

  const where = stageOfLesson(next.lesson.id)?.stage;
  const href = `/grammar/${next.lesson.id}`;
  const base = { title: next.lesson.title, stage: where ? `Stage ${pad(where.n)} · ${where.title}` : undefined, earlier: earlierStages(stages, where?.id) };

  // Placement chose where to start (and the learner is continuing from there).
  if (placed && next.reason !== "earlier-gap") {
    return {
      ...base,
      state: "placement",
      eyebrow: "แนะนำตามระดับ",
      reasons: [next.reason === "from-placement"
        ? `ผลสอบวัดระดับล่าสุดคือ ${levelName(placed)} เว็บจึงเริ่มให้ที่บทนี้ ข้ามบทที่ง่ายกว่าระดับของคุณ`
        : `บทถัดไปต่อจากบทที่ผ่านล่าสุด ในเส้นทางที่เริ่มจากผลสอบวัดระดับ ${levelName(placed)}`],
      facts: [...levelFact, ...passedFact],
      cta: { href, label: next.reason === "from-placement" ? "เริ่มบทที่แนะนำ" : "เรียนต่อ" },
    };
  }
  if (next.reason === "earlier-gap") {
    return {
      ...base,
      state: "gap",
      eyebrow: "ยังมีบทที่ค้าง",
      reasons: ["บทตั้งแต่ระดับของคุณขึ้นไปผ่านครบแล้ว ยังมีบทที่ง่ายกว่านี้ที่ยังไม่ผ่าน ทำให้ครบเพื่อปิด Grammar"],
      facts: [...levelFact, ...passedFact],
      cta: { href, label: "ไปบทที่ยังไม่ผ่าน" },
    };
  }
  if (next.reason === "start") {
    return {
      ...base,
      state: "start",
      eyebrow: "เริ่มต้นที่นี่",
      reasons: [
        signedIn ? "ยังไม่มีผลสอบวัดระดับและยังไม่มีบทที่ผ่าน จึงเริ่มจากบทแรกของ Grammar" : "เริ่มบทแรกของ Grammar ได้ทันที ไม่ต้องสมัครก่อน",
        "หรือสอบวัดระดับ 5–8 นาที แล้วเว็บจะเลือกบทแรกให้ตรงกับระดับของคุณ",
      ],
      facts: passedFact,
      cta: { href, label: "เริ่มบทแรก" },
      secondary: { href: "/placement", label: "สอบวัดระดับก่อน" },
      intro: startIntro(stages, where?.n),
    };
  }
  return {
    ...base,
    state: "progress",
    eyebrow: "เรียนต่อ",
    reasons: ["บทถัดไปตามลำดับ ต่อจากบทที่ผ่านล่าสุด"],
    facts: passedFact,
    cta: { href, label: "เรียนต่อ" },
  };
}

/** Stage 01 (its name and page come from the stage data) and the stage the first Grammar lesson is in. */
function startIntro(stages: StageProgress[], lessonStage?: number): NextStep["intro"] {
  const first = stages[0];
  if (!first || !lessonStage || lessonStage === first.n) return undefined;
  const page = first.items.find((i) => i.kind === "page")?.href ?? "/ielts";
  return {
    text: `Stage ${pad(first.n)} “${first.th}” คือจุดเริ่มต้นของเส้นทาง IELTS ทั้งหมด: ข้อสอบมีอะไรและคะแนน Band คิดอย่างไร ส่วนบท Grammar บทแรกเริ่มที่ Stage ${pad(lessonStage)}`,
    link: { href: page, label: `อ่าน Stage ${pad(first.n)}: ${first.th}` },
  };
}

/** Stage 01 up to the first stage with lessons left, when the recommendation is in a later stage. */
function earlierStages(stages: StageProgress[], recId?: string): NextStep["earlier"] {
  const open = stages.find((s) => s.status === "current");
  const rec = stages.find((s) => s.id === recId);
  if (!open || !rec || rec.id === open.id || rec.n < open.n) return undefined;
  const first = stages[0];
  const names = open.n - first.n === 1 ? `Stage ${pad(first.n)} และ Stage ${pad(open.n)}` : `Stage ${pad(first.n)}–${pad(open.n)}`;
  return {
    text: `${names} ยังเปิดเรียนได้ Stage ${pad(open.n)} ยังมีอีก ${open.total - open.done} บทที่ยังไม่ผ่าน ไม่ต้องทำให้ครบก่อน บทที่ข้ามไปจะยังไม่นับว่าผ่าน`,
    stages: [{ id: first.id, label: `ดู Stage ${pad(first.n)}` }, { id: open.id, label: `ดู Stage ${pad(open.n)}` }],
  };
}
