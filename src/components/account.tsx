import { UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { getUser } from "@/lib/data";

export async function Account({ compact = false }: { compact?: boolean }) {
  const user = await getUser();
  if (!user) {
    return (
      <Link href="/login" className={compact ? "text-sm font-semibold text-brand" : "btn w-full"}>
        เข้าสู่ระบบเพื่อบันทึก
      </Link>
    );
  }
  return (
    <form action={signOut} className={compact ? "flex items-center gap-2" : "flex flex-col gap-1"}>
      <Link href="/account" className={"truncate text-xs hover:underline " + (compact ? "max-w-36 text-muted" : "text-[#9fb0a9]")}>{user.email}</Link>
      <button type="submit" className={"text-left text-xs underline " + (compact ? "text-muted" : "text-[#c9d4cf]")}>
        ออกจากระบบ
      </button>
    </form>
  );
}

/** Phone header: the learner's initial (opens /account), or a sign-in link. */
export async function MobileAccount() {
  const user = await getUser();
  if (!user) {
    return <Link href="/login" className="rounded-full bg-mark px-3 py-1.5 text-xs font-semibold text-ink">เข้าสู่ระบบ</Link>;
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
  return <span className="grid size-8 place-items-center rounded-full border border-[#2c3f37] text-[#c9d4cf]"><UserRoundIcon className="size-4" aria-hidden /></span>;
}
