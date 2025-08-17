// components/home/ProfilesCarousel.jsx
"use client";

import { useEffect, useRef } from "react";

export default function ProfilesCarousel({ profiles = [] }) {
  const demo = [
    {
      username: "sara",
      name: "Sara",
      descriptionShort: "AI tinkerer",
      avatarUrl: "",
    },
    {
      username: "lee",
      name: "Lee",
      descriptionShort: "Indie dev",
      avatarUrl: "",
    },
    {
      username: "mario",
      name: "Mario",
      descriptionShort: "Video creator",
      avatarUrl: "",
    },
    {
      username: "nina",
      name: "Nina",
      descriptionShort: "Product designer",
      avatarUrl: "",
    },
    {
      username: "tom",
      name: "Tom",
      descriptionShort: "Web perf nerd",
      avatarUrl: "",
    },
    {
      username: "ava",
      name: "Ava",
      descriptionShort: "Security",
      avatarUrl: "",
    },
  ];
  const rows = profiles.length ? profiles : demo;

  const scroller = useRef(null);
  const cardW = 300; // consistent w-72 card
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let id = 0;
    const step = () => {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft + cardW + 2 >= max)
        el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: cardW, behavior: "smooth" });
    };
    id = window.setInterval(step, 3000);
    const stop = () => clearInterval(id);
    el.addEventListener("mouseenter", stop);
    el.addEventListener(
      "mouseleave",
      () => (id = window.setInterval(step, 3000))
    );
    return () => {
      clearInterval(id);
      el?.removeEventListener("mouseenter", stop);
    };
  }, []);

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-12">
      {/* fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0b0f0c] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0b0f0c] to-transparent" />

      <h2 className="mb-4 text-sm font-semibold tracking-wide text-gray-300">
        Featured Profiles
      </h2>

      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto"
      >
        {rows.map((u) => (
          <a
            key={u.username}
            href={`/${u.username}`}
            className="snap-start w-[280px] sm:w-[300px] shrink-0 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  u.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`
                }
                alt=""
                className="h-10 w-10 rounded-full ring-1 ring-white/10"
              />
              <div className="min-w-0">
                <div className="truncate font-semibold">@{u.username}</div>
                <div className="truncate text-xs text-gray-300">
                  {u.name || "—"}
                </div>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-gray-300">
              {u.descriptionShort || "Discover their stack →"}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
