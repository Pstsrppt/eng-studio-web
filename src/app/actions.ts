"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/data";
import { hasSupabase } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; info?: string };

const NOT_CONFIGURED = "ยังไม่ได้ตั้งค่า Supabase ในไฟล์ .env.local";

async function origin() {
  return (await headers()).get("origin") ?? "";
}

/**
 * One button for both cases: signs in if the account exists, otherwise creates it.
 */
export async function continueWithEmail(_: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: NOT_CONFIGURED };
  const email = String(form.get("email")).trim();
  const password = String(form.get("password"));
  if (password.length < 8) return { error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร" };

  const supabase = await createClient();
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signIn.error) redirect("/");
  if (signIn.error.code === "email_not_confirmed") {
    return { info: "บัญชีนี้ยังไม่ได้ยืนยันอีเมล เปิดอีเมลแล้วกดลิงก์ยืนยันก่อน" };
  }
  if (signIn.error.code !== "invalid_credentials") return { error: signIn.error.message };

  // No account with this email and password yet: try to create one.
  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (signUp.error) {
    if (signUp.error.code === "user_already_exists") return { error: "รหัสผ่านไม่ถูกต้อง" };
    if (signUp.error.code === "weak_password") return { error: "รหัสผ่านง่ายเกินไป ลองผสมตัวอักษรกับตัวเลข" };
    return { error: signUp.error.message };
  }
  if (signUp.data.session) redirect("/");
  // With email confirmation on, an existing email comes back with no identities.
  if (signUp.data.user && signUp.data.user.identities?.length === 0) return { error: "รหัสผ่านไม่ถูกต้อง" };
  return { info: `สร้างบัญชีแล้ว ส่งลิงก์ยืนยันไปที่ ${email} กดลิงก์นั้นแล้วจะเข้าใช้งานได้ทันที` };
}

/** Sends the learner to Google's sign-in page, which returns to /auth/callback. */
export async function continueWithGoogle(): Promise<AuthState> {
  if (!hasSupabase) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback` },
  });
  if (error || !data.url) return { error: "เปิดหน้า Google ไม่สำเร็จ ตรวจว่าเปิด Google ใน Supabase แล้ว" };
  redirect(data.url);
}

/** Emails a reset link. The link signs the learner in and lands on /reset-password. */
export async function requestPasswordReset(_: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: NOT_CONFIGURED };
  const email = String(form.get("email")).trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
  });
  if (error?.code === "over_email_send_rate_limit") return { error: "ขอลิงก์บ่อยเกินไป รอสักครู่แล้วลองใหม่" };
  if (error) return { error: error.message };
  // Same answer whether or not the account exists, so the form can't be used to find accounts.
  return { info: `ถ้ามีบัญชีของ ${email} ระบบส่งลิงก์ตั้งรหัสผ่านใหม่ไปแล้ว เปิดอีเมลในเครื่องนี้แล้วกดลิงก์` };
}

export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: NOT_CONFIGURED };
  const password = String(form.get("password"));
  if (password.length < 8) return { error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร" };
  if (password !== String(form.get("confirm"))) return { error: "รหัสผ่านสองช่องไม่ตรงกัน" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error?.code === "same_password") return { error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม" };
  if (error?.code === "weak_password") return { error: "รหัสผ่านง่ายเกินไป ลองผสมตัวอักษรกับตัวเลข" };
  if (error) return { error: "ลิงก์หมดอายุหรือใช้ไปแล้ว ขอลิงก์ใหม่อีกครั้ง" };
  redirect("/");
}

export async function signOut() {
  if (hasSupabase) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

type Wrong = { wrong: string; correct: string; note?: string };

/** Saves one quiz attempt plus the wrong answers. Returns false when nobody is signed in. */
export async function saveAttempt(lessonId: string, score: number, passed: boolean, wrongs: Wrong[]) {
  const user = await getUser();
  if (!user) return false;
  const supabase = await createClient();
  const { error } = await supabase.from("lesson_attempts").insert({ lesson_id: lessonId, score, passed });
  if (error) throw new Error(error.message);
  if (wrongs.length) {
    await supabase
      .from("mistakes")
      .insert(wrongs.slice(0, 20).map((w) => ({ source: `grammar:${lessonId}`, ...w })));
  }
  return true;
}

/** Records one flashcard or verb-drill answer and moves the card to its next Leitner box. */
export async function reviewCard(input: {
  itemId: string;
  kind: "word" | "verb";
  correct: boolean;
  answer?: string;
  ms?: number;
  /** Set for a wrong verb answer, e.g. "go – went – gone". */
  expected?: string;
}) {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_review", {
    p_item_id: input.itemId,
    p_kind: input.kind,
    p_correct: input.correct,
    p_answer: input.answer ?? null,
    p_ms: input.ms ?? null,
  });
  if (error) throw new Error(error.message);
  if (!input.correct && input.expected && input.answer) {
    await supabase.from("mistakes").insert({
      source: `${input.kind}:${input.itemId}`,
      wrong: input.answer,
      correct: input.expected,
      note: "V1-V2-V3",
    });
  }
  return data as { box: number; due_on: string };
}

/** Adds a word to the learner's review deck. Words outside the course get a "u-" id. */
export async function addCard(input: { itemId?: string; kind: "word" | "verb"; en: string; th: string }) {
  const user = await getUser();
  if (!user) return "signed-out" as const;
  const supabase = await createClient();
  const custom = !input.itemId;
  const { error } = await supabase.from("cards").upsert(
    {
      item_id: input.itemId ?? `u-${input.en.toLowerCase()}`,
      kind: input.kind,
      custom_en: custom ? input.en : null,
      custom_th: custom ? input.th : null,
    },
    { onConflict: "user_id,item_id", ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
  return "added" as const;
}
