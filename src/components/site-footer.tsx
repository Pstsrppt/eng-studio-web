"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DISCLAIMER, TRADEMARK_NOTE } from "@/content/ielts-guide";

/** The independence notice on every page, in both languages. Left out of the learn session, whose action bar sits at the bottom. */
export function SiteFooter() {
  if (usePathname().startsWith("/learn/session")) return null;
  return (
    <footer className="theme-academic border-t border-rule bg-page-alt text-body">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-2 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-xs leading-5 sm:px-6 lg:px-10 lg:pb-8 2xl:px-12">
        <p lang="th">{DISCLAIMER.th}</p>
        <p lang="th">{TRADEMARK_NOTE.th}</p>
        <p lang="en">{DISCLAIMER.en} {TRADEMARK_NOTE.en}</p>
        <p>
          <Link href="/ielts#about-odyssey" className="inline-flex min-h-6 items-center font-semibold text-primary underline underline-offset-2">เกี่ยวกับข้อมูล IELTS ในเว็บนี้</Link>
        </p>
      </div>
    </footer>
  );
}
