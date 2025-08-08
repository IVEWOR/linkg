// app/profiles/page.jsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProfilesPage({ searchParams }) {
  const sp = await searchParams; // Next 15: await, it's a plain object here

  const q = (Array.isArray(sp?.q) ? sp.q[0] : sp?.q ?? "").trim();
  const pageStr = Array.isArray(sp?.page) ? sp.page[0] : sp?.page ?? "1";
  const page = Math.max(1, parseInt(pageStr, 10));
  const take = 12;
  const skip = (page - 1) * take;

  const where = {
    isProfilePublic: true,
    ...(q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        followers: true,
        descriptionShort: true,
      },
      orderBy: [{ followers: "desc" }, { username: "asc" }],
    }),
    prisma.user.count({ where }),
  ]);

  const pages = Math.max(1, Math.ceil(total / take));
  const mkQuery = (p) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/profiles?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search profiles"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button className="rounded-md border px-4 py-2">Search</button>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((u) => (
          <Link
            key={u.id}
            href={`/${u.username}`}
            className="rounded-xl border p-4 hover:shadow transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  u.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`
                }
                className="size-12 rounded-full border object-cover"
                alt=""
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  @{u.username}
                  {u.name ? ` • ${u.name}` : ""}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {u.descriptionShort || "—"}
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Followers: {u.followers}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Page {page} of {pages} • {total} profiles
        </span>
        <div className="flex gap-2">
          <a
            href={mkQuery(Math.max(1, page - 1))}
            className="rounded-md border px-3 py-1 text-sm"
          >
            Prev
          </a>
          <a
            href={mkQuery(Math.min(pages, page + 1))}
            className="rounded-md border px-3 py-1 text-sm"
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}
