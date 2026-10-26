"use client";

import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BANDS, OVERALL_RULE } from "@/content/ielts-guide";
import { Thai } from "./thai";

const SOURCE = "https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail";

/** Explains what a band means and what to work on. An explainer, not an assessment of the learner. */
export function BandExplorer() {
  const [band, setBand] = useState("6.5");
  const info = BANDS.find((b) => b.band === band)!;
  return (
    <div className="grid overflow-hidden rounded-2xl border border-(--ac-line) bg-white shadow-(--ac-shadow) lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-6 bg-(--ac-navy) p-6 text-white lg:justify-center lg:p-10">
        <p className="text-sm text-[#c9d3e1]">Choose a band to see what it means</p>
        <div role="radiogroup" aria-label="เลือก Band" className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-4">
          {BANDS.map((b) => (
            <button key={b.band} type="button" role="radio" aria-checked={band === b.band} onClick={() => setBand(b.band)}
              className={"rounded-lg border px-2 py-2.5 font-mono text-[15px] transition " +
                (band === b.band ? "border-(--ac-gold-bright) bg-(--ac-gold-bright) font-semibold text-(--ac-navy)" : "border-white/20 text-white hover:border-white/50")}>
              {b.band}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-4 border-t border-white/15 pt-6" aria-live="polite">
          <p className="ac-serif text-[72px] leading-none font-bold text-(--ac-gold-bright)">{info.band}</p>
          <p className="pb-2 text-lg leading-snug font-semibold">{info.level}</p>
        </div>
      </div>
      <div key={band} className="learn-in flex flex-col gap-5 p-6 lg:p-8">
        <div>
          <p className="mb-2 font-mono text-[11px] tracking-[0.18em] text-(--ac-gold-ink)">WHAT IT MEANS (OFFICIAL BAND SCALE)</p>
          {info.official ? (
            <blockquote className="border-l-2 border-(--ac-gold-bright) pl-4 text-[15px] leading-7 text-(--ac-ink)">
              “{info.official}”
              <Thai className="mt-1 text-sm leading-6 text-(--ac-muted)">{info.officialTh}</Thai>
            </blockquote>
          ) : (
            <p className="text-[15px] leading-7 text-(--ac-ink)">
              The official scale describes whole bands only. Band {info.band} sits between band {Math.floor(Number(info.band))} and band {Math.ceil(Number(info.band))}: choose those to read both descriptions.
              <Thai className="text-sm leading-6 text-(--ac-muted)">คำอธิบายทางการมีเฉพาะ Band เต็ม Band {info.band} อยู่ระหว่าง Band {Math.floor(Number(info.band))} กับ {Math.ceil(Number(info.band))} เลือกสองตัวนั้นเพื่ออ่านคำอธิบาย</Thai>
            </p>
          )}
        </div>
        <div>
          <p className="mb-2 font-mono text-[11px] tracking-[0.18em] text-(--ac-gold-ink)">WHAT TO WORK ON</p>
          <ul className="flex flex-col gap-2">
            {info.focus.map((f) => (
              <li key={f.en} className="flex gap-2.5 text-[15px] leading-6 text-(--ac-body)">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-(--ac-gold)" aria-hidden />
                <span>{f.en}<Thai className="text-sm text-(--ac-muted)">{f.th}</Thai></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/placement" className="inline-flex items-center gap-2 rounded-lg bg-(--ac-navy) px-5 py-3 text-sm font-semibold text-white hover:bg-(--ac-navy-2)">
            Find your level <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
          <Link href={`/roadmap?stage=${info.stage}`} className="inline-flex items-center gap-2 rounded-lg border-[1.5px] border-(--ac-navy) px-5 py-3 text-sm font-semibold text-(--ac-navy) hover:bg-(--ac-gold-soft)">
            See the matching stage
          </Link>
        </div>
        <p className="border-t border-(--ac-line) pt-4 text-xs leading-5 text-(--ac-muted)">
          {OVERALL_RULE.en} This explorer explains the scale; it does not estimate your band, and no number of lessons guarantees a result.{" "}
          <a href={SOURCE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-(--ac-navy)">Source: ielts.org<ExternalLinkIcon className="size-3" aria-hidden /></a>
          <Thai className="mt-1">{OVERALL_RULE.th} ส่วนนี้อธิบายความหมายของ Band เท่านั้น ไม่ได้ประเมินคะแนนของคุณ และการเรียนครบจำนวนบทไม่ได้รับประกัน Band ใด</Thai>
        </p>
      </div>
    </div>
  );
}
