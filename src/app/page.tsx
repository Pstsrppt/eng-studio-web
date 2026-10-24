import { ArrowRightIcon, CompassIcon, GaugeIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { IeltsIntro } from "@/components/ielts-intro";
import { courseCompletion, STAGES, stageProgress } from "@/content/stages";
import { getLessonBest, getPlacements, getUser } from "@/lib/data";
import { RoadmapPreview } from "./roadmap-preview";

/** The academy: what the site is for, the road to the target band, and where the learner is on it. */
export default function HomePage() {
  return (
    <div className="page-bleed on-dark bg-navy text-white">
      <Hero />
      <section aria-labelledby="road" className="relative mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-10">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold">THE ROAD TO YOUR TARGET BAND</p>
        <h2 id="road" className="mt-2 font-brand text-2xl font-semibold tracking-wide sm:text-3xl">7 สถานีสู่ Band เป้าหมาย</h2>
        <p className="mt-2 max-w-[60ch] text-mist">แตะสถานีเพื่อดูว่าเรียนอะไร แล้วเปิด Roadmap เพื่อเริ่มจากสถานีนั้น</p>
        <RoadmapPreview stages={STAGES.map(({ n, id, title, th, blurb }) => ({ n, id, title, th, blurb }))} />
      </section>
      <section aria-labelledby="progress" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 lg:px-10">
        <h2 id="progress" className="sr-only">ความคืบหน้าของคุณ</h2>
        <Suspense fallback={<div className="glass h-40 animate-pulse" />}>
          <Progress />
        </Suspense>
      </section>
      <section aria-labelledby="what" className="mx-auto max-w-6xl px-4 pt-16 pb-32 sm:px-6 lg:px-10 lg:pb-20">
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold">STAGE 01</p>
        <h2 id="what" className="mt-2 mb-6 font-brand text-2xl font-semibold tracking-wide sm:text-3xl">What is IELTS?</h2>
        <IeltsIntro headingLevel={3} />
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[min(84vh,760px)] items-end overflow-hidden lg:items-center">
      {/* The academy scene drifts very slowly; reduced-motion settings stop it (globals.css). */}
      <picture className="absolute inset-0 -z-10">
        <source media="(max-width: 700px)" srcSet="/scenes/home-900.webp" />
        <img src="/scenes/home-1600.webp" alt="" fetchPriority="high" className="hero-drift size-full object-cover object-[60%_center]" />
      </picture>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,24,43,0.92)_0%,rgba(7,24,43,0.7)_38%,rgba(7,24,43,0.05)_70%)] max-lg:bg-[linear-gradient(0deg,rgba(7,24,43,0.95)_0%,rgba(7,24,43,0.75)_45%,rgba(7,24,43,0.1)_80%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-navy" aria-hidden />
      <div className="mx-auto w-full max-w-6xl px-4 pt-40 pb-12 sm:px-6 lg:px-10 lg:py-24">
        <div className="learn-in max-w-xl">
          <p className="font-mono text-[11px] tracking-[0.35em] text-gold">IELTS ODYSSEY · A HIGHER YOU</p>
          <h1 className="mt-4 font-brand text-[40px] leading-[1.08] font-bold tracking-wide sm:text-[56px]">
            Enter the <span className="text-gold-soft">Living Academy</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#dce5ee]">
            Understand IELTS. Build your four skills. Follow a clear roadmap to your target band.
          </p>
          <p className="mt-2 text-[15px] leading-7 text-mist">
            เริ่มจากรู้จักข้อสอบ ปูพื้นภาษาอังกฤษทีละบท แล้วไต่ระดับไปทีละสถานีจนพร้อมสอบ
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/roadmap" className="btn px-6 py-3.5 text-[15px]">Start Your Journey <ArrowRightIcon className="size-4" /></Link>
            <Link href="/roadmap?view=list" className="btn-dark px-6 py-3.5 text-[15px]"><CompassIcon className="size-4" /> Explore Roadmap</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

async function Progress() {
  const [user, best, placements] = await Promise.all([getUser(), getLessonBest(), getPlacements()]);
  if (!user) {
    return (
      <div className="glass flex flex-wrap items-center justify-between gap-5 p-6">
        <div className="max-w-xl">
          <p className="font-brand text-xl font-semibold tracking-wide text-gold-soft">Start with an assessment</p>
          <p className="mt-1 text-mist">ไม่แน่ใจว่าควรเริ่มตรงไหน? สอบวัดระดับ 5–8 นาที แล้วเว็บจะแนะนำสถานีและบทที่เหมาะกับคุณ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/placement" className="btn"><GaugeIcon className="size-4" /> สอบวัดระดับ</Link>
          <Link href="/login" className="btn-dark">เข้าสู่ระบบเพื่อบันทึกความคืบหน้า</Link>
        </div>
      </div>
    );
  }
  const stages = stageProgress(best);
  const current = stages.find((s) => s.status === "current") ?? stages.find((s) => s.status === "todo");
  const overall = courseCompletion(best);
  const level = placements[0]?.level;
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="glass flex flex-col gap-4 p-6">
        <p className="font-mono text-[11px] tracking-[0.25em] text-gold">CONTINUE YOUR JOURNEY</p>
        {current ? (
          <>
            <div>
              <p className="text-sm text-mist">Stage {String(current.n).padStart(2, "0")} / 07</p>
              <p className="font-brand text-2xl font-semibold tracking-wide">{current.title}</p>
              <p className="text-sm text-mist">{current.th} · ผ่านแล้ว {current.done} จาก {current.total} บท</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label={`ความคืบหน้า ${current.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={current.percent}>
              <div className="h-full rounded-full bg-gold" style={{ width: `${current.percent}%` }} />
            </div>
            {current.next && (
              <Link href={current.next.href} className="btn self-start">Continue: {current.next.title} <ArrowRightIcon className="size-4" /></Link>
            )}
          </>
        ) : (
          <p>ผ่านบทเรียนครบทุกสถานีแล้ว เยี่ยมมาก ทบทวนต่อได้ที่ Roadmap</p>
        )}
      </div>
      <dl className="glass grid grid-cols-2 gap-4 p-6">
        <div>
          <dt className="text-xs text-mist">บทเรียนที่ผ่าน</dt>
          <dd className="font-brand text-3xl font-bold text-gold-soft tabular">{overall.percent}%</dd>
          <dd className="text-xs text-mist">{overall.done} จาก {overall.total} บท</dd>
        </div>
        <div>
          <dt className="text-xs text-mist">ระดับจากการสอบวัดระดับ</dt>
          <dd className="font-brand text-3xl font-bold text-gold-soft">{level ? (level === "pre-A1" ? "<A1" : level) : "—"}</dd>
          <dd className="text-xs text-mist">{level ? "ระดับ CEFR ไม่ใช่ Band IELTS" : <Link href="/placement" className="underline">ยังไม่ได้สอบ</Link>}</dd>
        </div>
        <p className="col-span-2 text-xs leading-5 text-mist">Band IELTS จริงได้จากการสอบที่ศูนย์สอบเท่านั้น เว็บนี้ยังไม่ประเมิน Band ให้</p>
      </dl>
    </div>
  );
}
