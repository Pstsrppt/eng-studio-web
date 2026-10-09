import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { PlanCheck } from "@/components/plan-check";
import { Sentence } from "@/components/sentence";
import { LESSONS, VERBS, WORDS, type Lesson } from "@/content";
import { bangkokToday, getDashboard, getUser } from "@/lib/data";

export default function TodayPage() {
  return (
    <Suspense fallback={<TodaySkeleton />}>
      <Today />
    </Suspense>
  );
}

function TodaySkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-10 w-2/3 rounded-lg bg-line" />
      <div className="h-64 rounded-xl bg-line/60" />
      <div className="h-40 rounded-xl bg-line/60" />
    </div>
  );
}

type Dash = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;

async function Today() {
  // The plan depends on today's date, so render on every request.
  await connection();
  const [user, dash] = await Promise.all([getUser(), getDashboard()]);
  const today = dash?.today ?? bangkokToday();
  const best = dash?.best ?? {};
  const current = LESSONS.find((l) => !best[l.id]?.passed) ?? LESSONS[LESSONS.length - 1];
  const passedCount = LESSONS.filter((l) => best[l.id]?.passed).length;
  const dueTotal = dash ? dash.due.word + dash.due.verb : 0;
  const reviewDone = Boolean(dash && (dash.reviewsToday >= 10 || (dueTotal === 0 && dash.reviewsToday > 0)));
  const dateLabel = new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Bangkok" });

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
      <header className="flex flex-wrap items-end justify-between gap-3 xl:col-span-2">
        <div>
          <p className="text-sm text-muted">{dateLabel}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight lg:text-[34px]">
            {passedCount === 0 ? "เริ่มบทแรกกันเลย" : `เรียนต่อจากบทที่ ${LESSONS.indexOf(current) + 1}`}
          </h1>
        </div>
        {!user && (
          <Link href="/login" className="btn">เข้าสู่ระบบเพื่อบันทึกความคืบหน้า</Link>
        )}
      </header>

      <div className="flex min-w-0 flex-col gap-7">
        <ContinueCard lesson={current} best={best[current.id]?.best} />

        <section>
          <SectionHead title="แผน 60 นาทีวันนี้" note="ครบ 3 ใน 4 นับเป็นวันที่เรียน" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Task tone="text-brand" kind="ทวน" done={reviewDone} title="การ์ดคำศัพท์และ V1-V2-V3 ที่ถึงรอบ"
              meta={dash ? `ถึงรอบ ${dueTotal} ใบ · ทวนแล้ว ${dash.reviewsToday}` : "10 ใบต่อวัน"} href="/vocab" cta="ทวน" />
            <Task tone="text-subj" kind="ตัวภาษา" done={Boolean(dash?.passedToday)} title={`Grammar บทที่ ${LESSONS.indexOf(current) + 1} ให้ผ่าน 80%`}
              meta={current.title} href={`/grammar/${current.id}`} cta="เรียน" />
            <Task tone="text-obj" kind="รับเข้า" check={<PlanCheck id="input" day={today} label="ฟังหรืออ่าน" />}
              title="ฟังหรืออ่านเรื่องสั้นที่เข้าใจเกือบหมด" meta="VOA ระดับ 1 หรือ BBC" href="https://learningenglish.voanews.com/" cta="เปิด VOA" external />
            <Task tone="text-verb" kind="ส่งออก" check={<PlanCheck id="output" day={today} label="เขียน" />}
              title="เขียน 3–5 ประโยคเรื่องงานเมื่อวาน" meta={current.homework} />
          </div>
        </section>

        <section>
          <SectionHead title="โมดูล" />
          <div className="grid gap-3 md:grid-cols-3">
            <Module href="/grammar" glyph="Gr" tone="bg-subj-bg text-subj" title="Grammar" note={`ผ่าน ${passedCount} จาก ${LESSONS.length} บท`} value={passedCount / LESSONS.length} />
            <Module href="/verbs" glyph="V3" tone="bg-verb-bg text-verb" title="V1-V2-V3" note={`จำได้ ${dash?.known.verb ?? 0} จาก ${VERBS.length} คำ`} value={(dash?.known.verb ?? 0) / VERBS.length} />
            <Module href="/vocab" glyph="Wd" tone="bg-obj-bg text-obj" title="คำศัพท์" note={`จำได้ ${dash?.known.word ?? 0} จาก ${WORDS.length} คำ`} value={(dash?.known.word ?? 0) / WORDS.length} />
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-4">
        {dash ? <Rail dash={dash} /> : <GuestRail />}
      </aside>
    </div>
  );
}

const ROLE_TONES = ["bg-subj-bg text-subj", "bg-verb-bg text-verb", "bg-obj-bg text-obj"];

function ContinueCard({ lesson, best }: { lesson: Lesson; best?: number }) {
  const parts = lesson.formula.split("+").map((p) => p.trim());
  const [en, th] = lesson.examples[0] ?? ["", ""];
  return (
    <section className="card grid gap-6 p-6 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 flex-col gap-4">
        <p className="eyebrow">Grammar · {lesson.level} · บทที่ {LESSONS.indexOf(lesson) + 1} จาก {LESSONS.length}</p>
        <h2 className="-mt-2 text-2xl font-bold leading-snug">{lesson.title}</h2>
        <p className="max-w-[56ch] leading-7 text-muted">{lesson.why}</p>
        <div className="flex flex-wrap gap-1.5">
          {parts.map((p, i) => (
            <span key={i} className={"rounded-md px-2.5 py-1 font-mono text-xs " + (parts.length > 1 ? ROLE_TONES[i] ?? "bg-paper text-muted" : "bg-ink text-white")}>
              {p}
            </span>
          ))}
        </div>
        {en && <div className="rounded-lg bg-paper px-4 py-3"><Sentence en={en} th={th} size="lg" /></div>}
        <div className="flex flex-wrap gap-2.5">
          <Link href={`/grammar/${lesson.id}`} className="btn">{best ? "เรียนต่อ" : "เริ่มบทนี้"}</Link>
          <Link href="/grammar" className="btn-ghost">ดูทุกบท</Link>
        </div>
      </div>
      {best !== undefined && (
        <div className="grid size-28 place-items-center self-center rounded-full"
          style={{ background: `conic-gradient(var(--color-brand) 0 ${best * 3.6}deg, var(--color-brand-soft) 0)` }}>
          <div className="grid size-[88px] place-items-center rounded-full bg-surface text-center text-[11px] text-muted">
            <span><b className="block font-display text-2xl text-ink tabular">{best}%</b>คะแนนสูงสุด</span>
          </div>
        </div>
      )}
    </section>
  );
}

function SectionHead({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-[17px] font-bold">{title}</h2>
      {note && <span className="text-xs text-brand">{note}</span>}
    </div>
  );
}

function Task(props: {
  tone: string; kind: string; title: string; meta: string; done?: boolean; check?: ReactNode;
  href?: string; cta?: string; external?: boolean;
}) {
  const { tone, kind, title, meta, done, check, href, cta, external } = props;
  return (
    <div className={"flex min-h-40 flex-col gap-2.5 rounded-[10px] border p-4 " + (done ? "border-[#c6ddd2] bg-brand-soft" : "border-line bg-surface")}>
      <div className="flex items-center justify-between">
        {check ?? (
          <span aria-label={done ? "ทำแล้ว" : "ยังไม่ได้ทำ"}
            className={"grid size-5 place-items-center rounded-[5px] border-[1.5px] text-[11px] text-white " + (done ? "border-brand bg-brand" : "border-[#b9c6c0]")}>
            {done ? "✓" : ""}
          </span>
        )}
        <span className={"font-mono text-[10.5px] tracking-[0.08em] " + tone}>{kind} · 15 นาที</span>
      </div>
      <h3 className="font-sans text-[14.5px] font-semibold leading-snug">{title}</h3>
      <p className="line-clamp-2 text-xs text-muted">{meta}</p>
      {href && (
        <Link href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}
          className="mt-auto self-start text-sm font-semibold text-brand hover:underline">
          {cta} →
        </Link>
      )}
    </div>
  );
}

function Module({ href, glyph, tone, title, note, value }: { href: string; glyph: string; tone: string; title: string; note: string; value: number }) {
  return (
    <Link href={href} className="card flex items-center gap-3.5 p-4 transition hover:border-brand">
      <span className={"grid size-11 shrink-0 place-items-center rounded-[9px] font-display text-[15px] font-bold " + tone}>{glyph}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold">{title}</span>
        <span className="block text-xs text-muted">{note}</span>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[#ebefec]">
          <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.round(value * 100)}%` }} />
        </span>
      </span>
    </Link>
  );
}

function Rail({ dash }: { dash: Dash }) {
  const days = Array.from({ length: 42 }, (_, i) => bangkokToday(i - 41));
  const shade = (n = 0) => (n === 0 ? "bg-[#e9eeea]" : n < 5 ? "bg-[#b9d8cb]" : n < 15 ? "bg-[#5fa488]" : "bg-brand");
  return (
    <>
      <section className="card p-5">
        <h2 className="mb-3.5 font-sans text-[15px] font-semibold">ความสม่ำเสมอ 6 สัปดาห์</h2>
        <div className="grid grid-cols-14 gap-1" role="img" aria-label={`เรียน ${dash.studyDays} วันใน 6 สัปดาห์`}>
          {days.map((d) => (
            <span key={d} title={`${d}: ${dash.activity[d] ?? 0} ครั้ง`} className={"aspect-square rounded-[3px] " + shade(dash.activity[d])} />
          ))}
        </div>
        <dl className="mt-4 grid grid-cols-3 text-xs text-muted">
          <div><dd className="font-display text-2xl text-ink tabular">{dash.streak}</dd><dt>วันติดกัน</dt></div>
          <div><dd className="font-display text-2xl text-ink tabular">{dash.studyDays}</dd><dt>วันที่เรียน</dt></div>
          <div><dd className="font-display text-2xl text-ink tabular">{dash.reviewsToday}</dd><dt>ทวนวันนี้</dt></div>
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 font-sans text-[15px] font-semibold">ถึงรอบทวนวันนี้</h2>
        <ul className="divide-y divide-line text-sm">
          <li><Link href="/vocab" className="flex justify-between py-2.5">คำศัพท์<em className="rounded-full bg-paper px-2 font-mono text-xs not-italic tabular">{dash.due.word}</em></Link></li>
          <li><Link href="/verbs" className="flex justify-between py-2.5">V1-V2-V3<em className="rounded-full bg-paper px-2 font-mono text-xs not-italic tabular">{dash.due.verb}</em></Link></li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 font-sans text-[15px] font-semibold">ข้อผิดที่เจอบ่อย</h2>
        {dash.topMistakes.length === 0 ? (
          <p className="text-sm text-muted">ยังไม่มี ข้อที่ตอบผิดในแบบทดสอบและ V1-V2-V3 จะมาอยู่ที่นี่</p>
        ) : (
          <ul className="divide-y divide-line">
            {dash.topMistakes.map((m) => (
              <li key={m.wrong + m.correct} className="py-2.5 text-[13px] leading-5">
                <s className="text-bad">{m.wrong}</s> <span className="text-muted">→</span> <b className="font-semibold text-obj">{m.correct}</b>
                <small className="block text-[11.5px] text-muted">{m.note ? `${m.note} · ` : ""}{m.n} ครั้ง</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function GuestRail() {
  return (
    <section className="card flex flex-col gap-3 p-5 text-sm leading-6">
      <h2 className="font-sans text-[15px] font-semibold">ยังไม่ได้เข้าสู่ระบบ</h2>
      <p className="text-muted">เรียนและฝึกได้ทุกหน้า แต่ถ้าเข้าสู่ระบบ เว็บจะจำบทที่ผ่าน คำที่ต้องทวน วันที่เรียนติดกัน และข้อที่ผิดบ่อยไว้ให้</p>
      <Link href="/login" className="btn self-start">เข้าสู่ระบบ</Link>
    </section>
  );
}
