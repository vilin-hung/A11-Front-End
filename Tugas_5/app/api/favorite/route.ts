import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Mengambil daftar favorit pengguna
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "userId wajib diisi" },
        { status: 400 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { kuliner: true, },
      orderBy: { createdAt: "desc", },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Gagal mengambil favorit:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data favorit" },
      { status: 500 }
    );
  }
}

// POST: Menambahkan kuliner ke daftar favorit
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, kulinerId } = body;

    if (!userId || !kulinerId) {
      return NextResponse.json(
        { message: "userId dan kulinerId wajib diisi" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_kulinerId: {
          userId,
          kulinerId,
        },
      },
      update: {},
      create: {
        userId,
        kulinerId,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Gagal menambahkan favorit:", error);

    return NextResponse.json(
      { message: "Gagal menambahkan favorit" },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus kuliner dari daftar favorit
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId, kulinerId } = body;

    if (!userId || !kulinerId) {
      return NextResponse.json(
        { message: "userId dan kulinerId wajib diisi" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_kulinerId: {
          userId,
          kulinerId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { message: "Favorit tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: {
        userId_kulinerId: {
          userId,
          kulinerId,
        },
      },
    });

    return NextResponse.json({
      message: "Favorit berhasil dihapus",
    });
  } catch (error) {
    console.error("Gagal menghapus favorit:", error);

    return NextResponse.json(
      { message: "Gagal menghapus favorit" },
      { status: 500 }
    );
  }
}