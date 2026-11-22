import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/auth";

/* Pemetaan semua query SQL untuk tabel User. */
export function findUserByEmail(email: string) {
  return db.prepare("SELECT * FROM User WHERE email = ?").get(email) as
    | Record<string, unknown>
    | undefined;
}

export function findUserById(id: string) {
  return db.prepare("SELECT * FROM User WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
}

export function isAdmin(userId: string) {
  const user = findUserById(userId);
  return Boolean(user && user.role === "ADMIN");
}

/* Hanya admin yang boleh memakai endpoint admin */
export async function pastikanAdmin() {
  const session = await verifySession();

  if (!session) {
    return {
      session: null,
      galat: NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      ),
    };
  }

  if (!isAdmin(session.userId)) {
    return {
      session: null,
      galat: NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      ),
    };
  }

  return { session, galat: null };
}
