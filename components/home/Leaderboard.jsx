// components/home/Leaderboard.jsx
export default function Leaderboard({ users = [] }) {
  if (!users?.length) return null;
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16">
      <h2 className="mb-5 text-sm font-semibold tracking-wide text-gray-300">
        Top profiles this week
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u, idx) => (
          <div
            key={u.username}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-xl"
          >
            <div className="grid place-items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-b from-emerald-500/30 to-emerald-500/0 ring-1 ring-white/20" />
            </div>
            <img
              src={
                u.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`
              }
              className="h-12 w-12 rounded-full ring-1 ring-white/10"
              alt=""
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">@{u.username}</div>
              <div className="truncate text-xs text-gray-300">
                {u.name || u.descriptionShort || "—"}
              </div>
            </div>
            <div className="rounded-lg bg-white/10 px-2 py-1 text-xs text-emerald-300">
              {u.followers ?? 0} ⭐
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
