"use client";

import { LandmarkIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TopNav } from "./nav";
import { ThaiToggle } from "./thai-toggle";

/** Pages already on the Academic Studio theme get the light header; the rest keep the dark one. */
const LIGHT_PAGES = new Set(["/"]);

/** The site header. `account` is rendered on the server (it reads the session) and passed in. */
export function SiteHeader({ account }: { account: React.ReactNode }) {
  const light = LIGHT_PAGES.has(usePathname());
  return (
    <header className={"sticky top-0 z-30 border-b backdrop-blur-md " +
      (light ? "theme-academic border-[#ebe5d9] bg-white/95 text-[#0f2440]" : "on-dark border-white/10 bg-[rgba(7,24,43,0.92)] text-white")}>
      <div className={"mx-auto flex h-[62px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[70px] " + (light ? "max-w-[1520px] lg:px-10 2xl:px-12" : "max-w-[1440px]")}>
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Odyssey หน้าแรก">
          {light && <LandmarkIcon className="size-8 text-[#0f2440]" strokeWidth={1.6} aria-hidden />}
          <span className="flex flex-col leading-none">
            <span className={"text-[19px] font-bold tracking-[0.14em] " + (light ? "ac-serif text-[#0f2440]" : "font-brand tracking-[0.18em] text-white")}>ODYSSEY</span>
            <span className={"mt-1 font-mono text-[9.5px] tracking-[0.2em] whitespace-nowrap sm:tracking-[0.28em] " + (light ? "text-[#626b7a]" : "text-gold")}>IELTS · A HIGHER YOU</span>
          </span>
        </Link>
        <div className="hidden min-w-0 flex-1 justify-center lg:flex"><TopNav light={light} /></div>
        <div className="flex items-center gap-2">
          <Link href="/guide" className={"hidden rounded-full border px-3 py-1.5 text-xs lg:block " +
            (light ? "border-[#ebe5d9] text-[#3d4757] hover:border-[#0f2440]" : "border-white/15 text-[#c4d0dd] hover:text-white")}>คู่มือ</Link>
          <ThaiToggle dark={!light} />
          {account}
        </div>
      </div>
    </header>
  );
}
