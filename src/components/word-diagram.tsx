// Draws a word's diagram (content/diagram.ts) inside the picture side of a word card.
// Everything is HTML and SVG in the word's colour, so labels can be read, translated and fixed like any text.
import {
  ArrowDownIcon, ArrowRightIcon, BanIcon, Building2Icon, EqualIcon, EqualNotIcon, FileTextIcon, GlobeIcon, HouseIcon,
  LockKeyholeIcon, MapPinIcon, MessageSquareQuoteIcon, PackageIcon, PlaneIcon, PlusIcon, RepeatIcon, SearchIcon,
  TrendingDownIcon, TrendingUpIcon, TruckIcon, WavesIcon, XIcon, ZapIcon,
} from "lucide-react";
import type { BarsDiagram, CompareDiagram, Diagram, FlowDiagram, PlaceDiagram, ScaleDiagram, StepsDiagram, TimelineDiagram, VerbForms } from "@/content/diagram";

export type DiagramHide = { word?: boolean; meaning?: boolean; forms?: boolean; examples?: boolean };
type Props = { diagram: Diagram; word: string; verb?: VerbForms; hide?: DiagramHide };

/** Keeps a label that sits on a 0–100 position inside the box at both ends. */
const anchor = (at: number) => (at < 18 ? "translate-x-0" : at > 82 ? "-translate-x-full" : "-translate-x-1/2");
const chip = "rounded-lg bg-surface px-2 py-1 text-xs leading-snug text-ink shadow-sm ring-1 ring-black/5";

export function WordDiagram({ diagram, word, verb, hide = {} }: Props) {
  const body = (() => {
    switch (diagram.type) {
      case "scale": return <Scale d={diagram} word={hide.word ? "?" : word} />;
      case "timeline": return <Timeline d={diagram} />;
      case "flow": return <Flow d={diagram} hideMeaning={hide.meaning} />;
      case "bars": return <Bars d={diagram} />;
      case "place": return <Place d={diagram} />;
      case "compare": return <Compare d={diagram} />;
      case "steps": return <Steps d={diagram} />;
      case "verb": return verb ? <VerbTimeline v={verb} hide={hide} /> : null;
    }
  })();
  return <div className="relative flex w-full min-w-0 flex-col justify-center gap-3 px-5 pt-16 pb-6 md:pt-14 md:pr-6 md:pb-8 md:pl-[20%]">{body}</div>;
}

const SCALE_CAPTION: Record<ScaleDiagram["unit"], string> = { freq: "บ่อยแค่ไหน", chance: "โอกาสแค่ไหน", degree: "มากแค่ไหน" };

function Scale({ d, word }: { d: ScaleDiagram; word: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-mono text-[11px] tracking-wide opacity-80">{SCALE_CAPTION[d.unit]}</figcaption>
      <div className="relative mt-9 h-3 rounded-full bg-surface ring-1 ring-black/10">
        <div className="absolute inset-y-0 left-0 rounded-full bg-current" style={{ width: `${Math.max(d.value, 2)}%` }} />
        {[d.limit, d.target].map((at, i) => at !== undefined && (
          <div key={i} className="absolute -top-2 -bottom-2 border-l-2 border-dashed border-ink/50" style={{ left: `${at}%` }}>
            <span className={"absolute top-full mt-1 font-mono text-[11px] whitespace-nowrap text-ink/70 " + anchor(at)}>{i === 0 ? "พอดี" : "เต็ม"}</span>
          </div>
        ))}
        <div className={"absolute -top-9 " + anchor(d.value)} style={{ left: `${d.value}%` }}>
          <span className={chip + " block font-semibold whitespace-nowrap"}>{word}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-between font-mono text-[10.5px] opacity-80"><span>0%</span><span>50%</span><span>100%</span></div>
    </figure>
  );
}

function Timeline({ d }: { d: TimelineDiagram }) {
  const now = d.now === undefined ? 65 : d.now;
  const s = d.span;
  return (
    <figure className="relative h-[170px] w-full">
      {s && (
        <>
          <span className={"absolute top-0 text-xs font-medium whitespace-nowrap text-ink " + anchor((s.from + s.to) / 2)} style={{ left: `${(s.from + s.to) / 2}%` }}>{s.label}</span>
          <div className={"absolute top-6 h-2.5 rounded-full " + (s.late ? "bg-bad" : "bg-current") + (s.wait ? " opacity-40 [background:repeating-linear-gradient(90deg,currentColor_0_8px,transparent_8px_14px)]" : "")}
            style={{ left: `${s.from}%`, width: `${s.to - s.from}%` }} />
          {s.open && <ArrowRightIcon className="absolute top-[18px] size-5 -translate-x-1" style={{ left: `${s.to}%` }} aria-hidden />}
        </>
      )}
      {/* The time line itself: past on the left, future on the right. */}
      <div className="absolute top-[78px] right-0 left-0 h-0.5 bg-ink/30" />
      <span className="absolute top-[86px] left-0 font-mono text-[11px] text-ink/60">อดีต</span>
      <span className="absolute top-[86px] right-0 font-mono text-[11px] text-ink/60">อนาคต</span>
      {now !== null && (
        <div className="absolute top-[46px] h-[100px] border-l-2 border-ink" style={{ left: `${now}%` }}>
          <span className={"absolute bottom-0 rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-white " + anchor(now)}>ตอนนี้</span>
        </div>
      )}
      {d.dots?.map((dot, i) => {
        const above = i % 2 === 0;
        return (
          <div key={i} className="absolute top-[78px]" style={{ left: `${dot.at}%` }}>
            <span className={"absolute top-0 left-0 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ring-2 ring-surface "
              + (dot.strong ? "size-6 " : "size-5 ") + (dot.ask ? "bg-surface text-ink ring-ink/40" : dot.miss ? "bg-ink/30 text-white" : "bg-current")}>
              {dot.done && <span className="text-[11px] font-bold text-white">✓</span>}
              {dot.ask && <span className="text-[11px] font-bold">?</span>}
              {dot.miss && <XIcon className="size-3" aria-hidden />}
            </span>
            <span className={"absolute " + (above ? "bottom-4 " : "top-4 ") + chip + " max-w-[9rem] text-center whitespace-nowrap " + anchor(dot.at)}>{dot.label}</span>
          </div>
        );
      })}
    </figure>
  );
}

const LINK: Record<FlowDiagram["link"], { icon: typeof ArrowDownIcon; th: string }> = {
  cause: { icon: ArrowDownIcon, th: "เป็นเหตุให้" },
  contrast: { icon: ZapIcon, th: "ขัดกับที่คาด แต่ก็ยัง" },
  condition: { icon: LockKeyholeIcon, th: "ต้องมีข้อบนก่อน ไม่งั้นไม่เกิด" },
  "same-time": { icon: EqualIcon, th: "เกิดพร้อมกัน" },
  add: { icon: PlusIcon, th: "เพิ่มอีกอย่าง" },
  correct: { icon: ArrowDownIcon, th: "ที่จริงคือ" },
  swap: { icon: RepeatIcon, th: "ใช้อันล่างแทน" },
};

function Flow({ d, hideMeaning }: { d: FlowDiagram; hideMeaning?: boolean }) {
  const { icon: Icon, th } = LINK[d.link];
  const struck = d.link === "correct" || d.link === "swap";
  const box = "rounded-xl bg-surface px-3.5 py-2.5 text-sm leading-snug text-ink shadow-sm ring-1 ring-black/5";
  if (d.link === "same-time") {
    return (
      <figure className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {[d.a, d.b].map((t) => (
            <div key={t} className={box}>
              <span className="mb-1.5 block h-1.5 rounded-full bg-current" aria-hidden />
              {t}
            </div>
          ))}
        </div>
        {!hideMeaning && <figcaption className="flex items-center gap-1.5 text-xs"><Icon className="size-4" aria-hidden />{th}</figcaption>}
      </figure>
    );
  }
  return (
    <figure className="flex flex-col items-start gap-1.5">
      <div className={box + (struck ? " text-muted line-through decoration-bad decoration-2" : "")}>{d.a}</div>
      <div className="flex items-center gap-2 pl-3">
        <span className="grid size-8 place-items-center rounded-full bg-current"><Icon className="size-4 text-white" aria-hidden /></span>
        {!hideMeaning && <span className="text-xs font-medium">{th}</span>}
      </div>
      <div className={box + " font-semibold ring-2 ring-current"}>{d.b}</div>
    </figure>
  );
}

function Bars({ d }: { d: BarsDiagram }) {
  const Trend = d.trend === "up" ? TrendingUpIcon : d.trend === "down" ? TrendingDownIcon : null;
  return (
    <figure className="flex flex-col gap-2">
      {Trend && <Trend className="size-7 self-end" aria-hidden />}
      <div className="relative flex h-36 items-end gap-2 border-b-2 border-ink/30">
        {d.bars.map((b) => (
          <div key={b.label} className="flex h-full flex-1 flex-col justify-end">
            {b.extra ? <div className="rounded-t-md bg-current [background:repeating-linear-gradient(45deg,currentColor_0_5px,transparent_5px_9px)]" style={{ height: `${b.extra}%` }} /> : null}
            <div className={(b.extra ? "" : "rounded-t-md ") + "bg-current " + (b.hi ? "" : "opacity-30")} style={{ height: `${b.value}%` }} />
          </div>
        ))}
        {d.line && (
          <div className="absolute right-0 left-0 border-t-2 border-dashed border-ink/70" style={{ bottom: `${d.line.value}%` }}>
            <span className={chip + " absolute right-0 bottom-1 font-mono"}>{d.line.label}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {d.bars.map((b) => (
          <span key={b.label} className={"flex-1 truncate text-center font-mono text-[10.5px] " + (b.hi ? "font-semibold text-ink" : "text-ink/60")}>{b.label}</span>
        ))}
      </div>
    </figure>
  );
}

function Spot({ icon: Icon, label, strong }: { icon: typeof MapPinIcon; label?: string; strong?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <span className={"grid place-items-center rounded-2xl shadow-sm ring-1 ring-black/5 " + (strong ? "size-14 bg-current" : "size-12 bg-surface")}>
        <Icon className={strong ? "size-7 text-white" : "size-6"} aria-hidden />
      </span>
      {label && <span className="max-w-[7rem] text-center text-xs leading-tight text-ink">{label}</span>}
    </div>
  );
}

const Dash = () => <span className="mt-6 h-0.5 min-w-4 flex-1 self-start [background:repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_10px)]" aria-hidden />;

function Place({ d }: { d: PlaceDiagram }) {
  const row = "flex items-start justify-center gap-2";
  switch (d.rel) {
    case "between":
      return <figure className={row}><Spot icon={MapPinIcon} label={d.a} /><Dash /><Spot icon={TruckIcon} strong /><Dash /><Spot icon={MapPinIcon} label={d.b} /></figure>;
    case "through":
      return (
        <figure className={row}>
          <Spot icon={PackageIcon} label={d.a} /><Dash />
          <div className="flex flex-col items-center gap-1.5">
            <span className="grid h-16 w-5 place-items-center rounded-md bg-current"><ArrowRightIcon className="size-4 text-white" aria-hidden /></span>
            <span className="text-xs text-ink">{d.b}</span>
          </div>
          <Dash /><Spot icon={PackageIcon} />
        </figure>
      );
    case "without":
      return (
        <figure className={row}>
          <div className="relative"><Spot icon={FileTextIcon} label={d.a} /><BanIcon className="absolute top-0 left-1/2 size-12 -translate-x-1/2 text-bad" aria-hidden /></div>
          <ArrowRightIcon className="mt-4 size-6" aria-hidden />
          <Spot icon={BanIcon} label={d.b} strong />
        </figure>
      );
    case "near":
      return (
        <figure className="flex flex-col items-center gap-2">
          <div className="flex items-start gap-1"><Spot icon={Building2Icon} label={d.a} strong /><span className="mt-6 h-0.5 w-6 bg-current" aria-hidden /><Spot icon={PlaneIcon} label={d.b} /></div>
          <span className="flex w-full items-center gap-2 font-mono text-[11px] opacity-70"><span className="h-px flex-1 bg-current" />ห่างกันนิดเดียว<span className="h-px flex-1 bg-current" /></span>
        </figure>
      );
    case "everywhere":
      return (
        <figure className="relative mx-auto grid size-44 place-items-center">
          {[[8, 10], [78, 6], [4, 70], [80, 72], [42, 86], [44, 0]].map(([x, y]) => (
            <SearchIcon key={`${x}-${y}`} className="absolute size-6 opacity-70" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden />
          ))}
          <Spot icon={FileTextIcon} label={d.a} strong />
        </figure>
      );
    case "abroad":
      return (
        <figure className={row}>
          <Spot icon={HouseIcon} label={d.a} />
          <div className="mt-3 flex flex-1 flex-col items-center"><WavesIcon className="size-7 opacity-60" aria-hidden /><ArrowRightIcon className="size-5" aria-hidden /></div>
          <Spot icon={GlobeIcon} label={d.b} strong />
        </figure>
      );
    case "source":
      return <figure className={row}><Spot icon={FileTextIcon} label={d.a} strong /><ArrowRightIcon className="mt-4 size-6" aria-hidden /><Spot icon={MessageSquareQuoteIcon} label={d.b} /></figure>;
    case "within":
      return (
        <figure className="mx-auto grid w-full max-w-60 place-items-center rounded-2xl border-2 border-dashed border-current p-5">
          <Spot icon={PackageIcon} label={d.a} strong />
          {d.b && <span className="mt-2 font-mono text-[10.5px]">{d.b}</span>}
        </figure>
      );
  }
}

function Compare({ d }: { d: CompareDiagram }) {
  const same = d.rel === "same";
  return (
    <figure className="flex items-start justify-center gap-3">
      <div className="flex flex-col items-center gap-1.5"><span className="size-16 rounded-2xl bg-current" /><span className="text-center text-xs text-ink">{d.a}</span></div>
      <span className="mt-4 grid size-8 place-items-center rounded-full bg-surface shadow-sm">{same ? <EqualIcon className="size-5" aria-hidden /> : <EqualNotIcon className="size-5" aria-hidden />}</span>
      <div className="flex flex-col items-center gap-1.5">
        <span className={"size-16 bg-current " + (same ? "rounded-2xl" : "rounded-full opacity-50")} />
        <span className="text-center text-xs text-ink">{d.b}</span>
      </div>
    </figure>
  );
}

function Steps({ d }: { d: StepsDiagram }) {
  return (
    <ol className="flex flex-col gap-2">
      {d.steps.map((s, i) => {
        const on = d.hi === -1 || d.hi === i;
        return (
          <li key={s} className="flex items-center gap-3">
            <span className={"grid size-8 shrink-0 place-items-center rounded-full font-mono text-sm " + (on ? "bg-current" : "bg-surface ring-1 ring-black/10")}>
              <span className={on ? "text-white" : "text-ink"}>{i + 1}</span>
            </span>
            <span className={"text-sm " + (on ? "font-semibold text-ink" : "text-ink/60")}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** The example with the verb form in bold, matching each spelling of "was/were". */
function Marked({ text, form }: { text: string; form: string }) {
  const forms = form.split("/").map((f) => f.trim()).filter(Boolean);
  const re = new RegExp(`\\b(${forms.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
  const m = text.match(re);
  if (!m || m.index === undefined) return <>{text}</>;
  return <>{text.slice(0, m.index)}<b className="font-semibold">{m[0]}</b>{text.slice(m.index + m[0].length)}</>;
}

/**
 * V2 is a finished point in the past; V3 (with have/has, or in the passive) reaches from the past to now;
 * V1 is now and habits. The two example sentences put each form back in context.
 */
function VerbTimeline({ v, hide }: { v: VerbForms; hide: DiagramHide }) {
  const form = (text: string) => (hide.forms ? "?" : text);
  return (
    <figure className="flex flex-col gap-4">
      <div className="relative h-[118px] w-full">
        <div className="absolute top-[58px] right-0 left-0 h-0.5 bg-ink/30" />
        <span className="absolute top-[66px] left-0 font-mono text-[11px] text-ink/60">อดีต</span>
        {/* V3: from a past point up to now. */}
        <div className="absolute top-[28px] h-2 rounded-full bg-current opacity-35" style={{ left: "24%", width: "52%" }} />
        <span className={chip + " absolute top-0 -translate-x-1/2 font-semibold"} style={{ left: "50%" }}>V3 {form(v.v3)}</span>
        <span className="absolute top-[58px] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current ring-2 ring-surface" style={{ left: "24%" }} />
        <span className={chip + " absolute top-[74px] -translate-x-1/2 font-semibold"} style={{ left: "24%" }}>V2 {form(v.v2)}</span>
        <div className="absolute top-[22px] h-[56px] border-l-2 border-ink" style={{ left: "76%" }} />
        <span className={chip + " absolute top-[74px] -translate-x-1/2 bg-ink! font-semibold text-white!"} style={{ left: "76%" }}>V1 {v.v1}</span>
      </div>
      {!hide.examples && (
        <ul className="flex flex-col gap-1.5 text-[13px] leading-snug text-ink">
          {v.ex2 && <li className="rounded-lg bg-surface/80 px-2.5 py-1.5"><span className="mr-1.5 font-mono text-[10.5px] opacity-70">V2</span><Marked text={v.ex2} form={v.v2} /></li>}
          {v.ex3 && <li className="rounded-lg bg-surface/80 px-2.5 py-1.5"><span className="mr-1.5 font-mono text-[10.5px] opacity-70">V3</span><Marked text={v.ex3} form={v.v3} /></li>}
        </ul>
      )}
      <figcaption className="text-[11px] leading-snug text-ink/70">V2 จบไปแล้วในอดีต · V3 ใช้กับ have/has หรือประโยค passive · V1 ตอนนี้และกิจวัตร</figcaption>
    </figure>
  );
}
