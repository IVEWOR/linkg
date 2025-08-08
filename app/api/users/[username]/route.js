import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(_req, { params }) {
  const { username } = await params; // ⬅️ await
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      descriptionShort: true,
      avatarUrl: true,
      socialLinks: true,
      isProfilePublic: true,
      followers: true,
    },
  });
  if (!user) return new Response("Not found", { status: 404 });
  return Response.json({ user });
}

export async function PATCH(req, { params }) {
  const { username } = await params; // ⬅️ await
  const { authUser, dbUser } = await getSessionUser();
  if (!authUser) return new Response("Unauthorized", { status: 401 });
  if (dbUser.username !== username)
    return new Response("Forbidden", { status: 403 });

  const body = await req.json();
  const allowed = (({
    username,
    name,
    descriptionShort,
    avatarUrl,
    socialLinks,
    isProfilePublic,
  }) => ({
    username,
    name,
    descriptionShort,
    avatarUrl,
    socialLinks,
    isProfilePublic,
  }))(body || {});
  Object.keys(allowed).forEach(
    (k) => allowed[k] === undefined && delete allowed[k]
  );

  try {
    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: allowed,
      select: {
        id: true,
        username: true,
        name: true,
        descriptionShort: true,
        avatarUrl: true,
        socialLinks: true,
        isProfilePublic: true,
      },
    });
    return Response.json({ user: updated });
  } catch (e) {
    if (e.code === "P2002")
      return new Response("Username already taken", { status: 409 });
    throw e;
  }
}
