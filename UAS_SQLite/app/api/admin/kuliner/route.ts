import { NextResponse } from "next/server";
import {
  db,
  mapKuliner,
  mapKulinerList,
  now,
  parseListData,
  serializeListData,
  uuid,
} from "@/lib/db";
import { pastikanAdmin } from "@/lib/userQuery";

const STATUS_VALID = ["PENDING", "APPROVED", "REJECTED"];

export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const rows = db
      .prepare(
        `SELECT k.*, u.nama AS userNama
         FROM Kuliner k
         LEFT JOIN User u ON u.id = k.submittedBy
         ORDER BY k.createdAt DESC`
      )
      .all() as Record<string, unknown>[];

    const kuliner = mapKulinerList(rows).map((item) => ({
      ...item,
      user: item.userNama ? { nama: item.userNama } : null,
    }));

    return NextResponse.json({ kuliner });
  } catch (error) {
    console.error("Gagal mengambil daftar kuliner:", error);
    return NextResponse.json(
      { message: "Gagal mengambil daftar kuliner." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { galat, session } = await pastikanAdmin();
    if (galat) return galat;
    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

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
      return NextResponse.json(
        { message: "Nama, kategori, asal daerah, dan deskripsi wajib diisi." },
        { status: 400 }
      );
    }

    if (!gambar || !gambar.startsWith("data:image/")) {
      return NextResponse.json(
        { message: "Foto kuliner wajib diunggah dengan format yang benar." },
        { status: 400 }
      );
    }

    const status = STATUS_VALID.includes(body.status as string)
      ? (body.status as string)
      : "APPROVED";

    // Kita buat default harga 0 jika tidak dikirim dari frontend
    const hargaMin = Number(body.hargaMin) || 0;
    const hargaMax = Number(body.hargaMax) || 0;

    const id = uuid();
    const timestamp = now();

    db.prepare(
      `INSERT INTO Kuliner (
        id, nama, deskripsi, sejarah, kategori, daerah, bahan, rasa,
        gambar, hargaMin, hargaMax, status, catatanAdmin, submittedBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`
    ).run(
      id,
      nama,
      deskripsi,
      kategori,
      daerah,
      serializeListData(body.bahan),
      serializeListData(body.rasa),
      gambar,
      hargaMin,
      hargaMax,
      status,
      session.userId,
      timestamp,
      timestamp
    );

    const kuliner = db.prepare("SELECT * FROM Kuliner WHERE id = ?").get(id);

    return NextResponse.json(
      {
        message: "Kuliner berhasil ditambahkan.",
        kuliner: mapKuliner(kuliner as Record<string, unknown>),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menambahkan kuliner:", error);
    return NextResponse.json(
      {
        message: "Gagal menambahkan kuliner.",
        detail: error instanceof Error ? error.message : "Unknown error",
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

    if (!body.id) {
      return NextResponse.json(
        { message: "id kuliner wajib diisi." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.status === "string") {
      if (!STATUS_VALID.includes(body.status)) {
        return NextResponse.json(
          { message: "Status kuliner tidak dikenali." },
          { status: 400 }
        );
      }
      data.status = body.status;
      data.catatanAdmin =
        body.status === "REJECTED"
          ? String(body.catatanAdmin || "").trim() || null
          : null;
    }

    if (typeof body.nama === "string") data.nama = body.nama.trim();
    if (typeof body.kategori === "string") data.kategori = body.kategori;
    if (typeof body.daerah === "string") data.daerah = body.daerah;
    if (typeof body.deskripsi === "string") data.deskripsi = body.deskripsi;
    if (body.bahan !== undefined) {
      data.bahan = serializeListData(parseListData(body.bahan));
    }
    if (body.rasa !== undefined) {
      data.rasa = serializeListData(parseListData(body.rasa));
    }

    const columns = Object.keys(data);

    if (columns.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const assignments = columns.map((column) => `${column} = @${column}`);
    assignments.push("updatedAt = @updatedAt");

    const result = db
      .prepare(`UPDATE Kuliner SET ${assignments.join(", ")} WHERE id = @id`)
      .run({ ...data, id: body.id, updatedAt: now() });

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Kuliner tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data kuliner berhasil diperbarui.",
      kuliner: mapKuliner(
        db.prepare("SELECT * FROM Kuliner WHERE id = ?").get(body.id) as Record<
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

    const result = db.prepare("DELETE FROM Kuliner WHERE id = ?").run(body.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Kuliner tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Kuliner berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus kuliner:", error);
    return NextResponse.json(
      { message: "Gagal menghapus kuliner." },
      { status: 500 }
    );
  }
}
