'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import './admin-dashboard.css';
import { DATA_KULINER } from '../data/kuliner';
import {
  BarisKosong,
  BarisKuliner,
  BarisUlasan,
  BarisUsulan,
  KATEGORI,
  type ItemAdmin,
  type StatusKuliner,
  type StatusUlasan,
  type Ulasan,
} from '../components/AdminTabel';
import {
  ModalEditKuliner,
  ModalGambar,
  ModalPeringkat,
  ModalTolakUsulan,
} from '../components/AdminModal';

/* =========================
   KEY LOCAL STORAGE
   ========================= */
const CURRENT_USER_KEY = 'jelajahRasaCurrentUser';
const USULAN_KEY = 'jelajahRasaUsulan';
const ULASAN_KEY = 'jelajahRasaUlasan';
const FAVORIT_KEY = 'jelajahRasaFavorites';
const KULINER_KEY = 'jelajahRasaKuliner';

const CHART_URL =
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

type TabType = 'ringkasan' | 'kuliner' | 'ulasan';

type User = {
  name: string;
  email: string;
  city: string;
  avatar?: string;
};

/* =========================
   DATA BAWAAN
   ========================= */
const LABEL_KATEGORI = {
  makanan: 'Makanan',
  jajanan: 'Jajanan',
  minuman: 'Minuman',
  'oleh-oleh': 'Oleh-Oleh Khas',
};

/* Kuliner bawaan disamakan bentuknya dengan usulan pengguna
   supaya satu tabel bisa menampung keduanya. */
const KULINER_AWAL: ItemAdmin[] = DATA_KULINER.map((item) => ({
  id: item.id,
  nama: item.nama,
  kategori: LABEL_KATEGORI[item.kategori],
  daerah: item.asal,
  status: 'Aktif',
  bahan: item.bahan,
  deskripsi: item.deskripsi,
  img: item.gambar,
  sumber: 'bawaan',
}));

/* =========================
   BANTUAN STORAGE
   ========================= */
function bacaJson(key: string, fallback: unknown) {
  try {
    const tersimpan = localStorage.getItem(key);
    if (!tersimpan) return fallback;
    return JSON.parse(tersimpan);
  } catch {
    return fallback;
  }
}

function simpanJson(key: string, nilai: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(nilai));
  } catch {
    /* abaikan kalau storage penuh */
  }
}

/* Usulan dari localStorage belum tentu lengkap (data lama),
   jadi diberi nilai default dulu. */
function rapikanUsulan(data: unknown): ItemAdmin[] {
  if (!Array.isArray(data)) return [];

  return data.map((item, indeks) => ({
    id: String(item.id ?? `usulan-${indeks}`),
    nama: item.nama || '(tanpa nama)',
    kategori: item.kategori || 'Makanan',
    daerah: item.daerah || '-',
    status: item.status || 'Menunggu',
    bahan: item.bahan ?? '',
    deskripsi: item.deskripsi ?? '',
    img: item.img ?? '',
    pengirim: item.pengirim || 'Pengunjung',
    tanggal: item.tanggal || '',
    catatan: item.catatan,
    rasa: item.rasa ?? '',
    harga: item.harga ?? '',
    sumber: 'usulan',
  }));
}

/* =========================
   HALAMAN
   ========================= */
export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');
  const [siap, setSiap] = useState(false);
  const [admin, setAdmin] = useState<User | null>(null);

  const [kuliner, setKuliner] = useState<ItemAdmin[]>(KULINER_AWAL);
  const [usulan, setUsulan] = useState<ItemAdmin[]>([]);
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [favorit, setFavorit] = useState<string[]>([]);

  const [chartSiap, setChartSiap] = useState(false);

  /* Modal */
  const [editForm, setEditForm] = useState<ItemAdmin | null>(null);
  const [tolakItem, setTolakItem] = useState<ItemAdmin | null>(null);
  const [gambarBesar, setGambarBesar] = useState<ItemAdmin | null>(null);
  const [peringkatTerbuka, setPeringkatTerbuka] = useState(false);

  const menu = [
    { id: 'ringkasan', icon: 'bx-grid-alt', label: 'Ringkasan' },
    { id: 'kuliner', icon: 'bx-restaurant', label: 'Kelola Kuliner' },
    { id: 'ulasan', icon: 'bx-chat', label: 'Kelola Ulasan' },
  ] as { id: TabType; icon: string; label: string }[];

  const daftar = [...kuliner, ...usulan];

  /* Ambil data saat halaman dibuka */
  useEffect(() => {
    const aktif = bacaJson(CURRENT_USER_KEY, null);

    if (!aktif) {
      router.replace('/login');
      return;
    }

    /* localStorage baru bisa dibaca setelah komponen terpasang di browser */
    /* eslint-disable react-hooks/set-state-in-effect -- baca data awal dari localStorage */
    setAdmin(aktif);
    setKuliner(bacaJson(KULINER_KEY, null) ?? KULINER_AWAL);
    setUsulan(rapikanUsulan(bacaJson(USULAN_KEY, [])));
    setUlasan(bacaJson(ULASAN_KEY, []));
    setFavorit(bacaJson(FAVORIT_KEY, []));
    setSiap(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [router]);

  /* Gambar grafik sebaran daerah (Chart.js dari CDN) */
  useEffect(() => {
    if (!chartSiap || activeTab !== 'ringkasan') return;

    const canvas = document.getElementById('chart-daerah');
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Chart.js dari CDN */
    const Chart = (window as any).Chart;

    /* lewati kalau canvas atau library belum siap */
    if (!canvas || !Chart) return;

    const hitungDaerah: { [daerah: string]: number } = {};

    [...kuliner, ...usulan].forEach((item) => {
      /* cuma hitung yang statusnya Aktif */
      if (item.status !== 'Aktif') return;

      const daerah = item.daerah.replace(/^Kabupaten /, 'Kab. ');
      hitungDaerah[daerah] = (hitungDaerah[daerah] ?? 0) + 1;
    });

    const urut = Object.keys(hitungDaerah).sort(
      (a, b) => hitungDaerah[b] - hitungDaerah[a]
    );

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: urut,
        datasets: [
          {
            label: 'Jumlah Kuliner',
            data: urut.map((daerah) => hitungDaerah[daerah]),
            backgroundColor: '#8CA978',
            borderRadius: 4,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 0 } },
          y: { beginAtZero: true, ticks: { precision: 0 } },
        },
      },
    });

    return () => chart.destroy();
  }, [chartSiap, activeTab, kuliner, usulan]);

  /* =========================
     AKSI DATA
     ========================= */

  /* sumber ikut tersimpan, tapi saat dibaca selalu diisi 'usulan' lagi */
  const simpanUsulan = (daftarBaru: ItemAdmin[]) => {
    setUsulan(daftarBaru);
    simpanJson(USULAN_KEY, daftarBaru);
  };

  /* Kuliner bawaan yang sudah diedit/dihapus admin disimpan terpisah,
     supaya perubahannya tidak hilang saat halaman di-refresh. */
  const simpanKuliner = (daftarBaru: ItemAdmin[]) => {
    setKuliner(daftarBaru);
    simpanJson(KULINER_KEY, daftarBaru);
  };

  const terimaUsulan = (id: string) => {
    simpanUsulan(
      usulan.map((item) =>
        item.id === id ? { ...item, status: 'Aktif' as StatusKuliner } : item
      )
    );
  };

  const kirimTolak = (catatan: string) => {
    if (!tolakItem) return;

    simpanUsulan(
      usulan.map((item) =>
        item.id === tolakItem.id
          ? { ...item, status: 'Nonaktif' as StatusKuliner, catatan }
          : item
      )
    );

    setTolakItem(null);
  };

  const hapusItem = (item: ItemAdmin) => {
    if (!confirm(`Hapus "${item.nama}" dari daftar kuliner?`)) return;

    if (item.sumber === 'usulan') {
      simpanUsulan(usulan.filter((baris) => baris.id !== item.id));
      return;
    }

    simpanKuliner(kuliner.filter((baris) => baris.id !== item.id));
  };

  const simpanEdit = (itemBaru: ItemAdmin) => {
    if (itemBaru.sumber === 'usulan') {
      simpanUsulan(
        usulan.map((item) => (item.id === itemBaru.id ? itemBaru : item))
      );
    } else {
      simpanKuliner(
        kuliner.map((item) => (item.id === itemBaru.id ? itemBaru : item))
      );
    }

    setEditForm(null);
  };

  const toggleUlasan = (id: number) => {
    const terbaru = ulasan.map((item) =>
      item.id === id
        ? {
            ...item,
            status: (item.status === 'Tampil'
              ? 'Sembunyi'
              : 'Tampil') as StatusUlasan,
          }
        : item
    );

    setUlasan(terbaru);
    simpanJson(ULASAN_KEY, terbaru);
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    router.push('/login');
  };

  /* =========================
     HITUNGAN
     ========================= */
  const jumlahPerKategori = (nama: string) =>
    daftar.filter((item) => item.kategori === nama).length;

  const jumlahMenunggu = usulan.filter(
    (item) => item.status === 'Menunggu'
  ).length;

  const usulanTerbaru = usulan
    .slice()
    .sort((a, b) => {
      const urutTanggal = (b.tanggal ?? '').localeCompare(a.tanggal ?? '');
      if (urutTanggal !== 0) return urutTanggal;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    })
    .slice(0, 5);

  const ulasanTerurut = ulasan
    .slice()
    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

  const peringkat = daftar
    .map((item) => ({
      nama: item.nama,
      kategori: item.kategori,
      jumlah: favorit.filter((id) => String(id) === item.id).length,
    }))
    .filter((baris) => baris.jumlah > 0)
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5);

  if (!siap || !admin) {
    return (
      <div className="body-admin">
        <div className="container my-5">
          <p className="text-center text-muted py-5">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="body-admin">
      <Script
        src={CHART_URL}
        strategy="afterInteractive"
        onReady={() => setChartSiap(true)}
      />

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={admin.avatar || '/images/homepage/default-avatar.png'}
            width="35"
            height="35"
            alt="Foto Admin"
            className="rounded-circle"
          />
          <span>{admin.name || 'Admin'}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={logout}
          >
            <i className="bx bx-log-out" /> Keluar
          </button>
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
                  <div className="col-md-4 col-xl-3">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Total Kuliner</span>
                      <h3 id="stat-total-kuliner">{daftar.length}</h3>
                      <small>Terdaftar dalam sistem</small>
                    </div>
                  </div>

                  <div className="col-md-4 col-xl-3">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Perlu Menunggu</span>
                      <h3 id="stat-perlu-menunggu">{jumlahMenunggu}</h3>
                      <small>Perlu ditinjau admin</small>
                    </div>
                  </div>

                  <div className="col-md-4 col-xl-3">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Total Usulan</span>
                      <h3 id="stat-total-usulan">{usulan.length}</h3>
                      <small>Total dari pengguna</small>
                    </div>
                  </div>

                  <div className="col-md-4 col-xl-3">
                    <button
                      type="button"
                      className="kartu-stat kartu-tombol border rounded bg-white w-100 text-start"
                      onClick={() => setPeringkatTerbuka(true)}
                    >
                      <span className="d-flex justify-content-between align-items-center">
                        Total Favorit
                        <i className="bx bx-chevron-right" />
                      </span>
                      <h3 id="stat-total-favorit">{favorit.length}</h3>
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
                    {KATEGORI.map((item) => (
                      <div className="col-6 col-md-3" key={item.id}>
                        <div className="border rounded bg-light">
                          <small className="text-muted d-block">
                            {item.nama}
                          </small>
                          <h4 id={item.id}>
                            {jumlahPerKategori(item.nama)}
                          </h4>
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
                        {usulanTerbaru.length === 0 ? (
                          <BarisKosong
                            kolom={5}
                            ikon="bx-inbox"
                            pesan="Belum ada pengajuan rekomendasi kuliner baru."
                          />
                        ) : (
                          usulanTerbaru.map((item) => (
                            <BarisUsulan
                              key={item.id}
                              item={item}
                              onTerima={() => terimaUsulan(item.id)}
                              onTolak={() => setTolakItem(item)}
                              onFoto={() => setGambarBesar(item)}
                            />
                          ))
                        )}
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
                        {daftar.length === 0 ? (
                          <BarisKosong
                            kolom={5}
                            ikon="bx-folder-open"
                            pesan="Belum ada data kuliner."
                          />
                        ) : (
                          daftar.map((item) => (
                            <BarisKuliner
                              key={item.id}
                              item={item}
                              onEdit={() => setEditForm(item)}
                              onHapus={() => hapusItem(item)}
                              onFoto={() => setGambarBesar(item)}
                            />
                          ))
                        )}
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
                        {ulasanTerurut.length === 0 ? (
                          <BarisKosong
                            kolom={5}
                            ikon="bx-chat"
                            pesan="Belum ada ulasan dari pengguna."
                          />
                        ) : (
                          ulasanTerurut.map((item) => (
                            <BarisUlasan
                              key={item.id}
                              item={item}
                              onToggle={() => toggleUlasan(item.id)}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {editForm && (
        <ModalEditKuliner
          item={editForm}
          onBatal={() => setEditForm(null)}
          onSimpan={simpanEdit}
        />
      )}

      {tolakItem && (
        <ModalTolakUsulan
          nama={tolakItem.nama}
          onBatal={() => setTolakItem(null)}
          onKirim={kirimTolak}
        />
      )}

      {peringkatTerbuka && (
        <ModalPeringkat
          baris={peringkat}
          onTutup={() => setPeringkatTerbuka(false)}
        />
      )}

      {gambarBesar && (
        <ModalGambar item={gambarBesar} onTutup={() => setGambarBesar(null)} />
      )}
    </div>
  );
}
