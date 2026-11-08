"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "./daftar-kuliner.css";

/* =========================
   TIPE DATA
   ========================= */
type Kuliner = {
  id: string;
  nama: string;
  kota: string;
  kategori: "makanan" | "jajanan" | "minuman" | "oleh-oleh";
  kategoriLabel: string;
  harga: "murah" | "sedang" | "tinggi"; 
  rasa: string;
  asal: string;
  gambar: string;
  deskripsi: string;
  bahan: string;
  karakterRasa: string;
  estimasiHarga: string;
};

type FilterState = {
  kota: string[];
  kategori: string[];
  harga: string[];
  rasa: string[];
};

const FILTER_KOSONG: FilterState = { kota: [], kategori: [], harga: [], rasa: [] };

/* =========================
   DATA KULINER
   ========================= */
const DATA_KULINER: Kuliner[] = [
  {
    id: "empal-gentong",
    nama: "Empal Gentong",
    kota: "cirebon",
    kategori: "makanan",
    kategoriLabel: "Makanan Utama",
    harga: "sedang",
    rasa: "gurih",
    asal: "Kab. Cirebon",
    gambar: "/images/menu/makanan/empal gentong.jpg",
    deskripsi: "Gulai daging sapi dimasak dalam gentong tanah liat berkuah santan gurih.",
    bahan: "Daging Sapi, Jeroan, Santan, Bumbu Rempah Kuning, Daun Kucai.",
    karakterRasa: "Gurih Santan, Rempah Harum, Daging Empuk.",
    estimasiHarga: "Rp 25.000 - Rp 45.000 / porsi",
  },
  {
    id: "nasi-tutug-oncom",
    nama: "Nasi Tutug Oncom",
    kota: "tasikmalaya",
    kategori: "makanan",
    kategoriLabel: "Makanan Utama",
    harga: "murah",
    rasa: "gurih",
    asal: "Kota Tasikmalaya",
    gambar: "/images/menu/makanan/nasi tutug oncom.jpg",
    deskripsi: "Nasi hangat yang ditumbuk bersama oncom goreng gurih bumbu kencur dan bawang.",
    bahan: "Nasi, Oncom, Bumbu kencur, Bawang Merah, Sambal.",
    karakterRasa: "Gurih, Harum Kencur, Pedas.",
    estimasiHarga: "Rp 15.000 - Rp 30.000 / porsi",
  },
  {
    id: "karedok",
    nama: "Karedok",
    kota: "sumedang",
    kategori: "makanan",
    kategoriLabel: "Makanan Utama",
    harga: "murah",
    rasa: "gurih",
    asal: "Kab. Sumedang",
    gambar: "/images/menu/makanan/karedok.jpg",
    deskripsi:
      "Karedok adalah makanan tradisional khas Sunda, yang terbuat dari campuran sayuran mentah segar dan disiram dengan bumbu kacang gurih.",
    bahan: "Kacang Panjang, Timun, Tauge, Kol, Daun Kemangi, Terong Bulat, Bumbu Kacang, Kencur.",
    karakterRasa: "Segar, Gurih, Manis, Pedas.",
    estimasiHarga: "Rp 12.000 - Rp 42.000 / porsi",
  },
  {
    id: "burayot",
    nama: "Burayot",
    kota: "garut",
    kategori: "jajanan",
    kategoriLabel: "Jajanan",
    harga: "sedang",
    rasa: "manis",
    asal: "Kab. Garut",
    gambar: "/images/menu/jajanan/burayot.jpg",
    deskripsi:
      "Jajanan khas Sunda yang berasal dari Garut, jajanan pasar ini terkenal karena memiliki bentuk unik dan cita rasa manis legit yang khas.",
    bahan: "Tepung Beras, Gula Merah, Minyak Kelapa.",
    karakterRasa: "Manis Legit, Gurih.",
    estimasiHarga: "Rp 15.000 - Rp 50.000 / porsi",
  },
  {
    id: "batagor",
    nama: "Batagor",
    kota: "bandung",
    kategori: "jajanan",
    kategoriLabel: "Jajanan",
    harga: "murah",
    rasa: "gurih",
    asal: "Kota Bandung",
    gambar: "/images/menu/jajanan/batagor.jpg",
    deskripsi:
      "Bakso tahu goreng berbahan dasar adonan ikan tenggiri yang disiram kuah kacang gurih dan perasan jeruk purut.",
    bahan: "Tahu, Ikan Tenggiri, Tepung Tapioka, Bumbu Kacang, Jeruk Purut.",
    karakterRasa: "Gurih, Renyah, Manis Pedas Bumbu Kacang",
    estimasiHarga: "Rp 10.000 - Rp 25.000 / porsi",
  },
  {
    id: "jalabia",
    nama: "Jalabia",
    kota: "bekasi",
    kategori: "jajanan",
    kategoriLabel: "Jajanan",
    harga: "murah",
    rasa: "manis",
    asal: "Kab. Bekasi",
    gambar: "/images/menu/jajanan/jalabia.jpg",
    deskripsi:
      "Kue ini memiliki bentuk yang menyerupai donat kecil, namun memiliki karakteristik tekstur dan rasa yang sangat berbeda dengan donat modern.",
    bahan: "Tepung Ketan, Kelapa Parut, Santan, Garam.",
    karakterRasa: "Manis, Gurih, Legit.",
    estimasiHarga: "Rp 2.000 - Rp 2.500 / buah",
  },
  {
    id: "bandrek",
    nama: "Bandrek",
    kota: "bandung",
    kategori: "minuman",
    kategoriLabel: "Minuman",
    harga: "sedang",
    rasa: "manis pedas",
    asal: "Kota Bandung",
    gambar: "/images/menu/minuman/bandrek.jpg",
    deskripsi:
      "Minuman tradisional yang terbuat dari perpaduan jahe bakar, gula aren, dan berbagai rempah alami yang disajikan hangat.",
    bahan: "Jahe Bakar, Gula Aren, Rempah Alami.",
    karakterRasa: "Pedas & Hangat, Manis, Aroma Rempah.",
    estimasiHarga: "Rp 5.000 - Rp 12.000 / gelas",
  },
  {
    id: "es-cuing",
    nama: "Es Cuing",
    kota: "cirebon",
    kategori: "minuman",
    kategoriLabel: "Minuman",
    harga: "murah",
    rasa: "segar",
    asal: "Kota Cirebon",
    gambar: "/images/menu/minuman/es cuing.jpg",
    deskripsi: "Es Cuing adalah minuman segar khas Cirebon yang mirip dengan es cincau.",
    bahan: "Jeli Cuing, Kuah Santan, Pemanis.",
    karakterRasa: "Gurih, Manis, Segar.",
    estimasiHarga: "Rp 5.000 - Rp 9.000 / gelas",
  },
  {
    id: "es-goyobod",
    nama: "Es Goyobod",
    kota: "garut",
    kategori: "minuman",
    kategoriLabel: "Minuman",
    harga: "murah",
    rasa: "manis",
    asal: "Kota Garut",
    gambar: "/images/menu/minuman/es goyobod.jpg",
    deskripsi:
      "Minuman es tradisional khas Sunda berbasis santan dengan potongan hunkwe (tepung arenga), alpukat, kelapa muda, dan roti tawar.",
    bahan: "Tepung Hunkwe, Santan, Sirup Merah, Alpukat, Kelapa Muda, Roti Tawar.",
    karakterRasa: "Manis, Gurih Santan, Segar.",
    estimasiHarga: "Rp 8.000 - Rp 15.000 / gelas",
  },
  {
    id: "tahu-sumedang",
    nama: "Tahu Sumedang",
    kota: "sumedang",
    kategori: "oleh-oleh",
    kategoriLabel: "Oleh-Oleh Khas",
    harga: "sedang",
    rasa: "asin gurih",
    asal: "Kota Sumedang",
    gambar: "/images/menu/jajanan/tahu sumedang.jpg",
    deskripsi:
      "Tahu goreng khas Sumedang yang renyah dan gurih di luar namun sangat lembut di dalam, nikmat disajikan hangat bersama cabai rawit.",
    bahan: "Kedelai, Garam, Bumbu Tradisional, Cabai Rawit.",
    karakterRasa: "Gurih, Renyah di Luar, Lembut di Dalam.",
    estimasiHarga: "Rp 10.000 - Rp 20.000 / keranjang",
  },
  {
    id: "ali-agrem",
    nama: "Ali Agrem",
    kota: "karawang",
    kategori: "oleh-oleh",
    kategoriLabel: "Oleh-Oleh Khas",
    harga: "murah",
    rasa: "manis",
    asal: "Kab. Karawang",
    gambar: "/images/menu/oleh-oleh khas/ali agrem.jpg",
    deskripsi:
      "Ali Agrem biasa dikenal juga sebagai kue cincin adalah makanan tradisional yang berbentuk seperti donat, namun teksturnya lebih padat.",
    bahan: "Tepung Beras, Gula Merah, Gula Pasir, Minyak Goreng, Air",
    karakterRasa: "Padat, Manis, Legit.",
    estimasiHarga: "Rp 1.000 - Rp 1.500 / buah",
  },
  {
    id: "papais",
    nama: "Papais",
    kota: "subang",
    kategori: "oleh-oleh",
    kategoriLabel: "Oleh-Oleh Khas",
    harga: "murah",
    rasa: "manis",
    asal: "Kab. Subang",
    gambar: "/images/menu/oleh-oleh khas/papais.jpg",
    deskripsi:
      "Kue basah tradisional yang bertekstur lembut dan kenyal, dengan cita rasa manis legit atau gurih.",
    bahan: "Tepung Beras, Tepung Ketan, Santan, Pisang.",
    karakterRasa: "Manis, Lembut, Kenyal.",
    estimasiHarga: "Rp 25.000 - Rp 30.000 / porsi",
  },
];

/* =========================
   FILTER KOTA & KABUPATEN
   ========================= */

const OPSI_KOTA = [
  { key: "kota-bandung", label: "Kota Bandung", kota: "bandung" },
  { key: "kota-cirebon", label: "Kota Cirebon", kota: "cirebon" },
  { key: "kab-cirebon", label: "Kab. Cirebon", kota: "cirebon" },
  { key: "kota-tasikmalaya", label: "Kota Tasikmalaya", kota: "tasikmalaya" },
  { key: "kota-bogor", label: "Kota Bogor", kota: "bogor" },
  { key: "kota-garut", label: "Kota Garut", kota: "garut" },
  { key: "kab-garut", label: "Kab. Garut", kota: "garut" },
  { key: "kab-karawang", label: "Kab. Karawang", kota: "karawang" },
  { key: "kab-subang", label: "Kab. Subang", kota: "subang" },
  { key: "kota-sumedang", label: "Kota Sumedang", kota: "sumedang" },
  { key: "kab-sumedang", label: "Kab. Sumedang", kota: "sumedang" },
];

const OPSI_KATEGORI = [
  { value: "makanan", label: "Makanan" },
  { value: "jajanan", label: "Jajanan" },
  { value: "minuman", label: "Minuman" },
  { value: "oleh-oleh", label: "Oleh-oleh Khas" },
];

const OPSI_HARGA = [
  { value: "murah", label: "< Rp 15.000" },
  { value: "sedang", label: "Rp 15.000 - 30.000" },
  { value: "tinggi", label: "> Rp 30.000" },
];

const OPSI_RASA = [
  { value: "gurih", label: "Gurih / Asin" },
  { value: "pedas", label: "Pedas" },
  { value: "manis", label: "Manis" },
  { value: "segar", label: "Segar / Asam" },
];

/* =========================
   CARD KULINER
   ========================= */
type KartuProps = {
  item: Kuliner;
  disukai: boolean;
  onLike: (id: string) => void;
  onShare: (item: Kuliner) => void;
};

function KartuKuliner({ item, disukai, onLike, onShare }: KartuProps) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <div className="col-12 col-md-6 col-lg-4 catalog-col">
      <div
        id={`item-${item.id}`}
        className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden catalog-card"
        data-city={item.kota}
        data-category={item.kategori}
        data-price={item.harga}
        data-taste={item.rasa}
      >
        {/* Gambar & tombol aksi */}
        <div className="position-relative card-media-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.gambar} alt={item.nama} className="card-img-top item-img" />
          <div className="item-actions position-absolute top-0 end-0 p-2 d-flex gap-2">
            <button
              type="button"
              className={`btn btn-light btn-sm rounded-circle shadow-sm btn-icon btn-like ${disukai ? "active" : ""}`}
              title="Tandai Suka"
              onClick={() => onLike(item.id)}
            >
              <i className={`bx ${disukai ? "bxs-heart" : "bx-heart"} fs-6`}></i>
            </button>
            <button
              type="button"
              className="btn btn-light btn-sm rounded-circle shadow-sm btn-icon btn-share"
              title="Bagikan Kuliner"
              onClick={() => onShare(item)}
            >
              <i className="bx bx-share-alt fs-6"></i>
            </button>
          </div>
        </div>

        {/* Isi card */}
        <div className="card-body d-flex flex-column item-content">
          <div className="mb-2 tag-wrapper">
            <span className="badge rounded-pill item-badge">
              {item.kategoriLabel} • {item.asal.replace(/^(Kota|Kab\.)\s/, "")}
            </span>
          </div>
          <h5 className="card-title fw-bold text-dark mb-1 item-title">{item.nama}</h5>
          <p className="card-text text-muted small mb-2 item-origin">
            <i className="bx bx-map-pin me-1"></i>Asal: {item.asal}
          </p>
          <p className="card-text text-secondary small mb-3 item-description">{item.deskripsi}</p>

          {/* Detail (collapse dikontrol React state, tanpa Bootstrap JS) */}
          <div className="mt-auto detail-toggle-wrapper">
            <button
              className="btn btn-outline-success btn-sm w-100 rounded-pill btn-toggle-detail d-flex align-items-center justify-content-center gap-1"
              type="button"
              aria-expanded={terbuka}
              aria-controls={`detail-${item.id}`}
              onClick={() => setTerbuka((v) => !v)}
            >
              <span>{terbuka ? "Tutup Detail" : "Lihat Detail"}</span>{" "}
              <i className="bx bx-chevron-down"></i>
            </button>

            <div
              id={`detail-${item.id}`}
              className={`collapse mt-3 detail-info-box bg-light p-3 rounded-3 border ${terbuka ? "show" : ""}`}
            >
              <p className="small mb-1">
                <strong>Bahan utama:</strong> {item.bahan}
              </p>
              <p className="small mb-1">
                <strong>Karakter Rasa:</strong> {item.karakterRasa}
              </p>
              <p className="small mb-0 text-success fw-bold price-range">
                <strong>Estimasi Harga:</strong> {item.estimasiHarga}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   KONTEN HALAMAN
   ========================= */
function DaftarKulinerContent() {
  const searchParams = useSearchParams();
  const kataKunciUrl = searchParams.get("search") ?? "";

  const [kataKunci, setKataKunci] = useState(kataKunciUrl);
  const [kataKunciUrlSebelumnya, setKataKunciUrlSebelumnya] = useState(kataKunciUrl);
  const [filter, setFilter] = useState<FilterState>(FILTER_KOSONG);
  const [favorit, setFavorit] = useState<string[]>([]);

  const refKota = useRef<HTMLSelectElement>(null);
  const refKategori = useRef<HTMLSelectElement>(null);
  const refHarga = useRef<HTMLSelectElement>(null);
  const refRasa = useRef<HTMLSelectElement>(null);

  if (kataKunciUrl !== kataKunciUrlSebelumnya) {
    setKataKunciUrlSebelumnya(kataKunciUrl);
    setKataKunci(kataKunciUrl);
  }

  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem("favorit");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (tersimpan) setFavorit(JSON.parse(tersimpan));
    } catch {
      /* abaikan */
    }
  }, []);

  const ambilNilai = (el: HTMLSelectElement | null) =>
    el ? Array.from(el.selectedOptions).map((o) => o.dataset.value ?? o.value) : [];

  const terapkanFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilter({
      kota: ambilNilai(refKota.current),
      kategori: ambilNilai(refKategori.current),
      harga: ambilNilai(refHarga.current),
      rasa: ambilNilai(refRasa.current),
    });
  };

  const bersihkanFilter = () => {
    [refKota, refKategori, refHarga, refRasa].forEach((r) => {
      if (r.current) Array.from(r.current.options).forEach((o) => (o.selected = false));
    });
    setFilter(FILTER_KOSONG);
    setKataKunci("");
  };

  const toggleLike = (id: string) => {
    setFavorit((lama) => {
      const baru = lama.includes(id) ? lama.filter((x) => x !== id) : [...lama, id];
      try {
        localStorage.setItem("favorit", JSON.stringify(baru));
      } catch {
        /* abaikan */
      }
      return baru;
    });
  };

  const bagikan = async (item: Kuliner) => {
    const url = `${window.location.origin}/daftar-kuliner#item-${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.nama, text: item.deskripsi, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Tautan kuliner berhasil disalin!");
      }
    } catch {
      /* pengguna membatalkan share */
    }
  };

  const kataKunciKecil = kataKunci.trim().toLowerCase();
  const hasil = DATA_KULINER.filter((item) => {
    const cocokKota = filter.kota.length === 0 || filter.kota.includes(item.kota);
    const cocokKategori = filter.kategori.length === 0 || filter.kategori.includes(item.kategori);
    const cocokHarga = filter.harga.length === 0 || filter.harga.includes(item.harga);
    const cocokRasa =
      filter.rasa.length === 0 || item.rasa.split(" ").some((r) => filter.rasa.includes(r));
    const cocokCari =
      kataKunciKecil === "" ||
      `${item.nama} ${item.asal} ${item.kategoriLabel} ${item.kota}`.toLowerCase().includes(kataKunciKecil);
    return cocokKota && cocokKategori && cocokHarga && cocokRasa && cocokCari;
  });

  return (
    <main id="main-content" className="daftar-kuliner-page">
      <div className="container catalog-container">
        {/* Breadcrumb */}
        <nav id="breadcrumb-nav" className="mb-3">
          <ol className="breadcrumb breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/" className="nav-home-link">
                <i className="bx bx-home-alt me-1"></i>Beranda
              </Link>
            </li>
            <li className="breadcrumb-item active">Daftar Kuliner</li>
          </ol>
        </nav>

        {/* Header halaman */}
        <div id="catalog-header" className="mb-4 page-header-wrapper">
          <h4 className="mb-1 page-title">Eksplorasi Kuliner Jawa Barat</h4>
          <p className="page-subtitle">
            Temukan berbagai makanan, jajanan, minuman, dan oleh-oleh khas Jawa Barat bebas sesuai selera Anda.
          </p>
        </div>

        {/* Panel filter */}
        <div id="filter-card" className="card border-0 shadow-sm rounded-4 p-3 mb-4 filter-panel">
          <form id="culinary-search-form" onSubmit={terapkanFilter} className="filter-form">
            <p className="filter-hint text-muted small mb-2">*Tahan tombol Ctrl untuk memilih lebih dari satu.</p>
            <div className="row g-3 align-items-start filter-row">
              <div className="col-12 col-sm-6 col-md-3 filter-group region-filter-group">
                <label htmlFor="select-city" className="form-label small text-muted mb-1 fw-semibold filter-label">
                  <i className="bx bx-map me-1 text-success"></i>Kota / Daerah
                </label>
                <select
                  id="select-city"
                  ref={refKota}
                  className="form-select form-select-sm rounded-3 multi-select-box"
                  multiple
                  size={4}
                >
                  {OPSI_KOTA.map((o) => (
                    <option key={o.key} value={o.key} data-value={o.kota}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-md-3 filter-group category-filter-group">
                <label htmlFor="select-category" className="form-label small text-muted mb-1 fw-semibold filter-label">
                  <i className="bx bx-category me-1 text-success"></i>Kategori
                </label>
                <select
                  id="select-category"
                  ref={refKategori}
                  className="form-select form-select-sm rounded-3 multi-select-box"
                  multiple
                  size={4}
                >
                  {OPSI_KATEGORI.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-md-3 filter-group price-filter-group">
                <label htmlFor="select-price" className="form-label small text-muted mb-1 fw-semibold filter-label">
                  <i className="bx bx-money me-1 text-success"></i>Rentang Harga
                </label>
                <select
                  id="select-price"
                  ref={refHarga}
                  className="form-select form-select-sm rounded-3 multi-select-box"
                  multiple
                  size={4}
                >
                  {OPSI_HARGA.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-md-3 filter-group taste-filter-group">
                <label htmlFor="select-taste" className="form-label small text-muted mb-1 fw-semibold filter-label">
                  <i className="bx bx-cookie me-1 text-success"></i>Karakter Rasa
                </label>
                <select
                  id="select-taste"
                  ref={refRasa}
                  className="form-select form-select-sm rounded-3 multi-select-box"
                  multiple
                  size={4}
                >
                  {OPSI_RASA.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-submit-wrapper d-flex gap-2">
              <button
                id="btn-apply-filter"
                type="submit"
                className="btn btn-success btn-sm rounded-pill fw-semibold filter-submit-btn py-2"
              >
                <i className="bx bx-filter-alt me-1"></i> Terapkan Filter
              </button>
              <button
                id="btn-clear-filter"
                type="button"
                onClick={bersihkanFilter}
                className="btn btn-outline-success btn-sm rounded-pill fw-semibold filter-submit-btn py-2"
              >
                Clear Filter
              </button>
            </div>
          </form>
        </div>

        {/* Info hasil */}
        <p className="result-info">
          Menampilkan <strong>{hasil.length}</strong> dari {DATA_KULINER.length} kuliner
          {kataKunci && (
            <>
              {" "}
              untuk pencarian &quot;<strong>{kataKunci}</strong>&quot;
            </>
          )}
        </p>

        {/* Katalog */}
        <div id="culinary-catalog-grid" className="row g-4 catalog-grid">
          {hasil.length > 0 ? (
            hasil.map((item) => (
              <KartuKuliner
                key={item.id}
                item={item}
                disukai={favorit.includes(item.id)}
                onLike={toggleLike}
                onShare={bagikan}
              />
            ))
          ) : (
            <div className="col-12">
              <div className="empty-state">
                <i className="bx bx-search-alt"></i>
                <h6>Kuliner tidak ditemukan</h6>
                <p>Coba ubah filter atau kata kunci pencarianmu.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DaftarKulinerPage() {
  return (
    <Suspense fallback={null}>
      <DaftarKulinerContent />
    </Suspense>
  );
}
