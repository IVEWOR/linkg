// app/api/stack/reorder/route.js
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req) {
  try {
    const { dbUser } = await getSessionUser();
    if (!dbUser) return new Response("Unauthorized", { status: 401 });

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response("Bad payload", { status: 400 });
    }

    // Load all items for user (we’ll make sure we cover any not in ids too)
    const allItems = await prisma.userStackItem.findMany({
      where: { userId: dbUser.id },
      orderBy: { position: "asc" },
      select: { id: true, userId: true },
    });

    // Guard: all ids must belong to this user
    const idSet = new Set(ids);
    const wrongOwner = await prisma.userStackItem.findMany({
      where: { id: { in: ids }, userId: { not: dbUser.id } },
      select: { id: true },
    });
    if (wrongOwner.length) return new Response("Forbidden", { status: 403 });

    // Build final order = provided ids + any remaining (keeps their relative order)
    const remaining = allItems
      .filter((it) => !idSet.has(it.id))
      .map((it) => it.id);
    const finalOrder = [...ids, ...remaining];

    // Two-phase update to avoid unique (userId, position) collisions
    const BUMP = 10000;

    await prisma.$transaction(async (tx) => {
      // Phase 1: bump all positions out of the target range
      await tx.userStackItem.updateMany({
        where: { userId: dbUser.id },
        data: { position: { increment: BUMP } },
      });

      // Phase 2: assign new positions 1..N in the desired order
      // (use sequential updates; they are safe now because everything sits in [BUMP+1 ..])
      for (let i = 0; i < finalOrder.length; i++) {
        await tx.userStackItem.update({
          where: { id: finalOrder[i] },
          data: { position: i + 1 },
        });
      }
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error("reorder error", e);
    return new Response(e?.message || "Server error", { status: 500 });
  }
}
