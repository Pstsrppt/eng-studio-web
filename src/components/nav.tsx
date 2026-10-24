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
            className={"relative rounded-lg px-3 py-2 text-sm whitespace-nowrap transition " + (i > 5 ? "hidden xl:block " : "") +
              (on ? "font-semibold text-white" : "text-[#c4d0dd] hover:bg-white/5 hover:text-white")}>
            {item.label}
            {on && <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-gold" aria-hidden />}
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
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-navy pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      {TABS.map(({ href, label, Icon }) => {
        const on = isActive(pathname, href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={"flex flex-col items-center gap-1 text-[11px] " + (on ? "font-semibold text-gold" : "text-[#9fb0c4]")}>
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
