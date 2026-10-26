// How each roadmap stage looks on the Academic Studio pages: an icon and a one-line English summary.
// Names, order and lessons come from content/stages.ts; this only adds presentation.
import { ClipboardListIcon, CompassIcon, FlagIcon, GraduationCapIcon, HeadphonesIcon, LandmarkIcon, LayersIcon, type LucideIcon } from "lucide-react";

export const STAGE_LOOK: Record<string, { Icon: LucideIcon; short: string }> = {
  ielts: { Icon: GraduationCapIcon, short: "Know the test, its parts and its bands" },
  foundation: { Icon: LandmarkIcon, short: "Build core English skills" },
  grammar: { Icon: LayersIcon, short: "Grow your word bank and grammar" },
  skills: { Icon: HeadphonesIcon, short: "Listen, read, write and speak" },
  strategy: { Icon: CompassIcon, short: "Master key exam strategies" },
  practice: { Icon: ClipboardListIcon, short: "Practise and simulate the exam" },
  summit: { Icon: FlagIcon, short: "Be ready for your IELTS goal" },
};
