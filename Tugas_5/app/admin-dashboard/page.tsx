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
const USULAN_KEY = 'jelajahRasaUsulan';
const ULASAN_KEY = 'jelajahRasaUlasan';
const FAVORIT_KEY = 'jelajahRasaFavorites';
const KULINER_KEY = 'jelajahRasaKuliner';

const CHART_URL =
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

type TabType = 
  | 'ringkasan'
  | 'kuliner'
  | 'ulasan'
  | "pengguna"
  | 'peta'
  | 'metadata';

type User = {
  id: string;
  nama: string;
  email: string;
  kota: string | null;
  avatar: string | null;
  role: string;
};

type MapRegion = {
  id: string;
  nama: string;
  daerah: string;
  deskripsi: string;
  posisiX: number;
  posisiY: number;
  isActive: boolean;
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

type SiteMetadata = {
  key: string;
  value: string;
};

const METADATA_AWAL: SiteMetadata[] = [
  { key: "site_name", value: "JelajahRasa" },
  {
    key: "site_description",
    value: "Jelajahi kuliner khas Jawa Barat",
  },
  { key: "site_email", value: "halo@jelajahrasajabar.id" },
  { key: "site_phone", value: "" },
  { key: "site_address", value: "Jawa Barat, Indonesia" },
  { key: "footer_text", value: "© 2026 JelajahRasa" },
];

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
  const [users, setUsers] = useState<User[]>([]);

  const [chartSiap, setChartSiap] = useState(false);

  // state untuk kelola peta
  const [regions, setRegions] = useState<MapRegion[]>([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [regionMessage, setRegionMessage] = useState("");
  const [editingRegion, setEditingRegion] = useState<MapRegion | null>(null);
  const [regionFormOpen, setRegionFormOpen] = useState(false);
  const [regionForm, setRegionForm] = useState({
    nama: "",
    daerah: "",
    deskripsi: "",
    posisiX: 50,
    posisiY: 50,
    isActive: true,
  });
  
  /* Modal */
  const [editForm, setEditForm] = useState<ItemAdmin | null>(null);
  const [tolakItem, setTolakItem] = useState<ItemAdmin | null>(null);
  const [gambarBesar, setGambarBesar] = useState<ItemAdmin | null>(null);
  const [peringkatTerbuka, setPeringkatTerbuka] = useState(false);

  const menu: {
    id: TabType;
    icon: string;
    label: string;
  } [] = [
    { id: "ringkasan", icon: "bx-grid-alt", label: "Ringkasan" },
    { id: "kuliner", icon: "bx-restaurant", label: "Kelola Kuliner" },
    { id: "ulasan", icon: "bx-chat", label: "Kelola Ulasan" },
    { id: "pengguna", icon: "bx-user", label: "Kelola Pengguna" },
    { id: "peta", icon: "bx-map", label: "Kelola Peta" },
    { id: "metadata", icon: "bx-cog", label: "Metadata Website" },
  ];

  // state untuk metadata website
  const [metadata, setMetadata] =
    useState<SiteMetadata[]>(METADATA_AWAL);

  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataSaving, setMetadataSaving] = useState(false);
  const [metadataError, setMetadataError] = useState("");
  const [metadataMessage, setMetadataMessage] = useState("");

  const daftar = [...kuliner, ...usulan];

  /* Ambil data saat halaman dibuka */
  useEffect(() => {
    let masihAktif = true;

    async function periksaAksesAdmin() {
      try {
        // Memeriksa session pengguna melalui API
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
        });

        const data = (await response.json().catch(() => ({}))) as {
          user?: User | null;
        };

        // Menghentikan proses jika komponen sudah tidak aktif
        if (!masihAktif) return;

        // Mengarahkan pengguna yang belum login ke halaman login
        if (!response.ok || !data.user) {
          router.replace('/login');
          return;
        }

        // Memastikan hanya admin yang dapat membuka dashboard
        if (data.user.role !== 'ADMIN') {
          router.replace('/');
          return;
        }

        /* localStorage baru bisa dibaca setelah komponen terpasang di browser */
        setAdmin(data.user);
        setKuliner(bacaJson(KULINER_KEY, null) ?? KULINER_AWAL);
        setUsulan(rapikanUsulan(bacaJson(USULAN_KEY, [])));
        setUlasan(bacaJson(ULASAN_KEY, []));
        setFavorit(bacaJson(FAVORIT_KEY, []));
        
        const userResponse = await fetch('/api/admin/users', {
          cache: 'no-store',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsers(userData.users || []);
        }

        setSiap(true);
      } catch (error) {
        // Menangani kegagalan saat memeriksa session admin
        console.error('Gagal memeriksa session admin:', error);

        if (masihAktif) {
          router.replace('/login');
        }
      }
    }

    void periksaAksesAdmin();

    return () => {
      masihAktif = false;
    };
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

  /* Logout */
  const logout = async () => {
    try {
      // Mengakhiri session pada server
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Gagal mengakhiri session admin.');
        return;
      }

      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('Gagal menghubungi API logout:', error);
    }
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

  // peta rasa
  const bukaFormRegion = (region?: MapRegion) => {
    if (region) {
      setEditingRegion(region);

      setRegionForm({
        nama: region.nama,
        daerah: region.daerah,
        deskripsi: region.deskripsi,
        posisiX: region.posisiX,
        posisiY: region.posisiY,
        isActive: region.isActive,
      });
    } else {
      setEditingRegion(null);

      setRegionForm({
        nama: "",
        daerah: "",
        deskripsi: "",
        posisiX: 50,
        posisiY: 50,
        isActive: true,
      });
    }

    setRegionMessage("");
    setRegionError("");
    setRegionFormOpen(true);
  };

  const simpanRegion = async () => {
    setRegionLoading(true);
    setRegionError("");
    setRegionMessage("");

    try {
      const response = await fetch("/api/map-regions", {
        method: editingRegion ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(editingRegion ? { id: editingRegion.id } : {}),
          ...regionForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan daerah.");
      }

      if (editingRegion) {
        setRegions((sebelumnya) =>
          sebelumnya.map((item) =>
            item.id === editingRegion.id ? data.region : item
          )
        );
      } else {
        setRegions((sebelumnya) => [
          ...sebelumnya,
          data.region,
        ]);
      }

      setRegionMessage(data.message);
      setRegionFormOpen(false);
      setEditingRegion(null);
    } catch (error) {
      setRegionError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan daerah."
      );
    } finally {
      setRegionLoading(false);
    }
  };

  useEffect(() => {
    if (!siap || activeTab !== "peta") return;

    let masihAktif = true;

    async function loadRegions() {
      try {
        const response = await fetch("/api/map-regions", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil data daerah.");
        }

        if (masihAktif) {
          setRegions(data.regions ?? []);
          setRegionError("");
        }
      } catch (error) {
        if (masihAktif) {
          setRegionError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil data daerah."
          );
        }
      } finally {
        if (masihAktif) {
          setRegionLoading(false);
        }
      }
    }

    void loadRegions();

    return () => {
      masihAktif = false;
    };
  }, [siap, activeTab]);

  // Mengubah nilai metadata di state
  const ubahMetadata = (key: string, value: string) => {
    setMetadata((sebelumnya) =>
      sebelumnya.map((item) =>
        item.key === key ? { ...item, value } : item
      )
    );

    setMetadataMessage("");
  };

  // Menyimpan metadata ke database
  const simpanMetadata = async () => {
    setMetadataSaving(true);
    setMetadataError("");
    setMetadataMessage("");

    try {
      const response = await fetch("/api/admin/site-metadata", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan metadata.");
      }

      setMetadata(data.metadata ?? metadata);
      setMetadataMessage(data.message);
    } catch (error) {
      setMetadataError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan metadata."
      );
    } finally {
      setMetadataSaving(false);
    }
  };


  useEffect(() => {
    if (!siap || activeTab !== "metadata") return;

    let masihAktif = true;

    async function loadMetadata() {
      try {
        const response = await fetch("/api/admin/site-metadata", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil metadata.");
        }

        const metadataDatabase: SiteMetadata[] = data.metadata ?? [];

        const metadataLengkap = METADATA_AWAL.map((item) => {
          const ditemukan = metadataDatabase.find(
            (data) => data.key === item.key
          );

          return ditemukan ?? item;
        });

        if (masihAktif) {
          setMetadata(metadataLengkap);
        }
      } catch (error) {
        if (masihAktif) {
          setMetadataError(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil metadata."
          );
        }
      } finally {
        if (masihAktif) {
          setMetadataLoading(false);
        }
      }
    }

    void loadMetadata();

    return () => {
      masihAktif = false;
    };
  }, [siap, activeTab]);


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
          <span>{admin.nama || 'Admin'}</span>
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
                  onClick={() => {
                    if (item.id === "peta") {
                      setRegionLoading(true);
                      setRegionError("");
                      setRegionMessage("");
                    }

                    if (item.id === "metadata") {
                      setMetadataLoading(true);
                      setMetadataError("");
                      setMetadataMessage("");
                    }

                    setActiveTab(item.id);
                  }}
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

            {activeTab === 'pengguna' && (
              <section id="tab-kelola-pengguna">
                <h4>Kelola Pengguna</h4>

                <div className="box-tabel border rounded bg-white">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Nama</th>
                          <th>Email</th>
                          <th>Kota</th>
                          <th>Role</th>
                        </tr>
                      </thead>

                      <tbody>
                        {users.length === 0 ? (
                          <BarisKosong
                            kolom={4}
                            ikon="bx-user"
                            pesan="Belum ada data pengguna."
                          />
                        ) : (
                          users.map((user) => (
                            <tr key={user.id}>
                              <td>{user.nama}</td>
                              <td>{user.email}</td>
                              <td>{user.kota || '-'}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    user.role === 'ADMIN'
                                      ? 'bg-success'
                                      : 'bg-secondary'
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <small className="text-muted d-block mt-3">
                  Role hanya dapat diubah oleh developer melalui database.
                </small>
              </section>
            )}

            {activeTab === "peta" && (
              <section id="tab-kelola-peta">
                <h4>Kelola Peta Rasa</h4>

                <div className="box-tabel border rounded bg-white p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5>Data Daerah</h5>
                      <p className="text-muted mb-0">
                        Kelola nama daerah, posisi pin, dan status tampil.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => bukaFormRegion()}
                    >
                      <i className="bx bx-plus me-1" />
                      Tambah Daerah
                    </button>
                  </div>

                  {regionError && (
                    <div className="alert alert-danger">
                      {regionError}
                    </div>
                  )}

                  {regionMessage && (
                    <div className="alert alert-success">
                      {regionMessage}
                    </div>
                  )}

                  {regionLoading && (
                    <p className="text-muted">Memuat data daerah...</p>
                  )}

                  {!regionLoading && regions.length === 0 && (
                    <div className="text-center text-muted py-4">
                      <i className="bx bx-map fs-1" />
                      <p>Belum ada data daerah di database.</p>
                    </div>
                  )}

                  {!regionLoading && regions.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Nama</th>
                            <th>Daerah</th>
                            <th>Posisi X</th>
                            <th>Posisi Y</th>
                            <th>Status</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>

                        <tbody>
                          {regions.map((region) => (
                            <tr key={region.id}>
                              <td className="fw-semibold">{region.nama}</td>
                              <td>{region.daerah}</td>
                              <td>{region.posisiX}%</td>
                              <td>{region.posisiY}%</td>
                              <td>
                                <span
                                  className={`badge ${
                                    region.isActive
                                      ? "bg-success"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {region.isActive ? "Aktif" : "Nonaktif"}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => bukaFormRegion(region)}
                                >
                                  <i className="bx bx-edit-alt me-1" />
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {regionFormOpen && (
                  <div className="box-tabel border rounded bg-white p-4 mt-4">
                    <h5>
                      {editingRegion ? "Edit Daerah" : "Tambah Daerah"}
                    </h5>

                    <div className="mb-3">
                      <label className="form-label">Nama</label>
                      <input
                        className="form-control"
                        value={regionForm.nama}
                        onChange={(e) =>
                          setRegionForm({
                            ...regionForm,
                            nama: e.target.value,
                          })
                        }
                        placeholder="Contoh: Bandung"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Daerah</label>
                      <input
                        className="form-control"
                        value={regionForm.daerah}
                        onChange={(e) =>
                          setRegionForm({
                            ...regionForm,
                            daerah: e.target.value,
                          })
                        }
                        placeholder="Contoh: Kota Bandung"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Deskripsi</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={regionForm.deskripsi}
                        onChange={(e) =>
                          setRegionForm({
                            ...regionForm,
                            deskripsi: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Posisi X (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={regionForm.posisiX}
                          onChange={(e) =>
                            setRegionForm({
                              ...regionForm,
                              posisiX: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Posisi Y (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={regionForm.posisiY}
                          onChange={(e) =>
                            setRegionForm({
                              ...regionForm,
                              posisiY: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-check mb-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="region-active"
                        checked={regionForm.isActive}
                        onChange={(e) =>
                          setRegionForm({
                            ...regionForm,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="region-active"
                      >
                        Tampilkan daerah pada Peta Rasa
                      </label>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setRegionFormOpen(false);
                          setEditingRegion(null);
                        }}
                        disabled={regionLoading}
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={simpanRegion}
                        disabled={
                          regionLoading ||
                          !regionForm.nama.trim() ||
                          !regionForm.daerah.trim() ||
                          !regionForm.deskripsi.trim() ||
                          regionForm.posisiX < 0 ||
                          regionForm.posisiX > 100 ||
                          regionForm.posisiY < 0 ||
                          regionForm.posisiY > 100
                        }
                      >
                        {regionLoading ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'metadata' && (
              <section id="tab-metadata">
                <h4>Metadata Website</h4>

                <p className="text-muted">
                  Kelola informasi umum yang ditampilkan pada website JelajahRasa.
                </p>

                <div className="box-tabel border rounded bg-white p-4">
                  {metadataLoading ? (
                    <p className="text-muted mb-0">
                      Memuat metadata website...
                    </p>
                  ) : (
                    <>
                      {metadataError && (
                        <div className="alert alert-danger">
                          {metadataError}
                        </div>
                      )}

                      {metadataMessage && (
                        <div className="alert alert-success">
                          {metadataMessage}
                        </div>
                      )}

                      {metadata.map((item) => {
                        const label: Record<string, string> = {
                          site_name: "Nama Website",
                          site_description: "Deskripsi Website",
                          site_email: "Email Kontak",
                          site_phone: "Nomor Telepon",
                          site_address: "Alamat",
                          footer_text: "Teks Footer",
                        };

                        return (
                          <div className="mb-3" key={item.key}>
                            <label
                              htmlFor={`metadata-${item.key}`}
                              className="form-label fw-semibold"
                            >
                              {label[item.key]}
                            </label>

                            {item.key === "site_description" ||
                            item.key === "site_address" ||
                            item.key === "footer_text" ? (
                              <textarea
                                id={`metadata-${item.key}`}
                                className="form-control"
                                rows={item.key === "site_description" ? 3 : 2}
                                value={item.value}
                                onChange={(event) =>
                                  ubahMetadata(item.key, event.target.value)
                                }
                              />
                            ) : (
                              <input
                                id={`metadata-${item.key}`}
                                type={item.key === "site_email" ? "email" : "text"}
                                className="form-control"
                                value={item.value}
                                onChange={(event) =>
                                  ubahMetadata(item.key, event.target.value)
                                }
                              />
                            )}
                          </div>
                        );
                      })}

                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={simpanMetadata}
                          disabled={metadataSaving}
                        >
                          {metadataSaving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-save me-1" />
                              Simpan Perubahan
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
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