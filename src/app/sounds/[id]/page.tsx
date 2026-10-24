import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonShell } from "@/components/lesson-shell";
import { PASS_MARK, SOUNDS, getSound, nextLesson } from "@/content";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SOUNDS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getSound((await params).id);
  return { title: lesson?.title ?? "ออกเสียง" };
}

export default function SoundPage({ params }: Props) {
  // Reading params suspends on client navigation, so the lesson streams in behind a boundary.
  return (
    <Suspense fallback={<div className="page-bleed h-[70vh] animate-pulse bg-navy" />}>
      <Sound params={params} />
    </Suspense>
  );
}

async function Sound({ params }: Props) {
  const lesson = getSound((await params).id);
  if (!lesson) notFound();
  const next = nextLesson(lesson.id, SOUNDS);

  return <LessonShell lesson={lesson} kind="sounds" passMark={PASS_MARK} next={next && { href: `/sounds/${next.id}`, title: next.title }} />;
}
