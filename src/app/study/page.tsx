import {
  ArrowRightIcon, AudioLinesIcon, BookMarkedIcon, LayersIcon, LibraryBigIcon, PlayIcon, RepeatIcon, RotateCcwIcon, SunIcon, type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { GrammarComplete } from "@/components/grammar-complete";
import { LESSONS, WORDS } from "@/content";
import { lessonWords } from "@/content/lesson-words";
import { getDashboard, getPlacements, getUser } from "@/lib/data";
import { DAILY_NEW_LIMIT } from "@/lib/learning/queue";
import { getLearnOverview, type LearnOverview } from "@/lib/learning/server";
import { nextLesson, placedLevel, type NextLesson } from "@/lib/next-lesson";

export const metadata: Metadata = { title: "เรียน" };

/** The study overview behind the เรียน tab: what to continue, what to review, and a way into every study page.
    /today stays the detailed daily plan and /learn the Flashcards page; this page only points to them. */
export default function StudyPage() {
  return (
    <AcademicPage>
      <Suspense fallback={<StudySkeleton />}>
        <Study />
      </Suspense>
    </AcademicPage>
  );
}

function StudySkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-10 w-2/3 rounded-lg bg-line" />
      <div className="h-48 rounded-2xl bg-line/60" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 rounded-2xl bg-line/60" />)}</div>
    </div>
  );
}

const REASON: Record<Extract<NextLesson<(typeof LESSONS)[number]>, { kind: "lesson" }>["reason"], string> = {
  start: "บทแรกของคอร์ส ทุกบทเริ่มจากคำศัพท์ของบท ไม่ต้องรู้มาก่อน",
  continue: "บทถัดไปที่ยังไม่ผ่าน",
  "from-placement": "เริ่มจากผลสอบวัดระดับ บทที่ง่ายกว่ายังเปิดเรียนได้ทุกบท",
  "earlier-gap": "บทก่อนหน้าที่ยังไม่ผ่าน",
};
const levelLabel = (level: string) => (level === "pre-A1" ? "ก่อน A1" : level);

async function Study() {
  // Progress and today's review counts change every visit.
  await connection();
  const [user, dash, placements, learn] = await Promise.all([getUser(), getDashboard(), getPlacements(), getLearnOverview()]);
  const best = dash?.best ?? {};
  const latest = placements[0];
  const placed = placedLevel(latest?.level);
  const next = nextLesson(LESSONS, best, placed);
  const fresh = next.kind === "lesson" ? lessonWords(next.lesson.id).fresh.length : 0;
  // Nothing passed and no placement yet (every guest, and new learners): the placement test is the recommended
  // start, and the first lesson stays one tap away. Placement is never required.
  const starter = next.kind === "lesson" && next.passed === 0 && !placed;

  const title = next.kind === "grammar-complete" ? "ผ่าน Grammar ครบทุกบทแล้ว"
    : next.passed === 0 && !placed ? "เริ่มเรียนกันเลย"
    : `เรียนต่อจากบทที่ ${next.index + 1}`;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader eyebrow="STUDY · เรียน" title={title}
        lead="บทที่ควรเรียนต่อ คำที่ถึงรอบทวน และทางเข้าทุกส่วนของการเรียน" />

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          {next.kind === "lesson" && starter ? (
            <section className="on-dark grid gap-5 rounded-2xl bg-(--ac-dark) p-6 text-white sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" aria-labelledby="continue-title">
              <div className="min-w-0">
                <p className="eyebrow">เริ่มที่นี่ · แนะนำ</p>
                <h2 id="continue-title" className="ac-serif mt-1.5 text-[26px] leading-tight font-bold text-white sm:text-[28px]">สอบวัดระดับก่อน 5–8 นาที</h2>
                <p className="mt-2 max-w-[52ch] text-sm leading-6 text-on-dark-muted">
                  เว็บจะเลือกบทแรกให้ตรงกับระดับของคุณ ไม่จับเวลา และทำซ้ำได้ ไม่สะดวกตอนนี้ก็เริ่มบทแรกได้ทันที:
                  <span className="text-white"> {next.lesson.title}</span>{fresh > 0 && ` · คำใหม่ ${fresh} คำ`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 md:flex-col md:items-stretch">
                <Link href="/placement"
                  className="od-press inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-(--ac-gold-bright) px-6 text-[15px] font-semibold text-(--ac-navy) hover:bg-(--ac-gold-hover)">
                  สอบวัดระดับ <ArrowRightIcon className="size-4" aria-hidden />
                </Link>
                <Link href={`/grammar/${next.lesson.id}`} data-next-lesson={next.lesson.id}
                  className="od-press inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/35 px-5 text-[15px] font-semibold text-white hover:bg-white/10">
                  <PlayIcon className="size-4" aria-hidden />เริ่มบทแรกทันที
                </Link>
              </div>
            </section>
          ) : next.kind === "lesson" ? (
            <section className="on-dark grid gap-5 rounded-2xl bg-(--ac-dark) p-6 text-white sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" aria-labelledby="continue-title">
              <div className="min-w-0">
                <p className="eyebrow">เรียนต่อ · Grammar {next.lesson.level} · บทที่ {next.index + 1} จาก {next.total}</p>
                <h2 id="continue-title" className="ac-serif mt-1.5 text-[26px] leading-tight font-bold text-white sm:text-[28px]">{next.lesson.title}</h2>
                <p className="mt-2 text-sm leading-6 text-on-dark-muted">
                  {REASON[next.reason]}{fresh > 0 && ` · คำใหม่ ${fresh} คำ`}
                </p>
                <div className="mt-4 max-w-md">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="บท Grammar ที่ผ่านแล้ว"
                    aria-valuemin={0} aria-valuemax={next.total} aria-valuenow={next.passed}>
                    <div className="h-full rounded-full bg-(--ac-gold-bright)" style={{ width: `${(next.passed / next.total) * 100}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-on-dark-muted">ผ่านแล้ว {next.passed} จาก {next.total} บท</p>
                </div>
              </div>
              <Link href={`/grammar/${next.lesson.id}`} data-next-lesson={next.lesson.id}
                className="od-press inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-lg bg-(--ac-gold-bright) px-6 text-[15px] font-semibold text-(--ac-navy) hover:bg-(--ac-gold-hover) md:w-auto">
                <PlayIcon className="size-4" aria-hidden />{best[next.lesson.id] ? "เรียนต่อ" : "เริ่มบทนี้"}
              </Link>
            </section>
          ) : (
            <GrammarComplete total={next.total} />
          )}

          {starter && <GettingStarted signedIn={!!user} />}

          <Review learn={learn} signedIn={!!user} />

          <nav aria-label="ส่วนการเรียน" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Area href="/today" Icon={SunIcon} title="วันนี้" sub="แผน 60 นาทีของวันนี้" />
            <Area href="/grammar" Icon={BookMarkedIcon} title="บทเรียน" sub={`ผ่าน ${next.passed} จาก ${next.total} บท`} />
            <Area href="/learn" Icon={LayersIcon} title="ฝึกศัพท์" sub={learn ? `ถึงรอบ ${learn.due} คำ` : "Flashcards ทวนตามรอบ"} />
            <Area href="/vocab" Icon={LibraryBigIcon} title="คำศัพท์" sub={`คลัง ${WORDS.length} คำ`} />
          </nav>
          <ul className="flex flex-wrap gap-2 text-sm" aria-label="เครื่องมือ">
            {([["/verbs", RepeatIcon, "V1-V2-V3"], ["/sounds", AudioLinesIcon, "ออกเสียง"], ["/mistakes", RotateCcwIcon, "ทบทวนข้อผิด"]] as const).map(([href, Icon, label]) => (
              <li key={href}>
                <Link href={href} className="od-press inline-flex min-h-11 items-center gap-2 rounded-xl border border-(--ac-line) bg-card px-3.5 text-(--ac-heading) hover:border-(--ac-navy)/40">
                  <Icon className="size-4 text-(--ac-gold-ink)" aria-hidden />{label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {user && (
          <aside className="flex flex-col gap-4" aria-label="สรุปความคืบหน้า">
            <section className="card p-5">
              <h2 className="text-[15px] font-semibold text-(--ac-heading)">ระดับจากการสอบวัดระดับ</h2>
              {latest ? (
                <>
                  <p className="ac-serif mt-1 text-3xl font-bold text-(--ac-heading)">{levelLabel(latest.level)}</p>
                  <p className="text-xs text-(--ac-muted)">
                    ตอบถูก {latest.correct} จาก {latest.total} ข้อ · {new Date(latest.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" })}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-(--ac-muted)">ระดับ CEFR ไม่ใช่ Band IELTS</p>
                </>
              ) : (
                <p className="mt-1 text-sm leading-6 text-(--ac-body)">ยังไม่ได้สอบวัดระดับ</p>
              )}
              <Link href="/placement" className="mt-3 inline-flex min-h-6 items-center text-sm font-semibold text-(--ac-navy) underline underline-offset-2">
                {latest ? "สอบอีกครั้ง" : "สอบวัดระดับ 5–8 นาที"}
              </Link>
            </section>
            {dash && (
              <section className="card p-5">
                <h2 className="text-[15px] font-semibold text-(--ac-heading)">ความสม่ำเสมอ</h2>
                <dl className="mt-2 grid grid-cols-2 gap-3">
                  <div><dt className="text-xs text-(--ac-muted)">วันติดกัน</dt><dd className="ac-serif text-2xl font-bold text-(--ac-heading) tabular">{dash.streak}</dd></div>
                  <div><dt className="text-xs text-(--ac-muted)">ทวนวันนี้</dt><dd className="ac-serif text-2xl font-bold text-(--ac-heading) tabular">{dash.reviewsToday}</dd></div>
                </dl>
                <Link href="/roadmap" className="mt-3 inline-flex min-h-6 items-center text-sm font-semibold text-(--ac-navy) underline underline-offset-2">ดู Roadmap</Link>
              </section>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/** For guests and learners who have not started: the three steps (the placement test is the card above), with sign-in for guests. */
function GettingStarted({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="start-title">
      <h2 id="start-title" className="text-lg font-bold text-(--ac-heading)">เริ่มต้นอย่างไร</h2>
      <ol className="mt-3 grid gap-2.5 text-sm leading-6 text-(--ac-body) sm:grid-cols-3">
        <li><b className="block text-(--ac-heading)">1 · สอบวัดระดับ</b>5–8 นาที แล้วเว็บจะเลือกบทแรกให้</li>
        <li><b className="block text-(--ac-heading)">2 · เรียนบทที่แนะนำ</b>คำศัพท์ ทฤษฎี ฝึก แล้วทดสอบ</li>
        <li><b className="block text-(--ac-heading)">3 · ทวนทุกวัน</b>Flashcards นัดคำที่ลืมให้กลับมา</li>
      </ol>
      {!signedIn && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/login" className="btn-ghost od-press">เข้าสู่ระบบเพื่อบันทึกความคืบหน้า</Link>
        </div>
      )}
    </section>
  );
}

/** Flashcards for today, with the same numbers /learn shows. */
function Review({ learn, signedIn }: { learn: LearnOverview | null; signedIn: boolean }) {
  const action = !signedIn || !learn
    ? { text: `ลองฝึกคำใหม่ ${DAILY_NEW_LIMIT} คำ`, sub: "เล่นได้เลย ผลจะไม่ถูกบันทึกจนกว่าจะเข้าสู่ระบบ", href: "/learn/session?mode=new" }
    : learn.due > 0 ? { text: `ทวน ${learn.due} คำที่ถึงกำหนด`, sub: `จากนั้นเรียนคำใหม่ได้อีก ${learn.newLeft} คำวันนี้`, href: "/learn/session?mode=due" }
    : learn.newLeft > 0 ? { text: `เรียนคำใหม่ ${learn.newLeft} คำ`, sub: "ไม่มีคำค้างทวนวันนี้", href: "/learn/session?mode=new" }
    : null;
  return (
    <section className="card flex flex-wrap items-center justify-between gap-4 p-5" aria-labelledby="review-title">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-(--ac-gold-soft) text-(--ac-gold-ink)"><LayersIcon className="size-5" aria-hidden /></span>
        <div className="min-w-0">
          <h2 id="review-title" className="font-semibold text-(--ac-heading)">{action ? action.text : "ทวน Flashcards ครบแล้ววันนี้"}</h2>
          <p className="text-sm text-(--ac-muted)">{action ? action.sub : "พรุ่งนี้คำที่ถึงรอบจะกลับมาให้ทวน"}</p>
        </div>
      </div>
      {action ? (
        <Link href={action.href} className="btn-ghost od-press">เริ่ม <ArrowRightIcon className="size-4" aria-hidden /></Link>
      ) : (
        <Link href="/learn" className="btn-ghost od-press">ดูสถิติ</Link>
      )}
    </section>
  );
}

function Area({ href, Icon, title, sub }: { href: string; Icon: LucideIcon; title: string; sub: string }) {
  return (
    <Link href={href} className="card od-lift flex min-h-28 flex-col gap-2 p-4 hover:border-(--ac-navy)/30 sm:p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-(--ac-gold-soft) text-(--ac-gold-ink)"><Icon className="size-5" aria-hidden /></span>
      <span className="font-semibold text-(--ac-heading)">{title}</span>
      <span className="text-xs leading-5 text-(--ac-muted)">{sub}</span>
    </Link>
  );
}