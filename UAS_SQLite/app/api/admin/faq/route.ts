import { NextResponse } from "next/server";
import { db, mapFaq, now, uuid } from "@/lib/db";
import { pastikanAdmin } from "@/lib/userQuery";

type FaqRow = Record<string, unknown>;

function ambilFaq(id: string) {
  return db.prepare("SELECT * FROM FAQ WHERE id = ?").get(id) as
    | FaqRow
    | undefined;
}

/* Urutan FAQ aktif selalu 1, 2, 3, ... tanpa bentrok. */
function aturUlangUrutanFaqAktif() {
  const faqAktif = db
    .prepare("SELECT id FROM FAQ WHERE isActive = 1 ORDER BY urutan ASC")
    .all() as { id: string }[];

  const update = db.prepare("UPDATE FAQ SET urutan = ? WHERE id = ?");

  // Pakai nomor negatif sementara supaya tidak melanggar UNIQUE saat ditukar
  db.transaction(() => {
    faqAktif.forEach((item, index) => update.run(-(index + 1), item.id));
    faqAktif.forEach((item, index) => update.run(index + 1, item.id));
  })();
}

/* GET: mengambil seluruh FAQ beserta pesan referensinya */
export async function GET() {
  try {
    const { galat } = await pastikanAdmin();
    if (galat) return galat;

    const rows = db
      .prepare("SELECT * FROM FAQ ORDER BY urutan ASC")
      .all() as FaqRow[];

    const pesan = db
      .prepare(
        `SELECT id, email, subjek, pesan, status, createdAt, faqId
         FROM ContactMessage
         WHERE isFaqReference = 1
         ORDER BY createdAt DESC`
      )
      .all() as (Record<string, unknown> & { faqId: string | null })[];

    const pesanPerFaq = new Map<string, Record<string, unknown>[]>();

    pesan.forEach((item) => {
      if (!item.faqId) return;

      const list = pesanPerFaq.get(item.faqId) ?? [];
      list.push({
        id: item.id,
        email: item.email,
        subjek: item.subjek,
        pesan: item.pesan,
        status: item.status,
        createdAt: item.createdAt,
      });
      pesanPerFaq.set(item.faqId, list);
    });

    const faq = rows.map((row) => ({
      ...mapFaq(row),
      messages: pesanPerFaq.get(row.id as string) ?? [],
    }));

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
              (id): id is string => typeof id === "string" && id.trim() !== ""
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

    const isActive = body.isActive ?? true;
    const id = uuid();
    const timestamp = now();

    const buatFaq = db.transaction(() => {
      if (messageIds.length > 0) {
        const placeholders = messageIds.map(() => "?").join(", ");

        const pesan = db
          .prepare(
            `SELECT id FROM ContactMessage
             WHERE id IN (${placeholders})
               AND isFaqReference = 1
               AND faqId IS NULL
               AND status = 'DIPROSES'`
          )
          .all(...messageIds) as { id: string }[];

        if (pesan.length !== messageIds.length) {
          throw new Error("REFERENSI_TIDAK_VALID");
        }
      }

      const jumlahFaqAktif = (
        db.prepare("SELECT COUNT(*) AS n FROM FAQ WHERE isActive = 1").get() as {
          n: number;
        }
      ).n;

      db.prepare(
        `INSERT INTO FAQ (id, pertanyaan, jawaban, urutan, isActive, createdAt, updatedAt, iconClass, slug)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        pertanyaan,
        jawaban,
        isActive ? jumlahFaqAktif + 1 : 0,
        isActive ? 1 : 0,
        timestamp,
        timestamp,
        body.iconClass || "bx bx-info-circle",
        slug
      );

      if (messageIds.length > 0) {
        const placeholders = messageIds.map(() => "?").join(", ");

        db.prepare(
          `UPDATE ContactMessage
           SET faqId = ?, status = 'SELESAI'
           WHERE id IN (${placeholders})`
        ).run(id, ...messageIds);
      }

      return ambilFaq(id);
    });

    const faq = buatFaq();

    return NextResponse.json(
      {
        message: "FAQ berhasil ditambahkan.",
        faq: faq && { ...mapFaq(faq), messages: [] },
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

/* PATCH: mengedit FAQ atau mengatur ulang urutannya */
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

      const faqAktif = db
        .prepare("SELECT id FROM FAQ WHERE isActive = 1")
        .all() as { id: string }[];

      if (
        faqAktif.length !== faqIds.length ||
        !faqAktif.every((item) => faqIds.includes(item.id))
      ) {
        return NextResponse.json(
          { message: "Daftar urutan FAQ tidak valid." },
          { status: 400 }
        );
      }

      const update = db.prepare("UPDATE FAQ SET urutan = ? WHERE id = ?");

      db.transaction(() => {
        faqIds.forEach((id, index) => update.run(-(index + 1), id));
        faqIds.forEach((id, index) => update.run(index + 1, id));
      })();

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

    const faqLama = ambilFaq(body.id);

    if (!faqLama) {
      return NextResponse.json(
        { message: "FAQ tidak ditemukan." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

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
      data.isActive = body.isActive ? 1 : 0;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const statusBerubah =
      typeof body.isActive === "boolean" &&
      (body.isActive ? 1 : 0) !== faqLama.isActive;

    const simpan = db.transaction(() => {
      if (statusBerubah) {
        if (body.isActive === true) {
          // FAQ yang diaktifkan masuk ke urutan paling akhir
          const jumlahFaqAktif = (
            db
              .prepare("SELECT COUNT(*) AS n FROM FAQ WHERE isActive = 1")
              .get() as { n: number }
          ).n;

          data.urutan = jumlahFaqAktif + 1;
          data.isActive = 1;
        } else {
          // Nonaktifkan FAQ, lalu rapikan urutan sisanya
          data.urutan = 0;
          data.isActive = 0;
        }
      }

      const columns = Object.keys(data);
      const assignments = columns.map((column) => `${column} = @${column}`);

      assignments.push("updatedAt = @updatedAt");

      db.prepare(
        `UPDATE FAQ SET ${assignments.join(", ")} WHERE id = @id`
      ).run({ ...data, id: body.id, updatedAt: now() });

      if (statusBerubah && body.isActive === false) {
        aturUlangUrutanFaqAktif();
      }
    });

    simpan();

    const faq = ambilFaq(body.id);

    return NextResponse.json({
      message: "FAQ berhasil diperbarui.",
      faq: faq && mapFaq(faq),
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

    const faq = ambilFaq(body.id);

    if (!faq) {
      return NextResponse.json(
        { message: "FAQ tidak ditemukan." },
        { status: 404 }
      );
    }

    db.transaction(() => {
      db.prepare("DELETE FROM FAQ WHERE id = ?").run(body.id);
      aturUlangUrutanFaqAktif();
    })();

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
