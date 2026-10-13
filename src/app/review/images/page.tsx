import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { WORDS, VERBS, type ImageEntry } from "@/content";
import { IS_LOCAL_DEV } from "@/lib/local-dev";
import { ImageReviewBoard, type ReviewItem } from "./review-board";

export const metadata: Metadata = { title: "ตรวจภาพประกอบ", robots: { index: false, follow: false } };

/** Local-only page for checking and approving word pictures. On the live site it doesn't exist. */
export default function ImageReviewPage() {
  if (!IS_LOCAL_DEV) notFound();
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="eyebrow">เฉพาะเครื่องนักพัฒนา · npm run dev</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">ตรวจภาพประกอบคำศัพท์</h1>
        <p className="mt-2 max-w-[70ch] text-muted">
          ภาพใหม่จะขึ้นเว็บจริงเมื่อกดอนุมัติเท่านั้น ตรวจว่าภาพตรงกับความหมายและประโยคตัวอย่าง ไม่มีตัวอักษร โลโก้ หรือกรอบ แล้วค่อยอนุมัติ
        </p>
      </header>
      <Suspense fallback={<p className="text-muted">กำลังโหลดรายการ…</p>}>
        <Board />
      </Suspense>
    </div>
  );
}

async function Board() {
  await connection();
  // Read fresh from disk so approvals show up without restarting the dev server.
  const manifest = JSON.parse(await fs.readFile(path.join(process.cwd(), "src/content/data/image-manifest.json"), "utf8")) as Record<string, ImageEntry>;

  const items: ReviewItem[] = [
    ...WORDS.map((w) => ({
      id: w.id, entry: manifest[w.id], th: w.th, ex: w.ex, exTh: w.exTh,
      card: { word: w, examples: w.ex ? [{ en: w.ex, th: w.exTh }] : [] },
    })),
    ...VERBS.map((v) => ({
      id: v.id, entry: manifest[v.id], th: v.th, ex: v.ex2, exTh: v.ex2Th, forms: `${v.v1} – ${v.v2} – ${v.v3}`,
      card: {
        word: { id: v.id, en: v.v1, th: v.th, pos: "v" as const, ipa: v.ipa?.v1, icon: v.icon, level: v.level },
        examples: [{ label: "V2", en: v.ex2 ?? "", th: v.ex2Th }, { label: "V3", en: v.ex3 ?? "", th: v.ex3Th }].filter((e) => e.en),
        forms: [{ label: "V2", text: v.v2, ipa: v.ipa?.v2 }, { label: "V3", text: v.v3, ipa: v.ipa?.v3 }],
        verb: v,
      },
    })),
  ].filter((x) => x.entry);
  return <ImageReviewBoard items={items} />;
}
