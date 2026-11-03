"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./tambah-kuliner.css";

/* =========================
   DATA OPSI
   ========================= */
const OPSI_KOTA = [
  { value: "kota-bandung", label: "Kota Bandung" },
  { value: "kota-cirebon", label: "Kota Cirebon" },
  { value: "kota-tasikmalaya", label: "Kota Tasikmalaya" },
  { value: "kota-bogor", label: "Kota Bogor" },
  { value: "kota-garut", label: "Kota Garut" },
  { value: "kota-sumedang", label: "Kota Sumedang" },
];

const OPSI_KABUPATEN = [
  { value: "kab-cirebon", label: "Kab. Cirebon" },
  { value: "kab-garut", label: "Kab. Garut" },
  { value: "kab-karawang", label: "Kab. Karawang" },
  { value: "kab-subang", label: "Kab. Subang" },
  { value: "kab-sumedang", label: "Kab. Sumedang" },
];

const OPSI_KATEGORI = [
  { id: "kat-makanan-utama", value: "Makanan", label: "Makanan", icon: "bx-bowl-rice", warna: "text-success" },
  { id: "kat-jajanan", value: "Jajanan", label: "Jajanan", icon: "bx-cookie", warna: "text-warning" },
  { id: "kat-minuman", value: "Minuman", label: "Minuman", icon: "bx-drink", warna: "text-info" },
  { id: "kat-oleh-oleh", value: "Oleh-Oleh Khas", label: "Oleh-Oleh Khas", icon: "bx-gift", warna: "text-danger" },
];

const OPSI_RASA = [
  { id: "rasa-gurih", value: "Gurih", label: "Gurih" },
  { id: "rasa-pedas", value: "Pedas", label: "Pedas" },
  { id: "rasa-manis", value: "Manis", label: "Manis" },
  { id: "rasa-asam", value: "Asam", label: "Asam Segar" },
  { id: "rasa-asin", value: "Asin", label: "Asin" },
  { id: "rasa-renyah", value: "Renyah", label: "Renyah / Crispy" },
  { id: "rasa-fermentasi", value: "Fermentasi", label: "Fermentasi" },
  { id: "rasa-hangat", value: "Hangat Rempah", label: "Hangat Rempah" },
];

/* Opsi bahan, dikelompokkan berdasarkan jenis gizinya */
const OPSI_KARBOHIDRAT = ["Nasi", "Mie", "Bihun", "Singkong", "Ketan", "Ubi"];
const OPSI_PROTEIN = ["Ayam", "Daging Sapi", "Telur", "Tahu", "Tempe"];
const OPSI_SERAT = ["Tauge", "Timun", "Sawi", "Kol"];

const FORMAT_FOTO = ["image/jpeg", "image/png", "image/webp"];
const MAKS_UKURAN_FOTO = 5 * 1024 * 1024;

const USULAN_KEY = "jelajahRasaUsulan";

/* =========================
   HELPER LOGIN
   (hanya satu definisi, di luar komponen)
   ========================= */
type UserAktif = { nama: string };

/* Baca user yang sedang login dari session server (cookie),
   sama seperti yang dipakai halaman login. */
async function ambilUserAktif(): Promise<UserAktif | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;

    const data = (await res.json().catch(() => ({}))) as {
      user?: { nama?: string } | null;
    };

    if (!data.user || !data.user.nama) return null;
    return { nama: data.user.nama };
  } catch {
    return null;
  }
}

/* Foto disimpan sebagai dataURL supaya bisa ditampilkan di halaman
   admin & profil tanpa server penyimpanan file. */
function bacaFoto(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/* Perkecil foto (maks 1000px) dan ubah ke JPEG supaya ringan dikirim ke server */
function kompresFoto(file: File, maxSisi = 1000, kualitas = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const skala = Math.min(1, maxSisi / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * skala);
      canvas.height = Math.round(img.height * skala);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", kualitas));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("");
    };
    img.src = url;
  });
}

function labelDaerah(value: string) {
  const semua = [...OPSI_KOTA, ...OPSI_KABUPATEN];
  return semua.find((o) => o.value === value)?.label ?? value;
}

/* =========================
   HELPER HARGA
   ========================= */
/* Hanya angka, boleh titik sebagai pemisah ribuan (mis. 13.000) */
const POLA_HARGA = /^\d+(\.\d{3})*$/;

function hargaValid(value: string) {
  const v = value.trim();
  return v === "" || POLA_HARGA.test(v);
}

function hargaKeAngka(value: string) {
  return Number(value.trim().replace(/\./g, ""));
}

function formatRupiah(angka: number) {
  return angka.toLocaleString("id-ID");
}

/* =========================
   HELPER BAHAN
   ========================= */
/* "Kentang, Wortel" -> ["Kentang", "Wortel"] (kosong & spasi dibuang) */
function pecahDaftar(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/* Gabungkan pilihan checkbox + isian "Lainnya" tanpa duplikat */
function gabungBahan(terpilih: string[], lain: string) {
  const hasil = [...terpilih];
  pecahDaftar(lain).forEach((item) => {
    const sudahAda = hasil.some((h) => h.toLowerCase() === item.toLowerCase());
    if (!sudahAda) hasil.push(item);
  });
  return hasil;
}

function buatId(prefix: string, value: string) {
  return `${prefix}-${value.toLowerCase().replace(/\s+/g, "-")}`;
}

/* =========================
   KOMPONEN KELOMPOK BAHAN
   ========================= */
type KelompokBahanProps = {
  judul: string;
  icon: string;
  prefix: string;
  opsi: string[];
  terpilih: string[];
  onToggle: (value: string) => void;
  lain: string;
  onLainChange: (value: string) => void;
  placeholderLain: string;
};

function KelompokBahan({
  judul,
  icon,
  prefix,
  opsi,
  terpilih,
  onToggle,
  lain,
  onLainChange,
  placeholderLain,
}: KelompokBahanProps) {
  return (
    <div className="mb-4">
      <label className="form-label small fw-semibold text-dark d-flex align-items-center gap-1 mb-2">
        <i className={`bx ${icon} text-success fs-5`}></i> {judul}
      </label>

      <div className="d-flex flex-wrap gap-2 mb-2">
        {opsi.map((nama) => {
          const id = buatId(prefix, nama);
          return (
            <span key={id} className="d-contents">
              <input
                type="checkbox"
                className="taste-pill-input"
                id={id}
                name={prefix}
                value={nama}
                checked={terpilih.includes(nama)}
                onChange={() => onToggle(nama)}
              />
              <label className="taste-pill-label" htmlFor={id}>
                <i className="bx bx-check-circle"></i> {nama}
              </label>
            </span>
          );
        })}
      </div>

      <input
        type="text"
        className="form-control form-control-sm"
        id={`${prefix}-lain`}
        name={`${prefix}-lain`}
        placeholder={placeholderLain}
        aria-label={`${judul} lainnya (opsional)`}
        value={lain}
        onChange={(e) => onLainChange(e.target.value)}
      />
      <div className="form-text small">Lainnya (opsional). Pisahkan dengan koma jika lebih dari satu.</div>
    </div>
  );
}

/* =========================
   HALAMAN
   ========================= */
export default function TambahKulinerPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [daerah, setDaerah] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [rasa, setRasa] = useState<string[]>([]);
  const [hargaMin, setHargaMin] = useState("");
  const [hargaMax, setHargaMax] = useState("");

  /* Bahan: karbohidrat, protein, serat (checkbox + "lainnya"), dan pelengkap */
  const [karbo, setKarbo] = useState<string[]>([]);
  const [karboLain, setKarboLain] = useState("");
  const [protein, setProtein] = useState<string[]>([]);
  const [proteinLain, setProteinLain] = useState("");
  const [serat, setSerat] = useState<string[]>([]);
  const [seratLain, setSeratLain] = useState("");
  const [pelengkap, setPelengkap] = useState("");

  const [foto, setFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fotoError, setFotoError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [sudahSubmit, setSudahSubmit] = useState(false);
  const [tampilModal, setTampilModal] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* Handler foto */
  const prosesFile = (file?: File) => {
    if (!file) return;
    if (!FORMAT_FOTO.includes(file.type)) {
      setFotoError("Format foto harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAKS_UKURAN_FOTO) {
      setFotoError("Ukuran foto maksimal 5MB.");
      return;
    }
    setFotoError("");
    setFoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const hapusFoto = () => {
    setFoto(null);
    setPreviewUrl("");
    setFotoError("");
    if (inputFotoRef.current) inputFotoRef.current.value = "";
  };

  /* Handler checkbox */
  const toggleItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) => {
    setter((lama) => (lama.includes(value) ? lama.filter((v) => v !== value) : [...lama, value]));
  };

  /* Validasi harga */
  const minFormatSalah = !hargaValid(hargaMin);
  const maxFormatSalah = !hargaValid(hargaMax);
  const rentangSalah =
    !minFormatSalah &&
    !maxFormatSalah &&
    hargaMin.trim() !== "" &&
    hargaMax.trim() !== "" &&
    hargaKeAngka(hargaMin) > hargaKeAngka(hargaMax);

  let pesanHarga = "";
  if (minFormatSalah || maxFormatSalah) {
    pesanHarga = "Tolong masukkan harga dalam bentuk angka saja (contoh: 15000 atau 15.000).";
  } else if (rentangSalah) {
    pesanHarga = "Harga minimal tidak boleh lebih besar dari harga maksimal.";
  }

  /* Validasi form (bahan bersifat opsional, jadi tidak masuk validasi) */
  const error = {
    nama: nama.trim() === "",
    daerah: daerah === "",
    kategori: kategori === "",
    deskripsi: deskripsi.trim() === "",
    foto: foto === null || fotoError !== "",
    harga: pesanHarga !== "",
  };
  const formValid = !Object.values(error).some(Boolean);

  /* Reset form */
  const resetForm = () => {
    setNama("");
    setDaerah("");
    setKategori("");
    setDeskripsi("");
    setRasa([]);
    setHargaMin("");
    setHargaMax("");
    setKarbo([]);
    setKarboLain("");
    setProtein([]);
    setProteinLain("");
    setSerat([]);
    setSeratLain("");
    setPelengkap("");
    hapusFoto();
    setSudahSubmit(false);
  };

  /* Gabungkan harga min & max jadi 1 string untuk disimpan */
  const susunHarga = () => {
    const min = hargaMin.trim();
    const max = hargaMax.trim();
    if (min && max) return `${formatRupiah(hargaKeAngka(min))} - ${formatRupiah(hargaKeAngka(max))}`;
    if (min) return formatRupiah(hargaKeAngka(min));
    if (max) return formatRupiah(hargaKeAngka(max));
    return "";
  };

  /* Submit */
  const [mengirim, setMengirim] = useState(false); // tambahkan bersama state lain di atas

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSudahSubmit(true);
    if (!formValid || mengirim) return;

    /* Cek login lewat session server (cookie) */
    const user = await ambilUserAktif();
    if (!user) {
      alert("Kamu harus login dulu sebelum mengirim rekomendasi kuliner.");
      router.push("/login");
      return;
    }

    setMengirim(true);
    try {
      const gambar = foto ? await kompresFoto(foto) : "";

      const daftarKarbo = gabungBahan(karbo, karboLain);
      const daftarProtein = gabungBahan(protein, proteinLain);
      const daftarSerat = gabungBahan(serat, seratLain);
      const daftarPelengkap = pecahDaftar(pelengkap);

      const bahan = [...daftarKarbo, ...daftarProtein, ...daftarSerat, ...daftarPelengkap].join(", ");

      const res = await fetch("/api/kuliner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          deskripsi: deskripsi.trim(),
          kategori,                       // "Makanan" | "Jajanan" | "Minuman" | "Oleh-Oleh Khas"
          daerah: labelDaerah(daerah),    // "Kota Sumedang", dst.
          bahan,
          rasa: rasa.join(", "),
          gambar,
          hargaMin: hargaMin.trim() ? hargaKeAngka(hargaMin) : undefined,
          hargaMax: hargaMax.trim() ? hargaKeAngka(hargaMax) : undefined,
        }),
      });

      const hasil = await res.json().catch(() => ({}));

      if (res.status === 401) {
        alert("Sesi login habis. Silakan login lagi.");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        console.error("Gagal kirim kuliner:", hasil);
        const detail = hasil.detail
          ? Object.entries(hasil.detail)
              .map(([field, pesan]) => `${field}: ${(pesan as string[]).join(", ")}`)
              .join("\n")
          : "";
        alert(`${hasil.error || "Gagal mengirim rekomendasi."}${detail ? "\n" + detail : ""}`);
        return;
      }

      setTampilModal(true); // hanya muncul jika API benar-benar sukses
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setMengirim(false);
    }
  };
    
  const tambahLagi = () => {
    setTampilModal(false);
    resetForm();
  };

  return (
    <main id="main-content" className="tambah-kuliner-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav id="breadcrumb-nav" className="mb-3">
          <ol className="breadcrumb breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/" className="nav-home-link">
                <i className="bx bx-home-alt me-1"></i>Beranda
              </Link>
            </li>
            <li className="breadcrumb-item active">Tambah Kuliner</li>
          </ol>
        </nav>

        {/* Header halaman */}
        <div id="catalog-header" className="mb-4 page-header-wrapper">
          <h4 className="mb-1 page-title">Tambah Kuliner Baru</h4>
          <p className="page-subtitle">
            Bagikan rekomendasi hidangan otentik daerahmu untuk melengkapi peta rasa Jawa Barat.
          </p>
        </div>

        {/* Form utama */}
        <form id="form-tambah-kuliner" onSubmit={handleSubmit} noValidate>
          <div className="row g-4">
            <div className="col-lg-7">
              {/* Card 1: Informasi Utama */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bx bx-info-circle text-success fs-4"></i> Informasi Utama
                  </h5>
                </div>
                <div className="card-body p-4">
                  {/* Nama */}
                  <div className="mb-3">
                    <label htmlFor="nama-kuliner" className="form-label small fw-semibold text-dark">
                      Nama Kuliner <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${sudahSubmit && error.nama ? "is-invalid" : ""}`}
                      id="nama-kuliner"
                      name="nama-kuliner"
                      placeholder="Contoh: Nasi Tutug Oncom, Es Goyobod"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                    />
                    <div className="invalid-feedback">Mohon masukkan nama kuliner.</div>
                  </div>

                  {/* Asal daerah */}
                  <div className="mb-3">
                    <label htmlFor="asal-daerah" className="form-label small fw-semibold text-dark">
                      Asal Daerah (Kota/Kabupaten) <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${sudahSubmit && error.daerah ? "is-invalid" : ""}`}
                      id="asal-daerah"
                      name="asal-daerah"
                      value={daerah}
                      onChange={(e) => setDaerah(e.target.value)}
                    >
                      <option value="" disabled>
                        -- Pilih 1 dari 11 Daerah --
                      </option>
                      <optgroup label="Kota (6)">
                        {OPSI_KOTA.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Kabupaten (5)">
                        {OPSI_KABUPATEN.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="invalid-feedback">Mohon pilih asal daerah kuliner.</div>
                  </div>

                  {/* Kategori */}
                  <div className="mb-0">
                    <label className="form-label small fw-semibold text-dark d-block">
                      Kategori Kuliner <span className="text-danger">*</span>
                    </label>
                    <div className="row g-2">
                      {OPSI_KATEGORI.map((k) => (
                        <div className="col-6 col-sm-3" key={k.id}>
                          <input
                            type="radio"
                            className="category-radio"
                            name="kategori-kuliner"
                            id={k.id}
                            value={k.value}
                            checked={kategori === k.value}
                            onChange={() => setKategori(k.value)}
                          />
                          <label
                            className="category-card h-100 d-flex flex-column align-items-center justify-content-center"
                            htmlFor={k.id}
                          >
                            <i className={`bx ${k.icon} ${k.warna} fs-3 mb-1`}></i>
                            <span className="small fw-semibold">{k.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div
                      className={`invalid-feedback text-start feedback-kategori ${
                        sudahSubmit && error.kategori ? "show" : ""
                      }`}
                    >
                      Mohon pilih salah satu kategori.
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Detail & Karakteristik */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bx bx-detail text-success fs-4"></i> Detail &amp; Karakteristik Rasa
                  </h5>
                </div>
                <div className="card-body p-4">
                  {/* Deskripsi */}
                  <div className="mb-3">
                    <label htmlFor="deskripsi" className="form-label small fw-semibold text-dark">
                      Deskripsi Singkat <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${sudahSubmit && error.deskripsi ? "is-invalid" : ""}`}
                      id="deskripsi"
                      name="deskripsi"
                      rows={3}
                      placeholder="Ceritakan keunikan rasa, kebiasaan penyajian secara singkat..."
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                    ></textarea>
                    <div className="invalid-feedback">Mohon tuliskan deskripsi singkat kuliner.</div>
                  </div>

                  {/* Bahan */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark d-block">Bahan</label>
                    <div className="form-text small mt-0 mb-3">
                      Pilih bahan yang ada di kuliner ini. Jika tidak ada di pilihan, tulis di kolom &ldquo;Lainnya&rdquo;.
                    </div>

                    <KelompokBahan
                      judul="Karbohidrat"
                      icon="bx-bowl-hot"
                      prefix="karbohidrat"
                      opsi={OPSI_KARBOHIDRAT}
                      terpilih={karbo}
                      onToggle={toggleItem(setKarbo)}
                      lain={karboLain}
                      onLainChange={setKarboLain}
                      placeholderLain="Karbohidrat lain, misal: Jagung, Talas"
                    />

                    <KelompokBahan
                      judul="Protein"
                      icon="bx-food-menu"
                      prefix="protein"
                      opsi={OPSI_PROTEIN}
                      terpilih={protein}
                      onToggle={toggleItem(setProtein)}
                      lain={proteinLain}
                      onLainChange={setProteinLain}
                      placeholderLain="Protein lain, misal: Ikan asin, Oncom"
                    />

                    <KelompokBahan
                      judul="Serat"
                      icon="bx-leaf"
                      prefix="serat"
                      opsi={OPSI_SERAT}
                      terpilih={serat}
                      onToggle={toggleItem(setSerat)}
                      lain={seratLain}
                      onLainChange={setSeratLain}
                      placeholderLain="Serat lain, misal: Kemangi, Kangkung"
                    />

                    {/* Pelengkap */}
                    <div className="mb-0">
                      <label
                        htmlFor="pelengkap"
                        className="form-label small fw-semibold text-dark d-flex align-items-center gap-1 mb-2"
                      >
                        <i className="bx bx-dish text-success fs-5"></i> Pelengkap
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="pelengkap"
                        name="pelengkap"
                        placeholder="Misal: Bumbu kacang, Sambal, Kerupuk"
                        value={pelengkap}
                        onChange={(e) => setPelengkap(e.target.value)}
                      />
                      <div className="form-text small">
                        Menu pendamping atau bumbu yang menyertai hidangan (opsional). Pisahkan dengan koma.
                      </div>
                    </div>
                  </div>

                  {/* Karakter rasa */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark d-block">
                      Karakter Rasa Utama (Pilih 1 atau lebih)
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {OPSI_RASA.map((r) => (
                        <span key={r.id} className="d-contents">
                          <input
                            type="checkbox"
                            className="taste-pill-input"
                            id={r.id}
                            name="karakter-rasa"
                            value={r.value}
                            checked={rasa.includes(r.value)}
                            onChange={() => toggleItem(setRasa)(r.value)}
                          />
                          <label className="taste-pill-label" htmlFor={r.id}>
                            <i className="bx bx-check-circle"></i> {r.label}
                          </label>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Estimasi harga (min - max) */}
                  <div className="mb-0">
                    <label htmlFor="harga-min" className="form-label small fw-semibold text-dark">
                      Estimasi Harga Per Porsi / Kemasan
                    </label>

                    <div className="d-flex align-items-center gap-2">
                      {/* Harga minimal */}
                      <div className="input-group flex-grow-1">
                        <span className="input-group-text bg-light text-muted border-end-0">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`form-control border-start-0 ${
                            minFormatSalah || rentangSalah ? "is-invalid" : ""
                          }`}
                          id="harga-min"
                          name="harga-min"
                          placeholder="Harga minimal"
                          aria-label="Harga minimal"
                          value={hargaMin}
                          onChange={(e) => setHargaMin(e.target.value)}
                        />
                      </div>

                      {/* Strip pemisah */}
                      <span className="fw-bold text-muted fs-5">&ndash;</span>

                      {/* Harga maksimal */}
                      <div className="input-group flex-grow-1">
                        <span className="input-group-text bg-light text-muted border-end-0">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`form-control border-start-0 ${
                            maxFormatSalah || rentangSalah ? "is-invalid" : ""
                          }`}
                          id="harga-max"
                          name="harga-max"
                          placeholder="Harga maksimal"
                          aria-label="Harga maksimal"
                          value={hargaMax}
                          onChange={(e) => setHargaMax(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Pesan error merah */}
                    {pesanHarga && (
                      <div className="invalid-feedback d-block" id="feedback-harga">
                        {pesanHarga}
                      </div>
                    )}

                    <div className="form-text small">
                      Tulis perkiraan kisaran harga pasaran lokal (angka saja, contoh: 15000 atau 15.000).
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              {/* Card 3: Upload foto */}
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bx bx-image-add text-success fs-4"></i>
                    <span>
                      Foto Kuliner <span className="text-danger">*</span>
                    </span>
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div
                    className={`upload-zone ${dragOver ? "dragover" : ""}`}
                    id="upload-zone"
                    onClick={() => !foto && inputFotoRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      prosesFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <input
                      type="file"
                      id="foto-kuliner"
                      name="foto-kuliner"
                      accept="image/jpeg,image/png,image/webp"
                      className="d-none"
                      ref={inputFotoRef}
                      onChange={(e) => prosesFile(e.target.files?.[0])}
                    />

                    {!foto ? (
                      <div id="upload-placeholder">
                        <i className="bx bx-cloud-upload text-success display-4 mb-2"></i>
                        <h6 className="fw-bold mb-1 text-dark">Klik atau Seret Foto ke Sini</h6>
                        <p className="text-muted small mb-0">Format: JPG, PNG, atau WEBP (Maks. 5MB)</p>
                      </div>
                    ) : (
                      <div id="preview-wrapper">
                        <div className="img-preview-container mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            id="image-preview"
                            src={previewUrl}
                            alt="Preview Foto"
                            className="img-preview img-fluid shadow-sm"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            id="btn-hapus-foto"
                            className="btn btn-sm btn-outline-danger mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              hapusFoto();
                            }}
                          >
                            <i className="bx bx-trash me-1"></i>Ganti Foto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className={`invalid-feedback feedback-kategori ${
                      fotoError || (sudahSubmit && error.foto) ? "show" : ""
                    }`}
                    id="feedback-foto"
                  >
                    {fotoError || "Mohon unggah foto kuliner."}
                  </div>
                </div>
              </div>

              {/* Submit & Batal */}
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                <button
                  type="submit"
                  id="btn-submit-kuliner"
                  className="btn btn-success btn-lg fw-bold w-100 mb-2 py-2 fs-6 shadow-sm"
                  disabled={mengirim}
                >
                  <i className="bx bx-send me-1"></i> {mengirim ? "Mengirim..." : "Kirim Rekomendasi"}
                </button>
                <Link
                  href="/daftar-kuliner"
                  id="btn-batal"
                  className="btn btn-link text-muted text-decoration-none small"
                >
                  Batal &amp; Kembali
                </Link>
              </div>
            </div>
          </div>
        </form>

        {/* Modal sukses (dikontrol state, tanpa Bootstrap JS) */}
        {tampilModal && (
          <>
            <div className="modal fade show d-block" id="modal-sukses" tabIndex={-1} role="dialog" aria-modal="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow">
                  <div className="modal-body text-center p-4">
                    <div className="my-3">
                      <i className="bx bx-check-circle text-success display-1"></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-2">Terima Kasih!</h4>
                    <p className="text-muted small mb-4">
                      Rekomendasi kuliner Anda telah berhasil terkirim dan akan diverifikasi oleh tim penjelajah rasa.
                    </p>
                    <div className="d-flex justify-content-center gap-2">
                      <Link href="/daftar-kuliner" id="btn-ke-daftar-kuliner" className="btn btn-success px-4">
                        Lihat Daftar Kuliner
                      </Link>
                      <button
                        type="button"
                        id="btn-tambah-lagi"
                        className="btn btn-light border px-4"
                        onClick={tambahLagi}
                      >
                        Tambah Lagi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </div>
    </main>
  );
}