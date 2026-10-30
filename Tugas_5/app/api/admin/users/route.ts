
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/auth";

export async function GET() {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        kota: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Gagal mengambil daftar pengguna:", error);

    return NextResponse.json(
      { message: "Gagal mengambil daftar pengguna." },
      { status: 500 }
    );
  }
}
