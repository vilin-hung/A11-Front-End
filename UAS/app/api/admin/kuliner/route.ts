import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const STATUS_VALID = ["PENDING", "APPROVED", "REJECTED"];

async function pastikanAdmin() {
  const session = await verifySession();

  if (!session) {
    return {
      galat: NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      ),
      userId: null,
    };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return {
      galat: NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      ),
      userId: null,
    };
  }

  return { galat: null, userId: session.userId };
}

function parseListData(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(input).split(",").map((bagian) => bagian.trim()).filter(Boolean);
}

export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const kuliner = await prisma.kuliner.findMany({
      include: { user: { select: { nama: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ kuliner });
  } catch (error) {
    console.error("Gagal mengambil daftar kuliner:", error);
    return NextResponse.json({ message: "Gagal mengambil daftar kuliner." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { galat, userId } = await pastikanAdmin();
    if (galat) return galat;
    if (!userId) return NextResponse.json({ message: "Silakan login terlebih dahulu." }, { status: 401 });

    const body = (await request.json().catch(() => ({}))) as {
      nama?: string;
      kategori?: string;
      daerah?: string;
      deskripsi?: string;
      bahan?: string | string[];
      rasa?: string | string[];
      gambar?: string;
      status?: string;
      hargaMin?: number | string;
      hargaMax?: number | string;
    };

    const nama = String(body.nama || "").trim();
    const kategori = String(body.kategori || "").trim();
    const daerah = String(body.daerah || "").trim();
    const deskripsi = String(body.deskripsi || "").trim();
    const gambar = String(body.gambar || "");

    if (!nama || !kategori || !daerah || !deskripsi) {
      return NextResponse.json({ message: "Nama, kategori, asal daerah, dan deskripsi wajib diisi." }, { status: 400 });
    }

    if (!gambar || !gambar.startsWith("data:image/")) {
      return NextResponse.json({ message: "Foto kuliner wajib diunggah dengan format yang benar." }, { status: 400 });
    }

    const status = STATUS_VALID.includes(body.status as string) ? body.status : "APPROVED";

    // Kita buat default harga 0 jika tidak dikirim dari frontend
    const hargaMin = Number(body.hargaMin) || 0;
    const hargaMax = Number(body.hargaMax) || 0;

    const kuliner = await prisma.kuliner.create({
      data: {
        nama,
        kategori,
        daerah,
        deskripsi,
        bahan: parseListData(body.bahan),
        rasa: parseListData(body.rasa),
        gambar,
        hargaMin, // <--- TAMBAHAN WAJIB
        hargaMax, // <--- TAMBAHAN WAJIB
        status: status as string, 
        user: { connect: { id: userId } }, 
      },
    });

    return NextResponse.json({ message: "Kuliner berhasil ditambahkan.", kuliner }, { status: 201 });
  } catch (error) {
    console.error("Gagal menambahkan kuliner:", error);
    return NextResponse.json(
      { 
        message: "Gagal menambahkan kuliner.",
        detail: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      status?: string;
      catatanAdmin?: string;
      nama?: string;
      kategori?: string;
      daerah?: string;
      bahan?: string | string[];
      rasa?: string | string[];
      deskripsi?: string;
    };

    if (!body.id) return NextResponse.json({ message: "id kuliner wajib diisi." }, { status: 400 });

    // Menggunakan Record<string, unknown> agar tidak kena error ESLint "any"
    const data: Record<string, unknown> = {};

    if (typeof body.status === "string") {
      if (!STATUS_VALID.includes(body.status)) {
        return NextResponse.json({ message: "Status kuliner tidak dikenali." }, { status: 400 });
      }
      data.status = body.status;
      if (body.status === "REJECTED") {
        data.catatanAdmin = String(body.catatanAdmin || "").trim() || null;
      } else {
        data.catatanAdmin = null;
      }
    }

    if (typeof body.nama === "string") data.nama = body.nama.trim();
    if (typeof body.kategori === "string") data.kategori = body.kategori;
    if (typeof body.daerah === "string") data.daerah = body.daerah;
    if (typeof body.deskripsi === "string") data.deskripsi = body.deskripsi;
    if (body.bahan !== undefined) data.bahan = parseListData(body.bahan);
    if (body.rasa !== undefined) data.rasa = parseListData(body.rasa);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "Tidak ada perubahan yang dikirim." }, { status: 400 });
    }

    const kuliner = await prisma.kuliner.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json({ message: "Data kuliner berhasil diperbarui.", kuliner });
  } catch (error) {
    console.error("Gagal memperbarui kuliner:", error);
    return NextResponse.json({ message: "Gagal memperbarui kuliner." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = (await request.json().catch(() => ({}))) as { id?: string };

    if (!body.id) return NextResponse.json({ message: "id kuliner wajib diisi." }, { status: 400 });

    await prisma.kuliner.delete({ where: { id: body.id } });

    return NextResponse.json({ message: "Kuliner berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus kuliner:", error);
    return NextResponse.json({ message: "Gagal menghapus kuliner." }, { status: 500 });
  }
}