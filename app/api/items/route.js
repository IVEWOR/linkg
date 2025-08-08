import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const take = Math.min(parseInt(searchParams.get("take") || "15", 10), 50);

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { url: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const items = await prisma.item.findMany({
    where,
    take,
    select: {
      id: true,
      title: true,
      url: true,
      imageUrl: true,
      category: true,
    },
  });

  return Response.json({ items });
}
