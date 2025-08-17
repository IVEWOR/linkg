// app/auth/confirmed/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supa = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ConfirmedPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/login";

  const [status, setStatus] = useState("checking"); // checking | signed-in | signed-out

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supa.auth.getSession();
      setStatus(session?.user ? "signed-in" : "signed-out");
    })();
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center px-4">
      <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold">Email confirmed 🎉</h1>
        {status === "checking" && (
          <p className="mt-2 text-sm text-gray-300">Verifying your session…</p>
        )}
        {status === "signed-in" && (
          <>
            <p className="mt-2 text-sm text-gray-300">
              Your account is verified and you’re signed in.
            </p>
            <button
              className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              onClick={() => router.replace(next)}
            >
              Continue
            </button>
          </>
        )}
        {status === "signed-out" && (
          <>
            <p className="mt-2 text-sm text-gray-300">
              Your email is verified. Please sign in to continue.
            </p>
            <button
              className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm
                         font-semibold text-white hover:bg-white/10"
              onClick={() =>
                router.replace(`/login?next=${encodeURIComponent(next)}`)
              }
            >
              Go to Sign In
            </button>
          </>
        )}
      </div>
    </main>
  );
}
