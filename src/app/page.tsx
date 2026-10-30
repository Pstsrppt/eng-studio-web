import {
  ArrowRightIcon, BarChart3Icon, BookOpenIcon, BookOpenTextIcon, CompassIcon,
  FileTextIcon, GlobeIcon, GraduationCapIcon, HeadphonesIcon, LandmarkIcon, MessageCircleIcon, MicIcon,
  PenLineIcon, SchoolIcon, TargetIcon, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AcademicPhoto } from "@/components/academic-photo";
import { BandExplorer } from "@/components/home/band-explorer";
import { Faq } from "@/components/home/faq";
import { homeRecommendation, RoadmapStrip } from "@/components/home/roadmap-strip";
import { TestChooser } from "@/components/home/test-chooser";
import { Thai } from "@/components/home/thai";
import { LESSONS } from "@/content";
import { courseCompletion, stageOfLesson, stageProgress } from "@/content/stages";
import { getLessonBest, getPlacements, getUser } from "@/lib/data";
import { nextLesson, placedLevel } from "@/lib/next-lesson";

/** Home, on the Academic Studio theme (scoped by .theme-academic; other pages keep their own look). */
export default function HomePage() {
  return (
    <div className="theme-academic page-bleed bg-(--ac-bg) text-(--ac-ink)">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-6 px-4 pb-32 sm:px-6 lg:gap-8 lg:px-10 lg:pb-16 2xl:px-12">
        <Hero />
        <Suspense fallback={<RoadmapStrip stages={stageProgress({})} recommended={null} />}>
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
          subtitle="Choose a band to see what it tends to mean in practice and what to work on next.">
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
  { Icon: BookOpenIcon, text: "Grammar & vocabulary" },
  { Icon: TargetIcon, text: "Trackable progress" },
  { Icon: GlobeIcon, text: "Skills for study, work and life" },
];

function Hero() {
  return (
    <section className="relative flex flex-col lg:min-h-[540px] lg:justify-center" aria-labelledby="home-title">
      {/* From 30% to the right edge of the screen; an ivory wash joins the photo to the text side. */}
      <div className="relative -mx-4 h-56 sm:-mx-6 sm:h-72 lg:absolute lg:inset-y-0 lg:right-[calc((100%_-_100vw)/2)] lg:left-[30%] lg:mx-0 lg:h-auto">
        <AcademicPhoto name="hero-study" alt="ห้องเรียนสว่างแบบวิชาการ แสงธรรมชาติ หนังสือและโต๊ะไม้" icon={SchoolIcon} priority className="size-full object-[62%_center] lg:object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,var(--ac-bg)_100%)] lg:bg-[linear-gradient(90deg,var(--ac-bg)_0%,color-mix(in_srgb,var(--ac-bg)_92%,transparent)_14%,color-mix(in_srgb,var(--ac-bg)_55%,transparent)_28%,transparent_42%)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 hidden h-24 bg-[linear-gradient(180deg,transparent,var(--ac-bg))] lg:block" aria-hidden />
      </div>
      <div className="relative z-10 flex max-w-[780px] flex-col gap-6 pt-4 pb-2 lg:py-14">
        <h1 id="home-title" className="ac-serif text-[38px] leading-[1.08] font-bold tracking-[-0.015em] text-(--ac-navy) sm:text-[50px] lg:text-[54px] xl:text-[64px] xl:whitespace-nowrap">
          Learn English with Clarity.<br />
          <span className="text-(--ac-gold-ink)">Reach Your IELTS Goal.</span>
        </h1>
        <p className="max-w-[36rem] text-[17px] leading-[1.6] text-(--ac-body) sm:text-[19px]">
          Structured lessons. Real-world practice. Clear progress.{" "}<br className="hidden sm:block" />
          Build the English foundation your IELTS preparation needs.
        </p>
                <div className="flex flex-wrap gap-3">
          <Link href="/grammar/1-1" className="inline-flex items-center gap-2 rounded-lg bg-(--ac-navy) px-6 py-3.5 text-[15px] font-semibold text-white shadow-(--ac-shadow) transition hover:bg-(--ac-navy-2)">
            Start Learning Free <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
          <Link href="/roadmap" className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-(--ac-navy) bg-card px-6 py-3.5 text-[15px] font-semibold text-(--ac-navy) transition hover:bg-(--ac-gold-soft)">
            Explore Roadmap
          </Link>
        </div>
        <p className="-mt-2 text-[14px] leading-6 text-(--ac-body)">ทดลองเรียนได้โดยไม่ต้องเข้าสู่ระบบ สมัครฟรีเมื่ออยากบันทึกความคืบหน้า</p>
        <ul className="grid grid-cols-1 gap-2.5 pt-3 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-3">
          {HIGHLIGHTS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-full bg-card/85 py-1.5 pr-4 pl-1.5 shadow-[0_6px_18px_-12px_rgb(var(--od-shadow-rgb)/0.45)] ring-1 ring-(--ac-line)/70 backdrop-blur-sm">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-(--ac-gold-soft) text-(--ac-gold)"><Icon className="size-5" aria-hidden /></span>
              <span className="text-[14px] leading-[1.3] font-medium text-(--ac-ink)">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function RoadmapWithProgress() {
  const user = await getUser();
  if (!user) return <RoadmapStrip stages={stageProgress({})} recommended={null} />;
  const [best, placements] = await Promise.all([getLessonBest(), getPlacements()]);
  const stages = stageProgress(best);
  // Mark the stage of the lesson the Continue rule recommends, and say why. Stage statuses (done, todo) are unchanged:
  // a recommendation past Stage 1 or 2 never marks those stages as passed.
  const placed = placedLevel(placements[0]?.level);
  return <RoadmapStrip stages={stages} recommended={homeRecommendation(nextLesson(LESSONS, best, placed), placed)} signedIn />;
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
      <div className="on-dark relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-(--ac-dark) p-7 text-white md:col-span-2 lg:p-8 xl:col-span-1">
        <WorldDots />
        <span className="relative h-0.5 w-10 bg-(--ac-gold-bright)" aria-hidden />
        <h2 id="what-title" className="ac-serif relative text-[32px] leading-tight font-bold">What is IELTS?</h2>
        <p className="relative max-w-[30rem] text-[15px] leading-7 text-on-dark">
          IELTS (International English Language Testing System) วัดภาษาอังกฤษ 4 ทักษะ ผลออกเป็น Band 0–9
          ใช้ยื่นเรียนต่อ ทำงาน และย้ายถิ่นฐานในหลายประเทศ
        </p>
        <Link href="/ielts" className="relative inline-flex w-fit items-center gap-2 rounded-md bg-(--ac-gold-bright) px-4 py-2.5 text-sm font-semibold text-(--ac-dark) transition hover:bg-accent-on-dark-hover">
          Learn More About IELTS <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
        <ul className="relative mt-auto grid grid-cols-1 gap-4 pt-2 text-[14px] leading-5 text-on-dark sm:grid-cols-3">
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
            <span className="absolute -top-6 left-4 grid size-12 place-items-center rounded-full border border-(--ac-line) bg-card text-(--ac-navy) shadow-sm">
              <c.Icon className="size-5" aria-hidden />
            </span>
            <h3 className="ac-serif text-[22px] font-bold text-(--ac-heading)">{c.name}</h3>
            <p className="text-[14.5px] leading-[1.5] text-(--ac-body)">{c.text}</p>
            {/* No lessons for each skill yet: the link shows what Stage 04 has now and what's coming. */}
            <Link href="/roadmap?stage=skills" className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[15px] font-semibold text-(--ac-navy) hover:text-(--ac-gold-ink)">
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
  const overall = courseCompletion(best);
  const level = placements[0]?.level;
  // The same Continue rule as /today and /study.
  const next = nextLesson(LESSONS, best, placedLevel(level));
  const stage = next.kind === "lesson" ? stageOfLesson(next.lesson.id)?.stage : undefined;
  return (
    <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-(--ac-line) bg-(--ac-surface) p-6 shadow-(--ac-shadow)" aria-labelledby="continue-title">
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-[0.22em] text-(--ac-gold-ink)">YOUR PROGRESS</p>
        <h2 id="continue-title" className="ac-serif mt-1 text-2xl font-bold text-(--ac-heading)">
          {next.kind === "grammar-complete" ? "ผ่าน Grammar ครบทุกบทแล้ว" : stage ? `Stage ${String(stage.n).padStart(2, "0")} · ${stage.title}` : "เรียนต่อ"}
        </h2>
        <p className="mt-1 text-sm text-(--ac-muted)">
          ผ่านแล้ว {overall.done} จาก {overall.total} บท ({overall.percent}%)
          {level ? ` · ระดับจากการสอบวัดระดับ: ${level === "pre-A1" ? "ก่อน A1" : level} (CEFR ไม่ใช่ Band IELTS)` : " · ยังไม่ได้สอบวัดระดับ"}
        </p>
      </div>
      {next.kind === "lesson" ? (
        <Link href={`/grammar/${next.lesson.id}`} data-next-lesson={next.lesson.id} className="inline-flex items-center gap-2 rounded-lg bg-(--ac-navy) px-5 py-3 text-sm font-semibold text-white hover:bg-(--ac-navy-2)">
          Continue: {next.lesson.title} <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      ) : (
        <Link href="/study" className="inline-flex items-center gap-2 rounded-lg bg-(--ac-navy) px-5 py-3 text-sm font-semibold text-white hover:bg-(--ac-navy-2)">
          ไปหน้าเรียน <ArrowRightIcon className="size-4" aria-hidden />
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
        <p className="font-mono text-[11px] tracking-[0.22em] text-(--ac-gold-ink)">{eyebrow}</p>
        <h2 id={`${id}-title`} className="ac-serif mt-2 text-[30px] leading-tight font-bold text-(--ac-heading) sm:text-[38px]">{title}</h2>
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
        <li key={step.n} className="relative flex flex-col gap-4 rounded-2xl border border-(--ac-line) bg-card p-6 shadow-(--ac-shadow) lg:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-[54px] shrink-0 place-items-center rounded-full border border-(--ac-line) bg-(--ac-bg) text-(--ac-navy)"><step.Icon className="size-6" strokeWidth={1.6} aria-hidden /></span>
            <span className="font-mono text-sm tracking-[0.2em] text-(--ac-gold-ink)">STEP {step.n}</span>
          </div>
          <h3 className="ac-serif text-[22px] font-bold text-(--ac-heading)">{step.title}</h3>
          <p className="text-[15px] leading-7 text-(--ac-body)">{step.text}<Thai className="text-sm leading-6 text-(--ac-muted)">{step.th}</Thai></p>
          <Link href={step.href} className="mt-auto inline-flex w-fit items-center gap-1.5 pt-1 text-[15px] font-semibold text-(--ac-navy) hover:text-(--ac-gold-ink)">
            {step.cta} <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </li>
      ))}
    </ol>
  );
}

function FinalCta() {
  return (
    // A light closing band: Home keeps its dark panels for What is IELTS? and the Band Explorer only.
    <section aria-labelledby="final-title" className="relative mt-10 overflow-hidden rounded-3xl border border-(--ac-line) bg-(--ac-alt) px-6 py-12 text-center sm:px-10 lg:mt-16 lg:py-16">
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
        <span className="h-0.5 w-12 bg-(--ac-gold)" aria-hidden />
        <h2 id="final-title" className="ac-serif text-[32px] leading-tight font-bold text-(--ac-heading) sm:text-[42px]">Your English Journey Starts Here.</h2>
        <p className="text-[17px] leading-7 text-(--ac-body)">
          Build stronger skills, understand your progress, and take the next step toward your IELTS goal.
          <Thai className="mt-1 text-[15px] text-(--ac-muted)">สร้างทักษะให้แข็งแรง เข้าใจความคืบหน้าของตัวเอง และก้าวต่อไปสู่เป้าหมาย IELTS</Thai>
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/grammar/1-1" className="inline-flex items-center gap-2 rounded-lg bg-(--ac-navy) px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-(--ac-navy-2)">
            Start Learning Free <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
          <Link href="/roadmap" className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-(--ac-navy) bg-card px-6 py-3.5 text-[15px] font-semibold text-(--ac-navy) transition hover:bg-(--ac-gold-soft)">
            Explore Roadmap
          </Link>
        </div>
      </div>
    </section>
  );
}
