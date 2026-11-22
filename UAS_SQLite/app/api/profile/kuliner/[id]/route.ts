import { NextResponse } from "next/server";
import {
  db,
  mapKuliner,
  now,
  parseListData,
  serializeListData,
} from "@/lib/db";
import { verifySession } from "@/lib/auth";

/* Batas foto (dataURL hasil kompresi dari browser) */
const POLA_GAMBAR = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAKS_PANJANG_GAMBAR = 3_000_000;

function ambilAngka(teks: string) {
  const cocok = String(teks || "").match(/[0-9][0-9.]*/g);

  if (!cocok) return [];

  return cocok.map((angka) => Number(angka.replace(/\./g, "")));
}

/* memastikan kuliner yang diubah memang milik pengguna yang login */
function ambilMilikSendiri(id: string, userId: string) {
  const kuliner = db.prepare("SELECT * FROM Kuliner WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;

  if (!kuliner || kuliner.submittedBy !== userId) return null;

  return kuliner;
}

/* mengubah kuliner milik sendiri, status dikembalikan ke PENDING supaya
   perubahannya (termasuk foto baru) ditinjau ulang oleh admin. */
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
    const milikSendiri = ambilMilikSendiri(id, session.userId);

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
      gambar?: string;
    };

    const nama = String(body.nama || "").trim();

    if (!nama) {
      return NextResponse.json(
        { message: "Nama kuliner wajib diisi." },
        { status: 400 }
      );
    }

    /* Validasi foto baru (opsional). Kalau tidak dikirim, foto lama dipertahankan. */
    let gambarBaru: string | undefined;

    if (typeof body.gambar === "string" && body.gambar !== "") {
      if (
        body.gambar.length > MAKS_PANJANG_GAMBAR ||
        !POLA_GAMBAR.test(body.gambar)
      ) {
        return NextResponse.json(
          { message: "Format atau ukuran foto tidak valid." },
          { status: 400 }
        );
      }

      gambarBaru = body.gambar;
    }

    const angkaHarga = ambilAngka(String(body.harga || ""));
    const hargaMin =
      angkaHarga.length > 0
        ? angkaHarga[0]
        : (milikSendiri.hargaMin as number);
    const hargaMax =
      angkaHarga.length > 1
        ? angkaHarga[1]
        : angkaHarga.length === 1
          ? angkaHarga[0]
          : (milikSendiri.hargaMax as number);

    const bahan =
      body.bahan !== undefined
        ? serializeListData(body.bahan)
        : serializeListData(parseListData(milikSendiri.bahan));

    const assignments = [
      "nama = @nama",
      "kategori = @kategori",
      "daerah = @daerah",
      "bahan = @bahan",
      "deskripsi = @deskripsi",
      "hargaMin = @hargaMin",
      "hargaMax = @hargaMax",
      "status = 'PENDING'",
      "catatanAdmin = NULL",
      "updatedAt = @updatedAt",
    ];

    const values: Record<string, unknown> = {
      nama,
      kategori: String(body.kategori || milikSendiri.kategori),
      daerah: String(body.daerah || milikSendiri.daerah),
      bahan,
      deskripsi: String(body.deskripsi ?? milikSendiri.deskripsi),
      hargaMin,
      hargaMax,
      updatedAt: now(),
      id,
    };

    if (gambarBaru) {
      assignments.push("gambar = @gambar");
      values.gambar = gambarBaru;
    }

    db.prepare(
      `UPDATE Kuliner SET ${assignments.join(", ")} WHERE id = @id`
    ).run(values);

    return NextResponse.json({
      message: "Kuliner berhasil diperbarui dan menunggu peninjauan ulang.",
      kuliner: mapKuliner(
        db.prepare("SELECT * FROM Kuliner WHERE id = ?").get(id) as Record<
          string,
          unknown
        >
      ),
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
  _request: Request,
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
    const milikSendiri = ambilMilikSendiri(id, session.userId);

    if (!milikSendiri) {
      return NextResponse.json(
        { message: "Kuliner tidak ditemukan." },
        { status: 404 }
      );
    }

    db.prepare("DELETE FROM Kuliner WHERE id = ?").run(id);

    return NextResponse.json({ message: "Kuliner berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus kuliner:", error);

    return NextResponse.json(
      { message: "Gagal menghapus kuliner." },
      { status: 500 }
    );
  }
}
