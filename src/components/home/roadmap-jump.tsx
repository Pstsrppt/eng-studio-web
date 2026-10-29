"use client";

import { ArrowRightIcon } from "lucide-react";

/** Phones and tablets only: scrolls Home's stage row (never the page) to the recommended stage when tapped, then
    moves focus there. Nothing moves on load, so the row always opens at Stage 1. */
export function RoadmapJump({ stageId, label }: { stageId: string; label: string }) {
  function jump() {
    const li = document.querySelector<HTMLElement>(`[data-home-stage="${stageId}"]`);
    const ol = li?.parentElement;
    if (!li || !ol) return;
    const box = ol.getBoundingClientRect(), item = li.getBoundingClientRect();
    const left = ol.scrollLeft + item.left - box.left - (ol.clientWidth - item.width) / 2;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ol.scrollTo({ left: Math.max(0, Math.min(left, ol.scrollWidth - ol.clientWidth)), behavior: smooth ? "smooth" : "instant" });
    li.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
  }
  return (
    <button type="button" onClick={jump}
      className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-(--ac-navy) underline decoration-(--ac-line) underline-offset-4 transition-colors hover:decoration-current lg:hidden">
      {label} <ArrowRightIcon className="size-4" aria-hidden />
    </button>
  );
}
