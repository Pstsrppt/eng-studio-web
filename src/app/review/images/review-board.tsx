"use client";

import { CheckIcon, CopyIcon, UploadIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import type { ImageEntry, ImageStatus, Photo, Word } from "@/content";
import type { VerbForms } from "@/content/diagram";
import { PhotoWordCard } from "@/components/photo-word-card";

export type ReviewItem = {
  id: string;
  entry: ImageEntry;
  th: string;
  ex?: string;
  exTh?: string;
  forms?: string;
  card: { word: Word; examples: { en: string; th?: string; label?: string }[]; forms?: { label: string; text: string; ipa?: string }[]; verb?: VerbForms };
};

type Tab = "candidate" | "missing" | "rejected" | "approved" | "diagram";
const TABS: { id: Tab; label: string }[] = [
  { id: "candidate", label: "รอตรวจ" },
  { id: "missing", label: "ยังไม่มีภาพ" },
  { id: "rejected", label: "ปฏิเสธแล้ว" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "diagram", label: "ใช้ไดอะแกรม" },
];
const PER_PAGE = 12;

const STATUS_TONE: Record<ImageStatus, string> = {
  approved: "bg-obj-bg text-obj",
  candidate: "bg-[#fbf0d9] text-[#9a6200]",
  rejected: "bg-bad-bg text-bad",
  missing: "bg-[#ebe5d8] text-muted",
};

/** Which tab an item belongs in. A turned-down picture stays visible under "rejected" until a new one arrives. */
function tabOf(e: ImageEntry): Tab {
  if (e.candidate) return "candidate";
  if (e.image) return "approved";
  if (e.status === "rejected") return "rejected";
  return e.kind === "diagram" ? "diagram" : "missing";
}

const TOOL_KEY = "review-tool";
const DEFAULT_TOOL = "ChatGPT";
function readTool() {
  try {
    return localStorage.getItem(TOOL_KEY) ?? DEFAULT_TOOL;
  } catch {
    return DEFAULT_TOOL;
  }
}
function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

const candidateSrc = (e: ImageEntry) => e.candidate && `/review/images/file/candidates/${e.candidate.file}?t=${encodeURIComponent(e.candidate.addedAt)}`;

export function ImageReviewBoard({ items }: { items: ReviewItem[] }) {
  const [tab, setTab] = useState<Tab>("candidate");
  const [kind, setKind] = useState<"all" | "photo" | "scene">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  // The tool name is the same for a whole batch, so it's remembered in this browser.
  const [typed, setTyped] = useState<string | null>(null);
  const stored = useSyncExternalStore(subscribeStorage, readTool, () => DEFAULT_TOOL);
  const tool = typed ?? stored;
  function changeTool(t: string) {
    setTyped(t);
    try {
      localStorage.setItem(TOOL_KEY, t);
    } catch {}
  }

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { candidate: 0, missing: 0, rejected: 0, approved: 0, diagram: 0 };
    for (const it of items) c[tabOf(it.entry)]++;
    return c;
  }, [items]);

  const q = query.trim().toLowerCase();
  const list = items.filter((it) => tabOf(it.entry) === tab
    && (kind === "all" || it.entry.kind === kind)
    && (!q || it.id.toLowerCase() === q || it.entry.word.toLowerCase().includes(q) || it.th.includes(q)));
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const at = Math.min(page, pages - 1);
  const shown = list.slice(at * PER_PAGE, at * PER_PAGE + PER_PAGE);

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TABS.map((t) => (
          <div key={t.id} className="card px-4 py-3">
            <dt className="text-xs text-muted">{t.label}</dt>
            <dd className="font-display text-2xl font-bold tabular">{counts[t.id]}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="flex flex-wrap gap-1 rounded-[10px] bg-[#ebe5d8] p-1">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setPage(0); }}
              className={"rounded-lg px-3 py-1.5 text-sm " + (tab === t.id ? "bg-surface font-semibold shadow-sm" : "text-muted")}>
              {t.label} <span className="font-mono text-xs tabular">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        {tab !== "diagram" && (
          <select value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setPage(0); }} className="input w-auto" aria-label="ชนิดภาพ">
            <option value="all">ทุกชนิด</option>
            <option value="scene">scene (ฉาก)</option>
            <option value="photo">photo (ภาพถ่ายวัตถุ)</option>
          </select>
        )}
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="ค้นหาคำ รหัส หรือคำแปล" className="input w-56" aria-label="ค้นหา" />
        <label className="flex items-center gap-2 text-sm text-muted">
          สร้างภาพด้วย
          <input value={tool} onChange={(e) => changeTool(e.target.value)} className="input w-36" />
        </label>
      </div>

      <p className="text-sm text-muted tabular">
        {list.length === 0 ? "ไม่มีรายการในหมวดนี้" : `แสดง ${at * PER_PAGE + 1}–${at * PER_PAGE + shown.length} จาก ${list.length} · เหลืออีก ${list.length - (at * PER_PAGE + shown.length)} รายการ`}
      </p>

      <div className="flex flex-col gap-4">
        {shown.map((it) => <ReviewRow key={`${it.id}-${it.entry.candidate?.addedAt ?? it.entry.status}`} item={it} tool={tool} />)}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost" disabled={at === 0} onClick={() => setPage(at - 1)}>← ชุดก่อน</button>
          <span className="font-mono text-sm tabular">{at + 1}/{pages}</span>
          <button type="button" className="btn-ghost" disabled={at >= pages - 1} onClick={() => setPage(at + 1)}>ชุดถัดไป →</button>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ item, tool }: { item: ReviewItem; tool: string }) {
  const { id, entry: e, card } = item;
  const router = useRouter();
  const [busy, start] = useTransition();
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState(e.kind === "diagram");
  const [copied, setCopied] = useState("");

  const cand = candidateSrc(e);
  const previewPhoto: Photo | undefined = cand ? { src: cand, alt: e.candidate!.alt, site: e.candidate!.site, by: e.candidate!.by } : e.image;
  const diagram = card.verb ? { type: "verb" as const } : e.diagram;

  function call(init: RequestInit) {
    setError("");
    start(async () => {
      const res = await fetch("/review/images/api", { method: "POST", ...init });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? `ผิดพลาด (${res.status})`);
      else router.refresh();
    });
  }
  const decide = (action: "approve" | "reject") => call({ headers: { "content-type": "application/json" }, body: JSON.stringify({ action, id, reason }) });
  function upload(file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.set("id", id);
    form.set("file", file);
    form.set("tool", tool);
    call({ body: form });
  }
  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  return (
    <article className="card flex flex-col gap-4 p-4 sm:p-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-serif text-2xl font-semibold">{e.word}</h2>
        {item.forms && <span className="font-mono text-sm">{item.forms}</span>}
        <span className="font-mono text-xs text-muted">{id} · {e.senseId}</span>
        <span className="rounded bg-paper px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-line">{e.kind}</span>
        <span className={"rounded px-1.5 py-0.5 font-mono text-[11px] " + STATUS_TONE[e.status]}>{e.status}</span>
      </header>
      <div className="grid gap-1 text-sm">
        <p><span className="text-muted">ความหมาย:</span> {item.th}</p>
        {item.ex && <p><span className="text-muted">ตัวอย่าง:</span> {item.ex} {item.exTh && <span className="text-muted">({item.exTh})</span>}</p>}
      </div>

      {(e.candidate || e.image) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {cand && (
            <figure className="flex flex-col gap-1.5">
              <figcaption className="text-xs font-semibold text-[#9a6200]">ภาพรอตรวจ</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cand} alt={`ภาพรอตรวจของ ${e.word}`} className="aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-line" />
              <p className="text-xs text-muted">
                {e.candidate!.origin === "pixabay" ? `Pixabay · ${e.candidate!.by}` : `${e.candidate!.origin === "ai" ? "AI" : "ภาพของเรา"} · ${e.candidate!.tool ?? "-"}`}
                {e.candidate!.original && ` · ต้นฉบับ ${e.candidate!.original.width}×${e.candidate!.original.height}`}
              </p>
            </figure>
          )}
          {e.image && (
            <figure className="flex flex-col gap-1.5">
              <figcaption className="text-xs font-semibold text-obj">ภาพที่ใช้อยู่บนเว็บ</figcaption>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.image.src} alt={e.image.alt} className="aspect-[4/3] w-full rounded-lg object-cover ring-1 ring-line" />
              <p className="text-xs text-muted">{e.image.site}{e.image.by ? ` · ${e.image.by}` : ""} · {e.image.license}</p>
            </figure>
          )}
        </div>
      )}

      {e.candidate && e.candidate.warnings.length > 0 && (
        <ul className="rounded-lg bg-[#fbf3cf] px-3.5 py-2.5 text-sm">
          {e.candidate.warnings.map((w) => <li key={w}>⚠ {w}</li>)}
        </ul>
      )}

      {e.candidate && (
        <div className="flex flex-col gap-2 rounded-lg bg-paper p-3">
          <p className="text-xs text-muted">ก่อนอนุมัติ: ตรงความหมายและประโยคตัวอย่าง · ไม่มีตัวอักษร/โลโก้/ลายน้ำ · ไม่มีปุ่มหรือกรอบ · ไม่ซ้ำกับคำอื่น</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn" disabled={busy} onClick={() => decide("approve")}><CheckIcon className="size-4" /> อนุมัติ</button>
            <input value={reason} onChange={(ev) => setReason(ev.target.value)} placeholder="เหตุผลที่ปฏิเสธ (ไม่บังคับ)" className="input w-64" />
            <button type="button" className="btn-ghost text-bad!" disabled={busy} onClick={() => decide("reject")}><XIcon className="size-4" /> ปฏิเสธ</button>
          </div>
        </div>
      )}

      {e.rejected && e.rejected.length > 0 && !e.candidate && (
        <p className="text-xs text-muted">
          ปฏิเสธไปแล้ว {e.rejected.length} ภาพ{e.rejected.at(-1)?.reason ? ` · ล่าสุด: ${e.rejected.at(-1)!.reason}` : ""}
        </p>
      )}

      {e.prompt && !e.image && !e.candidate && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold">Prompt</span>
            <button type="button" onClick={() => copy(e.prompt!, "prompt")} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 hover:bg-paper">
              <CopyIcon className="size-3.5" /> {copied === "prompt" ? "คัดลอกแล้ว" : "คัดลอก prompt"}
            </button>
            <button type="button" onClick={() => copy(`${id}.png`, "file")} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 font-mono hover:bg-paper">
              <CopyIcon className="size-3.5" /> {copied === "file" ? "คัดลอกแล้ว" : `${id}.png`}
            </button>
          </div>
          <p className="rounded-lg bg-paper px-3 py-2 font-mono text-xs leading-5 text-ink-2">{e.prompt}</p>
        </div>
      )}

      {e.kind !== "diagram" && (
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#c9d3e0] px-3 py-2 text-sm text-brand hover:bg-brand-soft">
          <UploadIcon className="size-4" />
          {e.image || e.candidate ? "อัปโหลดภาพใหม่แทน" : "อัปโหลดภาพ"} <span className="text-xs text-muted">(PNG/JPG/WebP · จะปรับเป็น 800×600 ให้เอง)</span>
          <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="sr-only" disabled={busy}
            onChange={(ev) => { upload(ev.target.files?.[0]); ev.target.value = ""; }} />
        </label>
      )}

      {error && <p role="alert" className="text-sm text-bad">{error}</p>}
      {busy && <p className="text-sm text-muted">กำลังทำงาน…</p>}

      <div>
        <button type="button" onClick={() => setPreview((p) => !p)} className="text-sm font-semibold text-brand underline">
          {preview ? "ซ่อนตัวอย่างการ์ด" : "ดูในการ์ดจริง"}
        </button>
        {preview && (
          <div className="mt-3">
            <PhotoWordCard word={card.word} photo={previewPhoto} examples={card.examples} forms={card.forms} diagram={diagram} verb={card.verb} bookmark={false} />
          </div>
        )}
      </div>
    </article>
  );
}
