import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AcademicPage, PageHeader } from "@/components/academic-page";
import { PracticeSkeleton } from "@/components/skeleton";
import { VerbsView } from "@/components/verbs-view";
import { VERBS, VERB_GROUPS, withImages } from "@/content";
import { bangkokToday, getCards, getUser } from "@/lib/data";

export const metadata: Metadata = { title: "V1-V2-V3" };

export default function VerbsPage() {
  return (
    <AcademicPage className="flex flex-col gap-6">
      <PageHeader eyebrow={`VERBS · กริยา ${VERBS.length} คำ · 5 รูปแบบ`} title="V1-V2-V3" lead={<>
          V2 ใช้เล่าเรื่องที่จบแล้ว (I <b className="text-ink">sent</b> it.) ส่วน V3 ใช้กับ have และประโยค passive
          (I have <b className="text-ink">sent</b> it. / It was <b className="text-ink">sent</b>.) จำเป็นกลุ่มจะง่ายกว่าจำทีละคำ
      </>} />
      <Suspense fallback={<PracticeSkeleton />}>
        <VerbsWithCards />
      </Suspense>
    </AcademicPage>
  );
}

async function VerbsWithCards() {
  await connection();
  const [user, cards] = await Promise.all([getUser(), getCards("verb")]);
  return <VerbsView verbs={withImages(VERBS)} groups={VERB_GROUPS} cards={cards} signedIn={Boolean(user)} today={bangkokToday()} />;
}
