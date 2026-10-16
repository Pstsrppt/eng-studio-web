import type { Metadata } from "next";
import { Suspense } from "react";
import { DECKS } from "@/content";
import { getUser } from "@/lib/data";
import { LEARN_MODES, type LearnMode } from "@/lib/learning/queue";
import { LearnSession } from "./learn-session";

export const metadata: Metadata = { title: "Smart Flashcard" };

type Search = Promise<{ mode?: string; deck?: string; again?: string }>;

export default function LearnSessionPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="h-[520px] animate-pulse rounded-[28px] bg-line/60" aria-busy="true" aria-label="กำลังเตรียมการ์ด" />}>
      <Session searchParams={searchParams} />
    </Suspense>
  );
}

async function Session({ searchParams }: { searchParams: Search }) {
  const [params, user] = await Promise.all([searchParams, getUser()]);
  const explicit = Boolean(params.mode);
  const mode: LearnMode = LEARN_MODES.includes(params.mode as LearnMode) ? (params.mode as LearnMode) : "all";
  const deck = mode === "deck" && DECKS.some((d) => d.id === params.deck) ? params.deck : undefined;
  // A new key for every different URL, so "study again" starts a fresh component.
  const key = `${mode}-${deck ?? ""}-${params.again ?? ""}`;
  return <LearnSession key={key} mode={deck || mode !== "deck" ? mode : "all"} deck={deck} userKey={user?.id ?? "guest"} explicit={explicit} />;
}
