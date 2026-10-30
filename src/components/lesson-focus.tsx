"use client";

import { FocusIcon, Minimize2Icon } from "lucide-react";
import { createContext, use, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Ctx = { on: boolean; toggle: (from: HTMLElement) => void };
const FocusContext = createContext<Ctx | null>(null);

/**
 * The lesson page's root. Focus mode only flips data-focus here; the panels hide through
 * group-data-[focus=on]/lesson classes, so nothing is added to or removed from the React tree
 * and the lesson (its tab, answers and quiz result) carries on untouched.
 */
export function LessonFocus({ className, children }: { className: string; children: ReactNode }) {
  const [on, setOn] = useState(false);
  const pending = useRef<{ el: HTMLElement; top: number } | null>(null);
  const toggle = (from: HTMLElement) => {
    pending.current = { el: from, top: from.getBoundingClientRect().top };
    setOn((v) => !v);
  };

  // Panels above the button appear or disappear; scroll so the button stays where the learner tapped it.
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    const settle = () => window.scrollBy({ top: p.el.getBoundingClientRect().top - p.top, behavior: "instant" });
    settle();
    // The browser's own scroll anchoring can move the page once more after layout; correct that too.
    const frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [on]);

  return (
    <FocusContext value={{ on, toggle }}>
      <div data-focus={on ? "on" : "off"} className={"group/lesson " + className}>{children}</div>
    </FocusContext>
  );
}

/**
 * The top of the lesson card: the button, and in focus mode the one line of context that replaces the hero.
 * The heading is role="heading" so the page source still has a single <h1>; only one of the two is ever displayed.
 */
export function FocusBar({ title, level, section }: { title: string; level: string; section: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
      <div className="hidden min-w-0 flex-[1_1_15rem] group-data-[focus=on]/lesson:block">
        <span role="heading" aria-level={1} className="ac-serif text-[18px] leading-snug font-bold break-words text-(--ac-heading)">{title}</span>
        <span className="text-sm whitespace-nowrap text-(--ac-body)"> · {level} · <span className="font-semibold text-(--ac-gold-ink)">{section}</span></span>
      </div>
      <FocusToggle />
    </div>
  );
}

function FocusToggle() {
  const ctx = use(FocusContext);
  if (!ctx) return null;
  const { on, toggle } = ctx;
  const Icon = on ? Minimize2Icon : FocusIcon;
  return (
    <button type="button" aria-pressed={on} onClick={(e) => toggle(e.currentTarget)}
      className={"inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition " +
        (on ? "border-(--ac-navy) bg-card text-(--ac-navy) hover:bg-(--ac-gold-soft)" : "border-(--ac-line) bg-card text-(--ac-navy) hover:border-(--ac-navy)/40 hover:bg-(--ac-gold-soft)")}>
      <Icon className="size-4" aria-hidden />
      {on ? "ออกจากโหมดโฟกัส" : "เข้าโหมดโฟกัส"}
    </button>
  );
}
