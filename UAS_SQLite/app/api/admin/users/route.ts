import { NextResponse } from "next/server";
import { db, mapKuliner, mapUser, now } from "@/lib/db";
import { pastikanAdmin } from "@/lib/userQuery";

const ROLE_VALID = ["USER", "ADMIN"];

export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const rows = db
      .prepare("SELECT * FROM User ORDER BY createdAt DESC")
      .all() as Record<string, unknown>[];

    const users = rows.map((row) => ({
      id: row.id,
      nama: row.nama,
      email: row.email,
      kota: row.kota,
      avatar: row.avatar,
      role: row.role,
      createdAt: row.createdAt,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Gagal mengambil daftar pengguna:", error);

    return NextResponse.json(
      { message: "Gagal mengambil daftar pengguna." },
      { status: 500 }
    );
  }
}

/* mengubah role pengguna */
export async function PATCH(request: Request) {
  try {
    const { session, galat } = await pastikanAdmin();
    if (galat || !session) return galat;

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      role?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { message: "id pengguna wajib diisi." },
        { status: 400 }
      );
    }

    if (!body.role || !ROLE_VALID.includes(body.role)) {
      return NextResponse.json(
        { message: "Role pengguna tidak dikenali." },
        { status: 400 }
      );
    }

    /* admin tidak boleh menurunkan dirinya sendiri */
    if (body.id === session.userId) {
      return NextResponse.json(
        { message: "Role akun sendiri tidak dapat diubah." },
        { status: 400 }
      );
    }

    const target = db
      .prepare("SELECT role FROM User WHERE id = ?")
      .get(body.id) as { role: string } | undefined;

    if (!target) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    /* setidaknya ada 1 admin tersisa */
    if (target.role === "ADMIN" && body.role !== "ADMIN") {
      const jumlahAdmin = (
        db
          .prepare("SELECT COUNT(*) AS jumlah FROM User WHERE role = 'ADMIN'")
          .get() as { jumlah: number }
      ).jumlah;

      if (jumlahAdmin <= 1) {
        return NextResponse.json(
          { message: "Minimal harus ada satu akun admin." },
          { status: 400 }
        );
      }
    }

    db.prepare("UPDATE User SET role = ?, updatedAt = ? WHERE id = ?").run(
      body.role,
      now(),
      body.id
    );

    const row = db.prepare("SELECT * FROM User WHERE id = ?").get(body.id) as
      | Record<string, unknown>
      | undefined;

    return NextResponse.json({
      message: "Role pengguna berhasil diperbarui.",
      user: row && {
        id: row.id,
        nama: row.nama,
        email: row.email,
        kota: row.kota,
        avatar: row.avatar,
        role: row.role,
        createdAt: row.createdAt,
      },
    });
  } catch (error) {
    console.error("Gagal memperbarui role pengguna:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui role pengguna." },
      { status: 500 }
    );
  }
}
