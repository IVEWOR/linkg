import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req) {
  const { authUser, dbUser } = await getSessionUser();
  if (!authUser) return new Response("Unauthorized", { status: 401 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0)
    return new Response("Bad payload", { status: 400 });

  const items = await prisma.userStackItem.findMany({
    where: { id: { in: ids } },
    select: { id: true, userId: true },
  });
  if (items.some((i) => i.userId !== dbUser.id))
    return new Response("Forbidden", { status: 403 });

  await prisma.$transaction(
    ids.map((id, idx) =>
      prisma.userStackItem.update({
        where: { id },
        data: { position: idx + 1 },
      })
    )
  );

  return Response.json({ ok: true });
}
