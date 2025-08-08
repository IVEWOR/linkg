import { getSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const authUser = data?.user || null;
  const dbUser = authUser
    ? await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { id: true, username: true, email: true },
      })
    : null;

  return Response.json({
    loggedIn: !!authUser,
    authUser: authUser ? { id: authUser.id, email: authUser.email } : null,
    dbUser,
  });
}
