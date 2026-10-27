import { UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/data";

/** Header: the learner's initial (opens /account), or a sign-in link. */
export async function MobileAccount() {
  const user = await getUser();
  if (!user) {
    return <Link href="/login" className="account-chip rounded-full bg-mark px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink">เข้าสู่ระบบ</Link>;
  }
  return (
    <Link href="/account" aria-label={`บัญชีของฉัน (${user.email})`}
      className="account-chip grid size-8 place-items-center rounded-full bg-mark font-display text-sm font-bold text-ink lg:size-10 lg:text-base">
      {user.email.slice(0, 1).toUpperCase()}
    </Link>
  );
}

/** Shown while the session is read, so the header doesn't jump. */
export function MobileAccountFallback() {
  return <span className="grid size-8 place-items-center rounded-full border border-rule text-muted lg:size-10"><UserRoundIcon className="size-4" aria-hidden /></span>;
}
