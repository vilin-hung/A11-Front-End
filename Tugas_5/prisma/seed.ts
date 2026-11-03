import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedFaq } from "./seeder/faq";
import { seedRegions } from "./seeder/regions";
import { seedMetadata } from "./seeder/metadata";
import { seedKuliner } from "./seeder/kuliner";
import { seedUsers } from "./seeder/users";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await seedUsers(prisma);
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