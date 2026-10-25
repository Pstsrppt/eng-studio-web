"use client";

import { ArrowRightIcon, CheckIcon, ChevronDownIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TEST_NOTES, TEST_TYPES, type TestType } from "@/content/ielts-guide";
import { Thai } from "./thai";

/** Academic or General Training: pick one to highlight it and open its Reading and Writing details. Nothing is saved. */
export function TestChooser() {
  const [picked, setPicked] = useState<TestType["id"] | null>(null);
  const [open, setOpen] = useState<Set<TestType["id"]>>(new Set());

  function pick(id: TestType["id"]) {
    setPicked(id);
    setOpen((o) => new Set(o).add(id));
  }
  function toggle(id: TestType["id"]) {
    setOpen((o) => {
      const next = new Set(o);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div role="radiogroup" aria-label="เลือกประเภทการสอบ" className="flex w-fit rounded-xl border border-(--ac-line) bg-white p-1">
        {TEST_TYPES.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={picked === t.id} onClick={() => pick(t.id)}
            className={"rounded-lg px-4 py-2 text-[15px] transition " + (picked === t.id ? "bg-(--ac-navy) font-semibold text-white" : "text-(--ac-body) hover:bg-(--ac-gold-soft)")}>
            {t.id === "academic" ? "Academic" : "General Training"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {TEST_TYPES.map((t) => {
          const on = picked === t.id;
          const expanded = open.has(t.id);
          return (
            <article key={t.id} aria-labelledby={`test-${t.id}`}
              className={"flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-(--ac-shadow) transition lg:p-7 " +
                (on ? "border-(--ac-navy) ring-2 ring-(--ac-gold-soft)" : picked ? "border-(--ac-line) opacity-75" : "border-(--ac-line)")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 id={`test-${t.id}`} className="ac-serif text-[24px] font-bold text-(--ac-navy)">{t.name}</h3>
                  <p className="mt-1 text-[15px] leading-6 text-(--ac-body)">{t.tagline.en}<Thai className="text-sm text-(--ac-muted)">{t.tagline.th}</Thai></p>
                </div>
                {on && <span className="shrink-0 rounded-full bg-(--ac-gold-soft) px-3 py-1 text-xs font-semibold text-(--ac-navy)">Selected</span>}
              </div>
              <div>
                <p className="mb-2 font-mono text-[11px] tracking-[0.18em] text-(--ac-gold)">SUITABLE FOR</p>
                <ul className="flex flex-col gap-2">
                  {t.suitable.map((s) => (
                    <li key={s.en} className="flex gap-2.5 text-[15px] leading-6 text-(--ac-ink)">
                      <CheckIcon className="mt-1 size-4 shrink-0 text-(--ac-gold)" aria-hidden />
                      <span>{s.en}<Thai className="text-sm text-(--ac-muted)">{s.th}</Thai></span>
                    </li>
                  ))}
                </ul>
              </div>
              <button type="button" aria-expanded={expanded} aria-controls={`test-more-${t.id}`} onClick={() => toggle(t.id)}
                className="mt-auto flex w-fit items-center gap-1.5 text-sm font-semibold text-(--ac-navy) hover:text-(--ac-gold)">
                {expanded ? "Hide" : "Show"} Reading &amp; Writing details
                <ChevronDownIcon className={"size-4 transition " + (expanded ? "rotate-180" : "")} aria-hidden />
              </button>
              {expanded && (
                <dl id={`test-more-${t.id}`} className="learn-in grid gap-3 rounded-xl bg-(--ac-bg) p-4 text-sm leading-6">
                  <div><dt className="font-semibold text-(--ac-navy)">Reading</dt><dd className="text-(--ac-body)">{t.reading.en}<Thai className="text-(--ac-muted)">{t.reading.th}</Thai></dd></div>
                  <div><dt className="font-semibold text-(--ac-navy)">Writing</dt><dd className="text-(--ac-body)">{t.writing.en}<Thai className="text-(--ac-muted)">{t.writing.th}</Thai></dd></div>
                </dl>
              )}
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--ac-line) bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-col gap-1.5 text-sm leading-6 text-(--ac-body)">
          {TEST_NOTES.map((n) => (
            <li key={n.en} className="flex gap-2"><InfoIcon className="mt-1 size-4 shrink-0 text-(--ac-gold)" aria-hidden /><span>{n.en}<Thai className="text-(--ac-muted)">{n.th}</Thai></span></li>
          ))}
        </ul>
        <Link href="/ielts" className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-(--ac-navy) hover:text-(--ac-gold)">
          More about IELTS <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
