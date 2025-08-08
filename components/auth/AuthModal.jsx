"use client";
import { useEffect, useRef, useState } from "react";
import { X, Github, Mail, Lock, Twitter } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthModal({ open, onClose, onAuthed }) {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabaseRef = useRef(null);
  const getSupabase = () =>
    (supabaseRef.current ??= getSupabaseBrowserClient());

  useEffect(() => {
    if (!open) {
      setError("");
      setEmail("");
      setPassword("");
      setMode("signin");
    }
  }, [open]);

  const afterAuth = async () => {
    // probe the session + db username, then route
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const json = await res.json();
      if (json.loggedIn && json.dbUser?.username) {
        onAuthed?.(json.dbUser.username);
        router.push(`/${json.dbUser.username}`);
        router.refresh();
      } else {
        onClose?.();
      }
    } catch {
      onClose?.();
    }
  };

  const oAuth = async (provider) => {
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      // OAuth will redirect away; no afterAuth here.
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const signInWithEmail = async () => {
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return setError(error.message);
      await afterAuth();
    } catch (e) {
      setError(e?.message || "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };

  const signUpWithEmail = async () => {
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return setError(error.message);
      await afterAuth();
    } catch (e) {
      setError(e?.message || "Unable to create account.");
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) return setError(error.message);
      alert("Reset link sent (check your email).");
    } catch (e) {
      setError(e?.message || "Unable to send reset link.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-green-500/20 bg-[#0b0f0c] text-white shadow-2xl">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-gray-400">Sign in to your account</p>
          </div>
          <button
            className="rounded-lg p-2 text-gray-300 hover:bg-white/5"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4 pt-0">
          {/* Providers (styled like your screenshot) */}
          <button
            onClick={() => oAuth("twitter")} // or 'twitter_oauth2' if that's your id
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5 disabled:opacity-60"
          >
            <Twitter className="h-4 w-4" />
            Continue with X (Twitter)
          </button>

          {/* Example for GitHub look — optional (disable if not configured) */}
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-400 opacity-60"
            title="GitHub not enabled"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-wider text-gray-500">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Email form */}
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs text-gray-400">Email</span>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs text-gray-400">Password</span>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3">
                <Lock className="h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-200"
                  onClick={forgotPassword}
                  disabled={busy || !email}
                  title="Reset password"
                >
                  Forgot?
                </button>
              </div>
            </label>

            {error ? (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                {error}
              </p>
            ) : null}

            <button
              onClick={mode === "signin" ? signInWithEmail : signUpWithEmail}
              disabled={busy}
              className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-60"
            >
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            <p className="text-center text-xs text-gray-400">
              {mode === "signin"
                ? "Don’t have an account?"
                : "Already have an account?"}{" "}
              <button
                className="font-medium text-green-400 hover:underline"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "Sign Up Now" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
