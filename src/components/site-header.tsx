"use client";

import Link from "next/link";
import { TopNav } from "./nav";
import { OdysseyMark } from "./odyssey-mark";
import { ThaiToggle } from "./thai-toggle";

/** The site header, light on every page. `account` is rendered on the server (it reads the session) and passed in. */
export function SiteHeader({ account }: { account: React.ReactNode }) {
  return (
    <header className="theme-academic sticky top-0 z-30 border-b border-[#ebe5d9] bg-white/95 text-[#0f2440] backdrop-blur-md">
      <div className="mx-auto flex h-[62px] max-w-[1520px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[70px] lg:px-10 2xl:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Odyssey หน้าแรก">
          <OdysseyMark className="size-8" />
          <span className="flex flex-col leading-none">
            <span className="ac-serif text-[19px] font-bold tracking-[0.14em] text-[#0f2440]">ODYSSEY</span>
            <span className="mt-1 font-mono text-[9.5px] tracking-[0.2em] whitespace-nowrap text-[#626b7a] sm:tracking-[0.28em]">IELTS · A HIGHER YOU</span>
          </span>
        </Link>
        <div className="hidden min-w-0 flex-1 justify-center lg:flex"><TopNav /></div>
        <div className="flex items-center gap-2">
          <Link href="/guide" className="hidden rounded-full border border-[#ebe5d9] px-3 py-1.5 text-xs text-[#3d4757] hover:border-[#0f2440] lg:block">คู่มือ</Link>
          <ThaiToggle />
          {account}
        </div>
      </div>
    </header>
  );
}
