import {
  BookmarkIcon, CheckIcon, EarIcon, FlameIcon, GraduationCapIcon, ImageIcon, LayersIcon, ListChecksIcon,
  PuzzleIcon, RepeatIcon, SparklesIcon, StarIcon, ZapIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DECKS, WORDS } from "@/content";
import { getUser } from "@/lib/data";
import { DAILY_NEW_LIMIT } from "@/lib/learning/queue";
import type { QuestProgress } from "@/lib/learning/quests";
import { getLearnOverview, type DayActivity, type LearnOverview } from "@/lib/learning/server";
import { HubContinue } from "./hub-continue";

export const metadata: Metadata = { title: "ฝึกศัพท์" };

export default function LearnPage() {
  return (
    <Suspense fallback={<HubSkeleton />}>
      <Hub />
    </Suspense>
  );
}

function HubSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-10 w-2/3 rounded-lg bg-line" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-20 rounded-xl bg-line/60" />)}</div>
      <div className="h-32 rounded-2xl bg-line/60" />
      <div className="h-56 rounded-xl bg-line/60" />
    </div>
  );
}

const QUEST_ICON = { sparkles: SparklesIcon, repeat: RepeatIcon, zap: ZapIcon };
const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]));

async function Hub() {
  const [user, data] = await Promise.all([getUser(), getLearnOverview()]);
  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="eyebrow">Learning Studio · ฝึกศัพท์</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight lg:text-[34px]">พร้อมฝึกศัพท์วันนี้หรือยัง?</h1>
        <p className="mt-2 max-w-[62ch] text-muted">
          เปิดการ์ด นึกความหมาย แล้วบอกตามจริงว่าจำได้แค่ไหน ระบบจะนัดคำที่ลืมให้กลับมาเร็ว และเว้นระยะคำที่จำได้ดีให้ห่างออกไป
        </p>
      </header>
      {data && user ? <SignedIn data={data} userKey={user.id} /> : (
        <>
          <Guest />
          <HubContinue userKey="guest" hideWhenIdle startLabel="" startHref="/learn/session?mode=new" detail="" />
        </>
      )}
      <Modes data={data} />
    </div>
  );
}

function Guest() {
  return (
    <section className="grid gap-4 rounded-2xl bg-ink p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-mono text-[11px] tracking-[0.08em] text-mark">เริ่มต้น</p>
        <p className="mt-1 font-display text-2xl font-bold">ลองฝึกคำใหม่ {DAILY_NEW_LIMIT} คำ</p>
        <p className="mt-1 max-w-[56ch] text-sm text-[#b7c5bf]">
          เล่นได้เลยโดยไม่ต้องสมัคร แต่ผลจะไม่ถูกบันทึก เข้าสู่ระบบเพื่อเก็บ streak, XP, Daily Quest และให้ระบบนัดทวนคำให้
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/learn/session?mode=new" className="inline-flex items-center rounded-xl bg-mark px-5 py-3 font-semibold text-ink">ลองเล่นเลย</Link>
        <Link href="/login" className="inline-flex items-center rounded-xl border border-[#2c3f37] px-5 py-3 font-semibold">เข้าสู่ระบบ</Link>
      </div>
    </section>
  );
}

function SignedIn({ data, userKey }: { data: LearnOverview; userKey: string }) {
  const questsDone = data.quests.filter((q) => q.done).length;
  const startLabel = data.due > 0 ? `ทวน ${data.due} คำที่ถึงกำหนด` : data.newLeft > 0 ? `เรียนคำใหม่ ${data.newLeft} คำ` : "วันนี้ครบแล้ว";
  const stats: { label: string; value: string; icon: typeof FlameIcon; note?: string }[] = [
    { label: "Streak", value: `${data.streak} วัน`, icon: FlameIcon, note: data.streak ? undefined : "ฝึกวันนี้เพื่อเริ่มนับ" },
    { label: "คำที่เรียนแล้ว", value: String(data.learned), icon: GraduationCapIcon, note: `จำแม่นแล้ว ${data.mastered}` },
    { label: "ถึงกำหนดทวน", value: String(data.due), icon: RepeatIcon },
    { label: "XP วันนี้", value: String(data.xpToday), icon: StarIcon },
    { label: "เป้าหมายวันนี้", value: `${questsDone}/${data.quests.length}`, icon: ListChecksIcon, note: "Quest ที่ทำครบ" },
  ];

  return (
    <>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card flex flex-col gap-1 px-4 py-3.5">
            <dt className="flex items-center gap-1.5 text-xs text-muted"><s.icon className="size-3.5" aria-hidden />{s.label}</dt>
            <dd className="font-display text-2xl font-bold tabular">{s.value}</dd>
            {s.note && <dd className="text-[11px] text-muted">{s.note}</dd>}
          </div>
        ))}
      </dl>

      {!data.hasHistory && (
        <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm leading-6">
          ยินดีต้อนรับ! เริ่มจากคำใหม่วันละ {DAILY_NEW_LIMIT} คำก่อน พรุ่งนี้คำที่เรียนวันนี้จะกลับมาให้ทวน แล้วตัวเลขด้านบนจะเริ่มขยับ
        </p>
      )}

      <HubContinue userKey={userKey} startLabel={startLabel}
        startHref={data.due > 0 ? "/learn/session?mode=due" : "/learn/session?mode=new"}
        detail={data.due > 0 ? `จากนั้นยังเรียนคำใหม่ได้อีก ${data.newLeft} คำวันนี้` : data.newLeft > 0 ? "คำง่ายและคำที่บุ๊กมาร์กไว้มาก่อน" : "ทวนครบ และเรียนคำใหม่ครบโควตาแล้ว พักได้เลย"} />

      <section aria-labelledby="quests" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="quests" className="text-xl font-bold">Daily Quest</h2>
          <span className="text-xs text-muted">รีเซ็ตทุกเที่ยงคืน (เวลาไทย)</span>
        </div>
        <ul className="grid gap-3 lg:grid-cols-3">
          {data.quests.map((q) => <QuestCard key={q.id} q={q} />)}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Week week={data.week} hasHistory={data.hasHistory} />
        <section aria-labelledby="weak" className="card flex flex-col gap-3 p-5">
          <h2 id="weak" className="text-lg font-bold">คำที่ยังไม่แม่น</h2>
          {data.weak.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีคำที่ลืมบ่อย คำที่กด &ldquo;จำไม่ได้&rdquo; จะมาอยู่ตรงนี้</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {data.weak.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span><b className="font-semibold">{WORD_BY_ID.get(w.id)?.en}</b> <span className="text-muted">{WORD_BY_ID.get(w.id)?.th}</span></span>
                  <span className="shrink-0 font-mono text-xs text-bad">ลืม {w.lapses} ครั้ง</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function QuestCard({ q }: { q: QuestProgress }) {
  const Icon = QUEST_ICON[q.icon];
  return (
    <li className={"card flex flex-col gap-3 p-4 transition " + (q.done ? "border-[#9ccdb8] bg-obj-bg/40" : "")}>
      <div className="flex items-start gap-3">
        <span className={"grid size-10 shrink-0 place-items-center rounded-xl " + (q.done ? "bg-obj text-white" : "bg-brand-soft text-brand")}>
          {q.done ? <CheckIcon className="size-5 learn-in" aria-hidden /> : <Icon className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{q.title}</h3>
          <p className="text-xs leading-5 text-muted">{q.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-mark/40 px-2 py-0.5 font-mono text-[11px] font-semibold">+{q.xp} XP</span>
      </div>
      <div>
        <div className="flex justify-between text-xs"><span className="tabular">{q.progress}/{q.target}</span><span className={q.done ? "font-semibold text-obj" : "text-muted"}>{q.done ? "✓ สำเร็จแล้ว" : "กำลังทำ"}</span></div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e6ebe8]" role="progressbar" aria-label={q.title} aria-valuemin={0} aria-valuemax={q.target} aria-valuenow={q.progress}>
          <div className={"h-full rounded-full transition-[width] duration-500 " + (q.done ? "bg-obj" : "bg-brand")} style={{ width: `${(q.progress / q.target) * 100}%` }} />
        </div>
      </div>
      {!q.done && <Link href={q.href} className="btn-ghost self-start py-2">ทำ Quest นี้</Link>}
    </li>
  );
}

const DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function Week({ week, hasHistory }: { week: DayActivity[]; hasHistory: boolean }) {
  const max = Math.max(1, ...week.map((d) => d.reviews));
  const empty = week.every((d) => d.reviews === 0);
  return (
    <section aria-labelledby="week" className="card flex flex-col gap-4 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="week" className="text-lg font-bold">7 วันที่ผ่านมา</h2>
        <span className="text-xs text-muted">จำนวนครั้งที่ทวน</span>
      </div>
      {empty ? (
        <p className="py-6 text-center text-sm text-muted">{hasHistory ? "ช่วง 7 วันนี้ยังไม่ได้ฝึก เริ่มวันนี้แล้วกราฟจะขึ้นตรงนี้" : "ยังไม่มีประวัติการฝึก เมื่อเริ่มฝึก กราฟกิจกรรมจะขึ้นตรงนี้"}</p>
      ) : (
        <>
          <div className="flex h-36 items-end gap-2" aria-hidden>
            {week.map((d) => (
              <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="font-mono text-[10.5px] text-muted tabular">{d.reviews || ""}</span>
                <div className="w-full max-w-10 rounded-t-md bg-brand transition-[height] duration-500" style={{ height: `${(d.reviews / max) * 100}%`, minHeight: d.reviews ? 4 : 0 }} />
              </div>
            ))}
          </div>
          <div className="flex gap-2" aria-hidden>
            {week.map((d) => <span key={d.day} className="flex-1 text-center text-xs text-muted">{DAY_NAMES[new Date(`${d.day}T12:00:00+07:00`).getUTCDay()]}</span>)}
          </div>
          <table className="sr-only">
            <caption>กิจกรรม 7 วัน</caption>
            <thead><tr><th>วัน</th><th>คำที่ฝึก</th><th>ครั้งที่ทวน</th><th>XP</th></tr></thead>
            <tbody>{week.map((d) => <tr key={d.day}><td>{d.day}</td><td>{d.words}</td><td>{d.reviews}</td><td>{d.xp}</td></tr>)}</tbody>
          </table>
          <p className="text-xs text-muted">สัปดาห์นี้ฝึก {week.reduce((s, d) => s + d.words, 0)} คำ · ทวน {week.reduce((s, d) => s + d.reviews, 0)} ครั้ง · {week.reduce((s, d) => s + d.xp, 0)} XP</p>
        </>
      )}
    </section>
  );
}

function Modes({ data }: { data: LearnOverview | null }) {
  const soon = [
    { title: "Quick Quiz", body: "ปรนัย 4 ตัวเลือก ไทย ↔ อังกฤษ", icon: ListChecksIcon },
    { title: "Picture Challenge", body: "ดูภาพแล้วทายคำ", icon: ImageIcon },
    { title: "Listening Practice", body: "ฟังเสียงแล้วเลือกคำ", icon: EarIcon },
    { title: "Sentence Builder", body: "เติมคำในประโยคตัวอย่าง", icon: PuzzleIcon },
  ];
  const choice = "rounded-lg border border-line bg-surface px-3 py-2 text-sm transition hover:border-brand hover:bg-brand-soft";
  return (
    <section aria-labelledby="modes" className="flex flex-col gap-3">
      <h2 id="modes" className="text-xl font-bold">โหมดการเรียน</h2>
      <div className="card flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-mark"><LayersIcon className="size-5" aria-hidden /></span>
          <div>
            <h3 className="text-lg font-bold">Smart Flashcard</h3>
            <p className="text-sm text-muted">การ์ดคำพร้อมภาพและเสียง ให้คะแนนความจำ จำไม่ได้ / ยังไม่แม่น / จำได้ แล้วระบบนัดทวนให้</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/learn/session?mode=all" className={choice}>เรียนทั้งหมด</Link>
          <Link href="/learn/session?mode=due" className={choice}>ทวนที่ถึงกำหนด{data ? ` (${data.due})` : ""}</Link>
          <Link href="/learn/session?mode=new" className={choice}>คำใหม่{data ? ` (${data.newLeft})` : ""}</Link>
          {data && <Link href="/learn/session?mode=bookmarks" className={choice}><BookmarkIcon className="mr-1 inline size-3.5" aria-hidden />บุ๊กมาร์ก ({data.bookmarks})</Link>}
        </div>
        {/* A plain form, so choosing a category works even before the page's JavaScript loads. */}
        <form action="/learn/session" className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="mode" value="deck" />
          <label htmlFor="deck" className="text-sm text-muted">ตามหมวด</label>
          <select id="deck" name="deck" className="input w-auto py-2">
            {DECKS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button type="submit" className="btn py-2">เริ่ม</button>
        </form>
        <p className="text-xs text-muted">อยากดูคำทั้งหมดแบบตาราง ไปที่ <Link href="/vocab" className="text-brand underline">หน้าคำศัพท์</Link></p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {soon.map((m) => (
          <li key={m.title} className="flex items-start gap-3 rounded-xl border border-dashed border-line p-4 text-muted">
            <m.icon className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold text-ink-2">{m.title} <span className="ml-1 rounded-full bg-[#e6ebe8] px-2 py-0.5 text-[10.5px] font-normal">เร็วๆ นี้ · ยังใช้ไม่ได้</span></p>
              <p className="text-xs">{m.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
