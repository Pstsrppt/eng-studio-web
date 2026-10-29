// The sign-in pages' own full-screen layout (the site header, footer and tab bar are left out; see SiteFrame).
// Computers (lg and up): Editorial Gateway, a dark editorial panel (about 55%) beside the form (about 45%).
// Phones and tablets: Minimal, only compact branding, a way back home and the form on a light background. The
// editorial panel, its photo and copy are not shown there at all.
import { ArrowLeftIcon, BookOpenCheckIcon, LayersIcon, LibraryBigIcon, MapIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { AcademicPhoto } from "@/components/academic-photo";
import { OdysseyMark } from "@/components/odyssey-mark";
import { AuthTabs } from "./auth-tabs";

export type Editorial = {
  eyebrow: string;
  /** Two short serif lines; the second is set in champagne gold. */
  headline: [string, string];
  lead: string;
  /** A photo from public/academic, or null for no photo (recovery pages). */
  photo: string | null;
  highlights: { Icon: LucideIcon; text: string }[];
};

export const EDITORIAL: Editorial = {
  eyebrow: "YOUR IELTS JOURNEY",
  headline: ["Learn with clarity.", "Grow with purpose."],
  lead: "บัญชีเดียว เว็บจำบทที่ผ่าน คำที่ต้องทวน และข้อที่ผิดบ่อยไว้ให้ เรียนต่อได้ทุกเครื่อง",
  photo: "hero-study",
  highlights: [
    { Icon: BookOpenCheckIcon, text: "Grammar ทีละบท พร้อมแบบทดสอบท้ายบท" },
    { Icon: LayersIcon, text: "Flashcards ทวนตามรอบ คำไหนลืมจะกลับมาเร็ว" },
    { Icon: MapIcon, text: "Roadmap 7 Stage สู่ Band เป้าหมาย" },
  ],
};

function Brand({ onDark = false, compact = false }: { onDark?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex w-fit shrink-0 items-center gap-2.5" aria-label="Odyssey หน้าแรก">
      {/* The mark keeps its own navy and gold, so on the dark panel it sits on a white tile. */}
      <span className={onDark ? "grid size-10 place-items-center rounded-xl bg-white" : ""}><OdysseyMark className={compact ? "size-7" : "size-8"} /></span>
      <span className="flex flex-col leading-none">
        <span className={"ac-serif font-bold tracking-[0.14em] " + (compact ? "text-[17px] " : "text-[19px] ") + (onDark ? "text-white" : "text-(--ac-navy)")}>ODYSSEY</span>
        <span className={"mt-1 font-mono text-[9.5px] whitespace-nowrap " + (compact ? "tracking-[0.16em] " : "tracking-[0.24em] ") + (onDark ? "text-on-dark-muted" : "text-(--ac-muted)")}>IELTS · A HIGHER YOU</span>
      </span>
    </Link>
  );
}

function EditorialPanel({ e }: { e: Editorial }) {
  return (
    <aside className="on-dark relative hidden flex-col gap-10 overflow-hidden bg-(--ac-dark) px-12 py-10 text-white lg:flex xl:px-16 xl:py-12" aria-label="Odyssey">
      <Brand onDark />
      <div className="flex flex-1 flex-col justify-center gap-8">
        <div className="flex max-w-xl flex-col gap-5">
          <p className="font-mono text-[11px] tracking-[0.22em] text-(--ac-gold-bright)">{e.eyebrow}</p>
          <h2 className="ac-serif text-[44px] leading-[1.08] font-bold tracking-[-0.01em] xl:text-[54px]">
            {e.headline[0]}<br /><span className="text-(--ac-gold-bright)">{e.headline[1]}</span>
          </h2>
          <p className="max-w-[46ch] text-[16px] leading-7 text-on-dark">{e.lead}</p>
        </div>
        {e.photo && (
          <div className="aspect-[16/6] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10">
            <AcademicPhoto name={e.photo} alt="" icon={LibraryBigIcon} className="size-full object-[50%_45%]" />
          </div>
        )}
        <ul className="grid max-w-2xl gap-x-6 gap-y-3 text-sm leading-6 text-on-dark xl:grid-cols-3">
          {e.highlights.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-2.5">
              <Icon className="mt-0.5 size-4 shrink-0 text-(--ac-gold-bright)" aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs leading-5 text-on-dark-muted">Odyssey เป็นเว็บเตรียมสอบอิสระ ไม่ได้เป็นส่วนหนึ่งของหรือได้รับการรับรองโดยผู้จัดสอบ IELTS</p>
    </aside>
  );
}

/**
 * One layout for /login, /signup, /forgot-password, /reset-password and /welcome.
 * `tabs`: show the Login / Sign Up switch with that one selected. `editorial`: override parts of the left panel.
 */
export function AuthShell({ title, lead, tabs, editorial, children }: {
  title: string;
  lead?: React.ReactNode;
  tabs?: "login" | "signup";
  editorial?: Partial<Editorial>;
  children: React.ReactNode;
}) {
  return (
    <div className="theme-academic academic-page min-h-dvh bg-(--ac-bg) text-(--ac-ink) lg:grid lg:grid-cols-[55fr_45fr]">
      <EditorialPanel e={{ ...EDITORIAL, ...editorial }} />
      <main className="flex min-h-dvh flex-col bg-(--ac-bg) pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:bg-card">
        <div className="flex items-center justify-between gap-4 px-5 pt-4 sm:px-8 lg:justify-end lg:px-12 lg:pt-8">
          <span className="lg:hidden"><Brand compact /></span>
          <Link href="/" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap text-(--ac-body) hover:text-(--ac-navy)">
            {/* 320px phones: just "หน้าแรก", so the row fits beside the brand. */}
            <ArrowLeftIcon className="size-4" aria-hidden /> <span><span className="hidden min-[360px]:inline">กลับ</span>หน้าแรก</span>
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col gap-6 px-5 pt-6 pb-10 sm:px-8 sm:pt-10 lg:justify-center lg:px-0 lg:py-12">
          <header className="flex flex-col gap-2">
            <h1 className="text-[28px] leading-[1.2] font-bold text-balance text-(--ac-heading) sm:text-[32px]">{title}</h1>
            {lead && <p className="text-[15px] leading-6 text-(--ac-body)">{lead}</p>}
          </header>
          {tabs && <AuthTabs active={tabs} />}
          {children}
        </div>
      </main>
    </div>
  );
}
