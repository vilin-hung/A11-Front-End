import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifySession } from "../../../../lib/auth";

const ALLOWED_KEYS = [
  "site_name",
  "site_description",
  "site_email",
  "site_phone",
  "site_address",
  "footer_text",
] as const;

async function isAdmin() {
  const session = await verifySession();

  if (!session) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

// Mengambil seluruh metadata
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      );
    }

    const metadata = await prisma.siteMetadata.findMany({
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ metadata });
  } catch (error) {
    console.error("Gagal mengambil metadata:", error);

    return NextResponse.json(
      { message: "Gagal mengambil metadata website." },
      { status: 500 }
    );
  }
}

// Menyimpan perubahan metadata
export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
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

    const metadata = body.metadata as {
      key: string;
      value: string;
    }[];

    const keys = new Set<string>();

    for (const item of metadata) {
      if (
        !item ||
        typeof item.key !== "string" ||
        typeof item.value !== "string" ||
        !ALLOWED_KEYS.includes(
          item.key as (typeof ALLOWED_KEYS)[number]
        ) ||
        keys.has(item.key)
      ) {
        return NextResponse.json(
          { message: "Data metadata tidak valid." },
          { status: 400 }
        );
      }

      keys.add(item.key);
    }

    if (metadata.length !== ALLOWED_KEYS.length ||
        ALLOWED_KEYS.some((key) => !keys.has(key))) {
      return NextResponse.json(
        { message: "Semua field metadata wajib dikirim." },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      metadata.map((item) =>
        prisma.siteMetadata.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: {
            key: item.key,
            value: item.value,
          },
        })
      )
    );

    const updatedMetadata = await prisma.siteMetadata.findMany({
      orderBy: { key: "asc" },
    });

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