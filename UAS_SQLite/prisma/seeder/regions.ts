import type { PrismaClient } from "../../app/generated/prisma/client";
import { regions } from "../../app/data/regions";

export async function seedRegions(prisma: PrismaClient) {
  for (const region of regions) {
    await prisma.mapRegion.upsert({
      where: { daerah: region.daerah },
      update: {
        // nama: region.nama,
        // deskripsi: region.deskripsi,
        // posisiX: region.posisiX,
        // posisiY: region.posisiY,
      },
      create: region,
    });
  }

  console.log(`Berhasil memasukkan ${regions.length} daerah peta!`);
}