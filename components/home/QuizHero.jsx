// components/home/QuizHero.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Atom,
  Terminal,
  SquareCode,
  Layers,
  Palette,
  MessagesSquare,
  Database,
  Server,
  Apple,
  Monitor,
  Github,
  GitBranch,
  Flame,
  Puzzle,
  Braces,
  Wand2,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

/* Browser Supabase (only to check session) */
const supa = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* Icons for common choices */
const iconMap = {
  Vim: Terminal,
  "VS Code": SquareCode,
  React: Atom,
  Vue: Layers,
  "Next.js": Flame,
  Remix: Wand2,
  Tailwind: Palette,
  "CSS Modules": Braces,
  Discord: MessagesSquare,
  Slack: MessagesSquare,
  PostgreSQL: Database,
  MySQL: Server,
  Mac: Apple,
  Windows: Monitor,
  GitHub: Github,
  Git: GitBranch,
};
function IconBadge({ label }) {
  const Icon = iconMap[label] ?? Puzzle;
  return (
    <span
      className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full
                     bg-gradient-to-b from-emerald-400/25 to-emerald-400/5 ring-1 ring-white/10"
    >
      <Icon className="h-4 w-4 text-emerald-300" strokeWidth={2.5} />
    </span>
  );
}

const FIRST_PAIRS = [
  ["Vim", "VS Code"],
  ["React", "Vue"],
  ["Next.js", "Remix"],
  ["Tailwind", "CSS Modules"],
];

export default function QuizHero() {
  const router = useRouter();

  // quiz state
  const [history, setHistory] = useState([]); // [{q,a}]
  const [question, setQuestion] = useState(() => {
    const [A, B] = FIRST_PAIRS[Math.floor(Math.random() * FIRST_PAIRS.length)];
    return `${A} vs ${B}`;
  });
  const [options, setOptions] = useState(() => question.split(" vs "));
  const [loading, setLoading] = useState(false);
  const [mandatory, setMandatory] = useState(false);
  const [done, setDone] = useState(false);

  const progress = useMemo(
    () => Math.min((history.length / 6) * 100, 100),
    [history.length]
  );
  const [A, B] =
    options.length === 2 ? options : question.split(" vs ") ?? ["A", "B"];
  const canExplore = history.length >= 4 || done;

  /* ---------- local storage helpers ---------- */
  const saveLocalQuiz = () => {
    const payload = { answers: history, ts: Date.now(), version: 1 };
    try {
      localStorage.setItem("lg_quiz", JSON.stringify(payload));
    } catch {}
  };

  /* ---------- next question ---------- */
  async function fetchNext() {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });
      const json = await res.json();
      if (json.done) {
        setDone(true);
        setMandatory(true);
      } else {
        setQuestion(json.question);
        setOptions(json.options || []);
        setMandatory(!!json.mandatory);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const choose = (opt) => {
    if (!done) setHistory((h) => [...h, { q: question, a: opt }]);
  };

  useEffect(() => {
    if (history.length === 0) return;
    if (history.length >= 6) {
      setDone(true);
      setMandatory(true);
      return;
    }
    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length]);

  /* ---------- Explore: redirect to login or bridge ---------- */
  const handleExplore = async () => {
    saveLocalQuiz();

    // where to go after import succeeds
    const afterImport = "/profiles";
    // we land here post-login to import quiz
    const bridge = `/auth/quiz-bridge?next=${encodeURIComponent(afterImport)}`;
    // login page should read ?next= and go to bridge after success
    const loginWithNext = `/login?next=${encodeURIComponent(bridge)}`;

    // if already logged in, skip login and go straight to bridge
    const {
      data: { session },
    } = await supa.auth.getSession();
    if (session?.access_token) {
      router.push(bridge);
    } else {
      router.push(loginWithNext);
    }
  };

  /* ---------- UI ---------- */
  return (
    <section
      className="relative mx-auto w-full max-w-6xl px-4
                 min-h-[calc(100vh-96px)] md:min-h-[calc(100vh-120px)]
                 flex flex-col items-center justify-center"
    >
      {/* subtle ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[18%] h-72 w-72 rounded-full bg-emerald-400/15 blur-[110px]" />
        <div className="absolute right-[8%] bottom-[14%] h-80 w-80 rounded-full bg-green-500/20 blur-[120px]" />
      </div>

      <div className="text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
          Linkgraph
        </p>
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
          <span className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            Build your stack, one choice at a time.
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-300">
          Tap to choose. We’ll tailor the next question to your vibe.
        </p>
      </div>

      {/* progress */}
      <div className="mt-8 h-[6px] w-full max-w-xl overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* A/B options */}
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          disabled={loading || done}
          onClick={() => choose(A)}
          className="group flex items-center justify-center rounded-2xl
                     border border-white/12 bg-white/[0.06] px-6 py-8 text-lg font-semibold text-white
                     shadow-[0_8px_30px_-16px_rgba(0,0,0,0.6)]
                     transition will-change-transform hover:-translate-y-0.5 hover:bg-white/[0.08]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconBadge label={A} />
          <span className="truncate">{A}</span>
        </button>

        <button
          disabled={loading || done}
          onClick={() => choose(B)}
          className="group flex items-center justify-center rounded-2xl
                     border border-white/12 bg-white/[0.06] px-6 py-8 text-lg font-semibold text-white
                     shadow-[0_8px_30px_-16px_rgba(0,0,0,0.6)]
                     transition will-change-transform hover:-translate-y-0.5 hover:bg-white/[0.08]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconBadge label={B} />
          <span className="truncate">{B}</span>
        </button>
      </div>

      {/* CTA */}
      <div className="mt-8">
        <button
          onClick={handleExplore}
          disabled={!canExplore}
          className={`rounded-full px-6 py-2 text-sm font-semibold shadow-lg transition
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            focus-visible:ring-emerald-400 focus-visible:ring-offset-black/30
            ${
              canExplore
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white/10 text-white/60 cursor-not-allowed"
            }`}
          title={
            canExplore
              ? "Explore stacks"
              : `Answer ${Math.max(0, 4 - history.length)} more…`
          }
        >
          Explore Stack
        </button>
        {mandatory && !done && (
          <p className="mt-2 text-xs text-gray-400">
            Keep going — we need a couple more picks.
          </p>
        )}
      </div>

      <p className="mt-6 text-[11px] text-gray-400">
        Press <kbd className="rounded bg-white/10 px-1.5 py-[2px]">1</kbd> or{" "}
        <kbd className="rounded bg-white/10 px-1.5 py-[2px]">2</kbd> to pick
      </p>
    </section>
  );
}
