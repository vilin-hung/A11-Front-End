
'use client';

import { useState } from 'react';
import Link from 'next/link';
import './admin-dashboard.css';

type TabType = 'ringkasan' | 'kuliner' | 'ulasan';

const kategori = [
  { nama: 'Makanan', id: 'hitung-makanan' },
  { nama: 'Minuman', id: 'hitung-minuman' },
  { nama: 'Jajanan', id: 'hitung-jajanan' },
  { nama: 'Oleh-Oleh Khas', id: 'hitung-oleholeh' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');

  const menu = [
    {
      id: 'ringkasan' as const,
      icon: 'bx-grid-alt',
      label: 'Ringkasan',
    },
    {
      id: 'kuliner' as const,
      icon: 'bx-restaurant',
      label: 'Kelola Kuliner',
    },
    {
      id: 'ulasan' as const,
      icon: 'bx-chat',
      label: 'Kelola Ulasan',
    },
  ];

  return (
    <div className="body-admin">
      {/* Navbar Admin */}
      <header className="header-admin border-bottom py-2 px-4 d-flex justify-content-between align-items-center">
        <Link
          className="logo-brand text-decoration-none"
          href="/admin-dashboard"
        >
          <i className="bx bx-map-pin" />
          JelajahRasa
          <span className="badge bg-primary">Admin Dashboard</span>
        </Link>

        <div className="profil-admin d-flex align-items-center">
          <img
            src="/images/homepage/default-avatar.png"
            width="35"
            height="35"
            alt="Foto Admin"
            className="rounded-circle"
          />
          <span>Admin</span>
          <Link
            href="/login"
            className="btn btn-sm btn-outline-danger"
          >
            <i className="bx bx-log-out" /> Keluar
          </Link>
        </div>
      </header>

      <div className="container-fluid my-4">
        <div className="row">
          {/* Sidebar */}
          <nav className="col-md-3 col-lg-2 mb-4">
            <div className="list-group nav-menu" role="tablist">
              {menu.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`list-group-item list-group-item-action ${
                    activeTab === item.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveTab(item.id)}
                  role="tab"
                  aria-selected={activeTab === item.id}
                >
                  <i className={`bx ${item.icon} me-2`} />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Konten Utama */}
          <main className="col-md-9 col-lg-10 tab-content">
            {activeTab === 'ringkasan' && (
              <section id="tab-ringkasan">
                <h3>Ringkasan Statistik</h3>

                {/* Kartu Statistik */}
                <div className="row g-3">
                  {[
                    {
                      title: 'Total Kuliner',
                      id: 'stat-total-kuliner',
                      description: 'Terdaftar dalam sistem',
                    },
                    {
                      title: 'Perlu Menunggu',
                      id: 'stat-perlu-menunggu',
                      description: 'Perlu ditinjau admin',
                    },
                    {
                      title: 'Total Usulan',
                      id: 'stat-total-usulan',
                      description: 'Total dari pengguna',
                    },
                  ].map((stat) => (
                    <div className="col-md-4 col-xl-3" key={stat.id}>
                      <div className="kartu-stat border rounded bg-white">
                        <span>{stat.title}</span>
                        <h3 id={stat.id}>0</h3>
                        <small>{stat.description}</small>
                      </div>
                    </div>
                  ))}

                  <div className="col-md-4 col-xl-3">
                    <button
                      type="button"
                      className="kartu-stat kartu-tombol border rounded bg-white w-100 text-start"
                      data-bs-toggle="modal"
                      data-bs-target="#modal-peringkat-favorit"
                    >
                      <span className="d-flex justify-content-between align-items-center">
                        Total Favorit
                        <i className="bx bx-chevron-right" />
                      </span>
                      <h3 id="stat-total-favorit">0</h3>
                      <small className="text-danger">
                        <i className="bx bx-trophy me-1" />
                        Top 5 Terfavorit
                      </small>
                    </button>
                  </div>
                </div>

                {/* Statistik Kategori */}
                <div className="box-stat-kategori border rounded bg-white">
                  <h5>Sebaran Data per Kategori</h5>
                  <div className="row text-center g-2" id="wadah-stat-kategori">
                    {kategori.map((item) => (
                      <div className="col-6 col-md-3" key={item.id}>
                        <div className="border rounded bg-light">
                          <small className="text-muted d-block">
                            {item.nama}
                          </small>
                          <h4 id={item.id}>0</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grafik */}
                <div className="box-stat-kategori border rounded bg-white">
                  <h5>Sebaran Kuliner per Daerah</h5>
                  <div style={{ height: 240 }}>
                    <canvas id="chart-daerah" />
                  </div>
                </div>

                {/* Usulan Terbaru */}
                <div className="box-tabel border rounded bg-white">
                  <h5>Pengajuan Rekomendasi Terbaru</h5>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Nama Kuliner</th>
                          <th>Pengirim</th>
                          <th>Tanggal</th>
                          <th>Status</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody id="tabel-usulan-terbaru">
                        <tr className="baris-kosong">
                          <td colSpan={5} className="text-center text-muted">
                            <i className="bx bx-inbox d-block" />
                            <span>
                              Belum ada pengajuan rekomendasi kuliner baru.
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'kuliner' && (
              <section id="tab-kelola-kuliner">
                <h4>Daftar Semua Kuliner</h4>
                <div className="box-tabel border rounded bg-white">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Nama Kuliner</th>
                          <th>Kategori</th>
                          <th>Asal Daerah</th>
                          <th>Status</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody id="tabel-daftar-kuliner">
                        <tr className="baris-kosong">
                          <td colSpan={5} className="text-center text-muted">
                            <i className="bx bx-folder-open d-block" />
                            <span>Belum ada data kuliner.</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'ulasan' && (
              <section id="tab-kelola-ulasan">
                <h4>Ulasan Pengguna</h4>
                <div className="box-tabel border rounded bg-white">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Nama</th>
                          <th>Ulasan</th>
                          <th>Tanggal</th>
                          <th>Status</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody id="tabel-daftar-ulasan">
                        <tr className="baris-kosong">
                          <td colSpan={5} className="text-center text-muted">
                            <i className="bx bx-chat d-block" />
                            <span>Belum ada ulasan dari pengguna.</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Modal Edit Kuliner */}
      <div className="modal fade" id="modal-edit-kuliner" tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bx bx-edit me-1" />
                Perbarui Data Kuliner
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Tutup"
              />
            </div>
            <div className="modal-body">
              <form id="form-edit-kuliner">
                <input type="hidden" id="edit-id" />
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="edit-nama" className="form-label">
                      Nama Kuliner *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-nama"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="edit-kategori" className="form-label">
                      Kategori *
                    </label>
                    <select className="form-select" id="edit-kategori" required>
                      {kategori.map((item) => (
                        <option key={item.id} value={item.nama}>
                          {item.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="edit-daerah" className="form-label">
                      Asal Daerah *
                    </label>
                    <select className="form-select" id="edit-daerah" required>
                      <option value="Kota Tasikmalaya">Kota Tasikmalaya</option>
                      <option value="Kota Bandung">Kota Bandung</option>
                      <option value="Kab. Cirebon">Kab. Cirebon</option>
                      <option value="Kab. Garut">Kab. Garut</option>
                      <option value="Kab. Karawang">Kab. Karawang</option>
                      <option value="Kab. Subang">Kab. Subang</option>
                      <option value="Kab. Sumedang">Kab. Sumedang</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="edit-status" className="form-label">
                      Status Publikasi
                    </label>
                    <select className="form-select" id="edit-status">
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="edit-bahan" className="form-label">
                      Bahan Utama
                    </label>
                    <input className="form-control" id="edit-bahan" />
                  </div>
                  <div className="col-12">
                    <label htmlFor="edit-deskripsi" className="form-label">
                      Deskripsi
                    </label>
                    <textarea
                      className="form-control"
                      id="edit-deskripsi"
                      rows={3}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
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

      {/* Modal Tolak Usulan */}
      <div className="modal fade" id="modal-tolak-usulan" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="bx bx-x-circle me-1" />
                Tolak &amp; Kirim Catatan Revisi
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Tutup"
              />
            </div>
            <div className="modal-body">
              <form id="form-tolak-usulan">
                <input type="hidden" id="tolak-id-usulan" />
                <label htmlFor="tolak-alasan" className="form-label">
                  Alasan Penolakan / Catatan Revisi *
                </label>
                <textarea
                  className="form-control"
                  id="tolak-alasan"
                  rows={4}
                  placeholder="Contoh: Foto kurang jelas, silakan ganti dengan foto yang lebih terang."
                  required
                />
                <div className="form-text">
                  Catatan ini akan dikirimkan kepada pengirim agar mereka dapat
                  melakukan perbaikan.
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
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

      {/* Modal Top 5 Favorit */}
      <div className="modal fade" id="modal-peringkat-favorit" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bx bx-trophy text-warning me-2" />
                Top 5 Kuliner Terfavorit
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Tutup"
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
                    <tr className="baris-kosong">
                      <td colSpan={4} className="text-center text-muted">
                        <i className="bx bx-heart d-block" />
                        <span>Belum ada data favorit dari pengguna.</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                data-bs-dismiss="modal"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Preview Gambar */}
      <div className="modal fade" id="modal-lihat-gambar" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 rounded-4">
            <div className="modal-header border-0">
              <h5 className="modal-title" id="judul-gambar" />
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Tutup"
              />
            </div>
            <div className="modal-body text-center pt-0">
              <img
                id="gambar-ukuran-penuh"
                src=""
                alt="Foto Kuliner"
                className="img-fluid rounded-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
