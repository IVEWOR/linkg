"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithX() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitter", // or 'twitter_oauth2' if your project uses that id
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
    },
  });
  if (error) throw new Error(error.message);
  redirect(data.url);
}

export async function signUpWithEmail(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function signInWithEmail(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
