import { hash } from "bcryptjs";
import type { PrismaClient } from "../../app/generated/prisma/client";

const dataUser = [
  {
    nama: "Mei",
    email: "mei@gmail.com",
    password: "meimei",
    role: "USER",
    kota: "Kota Bandung",
  },
  {
    nama: "Bagus",
    email: "bagus@gmail.com",
    password: "bagus123",
    role: "USER",
    kota: "Kab. Garut",
  },
  {
    nama: "Admin",
    email: "admin@gmail.com",
    password: "admin123",
    role: "ADMIN",
    kota: "Kota Cirebon",
  },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const user of dataUser) {
    const passwordHash = await hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        nama: user.nama,
        passwordHash,
        role: user.role,
        kota: user.kota,
      },
      create: {
        nama: user.nama,
        email: user.email,
        passwordHash,
        role: user.role,
        kota: user.kota,
      },
    });
  }

  console.log(`Berhasil memasukkan ${dataUser.length} data pengguna!`);
}