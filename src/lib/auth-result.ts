// What the sign-up form shows for each Supabase signUp() result. Pure, so every branch is tested.
//
// How much this hides about existing accounts depends on the Supabase project:
// - Email confirmation ON: Supabase answers an existing address like a new one (a user with no identities, and no
//   email is sent). Both get the same "check your email" screen.
// - Email confirmation OFF: a new address is signed in at once, an existing one is refused (user_already_exists).
//   That difference can't be hidden, since a new account opens a session. The refusal uses the same message as
//   any other sign-up failure, so the wording doesn't single out an existing account.
// Other signals (response time, the sign-in form) are outside this function.

type SupabaseError = { code?: string; status?: number } | null;
type SignUpResult = { data: { session: unknown } | null; error: SupabaseError };
export type SignUpOutcome = { error?: string; sent?: string; created?: boolean };

/** One message for every sign-up failure that isn't the learner's input, an existing address included. */
export const SIGNUP_FAILED = "สมัครไม่สำเร็จ ถ้าเคยสมัครด้วยอีเมลนี้แล้ว ให้เข้าสู่ระบบหรือตั้งรหัสผ่านใหม่ ไม่อย่างนั้นลองใหม่อีกครั้ง";
export const SIGNUP_WEAK = "รหัสผ่านง่ายเกินไปตามเงื่อนไขของระบบ ลองให้ยาวขึ้นและผสมตัวอักษรกับตัวเลข";
export const SIGNUP_BAD_EMAIL = "ใช้อีเมลนี้สมัครไม่ได้ ตรวจรูปแบบอีเมลอีกครั้ง";
export const SIGNUP_LIMITED = "มีการสมัครหรือส่งอีเมลบ่อยเกินไป รอสักครู่แล้วลองใหม่";

export function isRateLimited(e: { status?: number; code?: string }): boolean {
  return e.status === 429 || e.code === "over_email_send_rate_limit" || e.code === "over_request_rate_limit";
}

export function signUpOutcome(email: string, { data, error }: SignUpResult): SignUpOutcome {
  if (error) {
    if (error.code === "weak_password") return { error: SIGNUP_WEAK };
    if (error.code === "email_address_invalid" || error.code === "validation_failed") return { error: SIGNUP_BAD_EMAIL };
    if (isRateLimited(error)) return { error: SIGNUP_LIMITED };
    // user_already_exists (confirmation off) and anything unexpected.
    return { error: SIGNUP_FAILED };
  }
  // Confirmation off: created and signed in.
  if (data?.session) return { created: true };
  // Confirmation on: new and existing addresses alike.
  return { sent: email };
}
