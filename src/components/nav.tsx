"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/", label: "วันนี้", code: "01" },
  { href: "/grammar", label: "Grammar", code: "Gr" },
  { href: "/verbs", label: "V1-V2-V3", code: "V3" },
  { href: "/vocab", label: "คำศัพท์", code: "Wd" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="เมนูหลัก">
      {NAV.map((item) => {
        const on = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition " +
              (on ? "bg-ink-2 text-white" : "text-[#c9d4cf] hover:bg-ink-2/60")
            }
          >
            <span className={"w-6 font-mono text-[11px] " + (on ? "text-mark" : "text-[#7f918a]")}>{item.code}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      {NAV.map((item) => {
        const on = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={"flex flex-col items-center gap-1 text-[11px] " + (on ? "font-semibold text-brand" : "text-muted")}
          >
            <span
              className={
                "grid h-6 min-w-9 place-items-center rounded-md px-1 font-mono text-[10px] " +
                (on ? "bg-brand-soft text-brand" : "border border-line")
              }
            >
              {item.code}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
