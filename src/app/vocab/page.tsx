import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PracticeSkeleton } from "@/components/skeleton";
import { VocabView } from "@/components/vocab-view";
import { DECKS, WORDS } from "@/content";
import { bangkokToday, getCards, getUser } from "@/lib/data";

export const metadata: Metadata = { title: "คำศัพท์" };

export default function VocabPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="eyebrow">คำศัพท์ {WORDS.length} คำ · ทวนตามรอบ</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">การ์ดคำศัพท์</h1>
        <p className="mt-2 max-w-[62ch] text-muted">
          ทวนวันละ 10 ใบ คำที่จำได้แล้วจะห่างออกไปเรื่อย ๆ ส่วนคำที่ลืมจะกลับมาบ่อยขึ้น
        </p>
      </header>
      <Suspense fallback={<PracticeSkeleton />}>
        <VocabWithCards />
      </Suspense>
    </div>
  );
}

async function VocabWithCards() {
  await connection();
  const [user, cards] = await Promise.all([getUser(), getCards("word")]);
  return <VocabView words={WORDS} decks={DECKS} cards={cards} signedIn={Boolean(user)} today={bangkokToday()} />;
}
