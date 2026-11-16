import { connection, NextResponse } from "next/server";
import { findUserById } from "@/lib/userQuery";
import { verifySession } from "@/lib/auth";

export async function GET() {
  await connection();

  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = findUserById(session.userId) as
      | {
          id: string;
          nama: string;
          email: string;
          kota: string | null;
          avatar: string | null;
          role: string;
        }
      | undefined;

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Mengirim data pengguna tanpa passwordHash
    return NextResponse.json({
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        kota: user.kota,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Gagal memeriksa sesi pengguna:", error);

    return NextResponse.json(
      { message: "Gagal memeriksa sesi pengguna." },
      { status: 500 }
    );
  }
}
