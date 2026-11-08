import { NextResponse } from "next/server";
import { deleteSession } from "../../../../lib/auth";

export async function POST() {
  try {
    // Menghapus session pengguna
    await deleteSession();

    return NextResponse.json({
      message: "Logout berhasil.",
    });
  } catch (error) {
    console.error("Gagal mengakhiri session:", error);

    return NextResponse.json(
      { message: "Gagal melakukan logout." },
      { status: 500 }
    );
  }
}