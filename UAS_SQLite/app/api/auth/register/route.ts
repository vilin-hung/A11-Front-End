import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db, now, uuid } from "@/lib/db";
import { findUserByEmail } from "@/lib/userQuery";
import { createSession } from "@/lib/auth";

// Menangani proses pendaftaran akun baru
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nama = typeof body.nama === "string" ? body.nama.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const kota = typeof body.kota === "string" ? body.kota.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    const errors: Record<string, string> = {};

    if (!nama) {
      errors.nama = "Nama lengkap wajib diisi.";
    } else if (nama.length < 4) {
      errors.nama = "Nama lengkap minimal 4 karakter.";
    }

    if (!email) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Masukkan alamat email dengan format yang benar.";
    }

    if (!kota) {
      errors.kota = "Kota atau kabupaten wajib diisi.";
    }

    if (!password) {
      errors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 6) {
      errors.password = "Kata sandi minimal 6 karakter.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: "Data pendaftaran belum valid.", errors },
        { status: 400 }
      );
    }

    // Memeriksa apakah email sudah terdaftar
    if (findUserByEmail(email)) {
      return NextResponse.json(
        {
          message: "Email sudah terdaftar. Gunakan email lain.",
          errors: { email: "Email sudah terdaftar. Gunakan email lain." },
        },
        { status: 409 }
      );
    }

    // Memastikan sesi dapat dibuat sebelum akun disimpan
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
      throw new Error("Konfigurasi sesi belum valid.");
    }

    const passwordHash = await hash(password, 12);
    const id = uuid();
    const timestamp = now();

    db.prepare(
      `INSERT INTO User (id, nama, email, passwordHash, role, kota, avatar, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'USER', ?, NULL, ?, ?)`
    ).run(id, nama, email, passwordHash, kota, timestamp, timestamp);

    await createSession(id);

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil.",
        user: { id, nama, email, kota, avatar: null, role: "USER" },
      },
      { status: 201 }
    );
  } catch (error) {
    // Menangani email duplikat jika terjadi permintaan bersamaan
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      String(error.code).startsWith("SQLITE_CONSTRAINT")
    ) {
      return NextResponse.json(
        {
          message: "Email sudah terdaftar. Gunakan email lain.",
          errors: { email: "Email sudah terdaftar. Gunakan email lain." },
        },
        { status: 409 }
      );
    }

    console.error("Gagal mendaftarkan akun:", error);

    return NextResponse.json(
      { message: "Data akun tidak dapat disimpan. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
