import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function LessonPage({ params }: Props) {
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
