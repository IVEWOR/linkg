// lib/supabase/server.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Use in Route Handlers / Server Actions (writes allowed) */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies(); // ✅ await

  return createServerClient(url, anon, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value, // ✅ now safe
      set: (name, value, options) => {
        try {
          cookieStore.set(name, value, options);
        } catch {}
      },
      remove: (name, options) => {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch {}
      },
    },
  });
}

/** Use in Server Components (no cookie writes) */
export async function getSupabaseServerClientReadOnly() {
  const cookieStore = await cookies(); // ✅ await

  return createServerClient(url, anon, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: () => {}, // no-ops in RSCs
      remove: () => {},
    },
  });
}
