"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/data";
import { hasSupabase } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; info?: string };

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "ยังไม่ได้ตั้งค่า Supabase ในไฟล์ .env.local" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  });
  if (error) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้ยืนยันอีเมล" };
  redirect("/");
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  if (!hasSupabase) return { error: "ยังไม่ได้ตั้งค่า Supabase ในไฟล์ .env.local" };
  const password = String(form.get("password"));
  if (password.length < 8) return { error: "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร" };
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(form.get("email")),
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/");
  return { info: "ส่งลิงก์ยืนยันไปที่อีเมลแล้ว กดลิงก์นั้นแล้วกลับมาเข้าสู่ระบบ" };
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
