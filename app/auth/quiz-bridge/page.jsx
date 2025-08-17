"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supa = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function QuizBridgePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/profiles";

  useEffect(() => {
    async function run() {
      const {
        data: { session },
      } = await supa.auth.getSession();
      if (!session?.access_token) {
        const self = `/auth/quiz-bridge?next=${encodeURIComponent(next)}`;
        router.replace(`/login?next=${encodeURIComponent(self)}`);
        return;
      }

      const raw = localStorage.getItem("lg_quiz");
      if (raw) {
        try {
          await fetch("/api/quiz/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            credentials: "include",
            body: raw,
          });
          localStorage.removeItem("lg_quiz");
        } catch {}
      }

      router.replace(next);
    }
    run();
  }, [router, next]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 text-sm text-gray-300">
      Saving your quiz to your profile…
    </div>
  );
}
