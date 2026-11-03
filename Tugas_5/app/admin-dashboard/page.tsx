'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './admin-dashboard.css';
import {
  BarisKosong,
  BarisKuliner,
  BarisUlasan,
  BarisUsulan,
  KATEGORI,
  type ItemAdmin,
  type Ulasan,
} from '../components/AdminTabel';
import type { StatusKuliner, StatusUlasan } from '../data/status';
import {
  ModalEditKuliner,
  ModalGambar,
  ModalPeringkat,
  ModalTolakUsulan,
} from '../components/AdminModal';

const CHART_URL =
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

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
  namaUser: string;
  komentar: string;
  rating: number;
  status: string;
  createdAt: string;
  kuliner: { nama: string };
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
    namaUser: item.namaUser,
    komentar: item.komentar,
    rating: item.rating,
    status: item.status as StatusUlasan,
    tanggal: item.createdAt.slice(0, 10),
    kuliner: item.kuliner?.nama ?? '-',
  };
}

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

/* =========================
   HALAMAN
   ========================= */
export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('ringkasan');
  const [siap, setSiap] = useState(false);
  const [admin, setAdmin] = useState<User | null>(null);

  const [kuliner, setKuliner] = useState<ItemAdmin[]>([]);
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  /* state pesan masuk */
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [messageInfo, setMessageInfo] = useState("");
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  
  /* state faq */
  const [faqList, setFaqList] = useState<FAQItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState("");
  const [faqInfo, setFaqInfo] = useState("");
  const [draggedFaqId, setDraggedFaqId] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FAQItem | null>(null);
  const [faqReferenceOpen, setFaqReferenceOpen] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState({
    pertanyaan: "",
    jawaban: "",
    slug: "",
    messageIds: [] as string[],
  });

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

  const muatFaq = async () => {
    setFaqLoading(true);
    setFaqError("");

    try {
      const response = await fetch("/api/admin/faq", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data FAQ.");
      }

      setFaqList(data.faq || []);
    } catch (error) {
      setFaqError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data FAQ."
      );
    } finally {
      setFaqLoading(false);
    }
  };

  const simpanFaq = async () => {
    setFaqLoading(true);
    setFaqError("");
    setFaqInfo("");

    try {
      const response = await fetch("/api/admin/faq", {
        method: editingFaq ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingFaq
            ? { id: editingFaq.id, ...faqForm }
            : faqForm
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan FAQ.");
      }

      setFaqInfo(
        data.message ||
          (editingFaq
            ? "FAQ berhasil diperbarui."
            : "FAQ berhasil ditambahkan.")
      );

      setEditingFaq(null);
      setFaqForm({
        pertanyaan: "",
        jawaban: "",
        slug: "",
        messageIds: [],
      });

      await muatFaq();

      if (!editingFaq) {
        await muatPesan();
      }
    } catch (error) {
      setFaqError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan FAQ."
      );
    } finally {
      setFaqLoading(false);
    }
  };

  const bukaEditFaq = (item: FAQItem) => {
    setEditingFaq(item);
    setFaqForm({
      pertanyaan: item.pertanyaan,
      jawaban: item.jawaban,
      slug: item.slug,
      messageIds: [],
    });
    setFaqError("");
    setFaqInfo("");
  };

  const toggleStatusFaq = async (item: FAQItem) => {
    setFaqLoading(true);
    setFaqError("");
    setFaqInfo("");

    try {
      const response = await fetch("/api/admin/faq", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          isActive: !item.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengubah status FAQ.");
      }

      setFaqInfo(data.message || "Status FAQ berhasil diperbarui.");
      await muatFaq();
    } catch (error) {
      setFaqError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengubah status FAQ."
      );
    } finally {
      setFaqLoading(false);
    }
  };

  const hapusFaq = async (item: FAQItem) => {
    setFaqLoading(true);
    setFaqError("");
    setFaqInfo("");

    try {
      const response = await fetch("/api/admin/faq", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: item.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus FAQ.");
      }

      setFaqInfo(data.message || "FAQ berhasil dihapus.");

      if (editingFaq?.id === item.id) {
        setEditingFaq(null);
        setFaqForm({
          pertanyaan: "",
          jawaban: "",
          slug: "",
          messageIds: [],
        });
      }

      await muatFaq();
      await muatPesan();
      return true;
    } catch (error) {
      setFaqError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghapus FAQ."
      );
      return false;
    } finally {
      setFaqLoading(false);
    }
  };
  
  const simpanUrutanFaq = async (faqIds: string[]) => {
    try {
      setFaqError("");
      setFaqInfo("");

      const response = await fetch("/api/admin/faq", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "REORDER",
          faqIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengatur urutan FAQ.");
      }

      setFaqInfo("Urutan FAQ berhasil diperbarui.");
      await muatFaq();
    } catch (error) {
      setFaqError(
        error instanceof Error
          ? error.message
          : "Gagal mengatur urutan FAQ."
      );

      await muatFaq();
    }
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

        const userResponse = await fetch('/api/admin/users', {
          cache: 'no-store',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsers(userData.users || []);
        }

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
    if (!confirm(`Hapus "${item.nama}" dari daftar kuliner?`)) return;

    try {
      const response = await fetch('/api/admin/kuliner', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });

      if (!response.ok) return;
    } catch (error) {
      console.error('Gagal menghapus kuliner:', error);
      return;
    }

    await muatKuliner();
    await muatStatistik();
  };

  const simpanEdit = async (itemBaru: ItemAdmin) => {
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

      if (!response.ok) return;
    } catch (error) {
      console.error('Gagal menyimpan perubahan kuliner:', error);
      return;
    }

    setEditForm(null);

    await muatKuliner();
    await muatStatistik();
  };

  const toggleUlasan = async (id: string) => {
    const item = ulasan.find((baris) => baris.id === id);
    if (!item) return;

    const status: StatusUlasan =
      item.status === 'TAMPIL' ? 'SEMBUNYI' : 'TAMPIL';

    try {
      const response = await fetch('/api/admin/ulasan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) return;
    } catch (error) {
      console.error('Gagal mengubah status ulasan:', error);
      return;
    }

    await muatUlasan();
    await muatStatistik();
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
  const ulasanTerurut = ulasan;

  /* Top 5 favorit sudah dihitung database */
  const peringkat = statistik?.topFavorit ?? [];

  const pesanReferensi = messages.filter(
    (item) => item.isFaqReference && !item.faqId
  );

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
    const konfirmasi = window.confirm(
      `Yakin ingin menghapus daerah "${region.nama}"?`
    );

    if (!konfirmasi) return;

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
                    
                    if (item.id === "pesan") {
                      setMessageLoading(true);
                      setMessageError("");
                      setMessageInfo("");
                    }
                    
                    if (item.id === "faq") {
                      setFaqError("");
                      setFaqInfo("");
                      void muatFaq();
                      void muatPesan();
                    }

                    setActiveTab(item.id);
                    if (item.id === "pesan") {
                      void muatPesan();
                    }
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
                  <div className="col-6 col-lg-4 col-xl-2">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Kuliner Disetujui</span>
                      <h3 id="stat-total-kuliner">
                        {statistik?.kulinerApproved ?? 0}
                      </h3>
                      <small>Tampil di katalog</small>
                    </div>
                  </div>

                  <div className="col-6 col-lg-4 col-xl-2">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Menunggu Tinjauan</span>
                      <h3 id="stat-perlu-menunggu">
                        {statistik?.kulinerPending ?? 0}
                      </h3>
                      <small>Perlu ditinjau admin</small>
                    </div>
                  </div>

                  <div className="col-6 col-lg-4 col-xl-2">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Ditolak</span>
                      <h3 id="stat-total-ditolak">
                        {statistik?.kulinerRejected ?? 0}
                      </h3>
                      <small>Tidak tampil di katalog</small>
                    </div>
                  </div>

                  <div className="col-6 col-lg-4 col-xl-2">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Total Pengguna</span>
                      <h3 id="stat-total-pengguna">
                        {statistik?.totalPengguna ?? 0}
                      </h3>
                      <small>Akun terdaftar</small>
                    </div>
                  </div>

                  <div className="col-6 col-lg-4 col-xl-2">
                    <div className="kartu-stat border rounded bg-white">
                      <span>Total Ulasan</span>
                      <h3 id="stat-total-ulasan">
                        {statistik?.totalUlasan ?? 0}
                      </h3>
                      <small>Ulasan pengguna</small>
                    </div>
                  </div>

                  <div className="col-6 col-lg-4 col-xl-2">
                    <button
                      type="button"
                      className="kartu-stat kartu-tombol border rounded bg-white w-100 text-start"
                      onClick={() => setPeringkatTerbuka(true)}
                    >
                      <span className="d-flex justify-content-between align-items-center">
                        Total Favorit
                        <i className="bx bx-chevron-right" />
                      </span>
                      <h3 id="stat-total-favorit">
                        {statistik?.totalFavorit ?? 0}
                      </h3>
                      <small className="text-danger">
                        <i className="bx bx-trophy me-1" />
                        Top 5 Terfavorit
                      </small>
                    </button>
                  </div>
                </div>

                {statistik !== null &&
                  statistik.kulinerApproved === 0 &&
                  statistik.kulinerPending === 0 &&
                  statistik.kulinerRejected === 0 && (
                    <p className="text-muted small mb-0">
                      Belum ada data kuliner di database. Angka akan terisi
                      setelah pengajuan masuk atau data awal di-seed.
                    </p>
                  )}

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
                            {statistik?.perKategori[item.nama] ?? 0}
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

                {/* Pengaturan Hero Carousel */}
                <div className="box-tabel border rounded bg-white p-4 mt-4">
                  <h5>Hero Carousel</h5>

                  <p className="text-muted">
                    Pilih kuliner yang ingin ditampilkan pada Hero Carousel
                    halaman utama. Gambar dan nama kuliner akan ditampilkan
                    secara bergantian. Hanya kuliner yang sudah disetujui
                    dan memiliki gambar yang tersedia.
                  </p>

                  {heroError && (
                    <div className="alert alert-danger">
                      {heroError}
                    </div>
                  )}

                  {heroMessage && (
                    <div className="alert alert-success">
                      {heroMessage}
                    </div>
                  )}

                  {heroLoading ? (
                    <p className="text-muted mb-0">
                      Memuat pilihan kuliner...
                    </p>
                  ) : (
                    <>
                      <h6 className="fw-semibold mt-3">
                        Pilihan Kuliner
                      </h6>

                      {daftarKulinerHero.length === 0 ? (
                        <p className="text-muted">
                          Belum ada kuliner approved yang memiliki gambar.
                        </p>
                      ) : (
                        <div className="row g-3">
                          {daftarKulinerHero.map((kuliner) => (
                            <div
                              className="col-md-6"
                              key={kuliner.id}
                            >
                              <label
                                className="border rounded p-3 d-flex align-items-center gap-3 h-100"
                                style={{ cursor: "pointer" }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input flex-shrink-0"
                                  checked={heroKulinerIds.includes(
                                    kuliner.id
                                  )}
                                  onChange={() =>
                                    toggleKulinerHero(kuliner.id)
                                  }
                                />

                                {kuliner.gambar && (
                                  <img
                                    src={kuliner.gambar}
                                    alt={kuliner.nama}
                                    style={{
                                      width: "80px",
                                      height: "65px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                    }}
                                  />
                                )}

                                <div>
                                  <div className="fw-semibold">
                                    {kuliner.nama}
                                  </div>
                                  <small className="text-muted">
                                    {kuliner.kategori} — {kuliner.daerah}
                                  </small>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      <hr className="my-4" />

                      <h6 className="fw-semibold">
                        Urutan Hero Carousel
                      </h6>

                      <p className="text-muted small">
                        Atur urutan gambar yang akan muncul. Kuliner pertama
                        menjadi slide pertama.
                      </p>

                      {heroKulinerIds.length === 0 ? (
                        <p className="text-muted">
                          Belum ada kuliner yang dipilih.
                        </p>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {heroKulinerIds.map((id, index) => {
                            const kuliner = daftarKulinerHero.find(
                              (item) => item.id === id
                            );

                            if (!kuliner) return null;

                            return (
                              <div
                                key={id}
                                className="border rounded p-2 d-flex align-items-center gap-3"
                              >
                                <span className="fw-semibold">
                                  {index + 1}.
                                </span>

                                {kuliner.gambar && (
                                  <img
                                    src={kuliner.gambar}
                                    alt={kuliner.nama}
                                    style={{
                                      width: "65px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                    }}
                                  />
                                )}

                                <div className="flex-grow-1">
                                  <div className="fw-semibold">
                                    {kuliner.nama}
                                  </div>
                                  <small className="text-muted">
                                    {kuliner.daerah}
                                  </small>
                                </div>

                                <div className="d-flex gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={index === 0}
                                    onClick={() =>
                                      pindahUrutanHero(index, -1)
                                    }
                                    title="Geser ke atas"
                                  >
                                    <i className="bx bx-up-arrow-alt" />
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={
                                      index === heroKulinerIds.length - 1
                                    }
                                    onClick={() =>
                                      pindahUrutanHero(index, 1)
                                    }
                                    title="Geser ke bawah"
                                  >
                                    <i className="bx bx-down-arrow-alt" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={simpanHero}
                          disabled={heroSaving || heroLoading}
                        >
                          {heroSaving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-save me-1" />
                              Simpan Hero Carousel
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
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
                        {kuliner.length === 0 ? (
                          <BarisKosong
                            kolom={5}
                            ikon="bx-folder-open"
                            pesan="Belum ada data kuliner."
                          />
                        ) : (
                          kuliner.map((item) => (
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

            {activeTab === 'peta' && (
              
              <div className="box-tabel border rounded bg-white p-4">
                <div className="mb-3">
                  <h5>Data Kabupaten/Kota Jawa Barat</h5>
                  <p className="text-muted mb-0">
                    Kelola deskripsi wilayah dan posisi pin pada Peta Rasa.
                  </p>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => bukaFormRegion()}
                  >
                    <i className="bx bx-plus me-1" />
                    Tambah Daerah
                  </button>
                </div>

                <div className="mb-4">
                  <h5 className="fw-semibold mb-3">
                    Preview Peta Jawa Barat
                  </h5>

                  <div
                    className="peta-admin-preview"
                    style={{
                      width: "100%",
                      maxWidth: "750px",
                    }}
                  >
                    <Image
                      src="/images/homepage/peta-jabar.jpg"
                      alt="Peta Kabupaten dan Kota Jawa Barat"
                      width={1200}
                      height={900}
                      className="w-100 h-auto"
                      style={{ display: "block" }}
                    />

                    {regions.map((region) => {
                      const jenisWilayah = region.nama.startsWith("Kota ")
                      ? "kota"
                      : "kabupaten";
                      return(
                        <div
                          key={region.id}
                          className={`peta-pin-item pin-${jenisWilayah}`}
                          style={{
                            left: `${region.posisiX}%`,
                            top: `${region.posisiY}%`,
                          }}
                        >
                          <button
                            type="button"
                            className="btn-pin"
                            title={`Edit ${region.nama}`}
                            aria-label={`Edit ${region.nama}`}
                            onClick={() => bukaFormRegion(region)}
                          >
                            <i className="bx bx-map-pin"></i>
                          </button>

                          <span className="pin-label">
                            {region.nama}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-muted small mt-2 mb-0">
                    Klik pin untuk mengedit informasi dan posisi daerah.
                  </p>
                </div>
                {regionError && (
                  <div className="alert alert-danger">{regionError}</div>
                )}

                {regionMessage && (
                  <div className="alert alert-success">{regionMessage}</div>
                )}

                {regionLoading ? (
                  <p className="text-muted">Memuat data wilayah...</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Kabupaten/Kota</th>
                          <th>Deskripsi</th>
                          <th>Posisi X</th>
                          <th>Posisi Y</th>
                          <th>Kuliner</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>

                      <tbody>
                        {regions.map((region) => {
                          const jenisWilayah = region.nama.startsWith("Kota ")
                            ? "kota"
                            : "kab";

                          const statusWilayah =
                            region.jumlahKulinerApproved > 0
                              ? "ada-kuliner"
                              : "belum-ada-kuliner";

                          return (
                            <tr key={region.id}>
                              <td>
                                <div className="fw-semibold">{region.nama}</div>
                                </td>

                              <td style={{ minWidth: 220, maxWidth: 350 }}>
                                {region.deskripsi || (
                                  <span className="text-muted">
                                    Belum ada deskripsi
                                  </span>
                                )}
                              </td>

                              <td>{region.posisiX}%</td>
                              <td>{region.posisiY}%</td>

                              <td>
                                <span
                                  className={`badge ${
                                    region.jumlahKulinerApproved > 0
                                      ? "bg-success"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {region.jumlahKulinerApproved > 0
                                    ? `${region.jumlahKulinerApproved} kuliner`
                                    : "Belum ada"}
                                </span>
                              </td>

                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-warning"
                                    onClick={() => bukaFormRegion(region)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => hapusRegion(region)}
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'metadata' && (
              <section id="tab-metadata">
                <h4>Pengaturan Website</h4>

                <p className="text-muted">
                  Kelola informasi umum yang ditampilkan pada website JelajahRasa.
                </p>

                <div className="box-tabel border rounded bg-white p-4">
                  {metadataLoading ? (
                    <p className="text-muted mb-0">
                      Memuat pengaturan website...
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

                          social_instagram: "URL Instagram",
                          social_tiktok: "URL TikTok",
                          social_youtube: "URL YouTube",
                          social_facebook: "URL Facebook",
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

                {/* Rekomendasi Homepage */}
                <div className="box-tabel border rounded bg-white p-4 mt-4">
                  <h5>Rekomendasi Homepage</h5>

                  <p className="text-muted">
                    Pilih satu kuliner untuk setiap kategori yang akan ditampilkan pada bagian rekomendasi di halaman utama. Hanya kuliner yang sudah disetujui yang tersedia.
                  </p>

                  {rekomendasiError && (
                    <div className="alert alert-danger">
                      {rekomendasiError}
                    </div>
                  )}

                  {rekomendasiMessage && (
                    <div className="alert alert-success">
                      {rekomendasiMessage}
                    </div>
                  )}

                  {rekomendasiLoading ? (
                    <p className="text-muted mb-0">
                      Memuat pilihan kuliner...
                    </p>
                  ) : (
                    <>
                    <div className="row g-6">
                      {PILIHAN_REKOMENDASI.map((item) => {
                        const daftarSesuai = daftarKulinerRekomendasi.filter(
                          (kuliner) =>
                            kuliner.kategori.trim().toLowerCase() ===
                            item.kategori.toLowerCase()
                        );

                        return (
                          <div className="col-md-6" key={item.key}>
                            <label
                              htmlFor={`rekomendasi-${item.key}`}
                              className="form-label fw-semibold"
                            >
                              {item.label}
                            </label>

                            <select
                              id={`rekomendasi-${item.key}`}
                              className="form-select"
                              value={rekomendasi[item.key]}
                              onChange={(event) =>
                                ubahRekomendasi(
                                  item.key,
                                  event.target.value
                                )
                              }
                            >
                              <option value="">
                                -- Tidak dipilih --
                              </option>

                              {daftarSesuai.map((kuliner) => (
                                <option
                                  key={kuliner.id}
                                  value={kuliner.id}
                                >
                                  {kuliner.nama} — {kuliner.daerah}
                                </option>
                              ))}
                            </select>

                            {daftarSesuai.length === 0 && (
                              <small className="text-muted">
                                Belum ada kuliner approved untuk kategori ini.
                              </small>
                            )}
                          </div>
                        );
                      })}
                    </div>

                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={simpanRekomendasi}
                          disabled={rekomendasiSaving}
                        >
                          {rekomendasiSaving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-save me-1" />
                              Simpan Rekomendasi
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Hero Carousel */}
                <div className="box-tabel border rounded bg-white p-4 mt-4">
                  <h5>Hero Carousel</h5>

                  <p className="text-muted">
                    Pilih beberapa kuliner yang akan ditampilkan secara
                    bergantian pada Hero Carousel halaman utama. Gambar dan
                    nama kuliner akan diambil dari database.
                  </p>

                  {heroError && (
                    <div className="alert alert-danger">
                      {heroError}
                    </div>
                  )}

                  {heroMessage && (
                    <div className="alert alert-success">
                      {heroMessage}
                    </div>
                  )}

                  {heroLoading ? (
                    <p className="text-muted mb-0">
                      Memuat pilihan kuliner...
                    </p>
                  ) : (
                    <>
                      <h6 className="fw-semibold mt-3">
                        Pilih Kuliner
                      </h6>

                      {daftarKulinerHero.length === 0 ? (
                        <p className="text-muted">
                          Belum ada kuliner approved yang memiliki gambar.
                        </p>
                      ) : (
                        <div className="row g-3">
                          {daftarKulinerHero.map((kuliner) => (
                            <div className="col-md-6" key={kuliner.id}>
                              <label
                                className="border rounded p-3 d-flex align-items-center gap-3 h-100"
                                style={{ cursor: "pointer" }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input flex-shrink-0"
                                  checked={heroKulinerIds.includes(kuliner.id)}
                                  onChange={() =>
                                    toggleKulinerHero(kuliner.id)
                                  }
                                />

                                {kuliner.gambar && (
                                  <img
                                    src={kuliner.gambar}
                                    alt={kuliner.nama}
                                    style={{
                                      width: "80px",
                                      height: "65px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                    }}
                                  />
                                )}

                                <div>
                                  <div className="fw-semibold">
                                    {kuliner.nama}
                                  </div>
                                  <small className="text-muted">
                                    {kuliner.kategori} — {kuliner.daerah}
                                  </small>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      <hr className="my-4" />

                      <h6 className="fw-semibold">
                        Urutan Slide
                      </h6>

                      <p className="text-muted small">
                        Atur urutan kemunculan gambar. Slide pertama akan
                        menjadi gambar pertama yang ditampilkan.
                      </p>

                      {heroKulinerIds.length === 0 ? (
                        <p className="text-muted">
                          Belum ada kuliner yang dipilih.
                        </p>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {heroKulinerIds.map((id, index) => {
                            const kuliner = daftarKulinerHero.find(
                              (item) => item.id === id
                            );

                            if (!kuliner) return null;

                            return (
                              <div
                                key={id}
                                className="border rounded p-2 d-flex align-items-center gap-3"
                              >
                                <span className="fw-semibold">
                                  {index + 1}.
                                </span>

                                {kuliner.gambar && (
                                  <img
                                    src={kuliner.gambar}
                                    alt={kuliner.nama}
                                    style={{
                                      width: "65px",
                                      height: "50px",
                                      objectFit: "cover",
                                      borderRadius: "6px",
                                    }}
                                  />
                                )}

                                <div className="flex-grow-1">
                                  <div className="fw-semibold">
                                    {kuliner.nama}
                                  </div>
                                  <small className="text-muted">
                                    {kuliner.daerah}
                                  </small>
                                </div>

                                <div className="d-flex gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={index === 0}
                                    onClick={() =>
                                      pindahUrutanHero(index, -1)
                                    }
                                    title="Geser ke atas"
                                  >
                                    <i className="bx bx-up-arrow-alt" />
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={
                                      index === heroKulinerIds.length - 1
                                    }
                                    onClick={() =>
                                      pindahUrutanHero(index, 1)
                                    }
                                    title="Geser ke bawah"
                                  >
                                    <i className="bx bx-down-arrow-alt" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={simpanHero}
                          disabled={heroSaving || heroLoading}
                        >
                          {heroSaving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-save me-1" />
                              Simpan Hero Carousel
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {activeTab === "pesan" && (
              <section id="tab-pesan">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h4>Pesan Masuk</h4>
                    <p className="text-muted mb-0">
                      Daftar pesan dan pertanyaan dari pengunjung website.
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Tombol Muat Ulang */}
                    <button
                      type="button"
                      className="btn btn-outline-success"
                      onClick={() => void muatPesan()}
                      disabled={messageLoading}
                    >
                      <i className="bx bx-refresh me-1" />
                      Muat Ulang
                    </button>

                    {/* Tombol Jadikan Referensi FAQ */}
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={ jadikanReferensiFaq }
                      disabled={ selectedMessageIds.length === 0 || messageLoading }
                    >
                      <i className="bx bx-bookmark-plus me-1" />
                      Jadikan Referensi FAQ ({selectedMessageIds.length})
                    </button>
                  </div>
                </div>

                {messageError && (
                  <div className="alert alert-danger">{messageError}</div>
                )}

                {messageInfo && (
                  <div className="alert alert-success">{messageInfo}</div>
                )}

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
                        {messageLoading ? (
                          <BarisKosong
                            kolom={7}
                            ikon="bx-loader-circle"
                            pesan="Memuat pesan masuk..."
                          />
                        ) : messages.length === 0 ? (
                          <BarisKosong
                            kolom={7}
                            ikon="bx-envelope"
                            pesan="Belum ada pesan masuk."
                          />
                        ) : (
                          messages.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={selectedMessageIds.includes(item.id)}
                                  disabled={item.status !== "DIPROSES" || !!item.faqId || item.isFaqReference}
                                  onChange={() => togglePesanTerpilih(item.id)}
                                />
                              </td>
                              <td>{item.email}</td>
                              <td>{item.subjek}</td>
                              <td style={{ minWidth: 220, maxWidth: 350 }}>
                                <div style={{ whiteSpace: "pre-wrap" }}>
                                  {item.pesan}
                                </div>
                              </td>
                              <td>
                                {new Date(item.createdAt).toLocaleDateString("id-ID")}
                              </td>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={item.status}
                                  onChange={(e) =>
                                    void ubahStatusPesan(item.id, e.target.value)
                                  }
                                >
                                  <option value="BARU">Baru</option>
                                  <option value="DIPROSES">Diproses</option>
                                  <option value="SELESAI">Selesai</option>
                                </select>
                              </td>
                              <td>
                                {item.faq ? (
                                  <span className="badge bg-success">
                                    Referensi FAQ
                                  </span>
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
            )}

            {activeTab === "faq" && (
              <section id="tab-kelola-faq">
                <div className="mb-4">
                  <h4>Kelola FAQ</h4>
                  <p className="text-muted">
                    Kelola pertanyaan dan jawaban yang ditampilkan pada halaman FAQ.
                  </p>
                </div>

                {faqError && (
                  <div className="alert alert-danger">{faqError}</div>
                )}

                {faqInfo && (
                  <div className="alert alert-success">{faqInfo}</div>
                )}

                {/* Form Tambah FAQ */}
                <div className="box-tabel border rounded bg-white p-4 mb-4">
                  <h5>{editingFaq ? "Edit FAQ" : "Tambah FAQ Baru"}</h5>

                  <div className="mb-3">
                    <label className="form-label">Pertanyaan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={faqForm.pertanyaan}
                      onChange={(e) =>
                        setFaqForm({
                          ...faqForm,
                          pertanyaan: e.target.value,
                        })
                      }
                      placeholder="Masukkan pertanyaan FAQ"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Jawaban</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={faqForm.jawaban}
                      onChange={(e) =>
                        setFaqForm({
                          ...faqForm,
                          jawaban: e.target.value,
                        })
                      }
                      placeholder="Masukkan jawaban FAQ"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      value={faqForm.slug}
                      onChange={(e) =>
                        setFaqForm({
                          ...faqForm,
                          slug: e.target.value,
                        })
                      }
                      placeholder="Contoh: cara-menggunakan-website"
                    />
                    <small className="text-muted">
                      Gunakan huruf kecil dan tanda hubung.
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">
                      Referensi dari Pesan Masuk
                    </label>

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
                              checked={faqForm.messageIds.includes(pesan.id)}
                              onChange={() =>
                                setFaqForm((sebelumnya) => ({
                                  ...sebelumnya,
                                  messageIds: sebelumnya.messageIds.includes(pesan.id)
                                    ? sebelumnya.messageIds.filter(
                                        (id) => id !== pesan.id
                                      )
                                    : [...sebelumnya.messageIds, pesan.id],
                                }))
                              }
                            />

                            <label
                              className="form-check-label"
                              htmlFor={`referensi-${pesan.id}`}
                            >
                              <strong>{pesan.subjek}</strong>
                              <small className="d-block text-muted">
                                {pesan.email}
                              </small>
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
                    onClick={simpanFaq}
                    disabled={
                      faqLoading ||
                      !faqForm.pertanyaan.trim() ||
                      !faqForm.jawaban.trim() ||
                      !faqForm.slug.trim()
                    }
                  >
                    <i className="bx bx-save me-1" />
                    {faqLoading ? "Menyimpan..." 
                    : editingFaq 
                      ? "Simpan Perubahan"
                      : "Simpan FAQ"}
                  </button>

                  {editingFaq && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary ms-2"
                      onClick={() => {
                        setEditingFaq(null);
                        setFaqForm({
                          pertanyaan: "",
                          jawaban: "",
                          slug: "",
                          messageIds: [],
                        });
                        setFaqError("");
                        setFaqInfo("");
                      }}
                      disabled={faqLoading}
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                {/* Daftar FAQ */}
                <div className="box-tabel border rounded bg-white p-4">
                  <h5>Daftar FAQ</h5>

                  {faqLoading ? (
                    <p className="text-muted">Memuat data FAQ...</p>
                  ) : faqList.length === 0 ? (
                    <p className="text-muted">Belum ada FAQ.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: 50 }}>Urut</th>
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
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (!draggedFaqId || draggedFaqId === item.id) return;

                                const daftarBaru = [...faqList];
                                const indexAwal = daftarBaru.findIndex(
                                  (faq) => faq.id === draggedFaqId
                                );
                                const indexTujuan = daftarBaru.findIndex(
                                  (faq) => faq.id === item.id
                                );

                                if (indexAwal === -1 || indexTujuan === -1) return;

                                const [faqDipindahkan] = daftarBaru.splice(indexAwal, 1);
                                daftarBaru.splice(indexTujuan, 0, faqDipindahkan);

                                setFaqList(
                                  daftarBaru.map((faq, index) => ({
                                    ...faq,
                                    urutan: index + 1,
                                  }))
                                );

                                setDraggedFaqId(null);

                                void simpanUrutanFaq(daftarBaru.map((faq) => faq.id));
                              }}
                              onDragEnd={() => setDraggedFaqId(null)}
                              style={{
                                cursor: "grab",
                                opacity: draggedFaqId === item.id ? 0.4 : 1,
                              }}
                            >
                              <td>
                                <i className="bx bx-menu fs-4 text-muted" />
                              </td>
                              <td>{item.pertanyaan}</td>
                              <td>{item.slug}</td>
                              <td>{item.urutan}</td>
                              <td>
                                {item.messages?.length > 0 ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => setFaqReferenceOpen(item)}
                                  >
                                    <i className="bx bx-book-content me-1" />
                                    Lihat ({item.messages.length})
                                  </button>
                                ) : (
                                  <span className="text-muted small">
                                    Tidak ada referensi
                                  </span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    item.isActive ? "bg-success" : "bg-secondary"
                                  }`}
                                >
                                  {item.isActive ? "Aktif" : "Nonaktif"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => bukaEditFaq(item)}
                                  >
                                    <i className="bx bx-edit-alt me-1" />
                                    Edit
                                  </button>
                                  
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      item.isActive
                                        ? "btn-outline-secondary"
                                        : "btn-outline-success"
                                    } ms-1`}
                                    onClick={() => void toggleStatusFaq(item)}
                                    disabled={faqLoading}
                                  >
                                    {item.isActive ? "Nonaktifkan" : "Aktifkan"}
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => setFaqToDelete(item)}
                                    disabled={faqLoading}
                                  >
                                    <i className="bx bx-trash me-1" />
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
              </section>
            )}
          </main>
        </div>
      </div>

      {regionFormOpen && (
        <div
          className="modal-region-overlay"
          onClick={() => {
            setRegionFormOpen(false);
            setEditingRegion(null);
          }}
        >
          <div
            className="modal-region-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">
                  {editingRegion ? `Edit ${editingRegion.nama}` : "Tambah Daerah"}
                </h5>
                <p className="text-muted mb-0">
                  Atur deskripsi dan posisi pin wilayah.
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setRegionFormOpen(false);
                  setEditingRegion(null);
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nama Kabupaten/Kota</label>
              <input
                type="text"
                className="form-control"
                value={regionForm.nama}
                onChange={(event) =>
                  setRegionForm({
                    ...regionForm,
                    nama: event.target.value,
                  })
                }
                placeholder="Contoh: Kabupaten Bandung"
                disabled={!!editingRegion}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Deskripsi Wilayah</label>
              <textarea
                className="form-control"
                rows={3}
                value={regionForm.deskripsi}
                onChange={(event) =>
                  setRegionForm({
                    ...regionForm,
                    deskripsi: event.target.value,
                  })
                }
                placeholder="Masukkan deskripsi wilayah..."
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Posisi Pin pada Peta
              </label>

              <div
                className="peta-admin-picker"
                onClick={pilihPosisiRegion}
              >
                <Image
                  src="/images/homepage/peta-jabar.jpg"
                  alt="Peta Jawa Barat"
                  width={1200}
                  height={900}
                  className="peta-admin-image"
                />

                <div
                  className={`peta-pin-item ${
                    regionForm.nama.startsWith("Kota ")
                      ? "pin-kota-region"
                      : "pin-kabupaten-region"
                  }`}
                  style={{
                    left: `${regionForm.posisiX}%`,
                    top: `${regionForm.posisiY}%`,
                    pointerEvents: "none",
                  }}
                >
                  <button
                    type="button"
                    className="btn-pin"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <i className="bx bx-map-pin" />
                  </button>

                  <span className="pin-label">
                    {regionForm.nama || "Pilih daerah"}
                  </span>
                </div>
              </div>

              <small className="text-muted">
                Klik pada peta untuk menentukan posisi pin.
              </small>
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
                  onChange={(event) =>
                    setRegionForm({
                      ...regionForm,
                      posisiX: Number(event.target.value),
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
                  onChange={(event) =>
                    setRegionForm({
                      ...regionForm,
                      posisiY: Number(event.target.value),
                    })
                  }
                />
              </div>
            </div>

            {regionError && (
              <div className="alert alert-danger">{regionError}</div>
            )}

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
        </div>
      )}

      {faqToDelete && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
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
                <p>Apakah kamu yakin ingin menghapus FAQ ini?</p>
                <strong>{faqToDelete.pertanyaan}</strong>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setFaqToDelete(null)}
                  disabled={faqLoading}
                >
                  Batal
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    const berhasil = await hapusFaq(faqToDelete);
                    if (berhasil) {
                      setFaqToDelete(null);
                    }
                  }}
                  disabled={faqLoading}
                >
                  {faqLoading ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {faqReferenceOpen && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Referensi Pesan FAQ
                </h5>

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
                  <div
                    key={pesan.id}
                    className="border rounded p-3 mb-3"
                  >
                    <strong>{pesan.subjek}</strong>

                    <p className="text-muted small mb-2">
                      {pesan.email}
                    </p>

                    <p className="mb-2">{pesan.pesan}</p>

                    <span className="badge bg-success">
                      {pesan.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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