import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/auth";

const KATEGORI_REKOMENDASI = {
  makanan: "Makanan",
  jajanan: "Jajanan",
  minuman: "Minuman",
  oleh_oleh: "Oleh-oleh Khas",
} as const;

type KategoriRekomendasi = keyof typeof KATEGORI_REKOMENDASI;

const KEYS = Object.keys(
  KATEGORI_REKOMENDASI
) as KategoriRekomendasi[];

async function isAdmin() {
  const session = await verifySession();

  if (!session) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

function normalisasiKategori(kategori: string) {
  return kategori.trim().toLowerCase();
}

// Mengambil pilihan Kuliner yang sudah disetujui
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
        where: { status: "APPROVED" },
        select: {
          id: true,
          nama: true,
          kategori: true,
          daerah: true,
        },
        orderBy: { nama: "asc" },
      }),

      prisma.siteMetadata.findMany({
        where: {
          key: { in: KEYS.map((key) => `featured_${key}`) },
        },
      }),
    ]);

    const rekomendasi: Record<KategoriRekomendasi, string> = {
      makanan: "",
      jajanan: "",
      minuman: "",
      oleh_oleh: "",
    };

    for (const item of metadata) {
      const key = item.key.replace(
        "featured_",
        ""
      ) as KategoriRekomendasi;

      if (KEYS.includes(key)) {
        rekomendasi[key] = item.value;
      }
    }

    return NextResponse.json({
      kuliner,
      rekomendasi,
    });
  } catch (error) {
    console.error("Gagal mengambil rekomendasi:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data rekomendasi." },
      { status: 500 }
    );
  }
}

// Menyimpan pilihan rekomendasi
export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = body.rekomendasi;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { message: "Format rekomendasi tidak valid." },
        { status: 400 }
      );
    }

    for (const key of KEYS) {
      if (typeof data[key] !== "string") {
        return NextResponse.json(
          { message: "Pilihan rekomendasi tidak valid." },
          { status: 400 }
        );
      }
    }

    const pilihan = data as Record<KategoriRekomendasi, string>;

    const selectedIds = KEYS
      .map((key) => pilihan[key])
      .filter((id) => id !== "");

    if (new Set(selectedIds).size !== selectedIds.length) {
      return NextResponse.json(
        { message: "Satu Kuliner tidak boleh dipilih untuk beberapa kategori." },
        { status: 400 }
      );
    }

    const kulinerTerpilih = selectedIds.length
      ? await prisma.kuliner.findMany({
          where: {
            id: { in: selectedIds },
            status: "APPROVED",
          },
          select: {
            id: true,
            kategori: true,
          },
        })
      : [];

    if (kulinerTerpilih.length !== selectedIds.length) {
      return NextResponse.json(
        { message: "Kuliner tidak ditemukan atau belum disetujui." },
        { status: 400 }
      );
    }

    for (const key of KEYS) {
      const id = pilihan[key];

      if (id === "") continue;

      const item = kulinerTerpilih.find(
        (kuliner) => kuliner.id === id
      );

      if (
        !item ||
        normalisasiKategori(item.kategori) !==
          normalisasiKategori(KATEGORI_REKOMENDASI[key])
      ) {
        return NextResponse.json(
          {
            message: `Pilihan untuk kategori ${KATEGORI_REKOMENDASI[key]} tidak sesuai.`,
          },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(
      KEYS.map((key) =>
        prisma.siteMetadata.upsert({
          where: { key: `featured_${key}` },
          update: { value: pilihan[key] },
          create: {
            key: `featured_${key}`,
            value: pilihan[key],
          },
        })
      )
    );

    return NextResponse.json({
      message: "Rekomendasi homepage berhasil diperbarui.",
      rekomendasi: pilihan,
    });
  } catch (error) {
    console.error("Gagal menyimpan rekomendasi:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan rekomendasi homepage." },
      { status: 500 }
    );
  }
}
