import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";

// Menangani proses login pengguna
export async function POST(request: Request) {
    try {
        // Membaca data yang dikirim dari form login
        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { message: "Data login tidak valid." },
                { status: 400 }
            );
        }

        if (
            typeof body !== "object" ||
            body === null ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                { message: "Data login tidak valid." },
                { status: 400 }
            );
        }

        const data = body as Record<string, unknown>;

        const email =
            typeof data.email === "string"
                ? data.email.trim().toLowerCase()
                : "";

        const password =
            typeof data.password === "string"
                ? data.password
                : "";

        const errors: Record<string, string> = {};

        // Validasi email
        if (!email) {
            errors.email = "Email wajib diisi.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email =
                "Masukkan alamat email dengan format yang benar.";
        }

        // Validasi kata sandi
        if (!password) {
            errors.password = "Kata sandi wajib diisi.";
        }

        // Mengembalikan pesan jika input belum valid
        if (Object.keys(errors).length > 0) {
            return NextResponse.json(
                {
                    message: "Data login belum valid.",
                    errors,
                },
                { status: 400 }
            );
        }

        // Mencari akun berdasarkan email di PostgreSQL
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                nama: true,
                email: true,
                kota: true,
                avatar: true,
                role: true,
                passwordHash: true,
            },
        });

        // Menolak login jika email tidak ditemukan
        if (!user) {
            return NextResponse.json(
                {
                    message: "Email atau kata sandi salah.",
                    errors: {
                        email: "Email atau kata sandi salah.",
                        password: "Email atau kata sandi salah.",
                    },
                },
                { status: 401 }
            );
        }

        // Membandingkan kata sandi dengan hash di database
        const passwordCocok = await compare(
            password,
            user.passwordHash
        );

        if (!passwordCocok) {
            return NextResponse.json(
                {
                    message: "Email atau kata sandi salah.",
                    errors: {
                        email: "Email atau kata sandi salah.",
                        password: "Email atau kata sandi salah.",
                    },
                },
                { status: 401 }
            );
        }

        // Membuat sesi setelah kredensial berhasil diverifikasi
        await createSession(user.id);

        // Mengembalikan informasi akun tanpa mengirim passwordHash
        return NextResponse.json({
            message: "Login berhasil.",
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
        console.error("Gagal memproses login:", error);

        return NextResponse.json(
            {
                message:
                    "Login tidak dapat diproses. Silakan coba kembali.",
            },
            { status: 500 }
        );
    }
}
