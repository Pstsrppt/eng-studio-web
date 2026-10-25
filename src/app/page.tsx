import {
  ArrowRightIcon, BarChart3Icon, BookOpenIcon, BookOpenTextIcon, CheckIcon, ChevronRightIcon, ClipboardListIcon, CompassIcon,
  FileTextIcon, FlagIcon, GlobeIcon, GraduationCapIcon, HeadphonesIcon, LandmarkIcon, LayersIcon, MessageCircleIcon, MicIcon,
  PenLineIcon, SchoolIcon, TargetIcon, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AcademicPhoto } from "@/components/academic-photo";
import { BandExplorer } from "@/components/home/band-explorer";
import { Faq } from "@/components/home/faq";
import { TestChooser } from "@/components/home/test-chooser";
import { Thai } from "@/components/home/thai";
import { courseCompletion, stageProgress, type StageProgress } from "@/content/stages";
import { getLessonBest, getPlacements, getUser } from "@/lib/data";

/** Home, on the Academic Studio theme (scoped by .theme-academic; other pages keep their own look). */
export default function HomePage() {
  return (
    <div className="theme-academic page-bleed bg-(--ac-bg) text-(--ac-ink)">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-6 px-4 pb-32 sm:px-6 lg:gap-8 lg:px-10 lg:pb-16 2xl:px-12">
        <Hero />
        <Suspense fallback={<Roadmap stages={stageProgress({})} current={null} />}>
          <RoadmapWithProgress />
        </Suspense>
        <Skills />
        <Suspense fallback={null}>
          <Continue />
        </Suspense>
        <Section id="tests" eyebrow="IELTS ACADEMIC OR GENERAL" title="Which IELTS Test Is Right for You?"
          subtitle="Understand the differences and choose the test that fits your goals.">
          <TestChooser />
        </Section>
        <Section id="bands" eyebrow="BAND SCORES" title="Know Your Band. Plan Your Progress."
          subtitle="Choose a band to read what it means on the official scale and what to work on next.">
          <BandExplorer />
        </Section>
        <Section id="how" eyebrow="HOW IT WORKS" title="Your Learning Journey, Made Simple.">
          <HowItWorks />
        </Section>
        <Section id="faq" eyebrow="FAQ" title="Everything You Need to Know">
          <Faq />
        </Section>
        <FinalCta />
      </div>
    </div>
  );
}

const HIGHLIGHTS: { Icon: LucideIcon; text: string }[] = [
  { Icon: BarChart3Icon, text: "Personalized learning path" },
  { Icon: BookOpenIcon, text: "Exam-format practice" },
  { Icon: TargetIcon, text: "Trackable progress" },
  { Icon: GlobeIcon, text: "Skills for study, work and life" },
];

function Hero() {
  return (
    <section className="relative flex flex-col lg:min-h-[540px] lg:justify-center" aria-labelledby="home-title">
      {/* From 30% to the right edge of the screen; an ivory wash joins the photo to the text side. */}
      <div className="relative -mx-4 h-56 sm:-mx-6 sm:h-72 lg:absolute lg:inset-y-0 lg:right-[calc((100%_-_100vw)/2)] lg:left-[30%] lg:mx-0 lg:h-auto">
        <AcademicPhoto name="hero-study" alt="ห้องเรียนสว่างแบบวิชาการ แสงธรรมชาติ หนังสือและโต๊ะไม้" icon={SchoolIcon} priority className="size-full object-[62%_center] lg:object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,var(--ac-bg)_100%)] lg:bg-[linear-gradient(90deg,var(--ac-bg)_0%,rgba(250,248,243,0.92)_14%,rgba(250,248,243,0.55)_28%,rgba(250,248,243,0)_42%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 hidden h-24 bg-[linear-gradient(180deg,transparent,var(--ac-bg))] lg:block" aria-hidden />
      </div>
      <div className="relative z-10 flex max-w-[780px] flex-col gap-6 pt-4 pb-2 lg:py-14">
        <h1 id="home-title" className="ac-serif text-[38px] leading-[1.08] font-bold tracking-[-0.015em] text-(--ac-navy) sm:text-[50px] lg:text-[54px] xl:text-[64px] xl:whitespace-nowrap">
          Learn English with Clarity.<br />
          <span className="text-(--ac-gold)">Reach Your IELTS Goal.</span>
        </h1>
        <p className="max-w-[36rem] text-[17px] leading-[1.6] text-(--ac-body) sm:text-[19px]">
          Structured lessons. Real-world practice. Clear progress.{" "}<br className="hidden sm:block" />
          Everything you need to confidently reach your target band.
        </p>
                <div className="flex flex-wrap gap-3">
          <Link href="/placement" className="inline-flex items-center gap-2 rounded-lg bg-(--ac-navy) px-6 py-3.5 text-[15px] font-semibold text-white shadow-(--ac-shadow) transition hover:bg-(--ac-navy-2)">
            Start Placement Test <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
          <Link href="/roadmap" className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-(--ac-navy) bg-white px-6 py-3.5 text-[15px] font-semibold text-(--ac-navy) transition hover:bg-(--ac-gold-soft)">
            See Your Roadmap
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-4 pt-3 sm:grid-cols-4">
          {HIGHLIGHTS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-(--ac-gold-soft) text-(--ac-gold)"><Icon className="size-[22px]" aria-hidden /></span>
              <span className="text-[14px] leading-[1.35] text-(--ac-body)">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Icons and one-line English summaries for the existing stages (names and order come from stages.ts). */
const STAGE_LOOK: Record<string, { Icon: LucideIcon; short: string }> = {
  ielts: { Icon: GraduationCapIcon, short: "Know the test, its parts and its bands" },
  foundation: { Icon: LandmarkIcon, short: "Build core English skills" },
  grammar: { Icon: LayersIcon, short: "Grow your word bank and grammar" },
  skills: { Icon: HeadphonesIcon, short: "Listen, read, write and speak" },
  strategy: { Icon: CompassIcon, short: "Master key exam strategies" },
  practice: { Icon: ClipboardListIcon, short: "Practise and simulate the exam" },
  summit: { Icon: FlagIcon, short: "Be ready for your IELTS goal" },
};

async function RoadmapWithProgress() {
  const user = await getUser();
  if (!user) return <Roadmap stages={stageProgress({})} current={null} />;
  const stages = stageProgress(await getLessonBest());
  return <Roadmap stages={stages} current={stages.find((s) => s.status === "current")?.id ?? null} />;
}

function Roadmap({ stages, current }: { stages: StageProgress[]; current: string | null }) {
  return (
    <section className="grid gap-7 rounded-2xl border border-(--ac-line) bg-(--ac-surface) p-6 shadow-(--ac-shadow) lg:grid-cols-[270px_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-10 lg:py-9" aria-labelledby="road-title">
      <div>
        <h2 id="road-title" className="ac-serif text-[28px] leading-[1.15] font-bold text-(--ac-navy)">Your 7-Stage<br className="hidden lg:block" /> IELTS Roadmap</h2>
        <p className="mt-3 text-[15px] leading-6 text-(--ac-muted)">A clear path from your current level to your target band.</p>
      </div>
      <ol className="-mx-2 flex snap-x gap-1 overflow-x-auto px-2 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0 lg:pb-0">
        {stages.map((s, i) => {
          const look = STAGE_LOOK[s.id];
          const active = current ? s.id === current : i === 0;
          const done = s.status === "done";
          return (
            <li key={s.id} className="relative flex w-[148px] shrink-0 snap-start lg:w-auto">
              {i < stages.length - 1 && (
                <span className="absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] hidden items-center lg:flex" aria-hidden>
                  <span className="h-px flex-1 bg-(--ac-line)" />
                  <ChevronRightIcon className="size-3.5 text-(--ac-muted)" />
                  <span className="h-px flex-1 bg-(--ac-line)" />
                </span>
              )}
              <Link href={`/roadmap?stage=${s.id}`} aria-current={active ? "step" : undefined}
                className="group flex w-full flex-col items-center gap-3 rounded-xl px-1.5 py-1 text-center">
                <span className={"relative grid size-16 place-items-center rounded-full transition " +
                  (active ? "bg-(--ac-navy) text-white shadow-[0_0_0_6px_var(--ac-gold-soft)]" : "bg-[#f4f1ea] text-(--ac-navy) group-hover:bg-(--ac-gold-soft)")}>
                  {active ? <span className="ac-serif text-2xl font-bold">{s.n}</span> : <look.Icon className="size-7" strokeWidth={1.5} aria-hidden />}
                  {done && <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-[#2e7d5b] text-white"><CheckIcon className="size-3" aria-label="ผ่านแล้ว" /></span>}
                  {active && !done && <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-(--ac-gold-bright) text-[10px] font-bold text-(--ac-navy)">{s.n}</span>}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] leading-tight font-semibold text-(--ac-navy)">{s.title}</span>
                  <span className="text-[13px] leading-[1.4] text-(--ac-muted)">{look.short}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const SKILL_CARDS: { name: string; Icon: LucideIcon; photo: string; alt: string; photoIcon: LucideIcon; text: string }[] = [
  { name: "Listening", Icon: HeadphonesIcon, photo: "skill-listening", alt: "หูฟังบนโต๊ะเรียน", photoIcon: HeadphonesIcon, text: "Train your ear for real conversations, lectures and everyday situations." },
  { name: "Reading", Icon: BookOpenTextIcon, photo: "skill-reading", alt: "กองหนังสือและเอกสารอ่าน", photoIcon: BookOpenIcon, text: "Build speed, accuracy and critical reading skills." },
  { name: "Writing", Icon: PenLineIcon, photo: "skill-writing", alt: "สมุดและปากกาบนโต๊ะเขียน", photoIcon: FileTextIcon, text: "Learn how to plan, structure and write clear essays and reports." },
  { name: "Speaking", Icon: MessageCircleIcon, photo: "skill-speaking", alt: "ไมโครโฟนสำหรับฝึกพูด", photoIcon: MicIcon, text: "Build confidence and fluency for real-life and exam situations." },
];

function Skills() {
  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,2.3fr)_repeat(4,minmax(0,1fr))]" aria-labelledby="what-title">
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-(--ac-navy) p-7 text-white md:col-span-2 lg:p-8 xl:col-span-1">
        <WorldDots />
        <span className="relative h-0.5 w-10 bg-(--ac-gold-bright)" aria-hidden />
        <h2 id="what-title" className="ac-serif relative text-[32px] leading-tight font-bold">What is IELTS?</h2>
        <p className="relative max-w-[30rem] text-[15px] leading-7 text-[#dbe3ee]">
          IELTS (International English Language Testing System) วัดภาษาอังกฤษ 4 ทักษะ ผลออกเป็น Band 0–9
          ใช้ยื่นเรียนต่อ ทำงาน และย้ายถิ่นฐานในหลายประเทศ
        </p>
        <Link href="/ielts" className="relative inline-flex w-fit items-center gap-2 rounded-md bg-(--ac-gold-bright) px-4 py-2.5 text-sm font-semibold text-(--ac-navy) transition hover:bg-[#ecc580]">
          Learn More About IELTS <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
        <ul className="relative mt-auto grid grid-cols-1 gap-4 pt-2 text-[14px] leading-5 text-[#dbe3ee] sm:grid-cols-3">
          <li className="flex items-center gap-3"><LandmarkIcon className="size-8 shrink-0 text-white" strokeWidth={1.4} aria-hidden />4 skills, Band 0–9</li>
          <li className="flex items-center gap-3"><GlobeIcon className="size-8 shrink-0 text-white" strokeWidth={1.4} aria-hidden />For study, work and migration</li>
          <li className="flex items-center gap-3"><GraduationCapIcon className="size-8 shrink-0 text-white" strokeWidth={1.4} aria-hidden />Academic or General Training</li>
        </ul>
      </div>
      {SKILL_CARDS.map((c) => (
        <article key={c.name} className="flex flex-col overflow-hidden rounded-2xl border border-(--ac-line) bg-(--ac-surface) shadow-(--ac-shadow)">
          <div className="p-2 pb-0">
            <AcademicPhoto name={c.photo} alt={c.alt} icon={c.photoIcon} className="aspect-[16/8] w-full rounded-t-xl md:aspect-[16/9] xl:aspect-[16/9]" />
          </div>
          <div className="relative flex flex-1 flex-col gap-2 px-5 pt-9 pb-5">
            <span className="absolute -top-6 left-4 grid size-12 place-items-center rounded-full border border-(--ac-line) bg-white text-(--ac-navy) shadow-sm">
              <c.Icon className="size-5" aria-hidden />
            </span>
            <h3 className="ac-serif text-[22px] font-bold text-(--ac-navy)">{c.name}</h3>
            <p className="text-[14.5px] leading-[1.5] text-(--ac-body)">{c.text}</p>
            {/* No lessons for each skill yet: the link shows what Stage 04 has now and what's coming. */}
            <Link href="/roadmap?stage=skills" className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[15px] font-semibold text-(--ac-navy) hover:text-(--ac-gold)">
              See in Roadmap <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}

/** The faint world map in the IELTS card, drawn as a dot grid so it needs no image. */
function WorldDots() {
  // Rough continents on a 40×18 grid (1 = land).
  const rows = [
    "0000000111111000000000001111111111110000", "0001111111111110000001111111111111111000", "0011111111111100000011111111111111111100",
    "0001111111111000000111111111111111111000", "0000111111110000000011111111111111110000", "0000011111000000000001111111111111100000",
    "0000001111000000000000111111111110000000", "0000000110000000000001111111111100000000", "0000000011110000000011111101111000000000",
    "0000000011111100000011111000110000000000", "0000000001111110000001111000000000000000", "0000000000111110000000111000000011110000",
    "0000000000011100000000110000000111111000", "0000000000011000000000110000000011111000", "0000000000010000000000000000000001110000",
  ];
  return (
    <svg viewBox="0 0 40 15" className="pointer-events-none absolute top-4 right-[-4%] w-[62%] opacity-[0.13]" aria-hidden>
      {rows.flatMap((r, y) => [...r].map((c, x) => (c === "1" ? <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.32} fill="#fff" /> : null)))}
    </svg>
  );
}

async function Continue() {
  const user = await getUser();
  if (!user) return null;
  const [best, placements] = await Promise.all([getLessonBest(), getPlacements()]);
  const stages = stageProgress(best);
  const current = stages.find((s) => s.status === "current");
  const overall = courseCompletion(best);
  const level = placements[0]?.level;
  return (
    <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-(--ac-line) bg-(--ac-surface) p-6 shadow-(--ac-shadow)" aria-labelledby="continue-title">
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-[0.22em] text-(--ac-gold)">YOUR PROGRESS</p>
        <h2 id="continue-title" className="ac-serif mt-1 text-2xl font-bold text-(--ac-navy)">
          {current ? `Stage ${String(current.n).padStart(2, "0")} · ${current.title}` : "ผ่านบทเรียนครบทุกสถานีแล้ว"}
        </h2>
        <p className="mt-1 text-sm text-(--ac-muted)">
          ผ่านแล้ว {overall.done} จาก {overall.total} บท ({overall.percent}%)
          {level ? ` · ระดับจากการสอบวัดระดับ: ${level === "pre-A1" ? "ก่อน A1" : level} (CEFR ไม่ใช่ Band IELTS)` : " · ยังไม่ได้สอบวัดระดับ"}
        </p>
      </div>
      {current?.next && (
        <Link href={current.next.href} className="inline-flex items-center gap-2 rounded-lg bg-(--ac-navy) px-5 py-3 text-sm font-semibold text-white hover:bg-(--ac-navy-2)">
          Continue: {current.next.title} <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}


/** A content section below the fold: generous space above, one heading level, an optional subtitle. */
function Section({ id, eyebrow, title, subtitle, children }: { id: string; eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex scroll-mt-24 flex-col gap-7 pt-10 lg:pt-16" id={id}>
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.22em] text-(--ac-gold)">{eyebrow}</p>
        <h2 id={`${id}-title`} className="ac-serif mt-2 text-[30px] leading-tight font-bold text-(--ac-navy) sm:text-[38px]">{title}</h2>
        {subtitle && <p className="mt-3 text-[17px] leading-7 text-(--ac-body)">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

const STEPS: { n: string; title: string; text: string; th: string; cta: string; href: string; Icon: LucideIcon }[] = [
  { n: "01", title: "Discover Your Level", Icon: TargetIcon, cta: "Take Placement Test", href: "/placement",
    text: "Take the placement test to see your starting point and the areas to work on.",
    th: "ทำแบบทดสอบวัดระดับ เพื่อดูพื้นฐานของคุณและจุดที่ควรพัฒนา" },
  { n: "02", title: "Follow Your Roadmap", Icon: CompassIcon, cta: "Explore Roadmap", href: "/roadmap",
    text: "See the path from English Foundation all the way to exam preparation.",
    th: "ดูเส้นทางการเรียนตั้งแต่ English Foundation ไปจนถึงการเตรียมสอบ" },
  { n: "03", title: "Practice & Improve", Icon: BookOpenIcon, cta: "Browse Lessons", href: "/grammar",
    text: "Study grammar and vocabulary, practise each skill, and follow your progress as you go.",
    th: "เรียนไวยากรณ์และคำศัพท์ ฝึกแต่ละทักษะ และติดตามความคืบหน้าระหว่างทาง" },
];

function HowItWorks() {
  return (
    <ol className="relative grid gap-5 md:grid-cols-3">
      {/* The timeline behind the three steps on wide screens. */}
      <span className="absolute top-[42px] right-[16%] left-[16%] hidden h-px bg-[linear-gradient(90deg,var(--ac-line),var(--ac-gold-bright),var(--ac-line))] md:block" aria-hidden />
      {STEPS.map((step) => (
        <li key={step.n} className="relative flex flex-col gap-4 rounded-2xl border border-(--ac-line) bg-white p-6 shadow-(--ac-shadow) lg:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-[54px] shrink-0 place-items-center rounded-full border border-(--ac-line) bg-(--ac-bg) text-(--ac-navy)"><step.Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
            <span className="font-mono text-sm tracking-[0.2em] text-(--ac-gold)">STEP {step.n}</span>
          </div>
          <h3 className="ac-serif text-[22px] font-bold text-(--ac-navy)">{step.title}</h3>
          <p className="text-[15px] leading-7 text-(--ac-body)">{step.text}<Thai className="text-sm leading-6 text-(--ac-muted)">{step.th}</Thai></p>
          <Link href={step.href} className="mt-auto inline-flex w-fit items-center gap-1.5 pt-1 text-[15px] font-semibold text-(--ac-navy) hover:text-(--ac-gold)">
            {step.cta} <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </li>
      ))}
    </ol>
  );
}

function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="relative mt-10 overflow-hidden rounded-3xl bg-(--ac-navy) px-6 py-12 text-center text-white sm:px-10 lg:mt-16 lg:py-16">
      <WorldDots />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
        <span className="h-0.5 w-12 bg-(--ac-gold-bright)" aria-hidden />
        <h2 id="final-title" className="ac-serif text-[32px] leading-tight font-bold sm:text-[42px]">Your English Journey Starts Here.</h2>
        <p className="text-[17px] leading-7 text-[#dbe3ee]">
          Build stronger skills, understand your progress, and take the next step toward your IELTS goal.
          <Thai className="mt-1 text-[15px] text-[#b8c4d4]">สร้างทักษะให้แข็งแรง เข้าใจความคืบหน้าของตัวเอง และก้าวต่อไปสู่เป้าหมาย IELTS</Thai>
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/placement" className="inline-flex items-center gap-2 rounded-lg bg-(--ac-gold-bright) px-6 py-3.5 text-[15px] font-semibold text-(--ac-navy) transition hover:bg-[#ecc580]">
            Start Placement Test <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
          <Link href="/roadmap" className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-white/40 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-white/10">
            Explore Your Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
