"use client";

import { CompassIcon, HomeIcon, LayersIcon, LibraryBigIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Top bar on computers. Everything else (V1-V2-V3, sounds, mistakes, guide) is on /account and the roadmap. */
export const NAV = [
  { href: "/", label: "หน้าแรก" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/today", label: "วันนี้" },
  { href: "/grammar", label: "บทเรียน" },
  { href: "/learn", label: "ฝึกศัพท์" },
  { href: "/vocab", label: "คำศัพท์" },
  { href: "/verbs", label: "V1-V2-V3" },
  { href: "/sounds", label: "ออกเสียง" },
] as const;

/** The five a phone's tab bar has room for. */
const TABS = [
  { href: "/", label: "หน้าแรก", Icon: HomeIcon },
  { href: "/roadmap", label: "Roadmap", Icon: CompassIcon },
  { href: "/today", label: "วันนี้", Icon: SunIcon },
  { href: "/learn", label: "ฝึกศัพท์", Icon: LayersIcon },
  { href: "/vocab", label: "คำศัพท์", Icon: LibraryBigIcon },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // A lesson page belongs to the roadmap it was opened from.
  if (href === "/grammar") return pathname.startsWith("/grammar");
  return pathname.startsWith(href);
}

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="เมนูหลัก" className="flex min-w-0 items-center gap-0.5">
      {NAV.map((item, i) => {
        const on = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} aria-current={on ? "page" : undefined}
            className={"relative rounded-lg px-3 py-2 text-[15px] whitespace-nowrap transition " + (i > 5 ? "hidden xl:block " : "") +
              (on ? "font-semibold text-[#0f2440]" : "text-[#3d4757] hover:bg-[#f5efe3] hover:text-[#0f2440]")}>
            {item.label}
            {on && <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-[#b8843d]" aria-hidden />}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#ebe5d9] bg-white/95 pt-1.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-18px_rgba(15,36,64,0.35)] backdrop-blur-md lg:hidden">
      {TABS.map(({ href, label, Icon }) => {
        const on = isActive(pathname, href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={"relative flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] " + (on ? "font-semibold text-[#0f2440]" : "text-[#626b7a] hover:text-[#0f2440]")}>
            {/* The current tab: a gold bar on top plus navy, bold text, so it never relies on colour alone. */}
            {on && <span className="absolute -top-1.5 h-[3px] w-8 rounded-full bg-[#b8843d]" aria-hidden />}
            <Icon className="size-5" strokeWidth={on ? 2.2 : 1.8} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
