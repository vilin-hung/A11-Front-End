import type { RefObject } from "react";
import { KATEGORI } from "../AdminTabel";

export type FormKulinerBaru = {
  nama: string;
  kategori: string;
  daerah: string;
  deskripsi: string;
  bahan: string;
  rasa: string;
  hargaMin: string;
  hargaMax: string;
};

type Props = {
  open: boolean;
  form: FormKulinerBaru;
  foto: string;
  loading: boolean;
  error: string;
  hargaError: string;
  daerahTersedia: string[];
  inputFotoRef: RefObject<HTMLInputElement | null>;
  onChange: (field: keyof FormKulinerBaru, value: string) => void;
  onClearHargaError: () => void;
  onChoosePhoto: (file?: File) => void;
  onRemovePhoto: () => void;
  onClose: () => void;
  onSave: () => void;
};

export default function TambahKulinerModal({
  open,
  form,
  foto,
  loading,
  error,
  hargaError,
  daerahTersedia,
  inputFotoRef,
  onChange,
  onClearHargaError,
  onChoosePhoto,
  onRemovePhoto,
  onClose,
  onSave,
}: Props) {
  return (
    <>
      {open && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", overflowY: "auto" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bx bx-plus-circle me-2" />
                  Tambah Kuliner Baru
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  disabled={loading}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="admin-kuliner-nama" className="form-label fw-semibold">
                    Nama Kuliner <span className="text-danger">*</span>
                  </label>
                  <input
                    id="admin-kuliner-nama"
                    className="form-control"
                    placeholder="Contoh: Nasi Tutug Oncom"
                    value={form.nama}
                    onChange={(event) => onChange("nama", event.target.value)}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="admin-kuliner-kategori" className="form-label fw-semibold">
                      Kategori <span className="text-danger">*</span>
                    </label>
                    <select
                      id="admin-kuliner-kategori"
                      className="form-select"
                      value={form.kategori}
                      onChange={(event) => onChange("kategori", event.target.value)}
                    >
                      <option value="" disabled>-- Pilih kategori --</option>
                      {KATEGORI.map((item) => (
                        <option key={item.id} value={item.nama}>{item.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="admin-kuliner-daerah" className="form-label fw-semibold">
                      Asal Daerah <span className="text-danger">*</span>
                    </label>
                    <input
                      id="admin-kuliner-daerah"
                      className="form-control"
                      list="daftar-daerah-kuliner"
                      placeholder="Contoh: Kab. Garut"
                      value={form.daerah}
                      onChange={(event) => onChange("daerah", event.target.value)}
                    />
                    <datalist id="daftar-daerah-kuliner">
                      {daerahTersedia.map((daerah) => (
                        <option key={daerah} value={daerah} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="admin-kuliner-deskripsi" className="form-label fw-semibold">
                    Deskripsi <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="admin-kuliner-deskripsi"
                    className="form-control"
                    rows={3}
                    placeholder="Ceritakan keunikan rasa dan cara penyajiannya..."
                    value={form.deskripsi}
                    onChange={(event) => onChange("deskripsi", event.target.value)}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="admin-kuliner-bahan" className="form-label fw-semibold">Bahan</label>
                    <input
                      id="admin-kuliner-bahan"
                      className="form-control"
                      placeholder="Nasi, Oncom, Ikan asin"
                      value={form.bahan}
                      onChange={(event) => onChange("bahan", event.target.value)}
                    />
                    <small className="text-muted">Pisahkan dengan koma.</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="admin-kuliner-rasa" className="form-label fw-semibold">Karakter Rasa</label>
                    <input
                      id="admin-kuliner-rasa"
                      className="form-control"
                      placeholder="Gurih, Pedas"
                      value={form.rasa}
                      onChange={(event) => onChange("rasa", event.target.value)}
                    />
                    <small className="text-muted">Pisahkan dengan koma.</small>
                  </div>
                </div>

                <div className="row">
                  {(["hargaMin", "hargaMax"] as const).map((field) => (
                    <div className="col-md-6 mb-3" key={field}>
                      <label htmlFor={`admin-kuliner-${field}`} className="form-label fw-semibold">
                        {field === "hargaMin" ? "Harga Minimal" : "Harga Maksimal"}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted border-end-0">Rp</span>
                        <input
                          id={`admin-kuliner-${field}`}
                          type="text"
                          inputMode="numeric"
                          className={`form-control border-start-0 ${hargaError ? "is-invalid" : ""}`}
                          placeholder={field === "hargaMin" ? "Contoh: 15.000" : "Contoh: 25.000"}
                          value={form[field]}
                          onChange={(event) => {
                            onChange(field, event.target.value);
                            onClearHargaError();
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {hargaError && (
                  <div className="text-danger small mb-3">
                    <i className="bx bx-error-circle me-1" />
                    {hargaError}
                  </div>
                )}

                <div className="mb-2">
                  <label htmlFor="admin-kuliner-foto" className="form-label fw-semibold">
                    Foto Kuliner <span className="text-danger">*</span>
                  </label>
                  <input
                    id="admin-kuliner-foto"
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    ref={inputFotoRef}
                    onChange={(event) => onChoosePhoto(event.target.files?.[0])}
                  />
                  <small className="text-muted">Format JPG, PNG, atau WEBP (maks. 5MB).</small>

                  {foto && (
                    <div className="mt-3 d-flex align-items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={foto}
                        alt="Preview foto kuliner"
                        className="rounded border"
                        style={{ width: 120, height: 90, objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={onRemovePhoto}
                        disabled={loading}
                      >
                        <i className="bx bx-trash me-1" /> Hapus Foto
                      </button>
                    </div>
                  )}
                </div>

                <small className="text-muted d-block mt-3">
                  Kuliner yang ditambahkan admin langsung berstatus Aktif dan tampil di katalog.
                </small>
              </div>

              <div className="modal-footer">
                {error && <div className="alert alert-danger w-100 mb-2">{error}</div>}
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                  Batal
                </button>
                <button type="button" className="btn btn-success" onClick={onSave} disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Menyimpan...</>
                  ) : (
                    <><i className="bx bx-save me-1" />Simpan Kuliner</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}