"use client";

import { BookmarkCheckIcon, BookmarkIcon, ChevronRightIcon, Volume2Icon } from "lucide-react";
import Link from "next/link";
import { type Ref, useState, useTransition } from "react";
import { addCard } from "@/app/actions";
import type { Photo, Word } from "@/content";
import type { Diagram, VerbForms } from "@/content/diagram";
import { POS_LABEL } from "@/content/pos";
import { meaningShown } from "./meaning-pref";
import { Sentence } from "./sentence";
import { speak } from "./speak";
import { useStudy } from "./study-context";
import { WordDiagram } from "./word-diagram";
import { POS_STYLE, WordIcon } from "./word-bits";

type Example = { en: string; th?: string; label?: string };
/** A verb's forms shown in a row under the word, e.g. V2 went /wɛnt/. */
type Form = { label: string; text: string; ipa?: string };

/** What to keep covered while the learner is still answering. */
export type Cover = { en?: boolean; th?: boolean; examples?: boolean; photo?: boolean; forms?: boolean };

type Props = {
  word: Word;
  photo?: Photo;
  examples: Example[];
  /** Shown big in the corner: the card's place in a list. */
  index?: number;
  forms?: Form[];
  cover?: Cover;
  /** Flashcards already belong to the learner's deck, so their bookmark is hidden. */
  bookmark?: { kind: "word" | "verb" } | false;
  /** Shown when the meaning is covered. */
  hint?: string;
  /** The learner has just answered or opened the answer, so the meaning shows even with the header's Thai toggle off. */
  revealed?: boolean;
  /** Drawn instead of a photo for words like "although", or offered next to one (V1–V2–V3). */
  diagram?: Diagram;
  verb?: VerbForms;
  /** The word and its meaning, for flashcards to keep in view. */
  answerRef?: Ref<HTMLDivElement>;
};

/**
 * One word as a picture card: the word, how to say it, what it means, an example,
 * and a photo of the example's scene. Without a photo the word's icon stands in.
 * Flashcards and drills cover parts of it until the learner answers.
 */
export function PhotoWordCard({ word, photo, examples, index, forms, cover = {}, bookmark = { kind: "word" }, hint, revealed = false, diagram, verb, answerRef }: Props) {
  const { showThai } = useStudy();
  const [shown, setShown] = useState(0);
  // The word whose meaning the learner opened with Thai off; a new word starts hidden again.
  const [peeked, setPeeked] = useState<string | null>(null);
  const [view, setView] = useState<"photo" | "diagram">(photo ? "photo" : "diagram");
  const [saved, setSaved] = useState<"idle" | "added" | "signed-out">("idle");
  const [, start] = useTransition();
  const tone = POS_STYLE[word.pos ?? "phrase"];
  const example = examples[shown];
  const showPhoto = photo && !cover.photo && (view === "photo" || !diagram);
  const showDiagram = diagram && !cover.photo && !showPhoto;

  function save() {
    if (!bookmark || saved === "added") return;
    const kind = bookmark.kind;
    start(async () => {
      const result = await addCard({ itemId: word.id, kind, en: word.en, th: word.th }).catch(() => "error" as const);
      if (result === "added" || result === "signed-out") setSaved(result);
    });
  }

  function nextExample() {
    if (examples.length > 1) setShown((s) => (s + 1) % examples.length);
    else if (example) speak(example.en);
  }

  return (
    <article className="relative grid overflow-hidden rounded-[28px] bg-surface shadow-[0_18px_40px_-24px_rgb(var(--od-shadow-rgb)/0.35)] ring-1 ring-line md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
      {/* Picture: on top on phones, on the right with a curved edge from md up. Text 55%, picture 45%. */}
      <div className={"relative md:order-2 md:h-auto md:min-h-[360px] " + (showDiagram ? "flex" : "h-48")}>
        {showDiagram ? (
          <div className={"flex w-full items-center md:[clip-path:ellipse(100%_90%_at_100%_50%)] " + tone.tile}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1.5px)] [background-size:18px_18px] opacity-15" aria-hidden />
            <WordDiagram diagram={diagram} word={word.en} verb={verb} hide={{ word: cover.en, meaning: cover.th, forms: cover.forms, examples: cover.examples }} />
          </div>
        ) : showPhoto ? (
          // Already resized to 800×600 WebP by scripts/fetch-photos.mjs, so a plain img is enough.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.alt} loading="lazy"
            className="absolute inset-0 size-full object-cover md:[clip-path:ellipse(100%_90%_at_100%_50%)]" />
        ) : (
          // No photo fits words like "already" or "however", so they get an illustration in the same frame:
          // the word's colour, a dot grid, the icon on a tile and the word itself faintly behind it.
          <div className={"absolute inset-0 overflow-hidden md:[clip-path:ellipse(100%_90%_at_100%_50%)] " + tone.tile} aria-hidden>
            <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1.5px)] [background-size:18px_18px] opacity-20" />
            {!cover.photo && !cover.en && (
              <span className="absolute -bottom-3 left-5 font-serif text-[88px] leading-none font-semibold whitespace-nowrap opacity-10 md:text-[120px]">
                {word.en}
              </span>
            )}
            {!cover.photo && (
              <span className="absolute bottom-3 left-4 rounded-full bg-surface/80 px-2.5 py-1 text-[11px] text-ink-2 md:left-[22%]">กำลังจัดทำภาพประกอบ</span>
            )}
            <div className="absolute inset-0 grid place-items-center md:pl-10">
              <div className="grid size-24 rotate-[-4deg] place-items-center rounded-[28px] bg-surface shadow-[0_14px_30px_-12px_rgb(var(--od-shadow-rgb)/0.35)] md:size-32">
                {cover.photo ? (
                  <span className="font-serif text-6xl font-semibold md:text-7xl">?</span>
                ) : (
                  <WordIcon word={word} className="size-11 md:size-14" />
                )}
              </div>
            </div>
          </div>
        )}
        {bookmark && (
          <button type="button" onClick={save} aria-label={saved === "added" ? "เพิ่มในการ์ดทวนแล้ว" : "เก็บคำนี้ไว้ทวน"}
            className="absolute top-3 right-3 grid size-11 place-items-center rounded-xl bg-black/35 text-white backdrop-blur transition hover:bg-black/50">
            {saved === "added" ? <BookmarkCheckIcon className="size-5" /> : <BookmarkIcon className="size-5" />}
          </button>
        )}
        {photo && diagram && !cover.photo && (
          <div role="group" aria-label="มุมมองภาพ" className="absolute top-3 left-3 flex rounded-full bg-black/35 p-0.5 text-xs text-white backdrop-blur md:left-[24%]">
            {(["photo", "diagram"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
                className={"rounded-full px-3 py-1.5 transition " + (view === v ? "bg-card font-semibold text-ink" : "hover:bg-white/15")}>
                {v === "photo" ? "ภาพ" : diagram.type === "verb" ? "ไทม์ไลน์" : "ไดอะแกรม"}
              </button>
            ))}
          </div>
        )}
        {showPhoto && (() => {
          // Stock photos link to their page; pictures made for the app (no url) just say where they came from.
          const credit = `ภาพ: ${photo.by ? `${photo.by} / ` : ""}${photo.site}`;
          const cls = "absolute right-3 bottom-2 rounded bg-black/35 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur";
          return photo.url ? <a href={photo.url} target="_blank" rel="noreferrer" className={cls + " hover:text-white"}>{credit}</a> : <span className={cls}>{credit}</span>;
        })()}
      </div>

      <div className="flex min-w-0 flex-col gap-4 p-6 sm:p-8">
        <div ref={answerRef} className="flex scroll-mt-[calc(var(--header-h)+0.5rem)] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {cover.en ? (
              <span className="h-12 w-48 rounded-xl bg-paper ring-1 ring-line sm:h-14" aria-label="ซ่อนคำภาษาอังกฤษ" />
            ) : (
              // Long words and phrases take a smaller size on phones, so the meaning still fits on screen beside them.
              <h3 className={"font-serif font-semibold tracking-tight break-words text-ink sm:text-6xl sm:leading-none " + (word.en.length > 10 ? "text-3xl leading-tight" : "text-5xl leading-none")}>{word.en}</h3>
            )}
            {word.pos && (
              <span className={"rounded-lg px-2.5 py-1 font-mono text-sm " + tone.tile} title={POS_LABEL[word.pos].th}>
                {POS_LABEL[word.pos].abbr}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {!cover.en && (
              <div className="flex items-center gap-3">
                {word.ipa && <span className="ipa text-xl text-ink-2">{word.ipa}</span>}
                <button type="button" onClick={() => speak(word.en)} aria-label={`ฟังเสียง ${word.en}`}
                  className="relative grid size-9 place-items-center rounded-full text-ink transition hover:bg-paper after:absolute after:-inset-1 after:content-['']">
                  <Volume2Icon className="size-6" />
                </button>
              </div>
            )}
            {cover.th ? (
              <p className="text-lg text-muted">{hint ?? "นึกความหมายในใจก่อน"}</p>
            ) : meaningShown({ revealed: revealed || peeked === word.id, showThai }) ? (
              <p className="text-2xl text-ink">{word.th}</p>
            ) : (
              // Same height as the meaning line, so the card does not jump when it opens; ::after makes the tap area 44px.
              <button type="button" onClick={() => setPeeked(word.id)} aria-label={`ดูความหมายของ ${word.en}`}
                className="relative inline-flex min-h-8 items-center self-start rounded-lg bg-sunken px-3 text-sm font-semibold text-ink-2 hover:bg-line after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']">
                ดูความหมาย
              </button>
            )}
            {saved === "signed-out" && (
              <p className="text-xs text-muted"><Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> เพื่อเก็บคำไว้ทวน</p>
            )}
            {saved === "added" && <p className="text-xs text-obj">เพิ่มในการ์ดทวนแล้ว</p>}
          </div>
        </div>

        {forms && forms.length > 0 && (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${forms.length}, minmax(0, 1fr))` }}>
            {forms.map((f) => (
              <div key={f.label} className="rounded-xl bg-paper/70 px-3 py-2 ring-1 ring-line">
                <span className="block font-mono text-[10.5px] text-muted">{f.label}</span>
                {cover.forms ? (
                  <span className="block font-display text-lg text-muted">?</span>
                ) : (
                  <>
                    <button type="button" onClick={() => speak(f.text.replace("/", ", "))} className="block text-left font-display text-lg hover:text-brand">
                      {f.text}
                    </button>
                    {f.ipa && <span className="ipa block text-xs text-muted">{f.ipa}</span>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <hr className="border-line" />

        {example && !cover.examples && (
          <div className="flex items-center gap-3 rounded-2xl bg-paper/70 p-4 ring-1 ring-line">
            <div className="min-w-0 flex-1">
              {example.label && <span className="mb-1 inline-block rounded bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted ring-1 ring-line">{example.label}</span>}
              {/* While the meaning is covered, the Thai line would give it away. */}
              <Sentence en={example.en} th={cover.th ? undefined : example.th} />
            </div>
            <button type="button" onClick={nextExample}
              aria-label={examples.length > 1 ? "ตัวอย่างถัดไป" : "ฟังประโยค"}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:brightness-125">
              {examples.length > 1 ? <ChevronRightIcon className="size-6" /> : <Volume2Icon className="size-5" />}
            </button>
          </div>
        )}
        {cover.examples && examples.length > 0 && (
          <p className="rounded-2xl bg-paper/70 p-4 text-sm text-muted ring-1 ring-line">ประโยคตัวอย่างจะขึ้นหลังตอบ</p>
        )}

        <div className="mt-auto flex items-center gap-4">
          <span className="font-serif text-5xl leading-none font-semibold text-line tabular" aria-hidden>
            {String((index ?? shown) + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-xs tracking-[0.2em] text-muted">{index === undefined ? "EXAMPLE" : "WORD"}</span>
          <span className="h-px flex-1 bg-line" />
          {examples.length > 1 && !cover.examples && <span className="font-mono text-xs text-muted">ตัวอย่าง {shown + 1}/{examples.length}</span>}
        </div>
      </div>
    </article>
  );
}
