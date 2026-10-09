import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonView } from "@/components/lesson-view";
import { LESSONS, PASS_MARK, getLesson, nextLesson } from "@/content";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLesson((await params).id);
  return { title: lesson?.title ?? "Grammar" };
}

export default function LessonPage({ params }: Props) {
  // Reading params suspends on client navigation, so the lesson streams in behind a boundary.
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-ink/5" />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Props) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  const next = nextLesson(lesson.id);
  const n = LESSONS.indexOf(lesson) + 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <Link href="/grammar" className="hover:text-ink">← Grammar</Link>
        <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] text-white">{lesson.level} · {n}/{LESSONS.length}</span>
      </div>
      <h1 className="text-[28px] font-bold leading-tight tracking-tight lg:text-4xl">{lesson.title}</h1>
      <p className="w-fit rounded-lg bg-ink px-3 py-2 font-mono text-[13px] text-white">{lesson.formula}</p>
      <LessonView
        key={lesson.id}
        lesson={lesson}
        passMark={PASS_MARK}
        next={next && { id: next.id, title: next.title }}
      />
    </div>
  );
}
