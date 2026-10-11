import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PracticeSkeleton } from "@/components/skeleton";
import { MistakesView, type MistakeItem } from "@/components/mistakes-view";
import { LESSONS, SOUNDS } from "@/content";
import { getMistakes } from "@/lib/data";

export const metadata: Metadata = { title: "ทบทวนข้อผิด" };

export default function MistakesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="eyebrow">ทบทวนข้อผิด</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">ข้อที่เคยตอบผิด</h1>
        <p className="mt-2 max-w-[62ch] text-muted">
          รวมทุกข้อที่ตอบผิดจากแบบทดสอบและ V1-V2-V3 ทำซ้ำจนถูก จุดอ่อนจะหายไปจริง ๆ
        </p>
      </header>
      <Suspense fallback={<PracticeSkeleton />}>
        <Mistakes />
      </Suspense>
    </div>
  );
}

/** Where a mistake came from, as a link back to the lesson or drill. */
function origin(source: string) {
  const [kind, id] = source.split(":");
  if (kind === "grammar") {
    const lesson = LESSONS.find((l) => l.id === id) ?? SOUNDS.find((l) => l.id === id);
    if (lesson) return { title: `จากบท: ${lesson.title}`, href: `/${SOUNDS.includes(lesson) ? "sounds" : "grammar"}/${id}` };
  }
  if (kind === "verb") return { title: "จาก V1-V2-V3", href: "/verbs" };
  return null;
}

async function Mistakes() {
  const groups = await getMistakes();
  if (groups === null) {
    return (
      <p className="card p-6 text-sm leading-6 text-muted">
        <Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> แล้วเว็บจะเก็บข้อที่ตอบผิดไว้ให้ทบทวนที่นี่
      </p>
    );
  }
  if (groups.length === 0) {
    return <p className="card p-6 text-sm leading-6 text-muted">ไม่มีข้อผิดค้างอยู่ ข้อที่ตอบผิดในแบบทดสอบและ V1-V2-V3 จะมาอยู่ที่นี่</p>;
  }
  const items: MistakeItem[] = groups.map((g) => ({ ...g, from: origin(g.source) }));
  return <MistakesView items={items} />;
}
