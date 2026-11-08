"use client";

import { useCallback, useEffect, useState } from "react";

type FAQReference = {
  id: string;
  email: string;
  subjek: string;
  pesan: string;
  status: string;
  createdAt: string;
};

type FAQItem = {
  id: string;
  pertanyaan: string;
  jawaban: string;
  slug: string;
  urutan: number;
  iconClass: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messages: FAQReference[];
};

type FAQForm = {
  pertanyaan: string;
  jawaban: string;
  slug: string;
  messageIds: string[];
};

type FAQTouched = {
  pertanyaan: boolean;
  jawaban: boolean;
  slug: boolean;
};

type Props = {
  pesanReferensi: FAQReference[];
  onMessagesChanged: () => void;
};

const FORM_KOSONG: FAQForm = {
  pertanyaan: "",
  jawaban: "",
  slug: "",
  messageIds: [],
};

const TOUCHED_KOSONG: FAQTouched = {
  pertanyaan: false,
  jawaban: false,
  slug: false,
};

export default function FAQPage({
  pesanReferensi,
  onMessagesChanged,
}: Props) {
  const [faqList, setFaqList] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [form, setForm] = useState<FAQForm>(FORM_KOSONG);
  const [touched, setTouched] = useState<FAQTouched>(TOUCHED_KOSONG);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);
  const [faqReferenceOpen, setFaqReferenceOpen] =
    useState<FAQItem | null>(null);

  const muatFaq = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/faq", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data FAQ.");
      }

      setFaqList(data.faq || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data FAQ."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let masihAktif = true;

    fetch("/api/admin/faq", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil data FAQ.");
        }

        return data.faq || [];
      })
      .then((daftarFaq) => {
        if (masihAktif) setFaqList(daftarFaq);
      })
      .catch((err: unknown) => {
        if (!masihAktif) return;

        setError(
          err instanceof Error ? err.message : "Gagal mengambil data FAQ."
        );
      })
      .finally(() => {
        if (masihAktif) setLoading(false);
      });

    return () => {
      masihAktif = false;
    };
  }, []);

  useEffect(() => {
    if (!info && !error) return;

    const timer = setTimeout(() => {
      setInfo("");
      setError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [info, error]);

  function mulaiEdit(item: FAQItem) {
    setEditingFaq(item);
    setForm({
      pertanyaan: item.pertanyaan,
      jawaban: item.jawaban,
      slug: item.slug,
      messageIds: [],
    });
    setTouched(TOUCHED_KOSONG);
    setError("");
    setInfo("");
  }

  function batalEdit() {
    setEditingFaq(null);
    setForm(FORM_KOSONG);
    setTouched(TOUCHED_KOSONG);
  }

  async function simpanFaq() {
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/admin/faq", {
        method: editingFaq ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingFaq ? { id: editingFaq.id, ...form } : form
        ),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan FAQ.");
      }

      setInfo(
        data.message ||
          (editingFaq
            ? "FAQ berhasil diperbarui."
            : "FAQ berhasil ditambahkan.")
      );

      const faqBaru = !editingFaq;
      setEditingFaq(null);
      setForm(FORM_KOSONG);
      setTouched(TOUCHED_KOSONG);
      await muatFaq();

      if (faqBaru) onMessagesChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan FAQ."
      );
    } finally {
      setLoading(false);
    }
  }

  async function ubahStatus(item: FAQItem) {
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/admin/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isActive: !item.isActive,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah status FAQ.");
      }

      setInfo(data.message || "Status FAQ berhasil diperbarui.");
      await muatFaq();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah status FAQ."
      );
    } finally {
      setLoading(false);
    }
  }

  async function hapusFaq(item: FAQItem) {
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/admin/faq", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus FAQ.");
      }

      setInfo(data.message || "FAQ berhasil dihapus.");
      setFaqToDelete(null);

      if (editingFaq?.id === item.id) batalEdit();

      await muatFaq();
      onMessagesChanged();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus FAQ."
      );
    } finally {
      setLoading(false);
    }
  }

  async function simpanUrutan(faqIds: string[]) {
    setError("");
    setInfo("");

    try {
      const response = await fetch("/api/admin/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REORDER", faqIds }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengatur urutan FAQ.");
      }

      setInfo("Urutan FAQ berhasil diperbarui.");
      await muatFaq();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengatur urutan FAQ."
      );
      await muatFaq();
    }
  }

  function pindahkanFaq(targetId: string) {
    if (!draggedFaqId || draggedFaqId === targetId) return;

    const daftarBaru = [...faqList];
    const indexAwal = daftarBaru.findIndex((item) => item.id === draggedFaqId);
    const indexTujuan = daftarBaru.findIndex((item) => item.id === targetId);

    if (indexAwal < 0 || indexTujuan < 0) return;

    const [dipindahkan] = daftarBaru.splice(indexAwal, 1);
    daftarBaru.splice(indexTujuan, 0, dipindahkan);

    const daftarBerurutan = daftarBaru.map((item, index) => ({
      ...item,
      urutan: index + 1,
    }));

    setFaqList(daftarBerurutan);
    setDraggedFaqId(null);
    void simpanUrutan(daftarBerurutan.map((item) => item.id));
  }

  return (
    <section id="tab-kelola-faq">
      <div className="mb-4">
        <h4>Kelola FAQ</h4>
        <p className="text-muted">
          Kelola pertanyaan dan jawaban yang ditampilkan pada halaman FAQ.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      <div className="box-tabel border rounded bg-white p-4 mb-4">
        <h5>{editingFaq ? "Edit FAQ" : "Tambah FAQ Baru"}</h5>

        <div className="mb-3">
          <label className="form-label">Pertanyaan</label>
          <input
            className={`form-control ${
              touched.pertanyaan && !form.pertanyaan.trim() ? "is-invalid" : ""
            }`}
            value={form.pertanyaan}
            onChange={(event) =>
              setForm({ ...form, pertanyaan: event.target.value })
            }
            onBlur={() =>
              setTouched((prev) => ({ ...prev, pertanyaan: true }))
            }
            placeholder="Masukkan pertanyaan FAQ"
          />
          {touched.pertanyaan && !form.pertanyaan.trim() && (
            <div className="invalid-feedback">Pertanyaan harus diisi.</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Jawaban</label>
          <textarea
            className={`form-control ${
              touched.jawaban && !form.jawaban.trim() ? "is-invalid" : ""
            }`}
            value={form.jawaban}
            onChange={(event) =>
              setForm({ ...form, jawaban: event.target.value })
            }
            onBlur={() => setTouched((prev) => ({ ...prev, jawaban: true }))}
            placeholder="Masukkan jawaban FAQ"
            rows={4}
          />
          {touched.jawaban && !form.jawaban.trim() && (
            <div className="invalid-feedback">Jawaban harus diisi.</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Slug</label>
          <input
            className={`form-control ${
              touched.slug && !form.slug.trim() ? "is-invalid" : ""
            }`}
            value={form.slug}
            onChange={(event) => setForm({ ...form, slug: event.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, slug: true }))}
            placeholder="Masukkan slug FAQ"
          />
          {touched.slug && !form.slug.trim() && (
            <div className="invalid-feedback">Slug harus diisi.</div>
          )}
          <small className="text-muted">
            Gunakan huruf kecil dan tanda hubung.
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Referensi dari Pesan Masuk</label>

          {editingFaq ? (
            <p className="text-muted small mb-0">
              Referensi FAQ tidak diubah saat edit.
            </p>
          ) : pesanReferensi.length === 0 ? (
            <p className="text-muted small mb-0">
              Belum ada pesan yang ditandai sebagai referensi FAQ.
            </p>
          ) : (
            <div className="border rounded p-3">
              {pesanReferensi.map((pesan) => (
                <div className="form-check mb-2" key={pesan.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`referensi-${pesan.id}`}
                    checked={form.messageIds.includes(pesan.id)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        messageIds: prev.messageIds.includes(pesan.id)
                          ? prev.messageIds.filter((id) => id !== pesan.id)
                          : [...prev.messageIds, pesan.id],
                      }))
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`referensi-${pesan.id}`}
                  >
                    <strong>{pesan.subjek}</strong>
                    <small className="d-block text-muted">{pesan.email}</small>
                    <span className="d-block">{pesan.pesan}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-success"
          onClick={() => void simpanFaq()}
          disabled={
            loading ||
            !form.pertanyaan.trim() ||
            !form.jawaban.trim() ||
            !form.slug.trim()
          }
        >
          <i className="bx bx-save me-1" />
          {loading ? "Menyimpan..." : editingFaq ? "Simpan Perubahan" : "Simpan FAQ"}
        </button>

        {editingFaq && (
          <button
            type="button"
            className="btn btn-batal-edit rounded-pill ms-2"
            onClick={batalEdit}
            disabled={loading}
          >
            Batal Edit
          </button>
        )}
      </div>

      <div className="box-tabel border rounded bg-white p-4">
        <h5>Daftar FAQ</h5>

        {loading ? (
          <p className="text-muted">Memuat data FAQ...</p>
        ) : faqList.length === 0 ? (
          <p className="text-muted">Belum ada FAQ.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th>Urut</th>
                  <th>Pertanyaan</th>
                  <th>Slug</th>
                  <th>Urutan</th>
                  <th>Referensi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {faqList.map((item) => (
                  <tr
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggedFaqId(item.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => pindahkanFaq(item.id)}
                    onDragEnd={() => setDraggedFaqId(null)}
                    style={{
                      cursor: "grab",
                      opacity: draggedFaqId === item.id ? 0.4 : 1,
                    }}
                  >
                    <td><i className="bx bx-menu fs-4 text-muted" /></td>
                    <td>{item.pertanyaan}</td>
                    <td>{item.slug}</td>
                    <td>{item.urutan}</td>
                    <td>
                      {item.messages?.length ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-pill"
                          onClick={() => setFaqReferenceOpen(item)}
                        >
                          Lihat ({item.messages.length})
                        </button>
                      ) : (
                        <span className="text-muted small">Tidak ada referensi</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.isActive ? "bg-success" : "bg-secondary"}`}>
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-warning"
                          onClick={() => mulaiEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${item.isActive ? "btn-secondary" : "btn-success"}`}
                          onClick={() => void ubahStatus(item)}
                          disabled={loading}
                        >
                          {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setFaqToDelete(item)}
                          disabled={loading}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {faqToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hapus FAQ</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setFaqToDelete(null)}
                />
              </div>
              <div className="modal-body">
                Yakin ingin menghapus FAQ <strong>{faqToDelete.pertanyaan}</strong>?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFaqToDelete(null)}
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => void hapusFaq(faqToDelete)}
                  disabled={loading}
                >
                  {loading ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {faqReferenceOpen && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Referensi Pesan FAQ</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setFaqReferenceOpen(null)}
                />
              </div>
              <div className="modal-body">
                <h6>{faqReferenceOpen.pertanyaan}</h6>
                <hr />
                {faqReferenceOpen.messages.map((pesan) => (
                  <div key={pesan.id} className="border rounded p-3 mb-3">
                    <strong>{pesan.subjek}</strong>
                    <p className="text-muted small mb-2">{pesan.email}</p>
                    <p className="mb-2">{pesan.pesan}</p>
                    <span className="badge bg-success">{pesan.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}