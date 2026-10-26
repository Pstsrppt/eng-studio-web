import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { PracticeSkeleton } from "@/components/skeleton";
import { VocabView } from "@/components/vocab-view";
import { DECKS, WORDS, withImages } from "@/content";
import { bangkokToday, getCards, getUser } from "@/lib/data";

export const metadata: Metadata = { title: "คำศัพท์" };

export default function VocabPage() {
  return (
    <AcademicPage className="flex flex-col gap-6">
      <PageHeader eyebrow={`VOCABULARY · ${WORDS.length} คำ · ทวนตามรอบ`} title="การ์ดคำศัพท์"
        lead="ทวนวันละ 10 ใบ คำที่จำได้แล้วจะห่างออกไปเรื่อย ๆ ส่วนคำที่ลืมจะกลับมาบ่อยขึ้น" />
      <Suspense fallback={<PracticeSkeleton />}>
        <VocabWithCards />
      </Suspense>
    </AcademicPage>
  );
}

async function VocabWithCards() {
  await connection();
  const [user, cards] = await Promise.all([getUser(), getCards("word")]);
  return <VocabView words={withImages(WORDS)} decks={DECKS} cards={cards} signedIn={Boolean(user)} today={bangkokToday()} />;
}
