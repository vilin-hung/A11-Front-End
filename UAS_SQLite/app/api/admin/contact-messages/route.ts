
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const STATUS_VALID = ["BARU", "DIPROSES", "SELESAI"];

/* Hanya admin yang boleh memakai endpoint ini */
async function pastikanAdmin() {
  const session = await verifySession();

  if (!session) {
    return {
      galat: NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      ),
    };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return {
      galat: NextResponse.json(
        { message: "Akses hanya untuk admin." },
        { status: 403 }
      ),
    };
  }

  return { galat: null };
}

/* GET: mengambil seluruh pesan masuk */
export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const messages = await prisma.contactMessage.findMany({
      include: {
        faq: {
          select: {
            id: true,
            pertanyaan: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Gagal mengambil pesan masuk:", error);

    return NextResponse.json(
      { message: "Gagal mengambil pesan masuk." },
      { status: 500 }
    );
  }
}

/* PATCH: mengubah status pesan */
export async function PATCH(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = await request.json().catch(() => ({}));

    // Menjadikan beberapa pesan sebagai referensi FAQ
    if (body.action === "JADIKAN_REFERENSI") {
      const messageIds = body.messageIds;

      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return NextResponse.json(
          { message: "Pilih minimal satu pesan." },
          { status: 400 }
        );
      }

      const pesan = await prisma.contactMessage.findMany({
        where: {
          id: { in: messageIds },
          status: "DIPROSES",
          faqId: null,
          isFaqReference: false,
        },
        select: { id: true },
      });

      if (pesan.length !== messageIds.length) {
        return NextResponse.json(
          {
            message:
              "Pastikan semua pesan berstatus DIPROSES dan belum terhubung ke FAQ.",
          },
          { status: 400 }
        );
      }

      await prisma.contactMessage.updateMany({
        where: { id: { in: messageIds } },
        data: { isFaqReference: true },
      });

      return NextResponse.json({
        message: "Pesan berhasil disimpan sebagai referensi FAQ.",
      });
    }

    // Mengubah status pesan seperti sebelumnya
    if (!body.id || !body.status) {
      return NextResponse.json(
        { message: "ID dan status pesan wajib diisi." },
        { status: 400 }
      );
    }

    if (!STATUS_VALID.includes(body.status)) {
      return NextResponse.json(
        { message: "Status pesan tidak dikenali." },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.update({
      where: { id: body.id },
      data: { status: body.status },
    });

    return NextResponse.json({
      message: "Status pesan berhasil diperbarui.",
      data: message,
    });
  } catch (error) {
    console.error("Gagal mengubah pesan:", error);

    return NextResponse.json(
      { message: "Gagal mengubah pesan." },
      { status: 500 }
    );
  }
}

