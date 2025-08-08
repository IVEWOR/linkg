import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req) {
  const { authUser, dbUser } = await getSessionUser();
  if (!authUser) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const { originItemId, title, url, imageUrl, category } = body ?? {};
  if (!originItemId && (!title || !url || !category)) {
    return new Response("Missing required fields", { status: 400 });
  }

  // next position
  const count = await prisma.userStackItem.count({
    where: { userId: dbUser.id },
  });
  const position = count + 1;

  let data;
  if (originItemId) {
    const origin = await prisma.item.findUnique({
      where: { id: originItemId },
    });
    if (!origin) return new Response("Item not found", { status: 404 });
    data = {
      userId: dbUser.id,
      originItemId,
      title: origin.title,
      url: origin.url,
      imageUrl: origin.imageUrl,
      category: origin.category,
      position,
    };
  } else {
    data = {
      userId: dbUser.id,
      originItemId: null,
      title,
      url,
      imageUrl: imageUrl ?? null,
      category,
      position,
    };
  }

  const created = await prisma.userStackItem.create({ data });
  return Response.json({ item: created }, { status: 201 });
}
