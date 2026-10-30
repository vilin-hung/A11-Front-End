
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifySession } from "../../../lib/auth";

async function isAdmin() {
  const session = await verifySession();

  if (!session) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}


export async function GET() {
  try {
    // Ambil semua daerah yang memiliki kuliner APPROVED
    const kulinerAktif = await prisma.kuliner.findMany({
      where: { status: "APPROVED" },
      select: { daerah: true },
    });

    const daerahDenganKuliner = new Set(
      kulinerAktif.map((item) => item.daerah.trim().toLowerCase())
    );

    // Ambil daerah aktif dari database
    const regions = await prisma.mapRegion.findMany({
      where: { isActive: true },
      orderBy: { nama: "asc" },
    });

    // Tampilkan hanya daerah yang memiliki kuliner
    const regionsTampil = regions.filter((region) =>
      daerahDenganKuliner.has(region.daerah.trim().toLowerCase())
    );

    return NextResponse.json({ regions: regionsTampil });
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
    if (!(await isAdmin())) {
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
      posisiX < 0 || posisiX > 100 ||
      posisiY < 0 || posisiY > 100
    ) {
      return NextResponse.json(
        { message: "Data daerah atau posisi pin tidak valid." },
        { status: 400 }
      );
    }

    const region = await prisma.mapRegion.create({
      data: { nama, daerah, deskripsi, posisiX, posisiY },
    });

    return NextResponse.json({ region }, { status: 201 });
  } catch (error) {
    console.error("Gagal menambahkan daerah:", error);

    return NextResponse.json(
      { message: "Gagal menambahkan daerah. Periksa apakah nama daerah sudah digunakan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) {
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

    const data: {
      nama?: string;
      daerah?: string;
      deskripsi?: string;
      posisiX?: number;
      posisiY?: number;
      isActive?: boolean;
    } = {};

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
      data.isActive = body.isActive;
    }

    const region = await prisma.mapRegion.update({
      where: { id },
      data,
    });

    return NextResponse.json({ region });
  } catch (error) {
    console.error("Gagal memperbarui daerah:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui daerah." },
      { status: 500 }
    );
  }
}
