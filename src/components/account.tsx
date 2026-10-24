import { UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { getUser } from "@/lib/data";

/** Header: the learner's initial (opens /account), or a sign-in link. */
export async function MobileAccount() {
  const user = await getUser();
  if (!user) {
    return <Link href="/login" className="rounded-full bg-mark px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink">เข้าสู่ระบบ</Link>;
  }
  return (
    <Link href="/account" aria-label={`บัญชีของฉัน (${user.email})`}
      className="grid size-8 place-items-center rounded-full bg-mark font-display text-sm font-bold text-ink">
      {user.email.slice(0, 1).toUpperCase()}
    </Link>
  );
}

/** Shown while the session is read, so the header doesn't jump. */
export function MobileAccountFallback() {
  return <span className="grid size-8 place-items-center rounded-full border border-[#22395a] text-[#c4d0dd]"><UserRoundIcon className="size-4" aria-hidden /></span>;
}
