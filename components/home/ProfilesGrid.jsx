// components/home/ProfilesGrid.jsx
import Link from "next/link";

export default function ProfilesGrid({ profiles = [] }) {
  // Demo fallback if DB is empty
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
      descriptionShort: "Security engineer",
      avatarUrl: "",
    },
  ];
  const rows = profiles.length ? profiles : demo;

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-12">
      {/* subtle ambient glow */}
      <div className="pointer-events-none absolute -right-10 -top-6 h-56 w-56 rounded-full bg-emerald-400/15 blur-[90px]" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-gray-300">
          Featured Profiles
        </h2>
        <Link
          href="/profiles"
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-200 hover:bg-white/10"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((u) => (
          <Link
            key={u.username}
            href={`/${u.username}`}
            className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(34,197,94,0.18),0_24px_60px_-24px_rgba(0,0,0,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
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
          </Link>
        ))}
      </div>
    </section>
  );
}
