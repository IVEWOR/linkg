// app/login/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { X as XIcon, Mail, Eye, EyeOff } from "lucide-react";

const supa = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // where to go after login
  const next = sp.get("next") || "/profiles";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  const oauthRedirect = useMemo(() => {
    const safeNext =
      typeof next === "string" && next.startsWith("/") ? next : "/profiles";
    return `${origin}${safeNext}`;
  }, [origin, next]);

  // ✅ pure JS state (no TS generics)
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(""); // info/success
  const [err, setErr] = useState(""); // error

  // If already logged in, bounce to next
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supa.auth.getSession();
      if (session?.user) router.replace(next);
    })();
  }, [router, next]);

  async function handleTwitter() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const { error } = await supa.auth.signInWithOAuth({
        provider: "twitter",
        options: { redirectTo: oauthRedirect },
      });
      if (error) throw error;
      // Supabase will redirect away
    } catch (e) {
      setErr(e?.message || "Twitter sign-in failed");
      setLoading(false);
    }
  }

  async function handleEmailPassword(e) {
    e?.preventDefault?.();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { data, error } = await supa.auth.signInWithPassword({
          email,
          password: pw,
        });
        if (error) throw error;
        try {
          window.dispatchEvent(
            new CustomEvent("auth:signed-in", { detail: { user: data.user } })
          );
        } catch {}
        router.replace(next);
      } else {
        const { data, error } = await supa.auth.signUp({
          email,
          password: pw,
          options: {
            emailRedirectTo: `${origin}/auth/confirmed?next=${encodeURIComponent(
              next
            )}`,
          },
        });
        if (error) throw error;
        if (data?.session?.user) {
          try {
            window.dispatchEvent(
              new CustomEvent("auth:signed-in", {
                detail: { user: data.session.user },
              })
            );
          } catch {}
          router.replace(next);
        } else {
          setMsg("Check your email to confirm your account.");
        }
      }
    } catch (e) {
      setErr(e?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setErr("");
    setMsg("");
    if (!email) {
      setErr("Enter your email first");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset`,
      });
      if (error) throw error;
      setMsg("Password reset email sent.");
    } catch (e) {
      setErr(e?.message || "Could not send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Welcome
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            Sign {mode === "signin" ? "In" : "Up"}
          </h1>
          <p className="mt-1 text-xs text-gray-300">
            You’ll be redirected to{" "}
            <span className="text-gray-200">{next}</span> after this.
          </p>
        </div>

        {/* Social: Twitter/X */}
        <button
          onClick={handleTwitter}
          disabled={loading}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          <XIcon className="h-4 w-4" />
          Continue with X
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span>or</span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {/* Email / Password */}
        <form onSubmit={handleEmailPassword} className="space-y-3">
          <label className="block text-xs text-gray-300">Email</label>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="you@example.com"
            />
          </div>

          <label className="mt-2 block text-xs text-gray-300">Password</label>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
            <input
              type={showPw ? "text" : "password"}
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="text-gray-400 hover:text-gray-200"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline"
              disabled={loading}
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </form>

        {/* messages */}
        {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
        {msg && <p className="mt-3 text-xs text-emerald-300">{msg}</p>}

        {/* switch mode */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErr("");
                  setMsg("");
                }}
                className="font-semibold text-gray-200 underline-offset-2 hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setErr("");
                  setMsg("");
                }}
                className="font-semibold text-gray-200 underline-offset-2 hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
