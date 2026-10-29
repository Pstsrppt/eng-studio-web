// Home's 7-Stage IELTS Roadmap. Stage 1 is labelled as the start of the journey, the recommended stage says why it is
// recommended, and only stages whose tracked lessons are all passed show as passed.
import { AudioLinesIcon, CheckIcon, ChevronRightIcon, MapPinIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { RoadmapJump } from "@/components/home/roadmap-jump";
import { REC_LABEL, soundsOnlyLabel, STAGE_LOOK, START_LABEL } from "@/components/stage-look";
import { stageOfLesson, type StageProgress } from "@/content/stages";
import { recommendationBasis, type NextLesson, type RecommendationBasis } from "@/lib/next-lesson";

export type Recommended = { stage: string; basis: RecommendationBasis } | null;

/** The stage to mark for a signed-in learner: the stage of the Continue lesson, and why. None once Grammar is
    complete: no Grammar lesson is left to recommend, and other stages say what is left in their own label. */
export function homeRecommendation(next: NextLesson<{ id: string; level: string }>, placement?: unknown): Recommended {
  const stage = next.kind === "lesson" ? stageOfLesson(next.lesson.id)?.stage.id : undefined;
  const basis = recommendationBasis(next, placement);
  return stage && basis ? { stage, basis } : null;
}

/** Stage 1 is always the start of the journey; the recommendation and passed stages are labelled separately. */
function stageChip(s: StageProgress, i: number, recommended: Recommended) {
  if (s.status === "done") return { label: "ผ่านแล้ว", Icon: CheckIcon, tone: "bg-[#e3f1ea] text-[#22694b]" };
  if (recommended?.stage === s.id) return { label: REC_LABEL[recommended.basis], Icon: SparklesIcon, tone: "bg-(--ac-gold-soft) text-accent-text" };
  if (i === 0) return { label: START_LABEL, Icon: MapPinIcon, tone: "bg-tint text-(--ac-navy-2)" };
  const sounds = soundsOnlyLabel(s);
  if (sounds) return { label: sounds, Icon: AudioLinesIcon, tone: "bg-sunken text-(--ac-body)" };
  return null;
}

/** signedIn: guests see Stage 1 highlighted as the place to begin; signed-in learners see their recommended stage. */
export function RoadmapStrip({ stages, recommended, signedIn = false }: { stages: StageProgress[]; recommended: Recommended; signedIn?: boolean }) {
  const rec = recommended && stages.find((s) => s.id === recommended.stage);
  return (
    <section className="grid gap-7 rounded-2xl border border-(--ac-line) bg-(--ac-surface) p-6 shadow-(--ac-shadow) lg:grid-cols-[270px_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-10 lg:py-9" aria-labelledby="road-title">
      <div>
        <h2 id="road-title" className="ac-serif text-[28px] leading-[1.15] font-bold text-(--ac-heading)">Your 7-Stage<br className="hidden lg:block" /> IELTS Roadmap</h2>
        <p className="mt-3 text-[15px] leading-6 text-(--ac-muted)">A clear path from your current level to your target band.</p>
        {/* Phones and tablets: the row starts at Stage 1 and never scrolls on its own. A recommendation past the
            first two stages is off screen there, so offer a way to bring it into view. */}
        {rec && rec.n > 2 && <RoadmapJump stageId={rec.id} label={`ดู Stage ${String(rec.n).padStart(2, "0")} ที่แนะนำ`} />}
      </div>
      <ol className="-mx-2 flex snap-x gap-1 overflow-x-auto px-2 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0 lg:pb-0">
        {stages.map((s, i) => {
          const look = STAGE_LOOK[s.id];
          const active = recommended ? s.id === recommended.stage : !signedIn && i === 0;
          const done = s.status === "done";
          const chip = stageChip(s, i, recommended);
          return (
            <li key={s.id} data-home-stage={s.id} className="relative flex w-[148px] shrink-0 snap-start lg:w-auto">
              {i < stages.length - 1 && (
                <span className="absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] hidden items-center lg:flex" aria-hidden>
                  <span className="h-px flex-1 bg-(--ac-line)" />
                  <ChevronRightIcon className="size-3.5 text-(--ac-muted)" />
                  <span className="h-px flex-1 bg-(--ac-line)" />
                </span>
              )}
              <Link href={`/roadmap?stage=${s.id}`}
                className="group flex w-full flex-col items-center gap-3 rounded-xl px-1.5 py-1 text-center">
                <span className={"relative grid size-16 place-items-center rounded-full transition " +
                  (active ? "bg-(--ac-navy) text-white shadow-[0_0_0_6px_var(--ac-gold-soft)]" : "bg-sunken text-(--ac-navy) group-hover:bg-(--ac-gold-soft)")}>
                  <look.Icon className="size-7" strokeWidth={1.5} aria-hidden />
                  {done && <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-[#2e7d5b] text-white" aria-hidden><CheckIcon className="size-3" /></span>}
                </span>
                <span className="flex flex-col items-center gap-1.5">
                  <span className="flex min-h-[2.5em] items-start text-[15px] leading-[1.25] font-semibold text-balance text-(--ac-heading)">{s.title}</span>
                  <span className="max-w-[11rem] text-[13.5px] leading-[1.45] text-balance text-(--ac-muted)">{look.short}</span>
                  {chip && (
                    <span className={"mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap " + chip.tone}>
                      <chip.Icon className="size-3" aria-hidden />{chip.label}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
