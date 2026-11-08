import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/auth";

const HERO_KEY = "hero_kuliner_ids";

async function isAdmin() {
  const session = await verifySession();

  if (!session) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

// Mengambil daftar Kuliner dan pilihan Hero
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const [kuliner, metadata] = await Promise.all([
      prisma.kuliner.findMany({
        where: {
          status: "APPROVED",
          gambar: { not: null },
        },
        select: {
          id: true,
          nama: true,
          kategori: true,
          daerah: true,
          gambar: true,
        },
        orderBy: { nama: "asc" },
      }),

      prisma.siteMetadata.findUnique({
        where: { key: HERO_KEY },
        select: { value: true },
      }),
    ]);

    let heroKulinerIds: string[] = [];

    try {
      const parsed = JSON.parse(metadata?.value ?? "[]");

      if (Array.isArray(parsed)) {
        heroKulinerIds = parsed.filter(
          (id): id is string => typeof id === "string"
        );
      }
    } catch {
      heroKulinerIds = [];
    }

    return NextResponse.json({
      kuliner,
      heroKulinerIds,
    });
  } catch (error) {
    console.error("Gagal mengambil pengaturan Hero:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data Hero." },
      { status: 500 }
    );
  }
}

// Menyimpan pilihan dan urutan Kuliner Hero
export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const heroKulinerIds = body.heroKulinerIds;

    if (
      !Array.isArray(heroKulinerIds) ||
      !heroKulinerIds.every((id) => typeof id === "string")
    ) {
      return NextResponse.json(
        { message: "Format pilihan Hero tidak valid." },
        { status: 400 }
      );
    }

    if (new Set(heroKulinerIds).size !== heroKulinerIds.length) {
      return NextResponse.json(
        { message: "Kuliner yang sama tidak boleh dipilih dua kali." },
        { status: 400 }
      );
    }

    const kulinerTerpilih = heroKulinerIds.length
      ? await prisma.kuliner.findMany({
          where: {
            id: { in: heroKulinerIds },
            status: "APPROVED",
            gambar: { not: null },
          },
          select: { id: true },
        })
      : [];

    if (kulinerTerpilih.length !== heroKulinerIds.length) {
      return NextResponse.json(
        {
          message:
            "Ada Kuliner yang tidak ditemukan, belum disetujui, atau belum memiliki gambar.",
        },
        { status: 400 }
      );
    }

    await prisma.siteMetadata.upsert({
      where: { key: HERO_KEY },
      update: { value: JSON.stringify(heroKulinerIds) },
      create: {
        key: HERO_KEY,
        value: JSON.stringify(heroKulinerIds),
      },
    });

    return NextResponse.json({
      message: "Hero Carousel berhasil diperbarui.",
      heroKulinerIds,
    });
  } catch (error) {
    console.error("Gagal menyimpan pengaturan Hero:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan pengaturan Hero." },
      { status: 500 }
    );
  }
}