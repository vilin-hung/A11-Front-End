import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

function ambilAngka(teks: string) {
  const cocok = String(teks || "").match(/[0-9][0-9.]*/g);

  if (!cocok) return [];

  return cocok.map((angka) => Number(angka.replace(/\./g, "")));
}

function pisahBahan(teks: string) {
  return String(teks || "")
    .split(",")
    .map((bahan) => bahan.trim())
    .filter(Boolean);
}

/* memastikan kuliner yang diubah memang milik pengguna yang login */
async function ambilMilikSendiri(id: string, userId: string) {
  const kuliner = await prisma.kuliner.findUnique({ where: { id } });

  if (!kuliner || kuliner.submittedBy !== userId) return null;

  return kuliner;
}

/* mengubah kuliner milik sendiri, status dikembalikan ke PENDING supaya perubahannya ditinjau ulang oleh admin. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const milikSendiri = await ambilMilikSendiri(id, session.userId);

    if (!milikSendiri) {
      return NextResponse.json(
        { message: "Kuliner tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      nama?: string;
      kategori?: string;
      daerah?: string;
      harga?: string;
      bahan?: string;
      deskripsi?: string;
    };

    const nama = String(body.nama || "").trim();

    if (!nama) {
      return NextResponse.json(
        { message: "Nama kuliner wajib diisi." },
        { status: 400 }
      );
    }

    const angkaHarga = ambilAngka(String(body.harga || ""));
    const hargaMin = angkaHarga.length > 0 ? angkaHarga[0] : milikSendiri.hargaMin;
    const hargaMax =
      angkaHarga.length > 1
        ? angkaHarga[1]
        : angkaHarga.length === 1
          ? angkaHarga[0]
          : milikSendiri.hargaMax;

    const kuliner = await prisma.kuliner.update({
      where: { id },
      data: {
        nama,
        kategori: String(body.kategori || milikSendiri.kategori),
        daerah: String(body.daerah || milikSendiri.daerah),
        bahan: pisahBahan(String(body.bahan ?? milikSendiri.bahan.join(", "))),
        deskripsi: String(body.deskripsi ?? milikSendiri.deskripsi),
        hargaMin,
        hargaMax,
        status: "PENDING",
        catatanAdmin: null,
      },
    });

    return NextResponse.json({
      message: "Kuliner berhasil diperbarui dan menunggu peninjauan ulang.",
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

/* menghapus permanen kuliner milik sendiri. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const milikSendiri = await ambilMilikSendiri(id, session.userId);

    if (!milikSendiri) {
      return NextResponse.json(
        { message: "Kuliner tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.kuliner.delete({ where: { id } });

    return NextResponse.json({ message: "Kuliner berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus kuliner:", error);

    return NextResponse.json(
      { message: "Gagal menghapus kuliner." },
      { status: 500 }
    );
  }
}
