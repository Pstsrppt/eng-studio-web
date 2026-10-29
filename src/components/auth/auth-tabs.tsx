import Link from "next/link";

const TABS = [
  { id: "login", href: "/login", label: "เข้าสู่ระบบ" },
  { id: "signup", href: "/signup", label: "สมัครสมาชิก" },
] as const;

/** Login / Sign Up switch. They are two pages, so these are links (the current one marked aria-current). */
export function AuthTabs({ active }: { active: "login" | "signup" }) {
  return (
    <nav aria-label="เข้าสู่ระบบหรือสมัครสมาชิก" className="grid grid-cols-2 gap-1 rounded-xl bg-sunken p-1">
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <Link key={t.id} href={t.href} aria-current={on ? "page" : undefined}
            className={"grid min-h-11 place-items-center rounded-lg px-3 text-[15px] transition-colors " +
              (on ? "bg-card font-semibold text-(--ac-navy) shadow-[0_1px_2px_rgb(var(--od-shadow-rgb)/0.12)]" : "text-(--ac-body) hover:text-(--ac-navy)")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
