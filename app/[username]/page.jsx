import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import ProfileClient from "@/components/profile/ProfileClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserPublicPage({ params }) {
  const { username } = await params;

  const profile = await prisma.user.findUnique({
    where: { username },
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
  if (!profile) return notFound();

  const stack = await prisma.userStackItem.findMany({
    where: { userId: profile.id },
    orderBy: [{ category: "asc" }, { position: "asc" }],
    select: {
      id: true,
      title: true,
      url: true,
      imageUrl: true,
      category: true,
      position: true,
    },
  });

  const { authUser } = await getSessionUser();
  const isOwner = !!authUser && authUser.id === profile.id;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <ProfileClient
        initialProfile={profile}
        initialStack={stack}
        isOwner={isOwner}
      />
    </div>
  );
}
