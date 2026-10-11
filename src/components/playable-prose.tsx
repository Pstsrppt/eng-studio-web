"use client";

import { useEffect, useRef } from "react";
import { speak } from "./speak";

const THAI = /[฀-๿]/;
const IPA = /[ɪθðəʃʒŋæɑɔʊˈ]/;

/** English worth reading aloud: has a real word, no Thai, no IPA, not a label like "V2" or "-ed". */
function isSpeakable(text: string) {
  const t = text.trim();
  return (
    t.length > 0 && t.length <= 90 && !THAI.test(t) && !IPA.test(t) && /[a-z]{2}/i.test(t) &&
    !/^[+\-/]/.test(t) && !/:$/.test(t) && !/^V\d/.test(t) && !/^[A-Z]\d$/.test(t)
  );
}

/** What the voice should say: pairs as separate words, "com-PU-ter" as "computer". */
function spoken(text: string) {
  return text
    .split(/\s*[/·→]\s*|\s*,\s*/)
    .map((part) => (/^[a-z]+(-[a-z]+)+$/i.test(part) && /[A-Z]/.test(part) ? part.replace(/-/g, "").toLowerCase() : part))
    .filter(Boolean)
    .join(", ");
}

/** The English part of an example box: no Thai line, and no struck-out wrong version. */
function exampleText(el: Element) {
  const copy = el.cloneNode(true) as Element;
  copy.querySelectorAll(".th, s").forEach((n) => n.remove());
  return (copy.textContent ?? "").replace(/^\s*→\s*/, "");
}

/**
 * Lesson HTML where every English example, table cell or bold phrase can be tapped to hear it.
 * The HTML is trusted course content; the marking happens after it renders.
 */
export function PlayableProse({ html, className = "" }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mark = (el: Element, text: string) => {
      el.classList.add("say");
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("data-say", spoken(text));
      el.setAttribute("aria-label", `ฟังเสียง: ${text.trim()}`);
    };
    root.querySelectorAll(".ex").forEach((el) => {
      const text = exampleText(el);
      // Example boxes can be long, so only the Thai and IPA checks apply here.
      if (!THAI.test(text) && !IPA.test(text) && /[a-z]{2}/i.test(text)) mark(el, text);
    });
    root.querySelectorAll("td, b").forEach((el) => {
      if (el.closest(".say, s, th")) return;
      const text = el.textContent ?? "";
      if (isSpeakable(text)) mark(el, text);
    });
  }, [html]);

  function play(target: EventTarget | null) {
    const el = (target as Element | null)?.closest?.("[data-say]");
    if (el) speak(el.getAttribute("data-say") ?? "");
  }

  return (
    <div
      ref={ref}
      className={className}
      onClick={(e) => play(e.target)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && (e.target as Element).hasAttribute("data-say")) {
          e.preventDefault();
          play(e.target);
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
