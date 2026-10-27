"use client";

import { BookOpenIcon, ChevronDownIcon, CompassIcon, HomeIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { STUDY_HOME, STUDY_LINKS, TOOL_LINKS, navGroup, studyPage, type NavGroup, type NavLink } from "./nav-groups";

const ITEM = "relative inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] whitespace-nowrap transition";
const itemTone = (on: boolean) => (on ? "font-semibold text-primary" : "text-body hover:bg-accent-soft hover:text-primary");
/** The current item: a copper bar under it plus aubergine, bold text, so it never relies on colour alone. */
const Bar = () => <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-accent" aria-hidden />;

/** Top bar on computers: หน้าแรก · เรียน ▾ · Roadmap · IELTS · เครื่องมือ ▾. */
export function TopNav() {
  const pathname = usePathname();
  const group = navGroup(pathname);
  // Which menu is open, remembered with the page it was opened on, so moving to another page closes it.
  const [open, setOpen] = useState<{ id: NavGroup; at: string } | null>(null);
  const openId = open?.at === pathname ? open.id : null;
  const toggle = (id: NavGroup) => setOpen(openId === id ? null : { id, at: pathname });
  const close = () => setOpen(null);

  const link = (href: string, label: string, g: NavGroup) => (
    <Link href={href} aria-current={pathname === href ? "page" : undefined} className={ITEM + " " + itemTone(group === g)}>
      {label}
      {group === g && <Bar />}
    </Link>
  );

  return (
    <nav aria-label="เมนูหลัก" className="flex min-w-0 items-center gap-0.5">
      {link("/", "หน้าแรก", "home")}
      <Disclosure label="เรียน" links={STUDY_LINKS} active={group === "study"} open={openId === "study"} pathname={pathname}
        onToggle={() => toggle("study")} onClose={close} />
      {link("/roadmap", "Roadmap", "roadmap")}
      {link("/ielts", "IELTS", "ielts")}
      <Disclosure label="เครื่องมือ" links={TOOL_LINKS} active={group === "tools"} open={openId === "tools"} pathname={pathname}
        onToggle={() => toggle("tools")} onClose={close} />
    </nav>
  );
}

/** A button that shows a short list of links below it. Click, Enter or Space opens it; Escape, a click outside
    or tabbing away closes it. Not a hover menu, so it works the same with a mouse, a finger or a keyboard. */
function Disclosure({ label, links, active, open, pathname, onToggle, onClose }: {
  label: string; links: NavLink[]; active: boolean; open: boolean; pathname: string; onToggle: () => void; onClose: () => void;
}) {
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) onClose(); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open, onClose]);

  return (
    <div ref={wrap} className="relative"
      onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); onClose(); button.current?.focus(); } }}
      onBlur={(e) => { if (open && !wrap.current?.contains(e.relatedTarget as Node)) onClose(); }}>
      <button ref={button} type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}
        className={ITEM + " " + itemTone(active)}>
        {label}
        {active && <span className="sr-only"> (หน้าปัจจุบันอยู่ในเมนูนี้)</span>}
        <ChevronDownIcon className={"size-4 transition " + (open ? "rotate-180" : "")} aria-hidden />
        {active && <Bar />}
      </button>
      <div id={id} hidden={!open}
        className="absolute top-[calc(100%+10px)] left-0 z-40 w-72 rounded-2xl border border-rule bg-card p-2 shadow-[0_18px_40px_-18px_rgb(var(--od-shadow-rgb)/0.35)]">
        <ul className="flex flex-col">
          {links.map((l) => {
            const on = pathname === l.href;
            return (
              <li key={l.href}>
                <Link href={l.href} aria-current={on ? "page" : undefined} onClick={onClose}
                  className={"flex flex-col rounded-xl px-3 py-2.5 transition " + (on ? "bg-accent-soft" : "hover:bg-sunken")}>
                  <span className={"text-[15px] " + (on ? "font-semibold text-primary" : "font-medium text-heading")}>{l.label}</span>
                  <span className="text-xs text-muted">{l.sub}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Phones: four tabs. "เรียน" opens /today until the study hub exists; its pages share the sub-menu below. */
const TABS = [
  { href: "/", label: "หน้าแรก", Icon: HomeIcon, group: "home" },
  { href: STUDY_HOME, label: "เรียน", Icon: BookOpenIcon, group: "study" },
  { href: "/roadmap", label: "Roadmap", Icon: CompassIcon, group: "roadmap" },
  { href: "/account", label: "บัญชี", Icon: UserRoundIcon, group: "account" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const group = navGroup(pathname);
  return (
    <nav aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-rule bg-card/95 pt-1.5 pb-[calc(0.6rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-18px_rgb(var(--od-shadow-rgb)/0.35)] backdrop-blur-md lg:hidden">
      {TABS.map(({ href, label, Icon, group: g }) => {
        const on = group === g;
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={"relative flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] " + (on ? "font-semibold text-primary" : "text-muted hover:text-primary")}>
            {on && <span className="absolute -top-1.5 h-[3px] w-8 rounded-full bg-accent" aria-hidden />}
            <Icon className="size-5" strokeWidth={on ? 2.2 : 1.8} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The sub-menu at the top of the four study pages, on every width: one tap between Today, lessons, flashcards and words. */
export function StudyNav() {
  const pathname = usePathname();
  const current = studyPage(pathname);
  if (!current) return null;
  return (
    <div className="theme-academic border-b border-rule bg-page">
      <nav aria-label="เมนูการเรียน"
        className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:px-6 lg:px-10">
        {STUDY_LINKS.map((l) => {
          const on = l.href === current;
          return (
            <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined}
              className={"inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm whitespace-nowrap transition " +
                (on ? "bg-primary font-semibold text-white" : "text-body hover:bg-accent-soft hover:text-primary")}>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
