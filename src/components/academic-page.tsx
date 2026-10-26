import type { ReactNode } from "react";

/**
 * Puts a page on the Academic Studio theme: the .theme-academic tokens plus the .academic-page mapping
 * that restyles the older shared classes (.card, .btn, .eyebrow, .input) the page is built from.
 */
export function AcademicPage({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={"theme-academic academic-page " + className}>{children}</div>;
}

/** The title block every Academic page opens with: gold eyebrow, serif title, a line of context. */
export function PageHeader({ eyebrow, title, lead, children, className = "" }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** Actions or a summary that sit beside the title on wide screens. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header className={"flex flex-wrap items-end justify-between gap-x-6 gap-y-4 " + className}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-[30px] leading-[1.15] font-bold text-balance sm:text-[38px]">{title}</h1>
        {lead && <p className="mt-2.5 text-[16px] leading-7 text-(--ac-body)">{lead}</p>}
      </div>
      {children}
    </header>
  );
}
