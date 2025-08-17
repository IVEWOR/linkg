// app/page.jsx
import QuizHero from "@/components/home/QuizHero";
import ProfilesGrid from "@/components/home/ProfilesGrid";
import LeaderboardTable from "@/components/home/LeaderboardTable";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Leaderboard users
  const users = await prisma.user.findMany({
    where: { isProfilePublic: true },
    orderBy: { followers: "desc" },
    take: 10,
    select: {
      username: true,
      name: true,
      descriptionShort: true,
      avatarUrl: true,
      followers: true,
    },
  });

  // Profiles for carousel (reuse public users; could be curated)
  const profiles = await prisma.user.findMany({
    where: { isProfilePublic: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      username: true,
      name: true,
      descriptionShort: true,
      avatarUrl: true,
    },
  });

  return (
    <main className="pb-16">
      <QuizHero />
      <ProfilesGrid profiles={profiles} />
      <LeaderboardTable users={users} />
    </main>
  );
}
