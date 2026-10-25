"use client";

import { useStudy } from "../study-context";

/** A Thai translation line that follows the header's "คำแปลไทย" toggle, like lesson sentences do. */
export function Thai({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { showThai } = useStudy();
  if (!showThai) return null;
  return <span lang="th" className={"block " + className}>{children}</span>;
}
