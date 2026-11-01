import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const STATUS_VALID = ["PENDING", "APPROVED", "REJECTED"];

/* Hanya admin yang boleh memakai endpoint ini */
async function pastikanAdmin() {
  const session = await verifySession();

  if (!session) {
    return { galat: NextResponse.json(
      { message: "Silakan login terlebih dahulu." },
      { status: 401 }
    ) };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return { galat: NextResponse.json(
      { message: "Akses hanya untuk admin." },
      { status: 403 }
    ) };
  }

  return { galat: null };
}

/* "Daging Sapi, Jeroan" -> ["Daging Sapi", "Jeroan"] */
function pisahKoma(teks: string) {
  return String(teks || "")
    .split(",")
    .map((bagian) => bagian.trim())
    .filter(Boolean);
}

/* GET: seluruh kuliner beserta nama pengirimnya. */
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

    return NextResponse.json(
      { message: "Gagal mengambil daftar kuliner." },
      { status: 500 }
    );
  }
}

/* PATCH: mengubah status (terima/tolak) atau isi kuliner. */
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
      bahan?: string;
      rasa?: string;
      deskripsi?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { message: "id kuliner wajib diisi." },
        { status: 400 }
      );
    }

    const data: {
      status?: string;
      catatanAdmin?: string | null;
      nama?: string;
      kategori?: string;
      daerah?: string;
      bahan?: string[];
      rasa?: string[];
      deskripsi?: string;
    } = {};

    if (typeof body.status === "string") {
      if (!STATUS_VALID.includes(body.status)) {
        return NextResponse.json(
          { message: "Status kuliner tidak dikenali." },
          { status: 400 }
        );
      }

      data.status = body.status;

      /* Ditolak wajib punya alasan, diterima/ditinjau menghapus catatan lama */
      if (body.status === "REJECTED") {
        data.catatanAdmin = String(body.catatanAdmin || "").trim() || null;
      } else {
        data.catatanAdmin = null;
      }
    }

    if (typeof body.nama === "string") {
      const nama = body.nama.trim();

      if (!nama) {
        return NextResponse.json(
          { message: "Nama kuliner wajib diisi." },
          { status: 400 }
        );
      }

      data.nama = nama;
    }

    if (typeof body.kategori === "string") data.kategori = body.kategori;
    if (typeof body.daerah === "string") data.daerah = body.daerah;
    if (typeof body.deskripsi === "string") data.deskripsi = body.deskripsi;
    if (typeof body.bahan === "string") data.bahan = pisahKoma(body.bahan);
    if (typeof body.rasa === "string") data.rasa = pisahKoma(body.rasa);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const kuliner = await prisma.kuliner.update({
      where: { id: body.id },
      data,
    });

    return NextResponse.json({
      message: "Data kuliner berhasil diperbarui.",
      kuliner,
    });
  } catch (error) {
    console.error("Gagal memperbarui kuliner:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui kuliner." },
      { status: 500 }
    );
  }
}

/* DELETE: menghapus kuliner beserta favorit dan ulasannya. */
export async function DELETE(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = (await request.json().catch(() => ({}))) as { id?: string };

    if (!body.id) {
      return NextResponse.json(
        { message: "id kuliner wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.kuliner.delete({ where: { id: body.id } });

    return NextResponse.json({ message: "Kuliner berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus kuliner:", error);

    return NextResponse.json(
      { message: "Gagal menghapus kuliner." },
      { status: 500 }
    );
  }
}
