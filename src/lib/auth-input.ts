// Checks for the email/password forms, shared by the server actions. Supabase still has the final say (its own
// password rules and rate limits); these only catch the obvious mistakes before a request is sent.

export const PASSWORD_MIN = 8;

/** A practical email shape check: something@something.tld, no spaces. Supabase validates the address again. */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function signInError(email: string, password: string): string | undefined {
  if (!email || !password) return "กรอกอีเมลและรหัสผ่าน";
  if (!isEmail(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
  return undefined;
}

export function signUpError(email: string, password: string, confirm: string): string | undefined {
  if (!email || !password || !confirm) return "กรอกอีเมล รหัสผ่าน และยืนยันรหัสผ่านให้ครบ";
  if (!isEmail(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
  if (password.length < PASSWORD_MIN) return `รหัสผ่านต้องยาวอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`;
  if (password !== confirm) return "รหัสผ่านสองช่องไม่ตรงกัน";
  return undefined;
}
