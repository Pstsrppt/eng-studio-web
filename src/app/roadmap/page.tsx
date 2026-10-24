import type { Metadata } from "next";
import { Suspense } from "react";
import { courseCompletion, stageProgress } from "@/content/stages";
import { getLessonBest, getPlacements, getUser } from "@/lib/data";
import { RoadmapView } from "./roadmap-view";

export const metadata: Metadata = { title: "Roadmap" };

type Search = Promise<{ stage?: string; view?: string }>;

export default function RoadmapPage({ searchParams }: { searchParams: Search }) {
  return (
    <div className="page-bleed on-dark min-h-[calc(100dvh-62px)] bg-navy text-white">
      <Suspense fallback={<div className="h-[640px] animate-pulse bg-navy-2" aria-busy="true" aria-label="กำลังโหลด" />}>
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
    />
  );
}
