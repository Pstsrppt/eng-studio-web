"use client";

import Link from "next/link";
import { useRef } from "react";
import { TopNav } from "./nav";
import { OdysseyMark } from "./odyssey-mark";
import { usePinnedHeight } from "./pinned-bar";
import { ThaiToggle } from "./thai-toggle";

/** The site header, light on every page. `account` is rendered on the server (it reads the session) and passed in. */
export function SiteHeader({ account }: { account: React.ReactNode }) {
  const bar = useRef<HTMLElement>(null);
  usePinnedHeight(bar, "--header-h");
  return (
    <header ref={bar} className="theme-academic sticky top-0 z-30 border-b border-rule bg-card/95 text-primary backdrop-blur-md">
      <div className="mx-auto flex h-[62px] max-w-[1520px] items-center justify-between gap-4 px-4 cramped:gap-2 cramped:px-2 sm:px-6 lg:h-[70px] lg:px-10 2xl:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Odyssey หน้าแรก">
          <OdysseyMark className="size-8" />
          <span className="flex flex-col leading-none cramped:hidden">
            <span className="ac-serif text-[19px] font-bold tracking-[0.14em] text-primary">ODYSSEY</span>
            <span className="mt-1 font-mono text-[9.5px] tracking-[0.2em] whitespace-nowrap text-muted sm:tracking-[0.28em]">IELTS · A HIGHER YOU</span>
          </span>
        </Link>
        <div className="hidden min-w-0 flex-1 justify-center lg:flex"><TopNav /></div>
        <div className="flex items-center gap-2">
          <ThaiToggle />
          {/* Phones reach the account from the บัญชี tab, so the header keeps it for computers only. */}
          <div className="hidden lg:block">{account}</div>
        </div>
      </div>
    </header>
  );
}
