'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './admin-dashboard.css';
import AdminFilter from '../components/admin/AdminFilter';
import KulinerPage from '../components/admin/pages/KulinerPage';
import UlasanPage from '../components/admin/pages/UlasanPage';
import RingkasanPage from "../components/admin/pages/RingkasanPage";
import PetaPage from "../components/admin/pages/PetaPage";
import PesanPage from '../components/admin/pages/PesanPage';
import PengaturanPage from '../components/admin/pages/PengaturanPage';
import FAQPage from '../components/admin/pages/FAQPage';
import PenggunaPage from '../components/admin/pages/PenggunaPage';

import TambahKulinerModal, {
  type FormKulinerBaru,
} from '../components/admin/pages/TambahKulinerModal';

import {
  BarisKosong,
  BarisKuliner,
  BarisUlasan,
  BarisUsulan,
  KATEGORI,
  type ItemAdmin,
  type Ulasan,
} from '../components/admin/AdminTabel';
import type { StatusKuliner, StatusUlasan } from '../data/status';
import {
  ModalEditKuliner,
  ModalGambar,
  ModalPeringkat,
  ModalTolakUsulan,
} from '../components/admin/AdminModal';

const CHART_URL =
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

/* Aturan foto untuk form tambah kuliner (sama dengan halaman publik) */
const FORMAT_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const MAKS_UKURAN_FOTO = 5 * 1024 * 1024;

type TabType = 
  | 'ringkasan'
  | 'kuliner'
  | 'ulasan'
  | 'pengguna'
  | 'peta'
  | 'metadata'
  | 'pesan'
  | 'faq';

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
  deskripsi: string;
  posisiX: number;
  posisiY: number;
  jumlahKulinerApproved: number;
};

/* Angka ringkasan yang dihitung dari database oleh /api/admin/stats */
type StatistikAdmin = {
  totalPengguna: number;
  kulinerApproved: number;
  kulinerPending: number;
  kulinerRejected: number;
  totalUlasan: number;
  totalFavorit: number;
  perKategori: { [kategori: string]: number };
  sebaranDaerah: { daerah: string; jumlah: number }[];
  topFavorit: { id: string; nama: string; kategori: string; jumlah: number }[];
};

/* =========================
   BENTUK DATA DARI DATABASE
   ========================= */
type KulinerDb = {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  daerah: string;
  bahan: string[];
  rasa: string[];
  gambar: string | null;
  status: string;
  catatanAdmin: string | null;
  createdAt: string;
  user: { nama: string } | null;
};

type UlasanDb = {
  id: string;
  komentar: string;
  rating: number;
  status: string;
  createdAt: string;
  user: {
    nama: string;
  } | null;
};

/* Menyamakan bentuk data database dengan bentuk yang dipakai
   tabel dan modal admin. */
function keItemAdmin(item: KulinerDb): ItemAdmin {
  return {
    id: item.id,
    nama: item.nama,
    kategori: item.kategori,
    daerah: item.daerah,
    status: item.status as StatusKuliner,
    bahan: item.bahan.join(', '),
    deskripsi: item.deskripsi,
    img: item.gambar ?? '',
    pengirim: item.user?.nama ?? '-',
    tanggal: item.createdAt.slice(0, 10),
    catatan: item.catatanAdmin ?? '',
    rasa: item.rasa.join(', '),
  };
}

function keUlasan(item: UlasanDb): Ulasan {
  return {
    id: item.id,
    namaUser: item.user?.nama ?? "-",
    komentar: item.komentar,
    rating: item.rating,
    status: item.status as StatusUlasan,
    tanggal: item.createdAt.slice(0, 10),
  };
}

/* Foto diubah jadi dataURL supaya bisa dikirim lewat JSON ke API */
function bacaFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/* =========================
   HELPER HARGA
   ========================= */
const POLA_HARGA = /^\d+(\.\d{3})*$/;

function hargaValid(value: string) {
  const v = value.trim();
  return v === "" || POLA_HARGA.test(v);
}

function hargaKeAngka(value: string) {
  return Number(value.trim().replace(/\./g, ""));
}

const FORM_KULINER_KOSONG: FormKulinerBaru = {
  nama: '',
  kategori: '',
  daerah: '',
  deskripsi: '',
  bahan: '',
  rasa: '',
  hargaMin: '',
  hargaMax: '',
};

type ContactMessage = {
  id: string;
  email: string;
  subjek: string;
  pesan: string;
  status: string;
  isFaqReference: boolean;
  faqId: string | null;
  createdAt: string;
  faq: {
    id: string;
    pertanyaan: string;
  } | null;
};

type SiteMetadata = {
  key: string;
  value: string;
};

type PendingDelete =
  | { type: "kuliner"; item: ItemAdmin }
  | { type: "ulasan"; id: string; nama: string };

const METADATA_AWAL: SiteMetadata[] = [
  { key: "site_name", value: "JelajahRasa" },
  {
    key: "site_description",
    value: "Jelajahi kuliner khas Jawa Barat",
  },


  // Hero Homepage
  {
    key: "hero_tagline",
    value: "Satu Tampah Rasa, Sejuta Cerita Parahyangan",
  },
  {
    key: "hero_description",
    value:
      "Temukan cita rasa otentik yang tersebar dari pusat kota hingga sudut Pasundan.",
  },

  { key: "site_email", value: "halo@jelajahrasajabar.id" },
  { key: "site_phone", value: "" },
  { key: "site_address", value: "Jawa Barat, Indonesia" },
  { key: "footer_text", value: "© 2026 JelajahRasa" },

  // Media Sosial
  { key: "social_instagram", value: "" },
  { key: "social_tiktok", value: "" },
  { key: "social_youtube", value: "" },
  { key: "social_facebook", value: "" },
];

type KategoriRekomendasi =
  | "makanan"
  | "jajanan"
  | "minuman"
  | "oleh_oleh";

type KulinerPilihan = {
  id: string;
  nama: string;
  kategori: string;
  daerah: string;
};

type HeroKuliner = {
  id: string;
  nama: string;
  kategori: string;
  daerah: string;
  gambar: string | null;
};

type DataRekomendasi = Record<KategoriRekomendasi, string>;

const PILIHAN_REKOMENDASI: {
  key: KategoriRekomendasi;
  label: string;
  kategori: string;
}[] = [
  { key: "makanan", label: "Makanan", kategori: "Makanan" },
  { key: "jajanan", label: "Jajanan", kategori: "Jajanan" },
  { key: "minuman", label: "Minuman", kategori: "Minuman" },
  { key: "oleh_oleh", label: "Oleh-oleh", kategori: "Oleh-oleh Khas" },
];

const REKOMENDASI_AWAL: DataRekomendasi = {
  makanan: "",
  jajanan: "",
  minuman: "",
  oleh_oleh: "",
};
/* Menghilangkan notifikasi otomatis setelah 5 detik */
function useAutoDismiss(
  message: string,
  setMessage: (value: string) => void
) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => { setMessage(""); }, 5000);
    return () => clearTimeout(timer);
  }, [message, setMessage]);
}

/* =========================
   HALAMAN
   ========================= */
export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');
  const [menuOpen, setMenuOpen] = useState(false);
  const [siap, setSiap] = useState(false);
  const [admin, setAdmin] = useState<User | null>(null);

  const [kuliner, setKuliner] = useState<ItemAdmin[]>([]);
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [ulasanInfo, setUlasanInfo] = useState("");
  const [ulasanError, setUlasanError] = useState("");

  /* state tambah kuliner oleh admin */
  const [tambahKulinerOpen, setTambahKulinerOpen] = useState(false);
  const [tambahForm, setTambahForm] =
    useState<FormKulinerBaru>(FORM_KULINER_KOSONG);
  const [tambahFoto, setTambahFoto] = useState('');
  const [tambahLoading, setTambahLoading] = useState(false);
  const [tambahError, setTambahError] = useState('');
  const [hargaError, setHargaError] = useState('');
  const inputFotoTambahRef = useRef<HTMLInputElement>(null);

  /* notif di tab Kelola Kuliner (model sama seperti Kelola Peta) */
  const [kulinerInfo, setKulinerInfo] = useState('');
  const [kulinerError, setKulinerError] = useState('');

  /* state pesan masuk */
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [messageInfo, setMessageInfo] = useState("");
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  
  /* Ringkasan dari database; null berarti belum berhasil dimuat */
  const [statistik, setStatistik] = useState<StatistikAdmin | null>(null);

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
    deskripsi: "",
    posisiX: 50,
    posisiY: 50,
  });
  
  /* Modal */
  const [editForm, setEditForm] = useState<ItemAdmin | null>(null);
  const [tolakItem, setTolakItem] = useState<ItemAdmin | null>(null);
  const [gambarBesar, setGambarBesar] = useState<ItemAdmin | null>(null);
  const [peringkatTerbuka, setPeringkatTerbuka] = useState(false);
  
  const [roleDialog, setRoleDialog] = useState<{
    user: User;
    role: string;
  } | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [penggunaInfo, setPenggunaInfo] = useState('');
  const [penggunaError, setPenggunaError] = useState('');

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [roleError, setRoleError] = useState("");

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
    { id: "pesan", icon: "bx-envelope", label: "Pesan Masuk" },
    { id: "faq", icon: "bx-question-mark", label: "Kelola FAQ" },
    { id: "metadata", icon: "bx-cog", label: "Pengaturan Website" },
  ];

  // state untuk metadata website
  const [metadata, setMetadata] =
    useState<SiteMetadata[]>(METADATA_AWAL);

  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataSaving, setMetadataSaving] = useState(false);
  const [metadataError, setMetadataError] = useState("");
  const [metadataMessage, setMetadataMessage] = useState("");

  // State untuk rekomendasi homepage
  const [daftarKulinerRekomendasi, setDaftarKulinerRekomendasi] =
    useState<KulinerPilihan[]>([]);

  const [rekomendasi, setRekomendasi] =
    useState<DataRekomendasi>(REKOMENDASI_AWAL);

  const [rekomendasiLoading, setRekomendasiLoading] = useState(false);
  const [rekomendasiSaving, setRekomendasiSaving] = useState(false);
  const [rekomendasiError, setRekomendasiError] = useState("");
  const [rekomendasiMessage, setRekomendasiMessage] = useState("");

  // State untuk Hero Carousel
  const [daftarKulinerHero, setDaftarKulinerHero] =
    useState<HeroKuliner[]>([]);

  const [heroKulinerIds, setHeroKulinerIds] =
    useState<string[]>([]);

  const [heroLoading, setHeroLoading] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [heroMessage, setHeroMessage] = useState("");

  const [kulinerCari, setKulinerCari] = useState("");
  const [kulinerKategoriFilter, setKulinerKategoriFilter] = useState("");
  const [kulinerStatusFilter, setKulinerStatusFilter] = useState("");

  const [ulasanCari, setUlasanCari] = useState("");
  const [ulasanStatusFilter, setUlasanStatusFilter] = useState("");

  // Otomatis menghilangkan notifikasi setelah 5 detik
  // useEffect(() => {
  //   if (!messageError && !messageInfo) return;

  //   const timer = setTimeout(() => {
  //     setMessageError("");
  //     setMessageInfo("");
  //   }, 5000);

  //   return () => clearTimeout(timer);
  // }, [messageError, messageInfo]);

  // useEffect(() => {
  //   if (!faqError && !faqInfo) return;

  //   const timer = setTimeout(() => {
  //     setFaqError("");
  //     setFaqInfo("");
  //   }, 5000);

  //   return () => clearTimeout(timer);
  // }, [faqError, faqInfo]);

  useEffect(() => {
    if (!regionError && !regionMessage) return;

    const timer = setTimeout(() => {
      setRegionError("");
      setRegionMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [regionError, regionMessage]);

  useEffect(() => {
    if (!metadataError && !metadataMessage) return;

    const timer = setTimeout(() => {
      setMetadataError("");
      setMetadataMessage("");
    }, 8000);

    return () => clearTimeout(timer);
  }, [metadataError, metadataMessage]);

  useEffect(() => {
    if (!rekomendasiError && !rekomendasiMessage) return;

    const timer = setTimeout(() => {
      setRekomendasiError("");
      setRekomendasiMessage("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [rekomendasiError, rekomendasiMessage]);
  // Notifikasi pesan masuk
  useAutoDismiss(messageInfo, setMessageInfo);
  useAutoDismiss(messageError, setMessageError);

  // Notifikasi peta
  useAutoDismiss(regionMessage, setRegionMessage);
  useAutoDismiss(regionError, setRegionError);

  // Notifikasi metadata
  useAutoDismiss(metadataMessage, setMetadataMessage);
  useAutoDismiss(metadataError, setMetadataError);

  // Notifikasi kuliner 
  useAutoDismiss(kulinerInfo, setKulinerInfo);
  useAutoDismiss(kulinerError, setKulinerError);

  // Notifikasi ulasan
  useAutoDismiss(ulasanInfo, setUlasanInfo);
  useAutoDismiss(ulasanError, setUlasanError);

  /* Ambil angka ringkasan dari database. Dipisah dari effect awal
     supaya bisa dipanggil ulang setelah admin mengubah data. */
  const muatStatistik = async () => {
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' });

      if (!response.ok) return;

      const data = (await response.json()) as StatistikAdmin;
      setStatistik(data);
    } catch (error) {
      console.error('Gagal mengambil statistik admin:', error);
    }
  };

  /* Daftar kuliner dari database */
  const muatKuliner = async () => {
    try {
      const response = await fetch('/api/admin/kuliner', { cache: 'no-store' });

      if (!response.ok) return;

      const data = (await response.json()) as { kuliner?: KulinerDb[] };
      setKuliner((data.kuliner ?? []).map(keItemAdmin));
    } catch (error) {
      console.error('Gagal mengambil daftar kuliner:', error);
    }
  };

  /* Daftar ulasan dari database */
  const muatUlasan = async () => {
    try {
      const response = await fetch('/api/admin/ulasan', { cache: 'no-store' });

      if (!response.ok) return;

      const data = (await response.json()) as { ulasan?: UlasanDb[] };
      setUlasan((data.ulasan ?? []).map(keUlasan));
    } catch (error) {
      console.error('Gagal mengambil daftar ulasan:', error);
    }
  };

  /* daftar pengguna dari database */
  const muatUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });

      if (!response.ok) return;

      const data = (await response.json()) as { users?: User[] };
      setUsers(data.users ?? []);
    } catch (error) {
      console.error('Gagal mengambil daftar pengguna:', error);
    }
  };

  /* buka pop up konfirmasi ubah role pengguna */
  const mintaUbahRole = (user: User, role: string) => {
    if (role === user.role) return;

    setRoleDialog({ user, role });
  };

  /* simpan perubahan role setelah konfirmasi */
  const simpanRole = async () => {
    if (!roleDialog) return;

    setRoleLoading(true);
    setPenggunaInfo('');
    setPenggunaError('');

    const label = roleDialog.role === 'ADMIN' ? 'Admin' : 'User';
    const nama = roleDialog.user.nama;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roleDialog.user.id,
          role: roleDialog.role,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        setPenggunaError(data.message ?? 'Role pengguna belum berhasil diubah.');
        return;
      }

      setRoleDialog(null);
      setPenggunaInfo(`Role "${nama}" berhasil diubah menjadi ${label}.`);

      await muatUsers();
      await muatStatistik();
    } catch (error) {
      console.error('Gagal mengubah role pengguna:', error);
      setPenggunaError('Tidak dapat menghubungi server. Silakan coba lagi.');
    } finally {
      setRoleLoading(false);
    }
  };

  /* Daftar pesan masuk dari pengunjung */
  const muatPesan = async () => {
    setMessageLoading(true);
    setMessageError("");

    try {
      const response = await fetch("/api/admin/contact-messages", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil pesan masuk.");
      }

      setMessages(data.messages ?? []);
    } catch (error) {
      setMessageError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil pesan."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  const ubahStatusPesan = async (
    id: string,
    status: string
  ) => {
    try {
      const response = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah status pesan.");
      }

      setMessageInfo(data.message || "Status pesan berhasil diperbarui.");
      await muatPesan();
    } catch (error) {
      setMessageError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengubah status."
      );
    }
  };

  const jadikanReferensiFaq = async () => {
    if (selectedMessageIds.length === 0) return;

    setMessageLoading(true);
    setMessageError("");
    setMessageInfo("");

    try {
      const response = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "JADIKAN_REFERENSI",
          messageIds: selectedMessageIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan referensi FAQ.");
      }

      setMessageInfo(data.message);
      setSelectedMessageIds([]);
      await muatPesan();
    } catch (error) {
      setMessageError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan referensi FAQ."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  const togglePesanTerpilih = (id: string) => {
    setSelectedMessageIds((sebelumnya) =>
      sebelumnya.includes(id)
        ? sebelumnya.filter((item) => item !== id)
        : [...sebelumnya, id]
    );
  };

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

        /* Seluruh data diambil dari database lewat API admin */
        setAdmin(data.user);

        await muatUsers();
        await muatKuliner();
        await muatUlasan();
        await muatStatistik();

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

    const sebaran = statistik?.sebaranDaerah ?? [];
    const urut = sebaran.map((baris) => baris.daerah);

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: urut,
        datasets: [
          {
            label: 'Jumlah Kuliner',
            data: sebaran.map((baris) => baris.jumlah),
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
  }, [chartSiap, activeTab, statistik]);

  /* =========================
     AKSI DATA
     ========================= */

  /* Semua aksi menulis ke database lalu memuat ulang daftar dan
     angka ringkasan supaya tabel dan kartu selalu sama. */
  const ubahStatus = async (
    id: string,
    status: StatusKuliner,
    catatanAdmin = ''
  ) => {
    try {
      const response = await fetch('/api/admin/kuliner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, catatanAdmin }),
      });

      if (!response.ok) return;
    } catch (error) {
      console.error('Gagal mengubah status kuliner:', error);
      return;
    }

    await muatKuliner();
    await muatStatistik();
  };

  const terimaUsulan = (id: string) => {
    void ubahStatus(id, 'APPROVED');
  };

  const kirimTolak = (catatan: string) => {
    if (!tolakItem) return;

    void ubahStatus(tolakItem.id, 'REJECTED', catatan);
    setTolakItem(null);
  };

  const hapusItem = async (item: ItemAdmin) => {
  setKulinerInfo('');
  setKulinerError('');

  try {
    const response = await fetch('/api/admin/kuliner', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    if (!response.ok) {
      throw new Error(data.message || 'Gagal menghapus kuliner.');
    }

    setKulinerInfo(`Kuliner "${item.nama}" berhasil dihapus.`);

    await muatKuliner();
    await muatStatistik();
  } catch (error) {
    console.error('Gagal menghapus kuliner:', error);

    setKulinerError(
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat menghapus kuliner.'
    );
  }
};

  /* Simpan hasil edit kuliner. Hasilnya ditampilkan sebagai notif
     di atas tabel (model sama seperti notif di Kelola Peta). */
  const simpanEdit = async (itemBaru: ItemAdmin) => {
    setKulinerInfo('');
    setKulinerError('');

    try {
      const response = await fetch('/api/admin/kuliner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemBaru.id,
          nama: itemBaru.nama,
          kategori: itemBaru.kategori,
          daerah: itemBaru.daerah,
          status: itemBaru.status,
          bahan: itemBaru.bahan,
          rasa: itemBaru.rasa,
          deskripsi: itemBaru.deskripsi,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan perubahan kuliner.');
      }

      setEditForm(null);
      setKulinerInfo(`Data kuliner "${itemBaru.nama}" berhasil diperbarui.`);

      await muatKuliner();
      await muatStatistik();
    } catch (error) {
      console.error('Gagal menyimpan perubahan kuliner:', error);

      setEditForm(null);
      setKulinerError(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan perubahan kuliner.'
      );
    }
  };

  /* =========================
     TAMBAH KULINER (ADMIN)
     ========================= */
  const bukaTambahKuliner = () => {
    setTambahForm(FORM_KULINER_KOSONG);
    setTambahFoto('');
    setTambahError('');
    setHargaError('');
    setKulinerInfo('');
    setKulinerError('');
    setTambahKulinerOpen(true);
  };

  const tutupTambahKuliner = () => {
    if (tambahLoading) return;
    setTambahKulinerOpen(false);
  };

  const ubahTambahForm = (field: keyof FormKulinerBaru, value: string) => {
    setTambahForm((sebelumnya) => ({ ...sebelumnya, [field]: value }));
  };

  const pilihFotoTambah = async (file?: File) => {
    if (!file) return;

    if (!FORMAT_FOTO.includes(file.type)) {
      setTambahError('Format foto harus JPG, PNG, atau WEBP.');
      return;
    }

    if (file.size > MAKS_UKURAN_FOTO) {
      setTambahError('Ukuran foto maksimal 5MB.');
      return;
    }

    setTambahError('');
    setTambahFoto(await bacaFile(file));
  };

  const hapusFotoTambah = () => {
    setTambahFoto('');
    if (inputFotoTambahRef.current) inputFotoTambahRef.current.value = '';
  };

    const simpanKulinerBaru = async () => {
    const nama = tambahForm.nama.trim();
    const daerah = tambahForm.daerah.trim();
    const deskripsi = tambahForm.deskripsi.trim();
    const hargaMinStr = tambahForm.hargaMin.trim();
    const hargaMaxStr = tambahForm.hargaMax.trim();

    // Validasi field wajib
    if (!nama || !tambahForm.kategori || !daerah || !deskripsi || !hargaMinStr || !hargaMaxStr) {
      setTambahError('Nama, kategori, asal daerah, deskripsi, dan rentang harga wajib diisi.');
      return;
    }

    // Validasi format harga
    if (!hargaValid(hargaMinStr) || !hargaValid(hargaMaxStr)) {
      setTambahError('Format harga tidak valid (hanya angka atau titik pemisah ribuan).');
      return;
    }

    if (hargaKeAngka(hargaMinStr) > hargaKeAngka(hargaMaxStr)) {
    setHargaError("Harga minimal tidak boleh lebih besar dari harga maksimal.");
    return;
    }

    const hargaMin = hargaKeAngka(hargaMinStr);
    const hargaMax = hargaKeAngka(hargaMaxStr);

    if (hargaMin > hargaMax) {
      setTambahError('Harga minimal tidak boleh lebih besar dari harga maksimal.');
      return;
    }

    if (!tambahFoto) {
      setTambahError('Foto kuliner wajib diunggah.');
      return;
    }

    setTambahLoading(true);
    setTambahError('');

    try {
      const response = await fetch('/api/admin/kuliner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama,
          kategori: tambahForm.kategori,
          daerah,
          deskripsi,
          bahan: tambahForm.bahan.trim(),
          rasa: tambahForm.rasa.trim(),
          gambar: tambahFoto,
          hargaMin, // <--- Kirim ke API
          hargaMax, // <--- Kirim ke API
          status: 'APPROVED',
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Gagal menambahkan kuliner (kode ${response.status}).`
        );
      }

      setTambahKulinerOpen(false);
      setTambahForm(FORM_KULINER_KOSONG);
      setTambahFoto('');
      if (inputFotoTambahRef.current) inputFotoTambahRef.current.value = '';

      setKulinerInfo(`Kuliner "${nama}" berhasil ditambahkan.`);

      await muatKuliner();
      await muatStatistik();
    } catch (error) {
      console.error('Gagal menambahkan kuliner:', error);

      setTambahError(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menambahkan kuliner.'
      );
    } finally {
      setTambahLoading(false);
    }
  };

  // Status Ulasan
  const toggleUlasan = async (id: string) => {
    const item = ulasan.find((baris) => baris.id === id);
    if (!item) return;

    const status: StatusUlasan =
      item.status === "AKTIF" ? "NONAKTIF" : "AKTIF";

    setUlasanInfo("");
    setUlasanError("");

    try {
      const response = await fetch("/api/admin/ulasan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah status ulasan.");
      }

      setUlasanInfo(data.message || "Status ulasan berhasil diperbarui.");

      await muatUlasan();
      await muatStatistik();
    } catch (error) {
      setUlasanError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengubah status ulasan."
      );
    }
  };

  // Hapus Ulasan
  const hapusUlasan = async (id: string) => {
    const item = ulasan.find((baris) => baris.id === id);

    if (!item) return;

    setUlasanInfo("");
    setUlasanError("");

    try {
      const response = await fetch("/api/admin/ulasan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus ulasan.");
      }

      setUlasanInfo(data.message || "Ulasan berhasil dihapus.");

      await muatUlasan();
      await muatStatistik();
    } catch (error) {
      setUlasanError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus ulasan."
      );
    }
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

  /* Kuliner yang masih menunggu ditinjau, lima terbaru.
     API sudah mengurutkan dari yang paling baru. */
  const usulanTerbaru = kuliner
    .filter((item) => item.status === 'PENDING')
    .slice(0, 5);

  /* API sudah mengurutkan ulasan dari yang paling baru */
  // const ulasanTerurut = ulasan;

  /* filtering */
  const opsiKategoriKuliner = Array.from(
    new Set(kuliner.map((item) => item.kategori).filter(Boolean))
  )
    .sort()
    .map((value) => ({ value, label: value }));

  const opsiStatusKuliner = Array.from(
    new Set(kuliner.map((item) => item.status))
  )
    .sort()
    .map((value) => ({ value, label: value }));

  const opsiStatusUlasan = Array.from(
    new Set(ulasan.map((item) => item.status))
  )
    .sort()
    .map((value) => ({ value, label: value }));

  const kataKuliner = kulinerCari.trim().toLowerCase();

  const kulinerTersaring = kuliner.filter((item) => {
    const cocokCari = [
      item.nama,
      item.kategori,
      item.daerah,
      item.pengirim,
    ]
      .join(" ")
      .toLowerCase()
      .includes(kataKuliner);

    const cocokKategori =
      !kulinerKategoriFilter || item.kategori === kulinerKategoriFilter;
    const cocokStatus =
      !kulinerStatusFilter || item.status === kulinerStatusFilter;

    return cocokCari && cocokKategori && cocokStatus;
  });

  const kataUlasan = ulasanCari.trim().toLowerCase();

  const ulasanTerurut = ulasan.filter((item) => {
    const cocokCari = `${item.namaUser} ${item.komentar}`
      .toLowerCase()
      .includes(kataUlasan);

    const cocokStatus =
      !ulasanStatusFilter || item.status === ulasanStatusFilter;

    return cocokCari && cocokStatus;
  });

  /* Top 5 favorit sudah dihitung database */
  const peringkat = statistik?.topFavorit ?? [];

  const pesanReferensi = messages.filter(
    (item) => item.isFaqReference && !item.faqId
  );

  /* Saran asal daerah untuk form tambah kuliner (dari data yang sudah ada) */
  const daerahTersedia = Array.from(
    new Set(kuliner.map((item) => item.daerah).filter(Boolean))
  ).sort();

  // peta rasa
  const pilihPosisiRegion = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const posisiX = ((event.clientX - rect.left) / rect.width) * 100;
    const posisiY = ((event.clientY - rect.top) / rect.height) * 100;

    setRegionForm((sebelumnya) => ({
      ...sebelumnya,
      posisiX: Number(Math.min(100, Math.max(0, posisiX)).toFixed(2)),
      posisiY: Number(Math.min(100, Math.max(0, posisiY)).toFixed(2)),
    }));
  };

  const bukaFormRegion = (region?: MapRegion) => {
    setEditingRegion(region ?? null);

    setRegionForm({
      nama: region?.nama ?? "",
      deskripsi: region?.deskripsi ?? "",
      posisiX: region?.posisiX ?? 50,
      posisiY: region?.posisiY ?? 50,
    });

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

  const hapusRegion = async (region: MapRegion) => {
    try {
      setRegionError("");
      setRegionMessage("");

      const response = await fetch(
        `/api/admin/map-regions?id=${encodeURIComponent(region.id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus daerah.");
      }

      setRegions((sebelumnya) =>
        sebelumnya.filter((item) => item.id !== region.id)
      );

      setRegionMessage(`Daerah "${region.nama}" berhasil dihapus.`);
    } catch (error) {
      setRegionError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus daerah."
      );
    }
  };

  useEffect(() => {
    if (!siap || activeTab !== "peta") return;

    let masihAktif = true;

    async function loadRegions() {
      try {
        const response = await fetch("/api/admin/map-regions", {
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

  // Mengubah pilihan rekomendasi
  const ubahRekomendasi = (
    key: KategoriRekomendasi,
    value: string
  ) => {
    setRekomendasi((sebelumnya) => ({
      ...sebelumnya,
      [key]: value,
    }));

    setRekomendasiMessage("");
  };

  // Memuat daftar Kuliner dan pilihan rekomendasi
  const loadRekomendasi = async () => {
    try {
      const response = await fetch("/api/admin/rekomendasi", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil data rekomendasi."
        );
      }

      setDaftarKulinerRekomendasi(data.kuliner ?? []);
      setRekomendasi({
        ...REKOMENDASI_AWAL,
        ...data.rekomendasi,
      });

    } catch (error) {
      setRekomendasiError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil rekomendasi."
      );
    } finally {
      setRekomendasiLoading(false);
    }
  };

  // Menyimpan pilihan rekomendasi ke database
  const simpanRekomendasi = async () => {
    setRekomendasiSaving(true);
    setRekomendasiError("");
    setRekomendasiMessage("");

    try {
      const response = await fetch("/api/admin/rekomendasi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rekomendasi }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal menyimpan rekomendasi."
        );
      }

      setRekomendasi({
        ...REKOMENDASI_AWAL,
        ...data.rekomendasi,
      });

      setRekomendasiMessage(
        data.message || "Rekomendasi berhasil diperbarui."
      );
    } catch (error) {
      setRekomendasiError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan rekomendasi."
      );
    } finally {
      setRekomendasiSaving(false);
    }
  };

  // Memuat daftar Kuliner dan pilihan Hero
  const loadHero = async () => {
    setHeroLoading(true);
    setHeroError("");

    try {
      const response = await fetch("/api/admin/hero", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data Hero.");
      }

      setDaftarKulinerHero(data.kuliner ?? []);
      setHeroKulinerIds(data.heroKulinerIds ?? []);
    } catch (error) {
      setHeroError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data Hero."
      );
    } finally {
      setHeroLoading(false);
    }
  };

  // Mengubah pilihan Kuliner Hero
  const toggleKulinerHero = (id: string) => {
    setHeroKulinerIds((sebelumnya) =>
      sebelumnya.includes(id)
        ? sebelumnya.filter((item) => item !== id)
        : [...sebelumnya, id]
    );

    setHeroMessage("");
    setHeroError("");
  };

  // Mengatur ulang urutan slide
  const pindahUrutanHero = (index: number, arah: -1 | 1) => {
    setHeroKulinerIds((sebelumnya) => {
      const tujuan = index + arah;

      if (tujuan < 0 || tujuan >= sebelumnya.length) {
        return sebelumnya;
      }

      const hasil = [...sebelumnya];
      [hasil[index], hasil[tujuan]] = [
        hasil[tujuan],
        hasil[index],
      ];

      return hasil;
    });

    setHeroMessage("");
  };

  // Menyimpan pilihan Hero ke database
  const simpanHero = async () => {
    setHeroSaving(true);
    setHeroError("");
    setHeroMessage("");

    try {
      const response = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ heroKulinerIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan Hero.");
      }

      setHeroKulinerIds(data.heroKulinerIds ?? []);

      setHeroMessage(
        data.message || "Hero Carousel berhasil diperbarui."
      );
    } catch (error) {
      setHeroError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan Hero."
      );
    } finally {
      setHeroSaving(false);
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

    void Promise.resolve().then(() => {
      void loadRekomendasi();
    });

    void Promise.resolve().then(() => {
      void loadHero();
    });

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
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn-toggle-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={menuOpen}
          >
            <i className={`bx ${menuOpen ? "bx-x" : "bx-menu"}`} />
          </button>

          <Link
            className="logo-brand text-decoration-none"
            href="/admin-dashboard"
          >
            <i className="bx bx-map-pin" />
            JelajahRasa
            <span className="badge bg-primary">Admin Dashboard</span>
          </Link>
        </div>

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
          <nav
            className={`sidebar-admin col-12 col-lg-3 col-xl-2 ${
              menuOpen ? "sidebar-admin-open" : "sidebar-admin-closed"
            }`}
          >
            <div className="sidebar-admin-inner">
              <div className="sidebar-admin-heading">
                <span>NAVIGASI UTAMA</span>
              </div>

              <div className="nav-menu" role="tablist" aria-label="Menu Admin">
                {menu.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-menu-item ${
                      activeTab === item.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setKulinerInfo("");
                      setKulinerError("");

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

                      if (item.id === "pesan") {
                        setMessageLoading(true);
                        setMessageError("");
                        setMessageInfo("");
                        void muatPesan();
                      }

                      if (item.id === "faq") {
                        void muatPesan();
                      }

                      setActiveTab(item.id);
                      setMenuOpen(false);
                    }}
                    role="tab"
                    aria-selected={activeTab === item.id}
                  >
                    <span className="nav-menu-icon">
                      <i className={`bx ${item.icon}`} />
                    </span>

                    <span className="nav-menu-label">{item.label}</span>

                    {activeTab === item.id && (
                      <span className="nav-menu-indicator" />
                    )}
                  </button>
                ))}
              </div>

              <div className="sidebar-admin-footer">
                <i className="bx bx-shield-quarter" />
                <span>Panel Administrator</span>
              </div>
            </div>
          </nav>

          {/* Konten Utama */}
          <main className="col-12 col-lg-9 col-xl-10">
            {/* =========================
              TAB RINGKASAN
              ========================= */}
            {activeTab === "ringkasan" && (
              <RingkasanPage
                statistik={statistik}
                usulanTerbaru={usulanTerbaru}
                onPeringkat={() => setPeringkatTerbuka(true)}
                onTerima={terimaUsulan}
                onTolak={setTolakItem}
                onFoto={setGambarBesar}
              />
            )}

            {/* =========================
                TAB KELOLA KULINER
                ========================= */}
            {activeTab === 'kuliner' && (
              <>
                <KulinerPage
                  items={kuliner}
                  info={kulinerInfo}
                  error={kulinerError}
                  onAdd={bukaTambahKuliner}
                  onEdit={setEditForm}
                  onDelete={(item) => setPendingDelete({ type: "kuliner", item })}                  onPhoto={setGambarBesar}
                />

                <TambahKulinerModal
                  open={tambahKulinerOpen}
                  form={tambahForm}
                  foto={tambahFoto}
                  loading={tambahLoading}
                  error={tambahError}
                  hargaError={hargaError}
                  daerahTersedia={daerahTersedia}
                  inputFotoRef={inputFotoTambahRef}
                  onChange={ubahTambahForm}
                  onClearHargaError={() => setHargaError("")}
                  onChoosePhoto={(file) => void pilihFotoTambah(file)}
                  onRemovePhoto={hapusFotoTambah}
                  onClose={tutupTambahKuliner}
                  onSave={() => void simpanKulinerBaru()}
                />
              </>
            )}

            {/* =========================
                TAB KELOLA ULASAN
                ========================= */}
            {activeTab === "ulasan" && (
              <UlasanPage
                ulasan={ulasanTerurut}
                info={ulasanInfo}
                error={ulasanError}
                onToggle={(id) => void toggleUlasan(id)}
                onDelete={(id) => {
                  const item = ulasan.find((baris) => baris.id === id);
                  if (item) {
                    setPendingDelete({
                      type: "ulasan",
                      id,
                      nama: item.namaUser,
                    });
                  }
                }}              />
            )}

            {/* =========================
                TAB KELOLA PENGGUNA
                ========================= */}
            {activeTab === 'pengguna' && (
              <PenggunaPage
                users={users}
                adminId={admin?.id ?? null}
                info={penggunaInfo}
                error={penggunaError}
                onUbahRole={mintaUbahRole}
              />
            )}

            {/* =========================
                TAB KELOLA PETA
                ========================= */}
            {activeTab === "peta" && (
              <PetaPage
                regions={regions}
                loading={regionLoading}
                error={regionError}
                message={regionMessage}
                onAdd={() => bukaFormRegion()}
                onEdit={bukaFormRegion}
                onDelete={(region) => void hapusRegion(region)}
                regionFormOpen={regionFormOpen}
                editingRegion={editingRegion}
                regionForm={regionForm}
                setRegionForm={setRegionForm}
                onCloseForm={() => {
                  setRegionFormOpen(false);
                  setEditingRegion(null);
                }}
                onSaveForm={() => void simpanRegion()}
              />
            )}

            {/* =========================
                TAB PENGATURAN WEBSITE
                ========================= */}
            {activeTab === "metadata" && (
              <PengaturanPage
                metadata={metadata}
                metadataLoading={metadataLoading}
                metadataSaving={metadataSaving}
                metadataError={metadataError}
                metadataMessage={metadataMessage}
                onMetadataChange={ubahMetadata}
                onSaveMetadata={() => void simpanMetadata()}

                kulinerRekomendasi={daftarKulinerRekomendasi}
                rekomendasi={rekomendasi}
                rekomendasiLoading={rekomendasiLoading}
                rekomendasiSaving={rekomendasiSaving}
                rekomendasiError={rekomendasiError}
                rekomendasiMessage={rekomendasiMessage}
                onRekomendasiChange={ubahRekomendasi}
                onSaveRekomendasi={() => void simpanRekomendasi()}

                kulinerHero={daftarKulinerHero}
                heroKulinerIds={heroKulinerIds}
                heroLoading={heroLoading}
                heroSaving={heroSaving}
                heroError={heroError}
                heroMessage={heroMessage}
                onToggleHero={toggleKulinerHero}
                onMoveHero={pindahUrutanHero}
                onSaveHero={() => void simpanHero()}
              />
            )}

            {/* =========================
                TAB PESAN MASUK
                ========================= */}
            {activeTab === 'pesan' && (
              <PesanPage
                messages={messages}
                selectedIds={selectedMessageIds}
                loading={messageLoading}
                error={messageError}
                info={messageInfo}
                onConvertToFaq={() => void jadikanReferensiFaq()}
                onToggleSelected={togglePesanTerpilih}
                onChangeStatus={(id, status) => void ubahStatusPesan(id, status)}
              />
            )}

            {/* =========================
                TAB KELOLA FAQ
                ========================= */}
            {activeTab === "faq" && (
              <FAQPage
                pesanReferensi={messages.filter(
                  (item) => item.isFaqReference && !item.faqId
                )}
                onMessagesChanged={() => void muatPesan()}
              />
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

      {/* pop up konfirmasi ubah role pengguna */}
      {roleDialog && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ubah Role Akun</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Tutup"
                  onClick={() => setRoleDialog(null)}
                  disabled={roleLoading}
                />
              </div>

              <div className="modal-body">
                <p className="mb-2">
                  Ubah role akun ini menjadi{" "}
                  <strong>
                    {roleDialog.role === "ADMIN" ? "Admin" : "User"}
                  </strong>
                  ?
                </p>
                <p className="text-muted small mb-0">
                  {roleDialog.user.nama} ({roleDialog.user.email})
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setRoleDialog(null)}
                  disabled={roleLoading}
                >
                  Batal
                </button>

                <button
                  type="button"
                  className={
                    roleDialog.role === "ADMIN"
                      ? "btn btn-success"
                      : "btn btn-danger"
                  }
                  onClick={simpanRole}
                  disabled={roleLoading}
                >
                  {roleLoading ? "Menyimpan..." : "Ya, Ubah"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          className="modal fade show d-block"
          role="presentation"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="alertdialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Konfirmasi Hapus</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Tutup"
                  onClick={() => setPendingDelete(null)}
                />
              </div>

              <div className="modal-body">
                Yakin ingin menghapus{" "}
                <strong>
                  {pendingDelete.type === "kuliner"
                    ? pendingDelete.item.nama
                    : `ulasan dari ${pendingDelete.nama}`}
                </strong>
                ?
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setPendingDelete(null)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    const target = pendingDelete;
                    setPendingDelete(null);

                    if (target.type === "kuliner") {
                      void hapusItem(target.item);
                    } else {
                      void hapusUlasan(target.id);
                    }
                  }}
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}