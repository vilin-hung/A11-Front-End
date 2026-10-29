import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/auth";

export async function GET() {
    try {
        // Memeriksa session pengguna yang sedang login
        const session = await verifySession();

        if (!session) {
            return NextResponse.json({ user: null });
        }

        // Mengambil data pengguna dari database
        const user = await prisma.user.findUnique({
            where: {
                id: session.userId,
            },
            select: {
                id: true,
                nama: true,
                email: true,
                kota: true,
                avatar: true,
                role: true,
            },
        });

        // Mengembalikan hasil jika pengguna tidak ditemukan
        if (!user) {
            return NextResponse.json({ user: null });
        }

        // Mengirim data pengguna tanpa passwordHash
        return NextResponse.json({ user });
    } catch (error) {
        // Menangani kegagalan saat memeriksa sesi
        console.error("Gagal memeriksa sesi pengguna:", error);

        return NextResponse.json(
            { message: "Gagal memeriksa sesi pengguna." },
            { status: 500 }
        );
    }
}
