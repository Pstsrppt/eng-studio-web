import type { Metadata } from "next";
import { Suspense } from "react";
import { LESSONS, LEVELS } from "@/content";
import questions from "@/content/data/placement.json";
import { getPlacements, getUser } from "@/lib/data";
import type { PlacementQuestion } from "@/lib/placement";
import { PlacementTest } from "./placement-test";

export const metadata: Metadata = { title: "สอบวัดระดับ" };

// Only the question and its options reach the browser; answers are checked on the server.
const PUBLIC_QUESTIONS = (questions as PlacementQuestion[]).map(({ id, level, q, o }) => ({ id, level, q, o }));
const LESSON_LIST = LESSONS.map(({ id, level, title }) => ({ id, level, title }));

export default function PlacementPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <p className="eyebrow">สอบวัดระดับ · Placement test</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">ภาษาอังกฤษของฉันอยู่ระดับไหน?</h1>
      </header>
      <Suspense fallback={<div className="card h-64 animate-pulse" aria-busy="true" aria-label="กำลังโหลด" />}>
        <Test />
      </Suspense>
    </div>
  );
}

async function Test() {
  const [user, history] = await Promise.all([getUser(), getPlacements()]);
  return <PlacementTest questions={PUBLIC_QUESTIONS} lessons={LESSON_LIST} levels={LEVELS} signedIn={!!user} history={history} />;
}
