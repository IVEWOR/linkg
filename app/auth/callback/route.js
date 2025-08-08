import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const supabase = await getSupabaseServerClient();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
  }

  // find db user & send to /{username}
  const { data } = await supabase.auth.getUser();
  const authUser = data?.user;
  if (!authUser)
    return NextResponse.redirect(`${origin}/login?error=session-missing`);

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { username: true },
  });
  const to = dbUser?.username ? `/${dbUser.username}` : "/profiles";
  return NextResponse.redirect(`${origin}${to}`);
}
