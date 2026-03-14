import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  const league = await prisma.league.upsert({
    where: { id: "seed-league-1" },
    update: { name: "Premier League", sportType: "soccer", country: "England" },
    create: {
      id: "seed-league-1",
      name: "Premier League",
      sportType: "soccer",
      country: "England",
    },
  });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const m1 = await prisma.match.upsert({
    where: { id: "seed-match-1" },
    update: { homeTeamName: "Manchester United", awayTeamName: "Chelsea", matchTime: tomorrow, status: "scheduled", homeScore: null, awayScore: null },
    create: {
      id: "seed-match-1",
      leagueId: league.id,
      homeTeamName: "Manchester United",
      awayTeamName: "Chelsea",
      matchTime: tomorrow,
      status: "scheduled",
      homeScore: null,
      awayScore: null,
    },
  });

  await prisma.matchOdds.createMany({
    data: [
      { matchId: m1.id, source: "bet365", homeOdds: 2.1, drawOdds: 3.4, awayOdds: 3.2, recordedAt: new Date(now.getTime() - 3600000) },
      { matchId: m1.id, source: "bet365", homeOdds: 2.05, drawOdds: 3.5, awayOdds: 3.3, recordedAt: now },
    ],
    skipDuplicates: true,
  });

  const m2 = await prisma.match.upsert({
    where: { id: "seed-match-2" },
    update: { homeTeamName: "Liverpool", awayTeamName: "Arsenal", matchTime: nextWeek, status: "scheduled", homeScore: null, awayScore: null },
    create: {
      id: "seed-match-2",
      leagueId: league.id,
      homeTeamName: "Liverpool",
      awayTeamName: "Arsenal",
      matchTime: nextWeek,
      status: "scheduled",
      homeScore: null,
      awayScore: null,
    },
  });

  await prisma.matchOdds.createMany({
    data: [
      { matchId: m2.id, source: "bet365", homeOdds: 1.9, drawOdds: 3.6, awayOdds: 4.0, recordedAt: now },
    ],
    skipDuplicates: true,
  });

  const m3 = await prisma.match.upsert({
    where: { id: "seed-match-3" },
    update: { homeTeamName: "Manchester City", awayTeamName: "Tottenham", matchTime: new Date(now.getTime() - 86400000), status: "finished", homeScore: 2, awayScore: 1 },
    create: {
      id: "seed-match-3",
      leagueId: league.id,
      homeTeamName: "Manchester City",
      awayTeamName: "Tottenham",
      matchTime: new Date(now.getTime() - 86400000),
      status: "finished",
      homeScore: 2,
      awayScore: 1,
    },
  });

  await prisma.matchOdds.createMany({
    data: [
      { matchId: m3.id, source: "bet365", homeOdds: 1.7, drawOdds: 4.0, awayOdds: 5.0, recordedAt: new Date(now.getTime() - 86400000) },
    ],
    skipDuplicates: true,
  });

  console.log("Seed done: 1 league, 3 matches with odds.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
