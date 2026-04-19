import { Position, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedPlayer = {
  name: string;
  birthDate: string;
  nationality: string;
  position: Position;
  photoUrl: string;
  currentTeam: string;
};

const players: SeedPlayer[] = [
  {
    name: "Marc-André ter Stegen",
    birthDate: "1992-04-30",
    nationality: "Germany",
    position: Position.GK,
    photoUrl: "https://i.pravatar.cc/300?u=ter-stegen",
    currentTeam: "FC Barcelona",
  },
  {
    name: "Pedri",
    birthDate: "2002-11-25",
    nationality: "Spain",
    position: Position.CM,
    photoUrl: "https://i.pravatar.cc/300?u=pedri",
    currentTeam: "FC Barcelona",
  },
  {
    name: "Lamine Yamal",
    birthDate: "2007-07-13",
    nationality: "Spain",
    position: Position.RW,
    photoUrl: "https://i.pravatar.cc/300?u=lamine-yamal",
    currentTeam: "FC Barcelona",
  },
  {
    name: "Thibaut Courtois",
    birthDate: "1992-05-11",
    nationality: "Belgium",
    position: Position.GK,
    photoUrl: "https://i.pravatar.cc/300?u=courtois",
    currentTeam: "Real Madrid",
  },
  {
    name: "Éder Militão",
    birthDate: "1998-01-18",
    nationality: "Brazil",
    position: Position.CB,
    photoUrl: "https://i.pravatar.cc/300?u=militao",
    currentTeam: "Real Madrid",
  },
  {
    name: "Jude Bellingham",
    birthDate: "2003-06-29",
    nationality: "England",
    position: Position.CAM,
    photoUrl: "https://i.pravatar.cc/300?u=bellingham",
    currentTeam: "Real Madrid",
  },
  {
    name: "Vinícius Júnior",
    birthDate: "2000-07-12",
    nationality: "Brazil",
    position: Position.LW,
    photoUrl: "https://i.pravatar.cc/300?u=vinicius-junior",
    currentTeam: "Real Madrid",
  },
  {
    name: "Federico Valverde",
    birthDate: "1998-07-22",
    nationality: "Uruguay",
    position: Position.CM,
    photoUrl: "https://i.pravatar.cc/300?u=valverde",
    currentTeam: "Real Madrid",
  },
  {
    name: "Rodri",
    birthDate: "1996-06-22",
    nationality: "Spain",
    position: Position.CDM,
    photoUrl: "https://i.pravatar.cc/300?u=rodri",
    currentTeam: "Manchester City",
  },
  {
    name: "Kevin De Bruyne",
    birthDate: "1991-06-28",
    nationality: "Belgium",
    position: Position.CAM,
    photoUrl: "https://i.pravatar.cc/300?u=de-bruyne",
    currentTeam: "Manchester City",
  },
  {
    name: "Julián Álvarez",
    birthDate: "2000-01-31",
    nationality: "Argentina",
    position: Position.ST,
    photoUrl: "https://i.pravatar.cc/300?u=julian-alvarez",
    currentTeam: "Manchester City",
  },
  {
    name: "Alisson Becker",
    birthDate: "1992-10-02",
    nationality: "Brazil",
    position: Position.GK,
    photoUrl: "https://i.pravatar.cc/300?u=alisson",
    currentTeam: "Liverpool",
  },
  {
    name: "Virgil van Dijk",
    birthDate: "1991-07-08",
    nationality: "Netherlands",
    position: Position.CB,
    photoUrl: "https://i.pravatar.cc/300?u=van-dijk",
    currentTeam: "Liverpool",
  },
  {
    name: "Mohamed Salah",
    birthDate: "1992-06-15",
    nationality: "Egypt",
    position: Position.RW,
    photoUrl: "https://i.pravatar.cc/300?u=salah",
    currentTeam: "Liverpool",
  },
  {
    name: "Bukayo Saka",
    birthDate: "2001-09-05",
    nationality: "England",
    position: Position.RW,
    photoUrl: "https://i.pravatar.cc/300?u=saka",
    currentTeam: "Arsenal",
  },
  {
    name: "Declan Rice",
    birthDate: "1999-01-14",
    nationality: "England",
    position: Position.CDM,
    photoUrl: "https://i.pravatar.cc/300?u=declan-rice",
    currentTeam: "Arsenal",
  },
  {
    name: "William Saliba",
    birthDate: "2001-03-24",
    nationality: "France",
    position: Position.CB,
    photoUrl: "https://i.pravatar.cc/300?u=saliba",
    currentTeam: "Arsenal",
  },
  {
    name: "Achraf Hakimi",
    birthDate: "1998-11-04",
    nationality: "Morocco",
    position: Position.RB,
    photoUrl: "https://i.pravatar.cc/300?u=hakimi",
    currentTeam: "Paris Saint-Germain",
  },
  {
    name: "Khvicha Kvaratskhelia",
    birthDate: "2001-02-12",
    nationality: "Georgia",
    position: Position.LW,
    photoUrl: "https://i.pravatar.cc/300?u=kvaratskhelia",
    currentTeam: "Paris Saint-Germain",
  },
  {
    name: "Jamal Musiala",
    birthDate: "2003-02-26",
    nationality: "Germany",
    position: Position.CAM,
    photoUrl: "https://i.pravatar.cc/300?u=musiala",
    currentTeam: "Bayern Munich",
  },
  {
    name: "Theo Hernández",
    birthDate: "1997-10-06",
    nationality: "France",
    position: Position.LB,
    photoUrl: "https://i.pravatar.cc/300?u=theo-hernandez",
    currentTeam: "AC Milan",
  },
  {
    name: "Rafael Leão",
    birthDate: "1999-06-10",
    nationality: "Portugal",
    position: Position.LW,
    photoUrl: "https://i.pravatar.cc/300?u=rafael-leao",
    currentTeam: "AC Milan",
  },
  {
    name: "Lautaro Martínez",
    birthDate: "1997-08-22",
    nationality: "Argentina",
    position: Position.ST,
    photoUrl: "https://i.pravatar.cc/300?u=lautaro-martinez",
    currentTeam: "Inter",
  },
];

async function main() {
  await prisma.player.deleteMany();

  await prisma.player.createMany({
    data: players.map((player) => ({
      ...player,
      birthDate: new Date(player.birthDate),
    })),
    skipDuplicates: true,
  });

  console.log(`Seed completado: ${players.length} jugadores creados.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });