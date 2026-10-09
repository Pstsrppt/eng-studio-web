import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PracticeSkeleton } from "@/components/skeleton";
import { VerbsView } from "@/components/verbs-view";
import { VERBS, VERB_GROUPS } from "@/content";
import { bangkokToday, getCards, getUser } from "@/lib/data";

export const metadata: Metadata = { title: "V1-V2-V3" };

export default function VerbsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="eyebrow">กริยา {VERBS.length} คำ · 5 รูปแบบ</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">V1-V2-V3</h1>
        <p className="mt-2 max-w-[62ch] text-muted">
          V2 ใช้เล่าเรื่องที่จบแล้ว (I <b className="text-ink">sent</b> it.) ส่วน V3 ใช้กับ have และประโยค passive
          (I have <b className="text-ink">sent</b> it. / It was <b className="text-ink">sent</b>.) จำเป็นกลุ่มจะง่ายกว่าจำทีละคำ
        </p>
      </header>
      <Suspense fallback={<PracticeSkeleton />}>
        <VerbsWithCards />
      </Suspense>
    </div>
  );
}

async function VerbsWithCards() {
  await connection();
  const [user, cards] = await Promise.all([getUser(), getCards("verb")]);
  return <VerbsView verbs={VERBS} groups={VERB_GROUPS} cards={cards} signedIn={Boolean(user)} today={bangkokToday()} />;
}
