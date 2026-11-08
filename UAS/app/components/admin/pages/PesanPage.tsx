import { BarisKosong } from "../AdminTabel";

type ContactMessage = {
  id: string;
  email: string;
  subjek: string;
  pesan: string;
  status: string;
  isFaqReference: boolean;
  faqId: string | null;
  createdAt: string;
  faq: { id: string; pertanyaan: string } | null;
};

type Props = {
  messages: ContactMessage[];
  selectedIds: string[];
  loading: boolean;
  error: string;
  info: string;
  onConvertToFaq: () => void;
  onToggleSelected: (id: string) => void;
  onChangeStatus: (id: string, status: string) => void;
};

export default function PesanPage({
  messages,
  selectedIds,
  loading,
  error,
  info,
  onConvertToFaq,
  onToggleSelected,
  onChangeStatus,
}: Props) {
  return (
    <section id="tab-pesan">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4>Pesan Masuk</h4>
          <p className="text-muted mb-0">
            Daftar pesan dan pertanyaan dari pengunjung website.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success"
          onClick={onConvertToFaq}
          disabled={selectedIds.length === 0 || loading}
        >
          <i className="bx bx-bookmark-plus me-1" />
          Jadikan Referensi FAQ ({selectedIds.length})
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      <div className="box-tabel border rounded bg-white">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Pilih</th>
                <th>Email</th>
                <th>Subjek</th>
                <th>Pesan</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>FAQ Terkait</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <BarisKosong kolom={7} ikon="bx-loader-circle" pesan="Memuat pesan masuk..." />
              ) : messages.length === 0 ? (
                <BarisKosong kolom={7} ikon="bx-envelope" pesan="Belum ada pesan masuk." />
              ) : (
                messages.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.includes(item.id)}
                        disabled={
                          item.status !== "DIPROSES" ||
                          Boolean(item.faqId) ||
                          item.isFaqReference
                        }
                        onChange={() => onToggleSelected(item.id)}
                      />
                    </td>
                    <td>{item.email}</td>
                    <td>{item.subjek}</td>
                    <td style={{ minWidth: 220, maxWidth: 350 }}>
                      <div style={{ whiteSpace: "pre-wrap" }}>{item.pesan}</div>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString("id-ID")}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={item.status}
                        onChange={(event) =>
                          onChangeStatus(item.id, event.target.value)
                        }
                      >
                        <option value="BARU">Baru</option>
                        <option value="DIPROSES">Diproses</option>
                        <option value="SELESAI">Selesai</option>
                      </select>
                    </td>
                    <td>
                      {item.faq ? (
                        <span className="badge bg-success">Referensi FAQ</span>
                      ) : (
                        <span className="text-muted">Belum digunakan</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}