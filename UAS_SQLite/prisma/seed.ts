import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { seedFaq } from "./seeder/faq";
import { seedRegions } from "./seeder/regions";
import { seedMetadata } from "./seeder/metadata";
import { seedKuliner } from "./seeder/kuliner";
import { seedUsers } from "./seeder/users";
import { seedReviews } from "./seeder/review";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedUsers(prisma);
  await seedReviews(prisma);
  await seedFaq(prisma);
  await seedRegions(prisma);
  await seedMetadata(prisma);
  await seedKuliner(prisma);
}

main()
  .catch((error) => {
    console.error("Gagal memasukkan data seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });