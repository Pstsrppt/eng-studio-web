"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";

/**
 * Publishes a pinned bar's measured height as a CSS variable, so what sits around it never assumes a size.
 * Zero when the bar isn't pinned or showing. Updated on every commit too: a resize notice would come after
 * the layout effects of the parent, which may need the new height to scroll by.
 */
export function usePinnedHeight(ref: RefObject<HTMLElement | null>, name: string) {
  useLayoutEffect(() => publish(ref.current, name));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => publish(el, name);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    // A media query can unpin the bar without changing its size.
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.documentElement.style.removeProperty(name);
    };
  }, [ref, name]);
}

function publish(el: HTMLElement | null, name: string) {
  if (!el) return;
  const { position } = getComputedStyle(el);
  const pinned = position === "fixed" || position === "sticky";
  document.documentElement.style.setProperty(name, `${pinned ? el.offsetHeight : 0}px`);
}

/** The page's action bar above the phone tab bar. Only one shows at a time; Activity removes a hidden tab's. */
export function ActionPanel({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  usePinnedHeight(ref, "--action-panel-h");
  return <div ref={ref} className={className}>{children}</div>;
}
