import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Nama cookie yang menyimpan token sesi pengguna
const SESSION_COOKIE_NAME = "jelajahRasa_session";

// Masa berlaku sesi adalah 7 hari.
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Mengambil secret dari environment untuk menandatangani token sesi
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET belum dikonfigurasi atau terlalu pendek."
    );
  }

  return new TextEncoder().encode(secret);
}

// Membuat sesi setelah pengguna berhasil login
export async function createSession(userId: string) {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS
  );

  const session = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getSessionSecret());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Memeriksa validitas token dan mengambil id pengguna dari sesi
export async function verifySession(): Promise<{
  userId: string;
} | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      session,
      getSessionSecret(),
      {
        algorithms: ["HS256"],
      }
    );

    if (typeof payload.userId !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch {
    // Token tidak valid atau sudah kedaluwarsa
    return null;
  }
}

// Menghapus sesi ketika pengguna logout
export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}
