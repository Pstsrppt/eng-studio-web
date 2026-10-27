import fs from "node:fs";
import path from "node:path";
import type { LucideIcon } from "lucide-react";

/**
 * A photo from public/academic (see public/academic/README.md for the five files and their prompts).
 * Until a file is there, a quiet placeholder of the same shape stands in, so dropping the file in is
 * all it takes to swap it. Checked when the page is built.
 */
export function AcademicPhoto({ name, alt, icon: Icon, className = "", priority = false, fallback }: { name: string; alt: string; icon: LucideIcon; className?: string; priority?: boolean; fallback?: string }) {
  const has = (n: string) => fs.existsSync(path.join(process.cwd(), "public", "academic", `${n}.webp`));
  // A missing photo can borrow an approved one (e.g. the Home hero) instead of showing a placeholder.
  if (!has(name) && fallback && has(fallback)) name = fallback;
  const exists = has(name);
  if (exists) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP in public/academic
      <img src={`/academic/${name}.webp`} alt={alt} className={"object-cover " + className}
        loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} />
    );
  }
  return (
    <div role="img" aria-label={`${alt} (ภาพชั่วคราว)`}
      className={"relative grid place-items-center overflow-hidden bg-[linear-gradient(135deg,#f3ece0_0%,#e9dfcd_55%,#dfd2bb_100%)] " + className}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.75),transparent_55%)]" aria-hidden />
      <Icon className="relative size-12 text-primary/25" strokeWidth={1.25} aria-hidden />
      <span className="absolute top-2 right-2 max-w-[calc(100%-1rem)] truncate rounded bg-card/70 px-1.5 py-0.5 font-mono text-[10px] text-muted">ภาพชั่วคราว · {name}.webp</span>
    </div>
  );
}
