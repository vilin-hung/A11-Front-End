import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";

// Menangani proses pendaftaran akun baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nama =
      typeof body.nama === "string" ? body.nama.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const kota =
      typeof body.kota === "string" ? body.kota.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    const errors: Record<string, string> = {};

    // Validasi nama lengkap
    if (!nama) {
      errors.nama = "Nama lengkap wajib diisi.";
    } else if (nama.length < 4) {
      errors.nama = "Nama lengkap minimal 4 karakter.";
    }

    // Validasi email
    if (!email) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email =
        "Masukkan alamat email dengan format yang benar.";
    }

    // Validasi kota atau kabupaten
    if (!kota) {
      errors.kota = "Kota atau kabupaten wajib diisi.";
    }

    // Validasi kata sandi
    if (!password) {
      errors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 6) {
      errors.password = "Kata sandi minimal 6 karakter.";
    }

    // Validasi konfirmasi kata sandi
    if (!confirmPassword) {
      errors.confirmPassword =
        "Konfirmasi kata sandi wajib diisi.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword =
        "Konfirmasi kata sandi tidak cocok.";
    }

    // Mengembalikan pesan jika terdapat kesalahan input
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          message: "Data pendaftaran belum valid.",
          errors,
        },
        { status: 400 }
      );
    }

    // Memeriksa apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "Email sudah terdaftar. Gunakan email lain.",
          errors: {
            email: "Email sudah terdaftar. Gunakan email lain.",
          },
        },
        { status: 409 }
      );
    }

    // Memastikan sesi dapat dibuat sebelum akun disimpan
    if (
      !process.env.SESSION_SECRET ||
      process.env.SESSION_SECRET.length < 32
    ) {
      throw new Error("Konfigurasi sesi belum valid.");
    }

    // Mengenkripsi kata sandi sebelum menyimpan akun
    const passwordHash = await hash(password, 12);

    // Menyimpan data akun ke database
    const user = await prisma.user.create({
      data: {
        nama,
        email,
        kota,
        passwordHash,
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

    // Membuat sesi setelah pendaftaran berhasil
    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    // Menangani email duplikat jika terjadi permintaan bersamaan
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "Email sudah terdaftar. Gunakan email lain.",
          errors: {
            email: "Email sudah terdaftar. Gunakan email lain.",
          },
        },
        { status: 409 }
      );
    }

    console.error("Gagal mendaftarkan akun:", error);

    return NextResponse.json(
      {
        message:
          "Data akun tidak dapat disimpan. Silakan coba kembali.",
      },
      { status: 500 }
    );
  }
}
