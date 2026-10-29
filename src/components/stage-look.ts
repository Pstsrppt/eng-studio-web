// How each roadmap stage looks on the Academic Studio pages: an icon and a one-line English summary.
// Names, order and lessons come from content/stages.ts; this only adds presentation.
import { ClipboardListIcon, CompassIcon, FlagIcon, GraduationCapIcon, HeadphonesIcon, LandmarkIcon, LayersIcon, type LucideIcon } from "lucide-react";
import type { RecommendationBasis } from "@/lib/next-lesson";

export const STAGE_LOOK: Record<string, { Icon: LucideIcon; short: string }> = {
  ielts: { Icon: GraduationCapIcon, short: "Know the test, its parts and its bands" },
  foundation: { Icon: LandmarkIcon, short: "Build core English skills" },
  grammar: { Icon: LayersIcon, short: "Grow your word bank and grammar" },
  skills: { Icon: HeadphonesIcon, short: "Listen, read, write and speak" },
  strategy: { Icon: CompassIcon, short: "Master key exam strategies" },
  practice: { Icon: ClipboardListIcon, short: "Practise and simulate the exam" },
  summit: { Icon: FlagIcon, short: "Be ready for your IELTS goal" },
};

/** Stage 1 is the start of the journey for everyone; this is not a progress or recommendation state. */
export const START_LABEL = "จุดเริ่มต้น";
/** What the recommended stage says, by why it is recommended (see recommendationBasis). Never a passed state. */
export const REC_LABEL: Record<RecommendationBasis, string> = { placement: "แนะนำตามระดับ", start: "บทแรกที่แนะนำ", progress: "เรียนต่อที่นี่" };
/** A stage whose only lessons left are pronunciation (Sounds) says so, instead of "in progress", so it never reads
    as Grammar still to do. Undefined when Grammar lessons are left, nothing is left, or the stage has no lessons. */
export function soundsOnlyLabel(s: { status: string; left: { grammar: number; sounds: number } }): string | undefined {
  return (s.status === "current" || s.status === "todo") && s.left.grammar === 0 && s.left.sounds > 0 ? `เหลือบทออกเสียง ${s.left.sounds} บท` : undefined;
}
