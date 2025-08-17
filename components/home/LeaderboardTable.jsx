// components/home/LeaderboardTable.jsx
export default function LeaderboardTable({ users = [] }) {
  const demo = [
    {
      username: "shugert",
      name: "Samuel Noriega",
      followers: 102836,
      avatarUrl: "",
    },
    {
      username: "inovo",
      name: "Bruce van Zyl",
      followers: 42225,
      avatarUrl: "",
    },
    {
      username: "tribe",
      name: "Bruce van Zyl",
      followers: 17165,
      avatarUrl: "",
    },
    { username: "capgo", name: "Martin", followers: 12641, avatarUrl: "" },
    { username: "mystartup", name: "Shala", followers: 8606, avatarUrl: "" },
  ];
  const rows = users.length ? users : demo;

  const medal = (i) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : n;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-16 mt-20">
      <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-[80px_2fr_1fr] gap-4 border-b border-white/10 px-4 py-3 text-xs font-semibold text-gray-300">
          <div>Rank</div>
          <div>User</div>
          <div>Followers</div>
        </div>

        <ul className="divide-y divide-white/10">
          {rows.map((u, i) => (
            <li
              key={u.username + i}
              className="grid grid-cols-[80px_2fr_1fr] items-center gap-4 px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-lg">{medal(i)}</span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  alt=""
                  className="h-8 w-8 rounded-full ring-1 ring-white/10"
                  src={
                    u.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`
                  }
                />
                <div className="min-w-0">
                  <div className="truncate font-medium">@{u.username}</div>
                  <div className="truncate text-xs text-gray-400">
                    {u.name || "—"}
                  </div>
                </div>
              </div>

              <div className="font-semibold text-amber-300">
                {fmt(u.followers ?? 0)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
