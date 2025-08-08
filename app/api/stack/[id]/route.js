import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function PATCH(req, { params }) {
  const { id } = await params; // ⬅️ await
  const { authUser, dbUser } = await getSessionUser();
  if (!authUser) return new Response("Unauthorized", { status: 401 });

  const item = await prisma.userStackItem.findUnique({ where: { id } });
  if (!item || item.userId !== dbUser.id)
    return new Response("Forbidden", { status: 403 });

  const body = await req.json();
  const allowed = (({ title, url, imageUrl, category }) => ({
    title,
    url,
    imageUrl,
    category,
  }))(body || {});
  Object.keys(allowed).forEach(
    (k) => allowed[k] === undefined && delete allowed[k]
  );

  const updated = await prisma.userStackItem.update({
    where: { id },
    data: allowed,
  });
  return Response.json({ item: updated });
}

export async function DELETE(_req, { params }) {
  const { id } = await params; // ⬅️ await
  const { authUser, dbUser } = await getSessionUser();
  if (!authUser) return new Response("Unauthorized", { status: 401 });

  const item = await prisma.userStackItem.findUnique({ where: { id } });
  if (!item || item.userId !== dbUser.id)
    return new Response("Forbidden", { status: 403 });

  await prisma.userStackItem.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
