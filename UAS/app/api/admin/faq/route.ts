
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { verifySession } from "@/lib/auth";

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

async function aturUlangUrutanFaqAktif(
  tx: Prisma.TransactionClient
) {
  const faqAktif = await tx.fAQ.findMany({
    where: { isActive: true },
    orderBy: { urutan: "asc" },
    select: { id: true },
  });

  // Gunakan nomor negatif sementara untuk menghindari bentrok urutan
  await Promise.all(
    faqAktif.map((item, index) =>
      tx.fAQ.update({
        where: { id: item.id },
        data: { urutan: -(index + 1) },
      })
    )
  );

  // Kembalikan urutan menjadi 1, 2, 3, dan seterusnya
  await Promise.all(
    faqAktif.map((item, index) =>
      tx.fAQ.update({
        where: { id: item.id },
        data: { urutan: index + 1 },
      })
    )
  );
}

/* GET: mengambil seluruh FAQ */
export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const faq = await prisma.fAQ.findMany({
      orderBy: { urutan: "asc" },
      include: {
        messages: {
          where: { isFaqReference: true },
          select: {
            id: true,
            email: true,
            subjek: true,
            pesan: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ faq });
  } catch (error) {
    console.error("Gagal mengambil FAQ:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data FAQ." },
      { status: 500 }
    );
  }
}

/* POST: menambahkan FAQ baru dan menghubungkan pesan referensi */
export async function POST(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = await request.json().catch(() => ({}));

    const pertanyaan = String(body.pertanyaan || "").trim();
    const jawaban = String(body.jawaban || "").trim();
    const slug = String(body.slug || "").trim();

    const rawMessageIds: unknown = body.messageIds;

    const messageIds: string[] = Array.isArray(rawMessageIds)
      ? Array.from(
          new Set(
            rawMessageIds.filter(
              (id): id is string =>
                typeof id === "string" && id.trim() !== ""
            )
          )
        )
      : [];

    if (!pertanyaan || !jawaban || !slug) {
      return NextResponse.json(
        { message: "Pertanyaan, jawaban, dan slug wajib diisi." },
        { status: 400 }
      );
    }

    if (
      Array.isArray(body.messageIds) &&
      messageIds.length !== body.messageIds.length
    ) {
      return NextResponse.json(
        { message: "Daftar pesan referensi tidak valid." },
        { status: 400 }
      );
    }

    const faq = await prisma.$transaction(async (tx) => {
      // Pastikan semua pesan memang sudah dipilih sebagai referensi
      if (messageIds.length > 0) {
        const pesan = await tx.contactMessage.findMany({
          where: {
            id: { in: messageIds },
            isFaqReference: true,
            faqId: null,
            status: "DIPROSES",
          },
          select: { id: true },
        });

        if (pesan.length !== messageIds.length) {
          throw new Error("REFERENSI_TIDAK_VALID");
        }
      }

      // Tentukan urutan FAQ berikutnya
      const jumlahFaqAktif = await tx.fAQ.count({
        where: { isActive: true },
      });

      // Buat FAQ baru
      const faqBaru = await tx.fAQ.create({
        data: {
          pertanyaan,
          jawaban,
          slug,
          urutan: (body.isActive ?? true) ? jumlahFaqAktif + 1 : 0,
          iconClass: body.iconClass || "bx bx-info-circle",
          isActive: body.isActive ?? true,
        },
      });

      // Hubungkan pesan referensi ke FAQ yang baru dibuat
      if (messageIds.length > 0) {
        await tx.contactMessage.updateMany({
          where: {
            id: { in: messageIds },
            isFaqReference: true,
            faqId: null,
            status: "DIPROSES",
          },
          data: {
            faqId: faqBaru.id,
            status: "SELESAI",
          },
        });
      }

      return faqBaru;
    });

    return NextResponse.json(
      {
        message: "FAQ berhasil ditambahkan.",
        faq,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "REFERENSI_TIDAK_VALID"
    ) {
      return NextResponse.json(
        { message: "Pesan referensi tidak valid atau sudah digunakan." },
        { status: 400 }
      );
    }

    console.error("Gagal menambahkan FAQ:", error);

    return NextResponse.json(
      { message: "Gagal menambahkan FAQ. Pastikan slug belum digunakan." },
      { status: 500 }
    );
  }
}

/* PATCH: mengedit FAQ */
export async function PATCH(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = await request.json().catch(() => ({}));

    // Mengatur ulang urutan FAQ setelah drag-and-drop
    if (body.action === "REORDER") {
      const faqIds: unknown = body.faqIds;

      if (
        !Array.isArray(faqIds) ||
        !faqIds.every(
          (id): id is string => typeof id === "string" && id.trim() !== ""
        ) ||
        new Set(faqIds).size !== faqIds.length
      ) {
        return NextResponse.json(
          { message: "Daftar urutan FAQ tidak valid." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        const faqAktif = await tx.fAQ.findMany({
          where: { isActive: true },
          select: { id: true },
        });

        // Pastikan semua ID yang dikirim adalah FAQ aktif
        if (
          faqAktif.length !== faqIds.length ||
          !faqAktif.every((item) => faqIds.includes(item.id))
        ) {
          throw new Error("FAQ_TIDAK_VALID");
        }

        // Atur ulang urutan sementara
        await Promise.all(
          faqIds.map((id, index) =>
            tx.fAQ.update({
              where: { id },
              data: { urutan: -(index + 1) },
            })
          )
        );

        // Simpan urutan akhir
        await Promise.all(
          faqIds.map((id, index) =>
            tx.fAQ.update({
              where: { id },
              data: { urutan: index + 1 },
            })
          )
        );
      });

      return NextResponse.json({
        message: "Urutan FAQ berhasil diperbarui.",
      });
    }

    if (!body.id) {
      return NextResponse.json(
        { message: "ID FAQ wajib diisi." },
        { status: 400 }
      );
    }

    const data: {
      pertanyaan?: string;
      jawaban?: string;
      slug?: string;
      urutan?: number;
      iconClass?: string;
      isActive?: boolean;
    } = {};

    if (typeof body.pertanyaan === "string") {
      data.pertanyaan = body.pertanyaan.trim();
    }

    if (typeof body.jawaban === "string") {
      data.jawaban = body.jawaban.trim();
    }

    if (typeof body.slug === "string") {
      data.slug = body.slug.trim();
    }

    if (Number.isInteger(body.urutan)) {
      data.urutan = body.urutan;
    }

    if (typeof body.iconClass === "string") {
      data.iconClass = body.iconClass;
    }

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const faq = await prisma.$transaction(async (tx) => {
      const faqLama = await tx.fAQ.findUnique({
        where: { id: body.id },
      });

      if (!faqLama) {
        throw new Error("FAQ_TIDAK_DITEMUKAN");
      }

      const statusBerubah =
        typeof data.isActive === "boolean" &&
        data.isActive !== faqLama.isActive;

      if (statusBerubah) {
        if (data.isActive === true) {
          // FAQ yang diaktifkan masuk ke urutan paling akhir
          const jumlahFaqAktif = await tx.fAQ.count({
            where: { isActive: true },
          });

          await tx.fAQ.update({
            where: { id: body.id },
            data: {
              ...data,
              urutan: jumlahFaqAktif + 1,
            },
          });
        } else {
          // Nonaktifkan FAQ terlebih dahulu
          await tx.fAQ.update({
            where: { id: body.id },
            data: {
              ...data,
              urutan: 0,
            },
          });

          await aturUlangUrutanFaqAktif(tx);
        }
      } else {
        await tx.fAQ.update({
          where: { id: body.id },
          data,
        });
      }

      return tx.fAQ.findUnique({
        where: { id: body.id },
      });
    });

    return NextResponse.json({
      message: "FAQ berhasil diperbarui.",
      faq,
    });
  } catch (error) {
    console.error("Gagal memperbarui FAQ:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui FAQ." },
      { status: 500 }
    );
  }
}

/* DELETE: menghapus FAQ */
export async function DELETE(request: Request) {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const body = await request.json().catch(() => ({}));

    if (!body.id || typeof body.id !== "string") {
      return NextResponse.json(
        { message: "ID FAQ wajib diisi." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Cari FAQ yang akan dihapus
      const faq = await tx.fAQ.findUnique({
        where: { id: body.id },
        select: { id: true },
      });

      if (!faq) {
        throw new Error("FAQ_TIDAK_DITEMUKAN");
      }

      // Hapus FAQ
      await tx.fAQ.delete({
        where: { id: body.id },
      });

      await aturUlangUrutanFaqAktif(tx);
    });

    return NextResponse.json({
      message: "FAQ berhasil dihapus dan urutan berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal menghapus FAQ:", error);

    return NextResponse.json(
      { message: "Gagal menghapus FAQ." },
      { status: 500 }
    );
  }
}