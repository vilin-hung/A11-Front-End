import type { PrismaClient } from "../../app/generated/prisma/client";

const metadataData = [
  { key: "site_name", value: "JelajahRasa" },
  {
    key: "site_description",
    value: "Jelajahi kuliner khas Jawa Barat",
  },
  { key: "site_email", value: "halo@jelajahrasajabar.id" },
  { key: "site_phone", value: "" },
  { key: "site_address", value: "Jawa Barat, Indonesia" },
  { key: "footer_text", value: "© 2026 JelajahRasa" },
];

export async function seedMetadata(prisma: PrismaClient) {
  for (const metadata of metadataData) {
    await prisma.siteMetadata.upsert({
      where: { key: metadata.key },
      update: {},
      create: metadata,
    });
  }

  console.log(`Berhasil memasukkan ${metadataData.length} metadata website!`);
}