import { getSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function makeCandidateUsername(u) {
  const base =
    u.user_metadata?.username ||
    (u.email ? u.email.split("@")[0] : `user_${u.id.slice(0, 8)}`);
  let s = base.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  if (s.length < 3) s = `user_${u.id.slice(0, 8)}`;
  return s;
}

async function ensureDbUserRow(authUser) {
  const email = authUser.email ?? `no-email+${authUser.id}@example.local`;
  const name = authUser.user_metadata?.name ?? null;
  const avatarUrl = authUser.user_metadata?.avatar_url ?? null;
  const username = makeCandidateUsername(authUser);

  try {
    return await prisma.user.create({
      data: { id: authUser.id, email, username, name, avatarUrl },
    });
  } catch (e) {
    if (e.code === "P2002") {
      return await prisma.user.create({
        data: {
          id: authUser.id,
          email,
          username: `user_${authUser.id.slice(0, 8)}`,
          name,
          avatarUrl,
        },
      });
    }
    throw e;
  }
}

export async function getSessionUser() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const authUser = data?.user ?? null;
  if (!authUser) return { authUser: null, dbUser: null };

  let dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!dbUser) dbUser = await ensureDbUserRow(authUser);

  return { authUser, dbUser };
}
