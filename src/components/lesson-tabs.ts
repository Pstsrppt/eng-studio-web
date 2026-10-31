// The sections of a lesson. Apart from LessonView so the focus row's label can be tested without a browser.

export const TABS = [
  { id: "learn", label: "Learn", th: "เรียน" },
  { id: "practice", label: "Practice", th: "ฝึก" },
  { id: "quiz", label: "Quiz", th: "ทดสอบ" },
  { id: "real", label: "Real-life", th: "ใช้จริง" },
  { id: "summary", label: "Summary", th: "สรุป" },
] as const;

export type Tab = (typeof TABS)[number]["id"];

/** Each tab and the panel it opens point at each other through these ids. `base` keeps them apart from a lesson Next still holds hidden. */
export const tabId = (base: string, tab: Tab) => `${base}-tab-${tab}`;
export const panelId = (base: string, tab: Tab) => `${base}-panel-${tab}`;

/** The name of the section being shown, as on its tab. */
export function sectionLabel(tab: Tab): string {
  return TABS.find((t) => t.id === tab)?.label ?? "";
}
