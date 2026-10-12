"use client";

import { BookmarkCheckIcon, BookmarkIcon, ChevronRightIcon, Volume2Icon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { addCard } from "@/app/actions";
import type { Photo, Word } from "@/content";
import { POS_LABEL } from "@/content/pos";
import { Sentence } from "./sentence";
import { speak } from "./speak";
import { POS_STYLE, WordIcon } from "./vocab-view";

type Example = { en: string; th?: string };

/**
 * One word as a picture card: the word, how to say it, what it means, an example,
 * and a photo of the example's scene. Without a photo the word's icon stands in.
 */
export function PhotoWordCard({ word, photo, examples, index }: { word: Word; photo?: Photo; examples: Example[]; index?: number }) {
  const [shown, setShown] = useState(0);
  const [saved, setSaved] = useState<"idle" | "added" | "signed-out">("idle");
  const [, start] = useTransition();
  const tone = POS_STYLE[word.pos ?? "phrase"];
  const example = examples[shown];

  function bookmark() {
    if (saved === "added") return;
    start(async () => {
      const result = await addCard({ itemId: word.id, kind: "word", en: word.en, th: word.th }).catch(() => "error" as const);
      if (result === "added" || result === "signed-out") setSaved(result);
    });
  }

  function nextExample() {
    if (examples.length > 1) setShown((s) => (s + 1) % examples.length);
    else if (example) speak(example.en);
  }

  return (
    <article className="relative grid overflow-hidden rounded-[28px] bg-surface shadow-[0_18px_40px_-24px_rgba(19,32,27,0.35)] ring-1 ring-line md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Photo: on top on phones, on the right with a curved edge from md up. */}
      <div className="relative h-48 md:order-2 md:h-auto md:min-h-[360px]">
        {photo ? (
          // Already resized to 800×600 WebP by scripts/fetch-photos.mjs, so a plain img is enough.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.src} alt={photo.alt} loading="lazy"
            className="absolute inset-0 size-full object-cover md:[clip-path:ellipse(100%_90%_at_100%_50%)]" />
        ) : (
          <div className={"absolute inset-0 grid place-items-center md:[clip-path:ellipse(100%_90%_at_100%_50%)] " + tone.tile}>
            <span className="scale-[3] opacity-70"><WordIcon word={word} /></span>
          </div>
        )}
        <button type="button" onClick={bookmark} aria-label={saved === "added" ? "เพิ่มในการ์ดทวนแล้ว" : "เก็บคำนี้ไว้ทวน"}
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-xl bg-black/35 text-white backdrop-blur transition hover:bg-black/50">
          {saved === "added" ? <BookmarkCheckIcon className="size-5" /> : <BookmarkIcon className="size-5" />}
        </button>
        {photo && (
          <a href={photo.url} target="_blank" rel="noreferrer"
            className="absolute right-3 bottom-2 rounded bg-black/35 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur hover:text-white">
            ภาพ: {photo.by} / {photo.site}
          </a>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-serif text-5xl leading-none font-semibold tracking-tight break-words text-ink sm:text-6xl">{word.en}</h3>
          {word.pos && (
            <span className={"rounded-lg px-2.5 py-1 font-mono text-sm " + tone.tile} title={POS_LABEL[word.pos].th}>
              {POS_LABEL[word.pos].abbr}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            {word.ipa && <span className="ipa text-xl text-ink-2">{word.ipa}</span>}
            <button type="button" onClick={() => speak(word.en)} aria-label={`ฟังเสียง ${word.en}`}
              className="grid size-9 place-items-center rounded-full text-ink transition hover:bg-paper">
              <Volume2Icon className="size-6" />
            </button>
          </div>
          <p className="text-2xl text-ink">{word.th}</p>
          {saved === "signed-out" && (
            <p className="text-xs text-muted"><Link href="/login" className="font-semibold text-brand underline">เข้าสู่ระบบ</Link> เพื่อเก็บคำไว้ทวน</p>
          )}
          {saved === "added" && <p className="text-xs text-obj">เพิ่มในการ์ดทวนแล้ว</p>}
        </div>

        <hr className="border-line" />

        {example && (
          <div className="flex items-center gap-3 rounded-2xl bg-paper/70 p-4 ring-1 ring-line">
            <div className="min-w-0 flex-1"><Sentence en={example.en} th={example.th} /></div>
            <button type="button" onClick={nextExample}
              aria-label={examples.length > 1 ? "ตัวอย่างถัดไป" : "ฟังประโยค"}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:brightness-125">
              {examples.length > 1 ? <ChevronRightIcon className="size-6" /> : <Volume2Icon className="size-5" />}
            </button>
          </div>
        )}

        <div className="mt-auto flex items-center gap-4">
          <span className="font-serif text-5xl leading-none font-semibold text-line tabular">
            {String((index ?? shown) + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-xs tracking-[0.2em] text-muted">{index === undefined ? "EXAMPLE" : "WORD"}</span>
          <span className="h-px flex-1 bg-line" />
          {examples.length > 1 && <span className="font-mono text-xs text-muted">ตัวอย่าง {shown + 1}/{examples.length}</span>}
        </div>
      </div>
    </article>
  );
}
