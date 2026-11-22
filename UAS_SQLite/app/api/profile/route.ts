import { NextResponse } from "next/server";
import { db, mapKulinerList, now } from "@/lib/db";
import { findUserById } from "@/lib/userQuery";
import { verifySession } from "@/lib/auth";

/* profil pengguna yang sedang login beserta histori kuliner dan jumlah favoritnya. */
export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const user = findUserById(session.userId);

    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const rows = db
      .prepare(
        "SELECT * FROM Kuliner WHERE submittedBy = ? ORDER BY createdAt DESC"
      )
      .all(session.userId) as Record<string, unknown>[];

    const jumlahFavorit = (
      db
        .prepare("SELECT COUNT(*) AS jumlah FROM Favorite WHERE userId = ?")
        .get(session.userId) as { jumlah: number }
    ).jumlah;

    return NextResponse.json({
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        kota: user.kota,
        avatar: user.avatar,
        role: user.role,
      },
      kuliner: mapKulinerList(rows),
      jumlahFavorit,
    });
  } catch (error) {
    console.error("Gagal mengambil data profil:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data profil." },
      { status: 500 }
    );
  }
}

/* memperbarui nama, kota, atau foto profil. */
export async function PATCH(request: Request) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      nama?: string;
      kota?: string;
      avatar?: string;
    };

    const perubahan: { nama?: string; kota?: string; avatar?: string } = {};

    if (typeof body.nama === "string") {
      const nama = body.nama.trim();

      if (nama.length < 4) {
        return NextResponse.json(
          { message: "Nama lengkap minimal 4 karakter." },
          { status: 400 }
        );
      }

      perubahan.nama = nama;
    }

    if (typeof body.kota === "string") {
      const kota = body.kota.trim();

      if (!kota) {
        return NextResponse.json(
          { message: "Asal kota/kabupaten wajib diisi." },
          { status: 400 }
        );
      }

      perubahan.kota = kota;
    }

    if (typeof body.avatar === "string") {
      if (!body.avatar.startsWith("data:image/")) {
        return NextResponse.json(
          { message: "Format foto tidak dikenali." },
          { status: 400 }
        );
      }

      perubahan.avatar = body.avatar;
    }

    const columns = Object.keys(perubahan);

    if (columns.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const assignments = columns.map((column) => `${column} = @${column}`);
    assignments.push("updatedAt = @updatedAt");

    db.prepare(`UPDATE User SET ${assignments.join(", ")} WHERE id = @id`).run({
      ...perubahan,
      id: session.userId,
      updatedAt: now(),
    });

    const user = findUserById(session.userId);

    return NextResponse.json({
      message: "Profil berhasil diperbarui.",
      user: user && {
        id: user.id,
        nama: user.nama,
        email: user.email,
        kota: user.kota,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui profil." },
      { status: 500 }
    );
  }
}
