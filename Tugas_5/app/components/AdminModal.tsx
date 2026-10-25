'use client';

import { useState } from 'react';
import {
  DAFTAR_DAERAH,
  KATEGORI,
  type ItemAdmin,
  type StatusKuliner,
} from './AdminTabel';

/* =========================
   MODAL EDIT KULINER
   ========================= */
export function ModalEditKuliner({
  item,
  onBatal,
  onSimpan,
}: {
  item: ItemAdmin;
  onBatal: () => void;
  onSimpan: (itemBaru: ItemAdmin) => void;
}) {
  const [form, setForm] = useState<ItemAdmin>(item);

  const ubah = (nama: string, nilai: string) => {
    setForm({ ...form, [nama]: nilai } as ItemAdmin);
  };

  const pilihanDaerah = [...new Set([...DAFTAR_DAERAH, item.daerah])];

  return (
    <div
      className="modal fade show d-block"
      id="modal-edit-kuliner"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onBatal}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bx bx-edit me-1" />
              Perbarui Data Kuliner
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Tutup"
              onClick={onBatal}
            />
          </div>

          <div className="modal-body">
            <form
              id="form-edit-kuliner"
              onSubmit={(event) => {
                event.preventDefault();
                onSimpan(form);
              }}
            >
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="edit-nama" className="form-label">
                    Nama Kuliner *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="edit-nama"
                    value={form.nama}
                    onChange={(event) => ubah('nama', event.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="edit-kategori" className="form-label">
                    Kategori *
                  </label>
                  <select
                    className="form-select"
                    id="edit-kategori"
                    value={form.kategori}
                    onChange={(event) => ubah('kategori', event.target.value)}
                    required
                  >
                    {KATEGORI.map((k) => (
                      <option key={k.id} value={k.nama}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="edit-daerah" className="form-label">
                    Asal Daerah *
                  </label>
                  <select
                    className="form-select"
                    id="edit-daerah"
                    value={form.daerah}
                    onChange={(event) => ubah('daerah', event.target.value)}
                    required
                  >
                    {pilihanDaerah.map((daerah) => (
                      <option key={daerah} value={daerah}>
                        {daerah}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="edit-status" className="form-label">
                    Status Publikasi
                  </label>
                  <select
                    className="form-select"
                    id="edit-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as StatusKuliner,
                      })
                    }
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="col-12">
                  <label htmlFor="edit-bahan" className="form-label">
                    Bahan Utama
                  </label>
                  <input
                    className="form-control"
                    id="edit-bahan"
                    value={form.bahan}
                    onChange={(event) => ubah('bahan', event.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="edit-deskripsi" className="form-label">
                    Deskripsi
                  </label>
                  <textarea
                    className="form-control"
                    id="edit-deskripsi"
                    rows={3}
                    value={form.deskripsi}
                    onChange={(event) => ubah('deskripsi', event.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onBatal}>
              Batal
            </button>
            <button
              type="submit"
              form="form-edit-kuliner"
              className="btn btn-warning text-white"
            >
              Perbarui Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MODAL TOLAK USULAN
   ========================= */
export function ModalTolakUsulan({
  nama,
  onBatal,
  onKirim,
}: {
  nama: string;
  onBatal: () => void;
  onKirim: (catatan: string) => void;
}) {
  const [catatan, setCatatan] = useState('');

  return (
    <div
      className="modal fade show d-block"
      id="modal-tolak-usulan"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onBatal}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <i className="bx bx-x-circle me-1" />
              Tolak &amp; Kirim Catatan Revisi
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Tutup"
              onClick={onBatal}
            />
          </div>

          <div className="modal-body">
            <form
              id="form-tolak-usulan"
              onSubmit={(event) => {
                event.preventDefault();
                if (catatan.trim()) onKirim(catatan.trim());
              }}
            >
              <label htmlFor="tolak-alasan" className="form-label">
                Alasan Penolakan / Catatan Revisi *
              </label>
              <textarea
                className="form-control"
                id="tolak-alasan"
                rows={4}
                placeholder="Contoh: Foto kurang jelas, silakan ganti dengan foto yang lebih terang."
                value={catatan}
                onChange={(event) => setCatatan(event.target.value)}
                required
              />
              <div className="form-text">
                Catatan ini akan dikirimkan kepada pengirim ({nama}) agar mereka
                dapat melakukan perbaikan.
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onBatal}>
              Batal
            </button>
            <button
              type="submit"
              form="form-tolak-usulan"
              className="btn btn-danger"
            >
              Kirim Catatan Penolakan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MODAL TOP 5 FAVORIT
   ========================= */
export function ModalPeringkat({
  baris,
  onTutup,
}: {
  baris: { nama: string; kategori: string; jumlah: number }[];
  onTutup: () => void;
}) {
  return (
    <div
      className="modal fade show d-block"
      id="modal-peringkat-favorit"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onTutup}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bx bx-trophy text-warning me-2" />
              Top 5 Kuliner Terfavorit
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Tutup"
              onClick={onTutup}
            />
          </div>

          <div className="modal-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>No</th>
                    <th>Nama Kuliner</th>
                    <th>Kategori</th>
                    <th className="text-end">Jumlah Favorit</th>
                  </tr>
                </thead>
                <tbody id="tabel-peringkat-favorit">
                  {baris.length === 0 ? (
                    <tr className="baris-kosong">
                      <td colSpan={4} className="text-center text-muted">
                        <i className="bx bx-heart d-block" />
                        <span>Belum ada data favorit dari pengguna.</span>
                      </td>
                    </tr>
                  ) : (
                    baris.map((item, indeks) => (
                      <tr key={item.nama}>
                        <td>{indeks + 1}</td>
                        <td>{item.nama}</td>
                        <td>{item.kategori}</td>
                        <td className="text-end">{item.jumlah}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onTutup}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MODAL PREVIEW GAMBAR
   ========================= */
export function ModalGambar({
  item,
  onTutup,
}: {
  item: ItemAdmin;
  onTutup: () => void;
}) {
  return (
    <div
      className="modal fade show d-block"
      id="modal-lihat-gambar"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onTutup}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4">
          <div className="modal-header border-0">
            <h5 className="modal-title" id="judul-gambar">
              {item.nama}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Tutup"
              onClick={onTutup}
            />
          </div>

          <div className="modal-body text-center pt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              id="gambar-ukuran-penuh"
              src={item.img}
              alt={`Foto ${item.nama}`}
              className="img-fluid rounded-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
