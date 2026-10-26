import { LibraryBigIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademicPhoto } from "@/components/academic-photo";
import { courseCompletion, stageProgress } from "@/content/stages";
import { getLessonBest, getPlacements, getUser } from "@/lib/data";
import { RoadmapView } from "./roadmap-view";

export const metadata: Metadata = { title: "Roadmap" };

type Search = Promise<{ stage?: string; view?: string }>;

/** A short atmosphere strip; uses the Home photo until public/academic/roadmap-banner.webp is added. */
function Banner() {
  return <AcademicPhoto name="roadmap-banner" fallback="hero-study" alt="" icon={LibraryBigIcon} priority className="size-full object-[60%_45%]" />;
}

export default function RoadmapPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="theme-academic page-bleed min-h-[calc(100dvh-62px)] bg-(--ac-bg) text-(--ac-ink)">
      <Suspense fallback={<div className="h-[640px] animate-pulse bg-(--ac-bg)" aria-busy="true" aria-label="กำลังโหลด" />}>
        <Roadmap searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Roadmap({ searchParams }: { searchParams: Search }) {
  const [params, user, best, placements] = await Promise.all([searchParams, getUser(), getLessonBest(), getPlacements()]);
  const stages = stageProgress(best);
  return (
    <RoadmapView
      stages={stages}
      passed={Object.keys(best).filter((id) => best[id].passed)}
      overall={courseCompletion(best)}
      level={placements[0]?.level ?? null}
      signedIn={!!user}
      initialStage={stages.some((s) => s.id === params.stage) ? params.stage! : undefined}
      initialView={params.view === "list" ? "list" : "world"}
      banner={<Banner />}
    />
  );
}
