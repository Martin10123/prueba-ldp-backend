import "dotenv/config";
import { Position, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

type SeedTeam = {
  name: string;
  country: string;
  logoUrl: string;
};

type SeedPlayer = {
  name: string;
  birthDate: string;
  nationality: string;
  position: Position;
  photoUrl: string;
  teamName: string;
};

const teams: SeedTeam[] = [
  { name: "FC Barcelona", country: "Spain", logoUrl: "https://i.pravatar.cc/300?u=barcelona" },
  { name: "Real Madrid", country: "Spain", logoUrl: "https://i.pravatar.cc/300?u=real-madrid" },
  { name: "Manchester City", country: "England", logoUrl: "https://i.pravatar.cc/300?u=manchester-city" },
  { name: "Liverpool", country: "England", logoUrl: "https://i.pravatar.cc/300?u=liverpool" },
  { name: "Arsenal", country: "England", logoUrl: "https://i.pravatar.cc/300?u=arsenal" },
  { name: "Paris Saint-Germain", country: "France", logoUrl: "https://i.pravatar.cc/300?u=psg" },
  { name: "Bayern Munich", country: "Germany", logoUrl: "https://i.pravatar.cc/300?u=bayern" },
  { name: "AC Milan", country: "Italy", logoUrl: "https://i.pravatar.cc/300?u=ac-milan" },
  { name: "Inter", country: "Italy", logoUrl: "https://i.pravatar.cc/300?u=inter" },
];

const players: SeedPlayer[] = [
  { name: "Marc-André ter Stegen", birthDate: "1992-04-30", nationality: "Germany", position: Position.GK, photoUrl: "https://i.pravatar.cc/300?u=ter-stegen", teamName: "FC Barcelona" },
  { name: "Pedri", birthDate: "2002-11-25", nationality: "Spain", position: Position.CM, photoUrl: "https://i.pravatar.cc/300?u=pedri", teamName: "FC Barcelona" },
  { name: "Lamine Yamal", birthDate: "2007-07-13", nationality: "Spain", position: Position.RW, photoUrl: "https://i.pravatar.cc/300?u=lamine-yamal", teamName: "FC Barcelona" },
  { name: "Thibaut Courtois", birthDate: "1992-05-11", nationality: "Belgium", position: Position.GK, photoUrl: "https://i.pravatar.cc/300?u=courtois", teamName: "Real Madrid" },
  { name: "Éder Militão", birthDate: "1998-01-18", nationality: "Brazil", position: Position.CB, photoUrl: "https://i.pravatar.cc/300?u=militao", teamName: "Real Madrid" },
  { name: "Jude Bellingham", birthDate: "2003-06-29", nationality: "England", position: Position.CAM, photoUrl: "https://i.pravatar.cc/300?u=bellingham", teamName: "Real Madrid" },
  { name: "Vinícius Júnior", birthDate: "2000-07-12", nationality: "Brazil", position: Position.LW, photoUrl: "https://i.pravatar.cc/300?u=vinicius-junior", teamName: "Real Madrid" },
  { name: "Federico Valverde", birthDate: "1998-07-22", nationality: "Uruguay", position: Position.CM, photoUrl: "https://i.pravatar.cc/300?u=valverde", teamName: "Real Madrid" },
  { name: "Rodri", birthDate: "1996-06-22", nationality: "Spain", position: Position.CDM, photoUrl: "https://i.pravatar.cc/300?u=rodri", teamName: "Manchester City" },
  { name: "Kevin De Bruyne", birthDate: "1991-06-28", nationality: "Belgium", position: Position.CAM, photoUrl: "https://i.pravatar.cc/300?u=de-bruyne", teamName: "Manchester City" },
  { name: "Julián Álvarez", birthDate: "2000-01-31", nationality: "Argentina", position: Position.ST, photoUrl: "https://i.pravatar.cc/300?u=julian-alvarez", teamName: "Manchester City" },
  { name: "Alisson Becker", birthDate: "1992-10-02", nationality: "Brazil", position: Position.GK, photoUrl: "https://i.pravatar.cc/300?u=alisson", teamName: "Liverpool" },
  { name: "Virgil van Dijk", birthDate: "1991-07-08", nationality: "Netherlands", position: Position.CB, photoUrl: "https://i.pravatar.cc/300?u=van-dijk", teamName: "Liverpool" },
  { name: "Mohamed Salah", birthDate: "1992-06-15", nationality: "Egypt", position: Position.RW, photoUrl: "https://i.pravatar.cc/300?u=salah", teamName: "Liverpool" },
  { name: "Bukayo Saka", birthDate: "2001-09-05", nationality: "England", position: Position.RW, photoUrl: "https://i.pravatar.cc/300?u=saka", teamName: "Arsenal" },
  { name: "Declan Rice", birthDate: "1999-01-14", nationality: "England", position: Position.CDM, photoUrl: "https://i.pravatar.cc/300?u=declan-rice", teamName: "Arsenal" },
  { name: "William Saliba", birthDate: "2001-03-24", nationality: "France", position: Position.CB, photoUrl: "https://i.pravatar.cc/300?u=saliba", teamName: "Arsenal" },
  { name: "Achraf Hakimi", birthDate: "1998-11-04", nationality: "Morocco", position: Position.RB, photoUrl: "https://i.pravatar.cc/300?u=hakimi", teamName: "Paris Saint-Germain" },
  { name: "Khvicha Kvaratskhelia", birthDate: "2001-02-12", nationality: "Georgia", position: Position.LW, photoUrl: "https://i.pravatar.cc/300?u=kvaratskhelia", teamName: "Paris Saint-Germain" },
  { name: "Jamal Musiala", birthDate: "2003-02-26", nationality: "Germany", position: Position.CAM, photoUrl: "https://i.pravatar.cc/300?u=musiala", teamName: "Bayern Munich" },
  { name: "Theo Hernández", birthDate: "1997-10-06", nationality: "France", position: Position.LB, photoUrl: "https://i.pravatar.cc/300?u=theo-hernandez", teamName: "AC Milan" },
  { name: "Rafael Leão", birthDate: "1999-06-10", nationality: "Portugal", position: Position.LW, photoUrl: "https://i.pravatar.cc/300?u=rafael-leao", teamName: "AC Milan" },
  { name: "Lautaro Martínez", birthDate: "1997-08-22", nationality: "Argentina", position: Position.ST, photoUrl: "https://i.pravatar.cc/300?u=lautaro-martinez", teamName: "Inter" },
];

const seasons = [
  { year: 2024, name: "2024-2025" },
  { year: 2023, name: "2023-2024" },
];

type PlayerStats = { playerId: string; teamId: string; seasonId: string; matchesPlayed: number; goals: number; assists: number; yellowCards: number; redCards: number; minutesPlayed: number };

async function main() {
  console.log("🌱 Limpiando datos anteriores...");
  await prisma.playerStats.deleteMany();
  await prisma.player.deleteMany();
  await prisma.season.deleteMany();
  await prisma.team.deleteMany();

  console.log("🏟️  Creando teams...");
  const createdTeams = await Promise.all(
    teams.map((team) =>
      prisma.team.create({
        data: team,
      })
    )
  );

  console.log("📅 Creando seasons...");
  const createdSeasons = await Promise.all(
    seasons.map((season) =>
      prisma.season.create({
        data: season,
      })
    )
  );

  console.log("⚽ Creando players...");
  const createdPlayers = await Promise.all(
    players.map((player) => {
      const team = createdTeams.find((t: { id: string; name: string }) => t.name === player.teamName);
      return prisma.player.create({
        data: {
          name: player.name,
          birthDate: new Date(player.birthDate),
          nationality: player.nationality,
          position: player.position,
          photoUrl: player.photoUrl,
          ...(team ? { currentTeamId: team.id } : {}),
        },
      });
    })
  );

  console.log("📊 Creando player stats...");
  const statsData: PlayerStats[] = [];
  for (const player of createdPlayers) {
    for (const season of createdSeasons) {
      const team = createdTeams.find((t: { id: string; name: string }) => t.id === player.currentTeamId);
      if (!team) continue;

      statsData.push({
        playerId: player.id,
        teamId: team.id,
        seasonId: season.id,
        matchesPlayed: Math.floor(Math.random() * 30) + 10,
        goals: Math.floor(Math.random() * 20),
        assists: Math.floor(Math.random() * 15),
        yellowCards: Math.floor(Math.random() * 5),
        redCards: Math.floor(Math.random() * 2),
        minutesPlayed: Math.floor(Math.random() * 2700) + 300,
      });
    }
  }

  await Promise.all(
    statsData.map((stats) =>
      prisma.playerStats.create({
        data: stats,
      })
    )
  );

  console.log(`✅ Seed completado:`);
  console.log(`   - ${createdTeams.length} teams`);
  console.log(`   - ${createdSeasons.length} seasons`);
  console.log(`   - ${createdPlayers.length} players`);
  console.log(`   - ${statsData.length} player stats`);
}

main()
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });