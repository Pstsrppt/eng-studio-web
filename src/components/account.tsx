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
      <span className={"truncate text-xs " + (compact ? "max-w-36 text-muted" : "text-[#9fb0a9]")}>{user.email}</span>
      <button type="submit" className={"text-left text-xs underline " + (compact ? "text-muted" : "text-[#c9d4cf]")}>
        ออกจากระบบ
      </button>
    </form>
  );
}
