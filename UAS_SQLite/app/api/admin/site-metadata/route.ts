import { NextResponse } from "next/server";
import { db, now } from "@/lib/db";
import { isAdmin } from "@/lib/userQuery";
import { verifySession } from "@/lib/auth";

const ALLOWED_KEYS = [
  "site_name",
  "site_description",
  "site_email",
  "site_phone",
  "site_address",
  "footer_text",

  "hero_tagline",
  "hero_title",
  "hero_description",

  "social_instagram",
  "social_tiktok",
  "social_youtube",
  "social_facebook",

  "home_icon_makanan",
  "home_icon_jajanan",
  "home_icon_minuman",
  "home_icon_oleh_oleh",
] as const;

/* Mengambil seluruh metadata */
export async function GET() {
  try {
    const session = await verifySession();

    if (!session || !isAdmin(session.userId)) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const placeholders = ALLOWED_KEYS.map(() => "?").join(", ");

    const metadata = db
      .prepare(
        `SELECT * FROM SiteMetadata WHERE key IN (${placeholders}) ORDER BY key ASC`
      )
      .all(...ALLOWED_KEYS);

    return NextResponse.json({ metadata });
  } catch (error) {
    console.error("Gagal mengambil metadata:", error);

    return NextResponse.json(
      { message: "Gagal mengambil metadata website." },
      { status: 500 }
    );
  }
}

/* Menyimpan perubahan metadata */
export async function PUT(request: Request) {
  try {
    const session = await verifySession();

    if (!session || !isAdmin(session.userId)) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.metadata)) {
      return NextResponse.json(
        { message: "Format metadata tidak valid." },
        { status: 400 }
      );
    }

    const metadata = body.metadata as { key: string; value: string }[];
    const keys = new Set<string>();

    for (const item of metadata) {
      if (
        !item ||
        typeof item.key !== "string" ||
        typeof item.value !== "string" ||
        !ALLOWED_KEYS.includes(item.key as (typeof ALLOWED_KEYS)[number]) ||
        keys.has(item.key)
      ) {
        return NextResponse.json(
          { message: "Data metadata tidak valid." },
          { status: 400 }
        );
      }

      keys.add(item.key);
    }

    const simpan = db.prepare(
      `INSERT INTO SiteMetadata (id, key, value, updatedAt)
       VALUES (@id, @key, @value, @updatedAt)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updatedAt = excluded.updatedAt`
    );

    const timestamp = now();

    db.transaction(() => {
      for (const item of metadata) {
        simpan.run({
          id: crypto.randomUUID(),
          key: item.key,
          value: item.value,
          updatedAt: timestamp,
        });
      }
    })();

    const placeholders = ALLOWED_KEYS.map(() => "?").join(", ");

    const updatedMetadata = db
      .prepare(
        `SELECT * FROM SiteMetadata WHERE key IN (${placeholders}) ORDER BY key ASC`
      )
      .all(...ALLOWED_KEYS);

    return NextResponse.json({
      message: "Metadata website berhasil diperbarui.",
      metadata: updatedMetadata,
    });
  } catch (error) {
    console.error("Gagal menyimpan metadata:", error);

    return NextResponse.json(
      { message: "Gagal menyimpan metadata website." },
      { status: 500 }
    );
  }
}
