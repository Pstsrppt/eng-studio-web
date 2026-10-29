// Which primary menu item a page belongs to. One function for the desktop menu and the phone tab bar,
// so the two can never highlight different things.

export type NavGroup = "home" | "study" | "roadmap" | "ielts" | "tools" | "account";
export type NavLink = { href: string; label: string; sub: string };

/** The study pages grouped under "เรียน"; they share the sub-menu on phones. */
export const STUDY_LINKS: NavLink[] = [
  { href: "/today", label: "วันนี้", sub: "แผนวันนี้และบทที่เรียนต่อ" },
  { href: "/grammar", label: "บทเรียน", sub: "ไวยากรณ์ A1–B2 ทีละบท" },
  { href: "/learn", label: "ฝึกศัพท์", sub: "Flashcards ทวนตามรอบ" },
  { href: "/vocab", label: "คำศัพท์", sub: "คลังคำศัพท์ทั้งหมด" },
];

export const TOOL_LINKS: NavLink[] = [
  { href: "/verbs", label: "V1-V2-V3", sub: "กริยาผันไม่ปกติ" },
  { href: "/sounds", label: "ออกเสียง", sub: "เสียงที่คนไทยมักออกผิด" },
  { href: "/mistakes", label: "ทบทวนข้อผิด", sub: "ทำข้อที่เคยตอบผิดซ้ำจนถูก" },
  { href: "/guide", label: "คู่มือ", sub: "n. v. adj. V3 กริยาช่วย คืออะไร" },
];

/** Where "เรียน" goes: the study overview (continue, review and a way into every study page). */
export const STUDY_HOME = "/study";

/** The desktop เรียน menu: the overview first, then the four pages. */
export const STUDY_MENU: NavLink[] = [
  { href: STUDY_HOME, label: "ภาพรวมการเรียน", sub: "เรียนต่อ ทวน และทุกส่วนในที่เดียว" },
  ...STUDY_LINKS,
];

const under = (pathname: string, base: string) => pathname === base || pathname.startsWith(base + "/");

export function navGroup(pathname: string): NavGroup | null {
  if (pathname === "/") return "home";
  if (STUDY_MENU.some((l) => under(pathname, l.href))) return "study";
  if (TOOL_LINKS.some((l) => under(pathname, l.href))) return "tools";
  if (under(pathname, "/roadmap")) return "roadmap";
  if (under(pathname, "/ielts")) return "ielts";
  if (["/account", "/login", "/welcome", "/forgot-password", "/reset-password"].some((b) => under(pathname, b))) return "account";
  return null;
}

/**
 * aria-current for a primary link. "page" only when the link goes to the page being shown; "true" when the page
 * belongs to the link's group (e.g. /grammar under the เรียน tab, which links to /today), so a screen reader hears
 * the selected item without being told that /today is the current page. The sky-blue bar shows the group either way.
 */
export function ariaCurrent(pathname: string, href: string, groupActive: boolean): "page" | "true" | undefined {
  if (pathname === href) return "page";
  return groupActive ? "true" : undefined;
}

/** The study page whose sub-menu item is current: the four list pages only, not a lesson or a flashcard session. */
export function studyPage(pathname: string): string | null {
  return STUDY_LINKS.find((l) => l.href === pathname)?.href ?? null;
}
