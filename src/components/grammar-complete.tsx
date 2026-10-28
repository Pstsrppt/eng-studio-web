import { ArrowRightIcon, AudioLinesIcon, CompassIcon, GaugeIcon, LayersIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";

const NEXT: { href: string; Icon: LucideIcon; title: string; sub: string }[] = [
  { href: "/learn", Icon: LayersIcon, title: "ทวน Flashcards", sub: "คำที่ถึงรอบยังกลับมาให้ทวนทุกวัน" },
  { href: "/sounds", Icon: AudioLinesIcon, title: "ออกเสียง", sub: "บทเสียงที่คนไทยมักออกผิด" },
  { href: "/placement", Icon: GaugeIcon, title: "สอบวัดระดับอีกครั้ง", sub: "ดูว่าระดับ CEFR ขยับไปแค่ไหน" },
  { href: "/roadmap", Icon: CompassIcon, title: "ดู Roadmap", sub: "ทักษะ 4 ด้านและส่วนที่กำลังจัดทำ" },
];

/** Shown instead of a Continue lesson once every Grammar lesson is passed. The page title already says Grammar is
    complete, so the card is about what to practise next. Grammar is one part of IELTS preparation, so this never
    says the course or IELTS is finished. */
export function GrammarComplete({ total }: { total: number }) {
  return (
    <section className="card flex flex-col gap-4 p-6 sm:p-7" aria-labelledby="grammar-complete-title">
      <div>
        <p className="eyebrow">Grammar · ผ่านครบ {total} บท</p>
        <h2 id="grammar-complete-title" className="mt-1 text-2xl font-bold text-(--ac-heading)">ฝึกต่อจากนี้</h2>
        <p className="mt-2 max-w-[60ch] leading-7 text-(--ac-body)">
          ไวยากรณ์เป็นฐานหนึ่งของการเตรียม IELTS ยังมีการทวนคำศัพท์ การออกเสียง และทักษะ 4 ด้านให้ฝึกต่อ เปิดบทเดิมเพื่อทบทวนได้ทุกเมื่อ
        </p>
      </div>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {NEXT.map(({ href, Icon, title, sub }) => (
          <li key={href}>
            <Link href={href} className="od-lift flex min-h-14 items-center gap-3 rounded-xl border border-(--ac-line) bg-card px-4 py-3 hover:border-(--ac-navy)/40 hover:bg-(--ac-bg)">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-(--ac-gold-soft) text-(--ac-gold-ink)"><Icon className="size-4" aria-hidden /></span>
              <span className="min-w-0 flex-1"><b className="block font-semibold text-(--ac-heading)">{title}</b><span className="text-xs text-(--ac-muted)">{sub}</span></span>
              <ArrowRightIcon className="size-4 shrink-0 text-(--ac-muted)" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
