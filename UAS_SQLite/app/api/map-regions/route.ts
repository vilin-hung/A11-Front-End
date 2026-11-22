import { NextResponse } from "next/server";
import { db, mapRegion } from "@/lib/db";
import { isAdmin } from "@/lib/userQuery";
import { verifySession } from "@/lib/auth";
import { now, uuid } from "@/lib/db";

export async function GET() {
  try {
    const kulinerAktif = db
      .prepare("SELECT daerah FROM Kuliner WHERE status = 'APPROVED'")
      .all() as { daerah: string }[];

    const daerahDenganKuliner = new Set(
      kulinerAktif.map((item) => item.daerah.trim().toLowerCase())
    );

    const rows = db
      .prepare(
        "SELECT * FROM MapRegion WHERE isActive = 1 ORDER BY nama ASC"
      )
      .all() as Record<string, unknown>[];

    // Tampilkan hanya daerah yang memiliki kuliner
    const regions = rows
      .map(mapRegion)
      .filter((region) =>
        daerahDenganKuliner.has(region.daerah.trim().toLowerCase())
      );

    return NextResponse.json({ regions });
  } catch (error) {
    console.error("Gagal mengambil daerah:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data daerah." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession();

    if (!session || !isAdmin(session.userId)) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nama = String(body.nama ?? "").trim();
    const daerah = String(body.daerah ?? "").trim();
    const deskripsi = String(body.deskripsi ?? "").trim();
    const posisiX = Number(body.posisiX);
    const posisiY = Number(body.posisiY);

    if (
      !nama ||
      !daerah ||
      !deskripsi ||
      !Number.isFinite(posisiX) ||
      !Number.isFinite(posisiY) ||
      posisiX < 0 ||
      posisiX > 100 ||
      posisiY < 0 ||
      posisiY > 100
    ) {
      return NextResponse.json(
        { message: "Data daerah atau posisi pin tidak valid." },
        { status: 400 }
      );
    }

    const id = uuid();

    db.prepare(
      `INSERT INTO MapRegion (id, nama, daerah, deskripsi, posisiX, posisiY, isActive)
       VALUES (?, ?, ?, ?, ?, ?, 1)`
    ).run(id, nama, daerah, deskripsi, posisiX, posisiY);

    const region = db.prepare("SELECT * FROM MapRegion WHERE id = ?").get(id);

    return NextResponse.json(
      { region: mapRegion(region as Record<string, unknown>) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gagal menambahkan daerah:", error);

    return NextResponse.json(
      {
        message:
          "Gagal menambahkan daerah. Periksa apakah nama daerah sudah digunakan.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await verifySession();

    if (!session || !isAdmin(session.userId)) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = String(body.id ?? "");

    if (!id) {
      return NextResponse.json(
        { message: "ID daerah wajib diisi." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.nama !== undefined) {
      const nama = String(body.nama).trim();
      if (!nama) {
        return NextResponse.json(
          { message: "Nama daerah tidak boleh kosong." },
          { status: 400 }
        );
      }
      data.nama = nama;
    }

    if (body.daerah !== undefined) {
      const daerah = String(body.daerah).trim();
      if (!daerah) {
        return NextResponse.json(
          { message: "Kode daerah tidak boleh kosong." },
          { status: 400 }
        );
      }
      data.daerah = daerah;
    }

    if (body.deskripsi !== undefined) {
      const deskripsi = String(body.deskripsi).trim();
      if (!deskripsi) {
        return NextResponse.json(
          { message: "Deskripsi tidak boleh kosong." },
          { status: 400 }
        );
      }
      data.deskripsi = deskripsi;
    }

    for (const key of ["posisiX", "posisiY"] as const) {
      if (body[key] !== undefined) {
        const value = Number(body[key]);

        if (!Number.isFinite(value) || value < 0 || value > 100) {
          return NextResponse.json(
            { message: "Posisi pin harus antara 0 dan 100." },
            { status: 400 }
          );
        }

        data[key] = value;
      }
    }

    if (body.isActive !== undefined) {
      if (typeof body.isActive !== "boolean") {
        return NextResponse.json(
          { message: "Status daerah tidak valid." },
          { status: 400 }
        );
      }
      data.isActive = body.isActive ? 1 : 0;
    }

    const columns = Object.keys(data);

    if (columns.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const assignments = columns.map((column) => `${column} = @${column}`);

    const result = db
      .prepare(`UPDATE MapRegion SET ${assignments.join(", ")} WHERE id = @id`)
      .run({ ...data, id });

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Daerah tidak ditemukan." },
        { status: 404 }
      );
    }

    const region = db.prepare("SELECT * FROM MapRegion WHERE id = ?").get(id);

    return NextResponse.json({
      region: mapRegion(region as Record<string, unknown>),
    });
  } catch (error) {
    console.error("Gagal memperbarui daerah:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui daerah." },
      { status: 500 }
    );
  }
}
