"use client";

import { ArrowRightIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { dayOf } from "@/lib/learning/day";
import { sessionKey, inProgress, readSession } from "@/lib/learning/session-store";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** "Continue" when a session is half done in this browser today, otherwise "Start". */
export function HubContinue({ userKey, startLabel, startHref, detail, hideWhenIdle = false }: { userKey: string; startLabel: string; startHref: string; detail: string; hideWhenIdle?: boolean }) {
  // The raw string is a stable snapshot; parsing happens below.
  const raw = useSyncExternalStore(subscribe, () => {
    try {
      return localStorage.getItem(sessionKey(userKey));
    } catch {
      return null;
    }
  }, () => null);
  const saved = raw ? readSession(userKey) : null;
  const resume = inProgress(saved) && saved.day === dayOf() ? saved : null;
  if (!resume && hideWhenIdle) return null;

  return (
    <div className="on-dark flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-(--ac-navy) p-5 text-white sm:p-6">
      <div className="min-w-0">
        <p className="eyebrow">{resume ? "เรียนค้างไว้" : "รอบถัดไป"}</p>
        <p className="mt-1 font-display text-2xl font-bold">{resume ? `ต่อคำที่ ${resume.pos + 1} จาก ${resume.queue.length}` : startLabel}</p>
        <p className="mt-1 text-sm text-[#c9d3e1]">{resume ? (resume.guest ? "รอบทดลอง (ไม่บันทึกผล) เล่นต่อจากคำที่ค้างได้เลย" : "ผลที่ให้คะแนนไปแล้วบันทึกครบ เริ่มต่อจากคำที่ค้างได้เลย") : detail}</p>
      </div>
      <Link href={resume ? "/learn/session" : startHref}
        className="btn">
        {resume ? <><PlayIcon className="size-4" aria-hidden /> เรียนต่อ</> : <>เริ่มเรียน <ArrowRightIcon className="size-4" aria-hidden /></>}
      </Link>
    </div>
  );
}
