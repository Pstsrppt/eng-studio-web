import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonShell } from "@/components/lesson-shell";
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
    <Suspense fallback={<div className="page-bleed h-[70vh] animate-pulse bg-[#faf8f3]" />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Props) {
  const lesson = getLesson((await params).id);
  if (!lesson) notFound();
  const next = nextLesson(lesson.id);

  return <LessonShell lesson={lesson} kind="grammar" passMark={PASS_MARK} next={next && { href: `/grammar/${next.id}`, title: next.title }} />;
}
