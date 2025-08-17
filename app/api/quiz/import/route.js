// app/api/quiz/import/route.js
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/* ---- auth: cookie first, Bearer fallback ---- */
async function getUserFromRequest(req) {
  const supabase = await getSupabaseServerClient();

  // cookie session
  let {
    data: { user },
  } = await supabase.auth.getUser();

  // bearer fallback
  if (!user) {
    const auth = req.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const out = await supabase.auth.getUser(token);
      user = out.data?.user || null;
    }
  }
  if (!user) return null;

  // app user
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, username: true },
  });
  return dbUser;
}

/* ---- basic library for common quiz choices ----
   We try to *link* to a Main Item by title; if none exists,
   we fall back to this metadata and create a user-only custom row. */
const LIB = {
  Vim: { title: "Vim", url: "https://www.vim.org", category: "Editor" },
  "VS Code": {
    title: "VS Code",
    url: "https://code.visualstudio.com",
    category: "Editor",
  },
  React: { title: "React", url: "https://react.dev", category: "Framework" },
  Vue: { title: "Vue", url: "https://vuejs.org", category: "Framework" },
  "Next.js": {
    title: "Next.js",
    url: "https://nextjs.org",
    category: "Framework",
  },
  Remix: { title: "Remix", url: "https://remix.run", category: "Framework" },
  Tailwind: {
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    category: "Styling",
  },
  "CSS Modules": {
    title: "CSS Modules",
    url: "https://github.com/css-modules/css-modules",
    category: "Styling",
  },
  Discord: {
    title: "Discord",
    url: "https://discord.com",
    category: "Community",
  },
  Slack: { title: "Slack", url: "https://slack.com", category: "Community" },
  PostgreSQL: {
    title: "PostgreSQL",
    url: "https://www.postgresql.org",
    category: "Database",
  },
  MySQL: { title: "MySQL", url: "https://www.mysql.com", category: "Database" },
  Mac: { title: "macOS", url: "https://www.apple.com/macos", category: "OS" },
  Windows: {
    title: "Windows",
    url: "https://www.microsoft.com/windows",
    category: "OS",
  },
  GitHub: {
    title: "GitHub",
    url: "https://github.com",
    category: "Code Hosting",
  },
  Git: { title: "Git", url: "https://git-scm.com", category: "VCS" },
};

const norm = (s) => (s || "").trim().toLowerCase();

export async function POST(req) {
  try {
    const dbUser = await getUserFromRequest(req);
    if (!dbUser) return new Response("Unauthorized", { status: 401 });

    const payload = await req.json(); // { answers:[{q,a}], ts, version }
    const answers = Array.isArray(payload?.answers) ? payload.answers : [];
    if (!answers.length) return new Response("Bad payload", { status: 400 });

    // 1) Save raw quiz JSON for reference/analytics
    await prisma.quizPreference.upsert({
      where: { userId: dbUser.id },
      create: { userId: dbUser.id, data: payload },
      update: { data: payload },
    });

    // 2) Build the list of unique choices picked by user
    const picks = [];
    const seen = new Set();
    for (const { a } of answers) {
      const label = String(a || "").trim();
      if (!label) continue;
      const key = norm(label);
      if (seen.has(key)) continue;
      seen.add(key);
      picks.push(label);
    }
    if (!picks.length) return Response.json({ ok: true, created: 0 });

    // 3) Gather existing stack titles to avoid duplicates
    const existing = await prisma.userStackItem.findMany({
      where: { userId: dbUser.id },
      select: { id: true, title: true, position: true },
      orderBy: { position: "asc" },
    });
    const existingTitles = new Set(existing.map((i) => norm(i.title)));
    let nextPos = (existing.at(-1)?.position || 0) + 1;

    // 4) For each pick:
    //    - try to find a Main Item by title
    //    - if not found, fall back to LIB metadata and create a custom stack item
    const creates = [];
    for (const label of picks) {
      if (existingTitles.has(norm(label))) continue; // skip if already in stack

      // Try link to Main Item
      const main = await prisma.item.findFirst({
        where: { title: label },
        select: {
          id: true,
          title: true,
          url: true,
          imageUrl: true,
          category: true,
        },
      });

      if (main) {
        creates.push(
          prisma.userStackItem.create({
            data: {
              userId: dbUser.id,
              originItemId: main.id,
              title: main.title,
              url: main.url || "",
              imageUrl: main.imageUrl || "",
              category: main.category || "",
              position: nextPos++,
            },
          })
        );
      } else {
        const meta = LIB[label] || { title: label, url: "", category: "" };
        creates.push(
          prisma.userStackItem.create({
            data: {
              userId: dbUser.id,
              // no originItemId -> user-only custom item
              title: meta.title,
              url: meta.url || "",
              imageUrl: meta.imageUrl || "",
              category: meta.category || "",
              position: nextPos++,
            },
          })
        );
      }
    }

    if (creates.length) await prisma.$transaction(creates);

    return Response.json({ ok: true, created: creates.length });
  } catch (e) {
    console.error("quiz-import", e);
    return new Response("Server error", { status: 500 });
  }
}
