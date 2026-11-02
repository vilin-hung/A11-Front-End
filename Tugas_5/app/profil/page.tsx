"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./profil.css";
import {
  LABEL_STATUS,
  WARNA_STATUS,
  type StatusKuliner,
} from "../data/status";

/* =========================
   TIPE DATA
   ========================= */
type User = {
  id: string;
  nama: string;
  email: string;
  kota: string | null;
  avatar: string | null;
  role: string;
};

type Kuliner = {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  daerah: string;
  bahan: string[];
  rasa: string[];
  gambar: string | null;
  hargaMin: number;
  hargaMax: number;
  status: string;
  catatanAdmin: string | null;
  createdAt: string;
};

type Notifikasi = {
  tipe: "sukses" | "error";
  judul: string;
  pesan: string;
  redirectLogin?: boolean;
};

type NotifikasiFoto = {
  tipe: "sukses" | "error";
  judul: string;
  pesan: string;
};

/* =========================
   DATA OPSI
   ========================= */
const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAFTAR_DAERAH = [
  "Kota Bandung",
  "Kota Cirebon",
  "Kota Tasikmalaya",
  "Kota Bogor",
  "Kota Garut",
  "Kota Sumedang",
  "Kab. Cirebon",
  "Kab. Garut",
  "Kab. Karawang",
  "Kab. Subang",
  "Kab. Sumedang",
];

const DAFTAR_KATEGORI = [
  "Makanan",
  "Jajanan",
  "Minuman",
  "Oleh-Oleh Khas",
];

const FORMAT_FOTO = ["image/jpeg", "image/png", "image/webp"];
const MAKS_UKURAN_FOTO = 5 * 1024 * 1024;

/* =========================
   BANTUAN TAMPILAN
   ========================= */
function formatTanggal(tanggal?: string) {
  if (!tanggal) return "-";

  const bagian = tanggal.slice(0, 10).split("-");
  if (bagian.length !== 3) return tanggal;

  return `${Number(bagian[2])} ${NAMA_BULAN[Number(bagian[1]) - 1]} ${bagian[0]}`;
}

function formatHarga(min: number, max: number) {
  if (!min && !max) return "";

  const angka = (nilai: number) => nilai.toLocaleString("id-ID");

  if (!max || min === max) return angka(min);

  return `${angka(min)} - ${angka(max)}`;
}

/* =========================
   BADGE STATUS
   ========================= */
function BadgeStatus({ status }: { status: StatusKuliner }) {
  return (
    <span className={`badge ${WARNA_STATUS[status] ?? "bg-secondary"}`}>
      {LABEL_STATUS[status] ?? status}
    </span>
  );
}

/* =========================
   HALAMAN
   ========================= */
export default function ProfilPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [siap, setSiap] = useState(false);
  const [kuliner, setKuliner] = useState<Kuliner[]>([]);
  const [jumlahFavorit, setJumlahFavorit] = useState(0);
  const [notifikasi, setNotifikasi] = useState<Notifikasi | null>(null);
  const [notifikasiFoto, setNotifikasiFoto] = useState<NotifikasiFoto | null>(null);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState<Kuliner | null>(null);
  const [sedangSimpan, setSedangSimpan] = useState(false);
  const inputAvatarRef = useRef<HTMLInputElement>(null);

  /* Form informasi personal */
  const [nama, setNama] = useState("");
  const [kota, setKota] = useState("");
  const [errorNama, setErrorNama] = useState("");
  const [errorKota, setErrorKota] = useState("");

  /* Modal edit kuliner */
  const [diedit, setDiedit] = useState<Kuliner | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editKategori, setEditKategori] = useState("");
  const [editDaerah, setEditDaerah] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [editBahan, setEditBahan] = useState("");
  const [editDeskripsi, setEditDeskripsi] = useState("");

  /* Tampilkan notifikasi dalam card */
  const tampilkanNotifikasi = (
    tipe: Notifikasi["tipe"],
    judul: string,
    pesan: string,
    redirectLogin = false
  ) => {
    setNotifikasi({
      tipe,
      judul,
      pesan,
      redirectLogin,
    });
  };

  /* Tutup notifikasi */
  const tutupNotifikasi = () => {
    const redirectLogin = notifikasi?.redirectLogin;

    setNotifikasi(null);

    if (redirectLogin) {
      router.refresh();
      router.push("/login");
    }
  };

  /* Ambil data saat halaman dibuka */
  useEffect(() => {
    let masihAktif = true;

    async function muatProfil() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message ?? "Gagal memuat data profil.");
        }

        if (!masihAktif) return;

        setUser(data.user);
        setNama(data.user.nama);
        setKota(data.user.kota ?? "");
        setKuliner(data.kuliner ?? []);
        setJumlahFavorit(data.jumlahFavorit ?? 0);
        setSiap(true);
      } catch {
        if (!masihAktif) return;

        tampilkanNotifikasi(
          "error",
          "Gagal Memuat Profil",
          "Data profil belum berhasil dimuat. Silakan kembali ke halaman masuk dan coba lagi.",
          true
        );
      }
    }

    void muatProfil();

    return () => {
      masihAktif = false;
    };
  }, [router]);

  /* Upload foto profil */
  const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!FORMAT_FOTO.includes(file.type)) {
      event.target.value = "";
      setNotifikasiFoto({
        tipe: "error",
        judul: "Format Foto Tidak Didukung",
        pesan: "Format foto harus JPG, PNG, atau WEBP.",
      });
      return;
    }

    if (file.size > MAKS_UKURAN_FOTO) {
      event.target.value = "";
      setNotifikasiFoto({
        tipe: "error",
        judul: "Ukuran Foto Terlalu Besar",
        pesan: "Ukuran foto maksimal 5MB. Silakan pilih foto yang lebih kecil.",
      });
      return;
    }

    setNotifikasiFoto(null);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const avatar = e.target?.result;

      if (typeof avatar !== "string" || !avatar) {
        setNotifikasiFoto({
          tipe: "error",
          judul: "Foto Gagal Dibaca",
          pesan: "Foto tidak dapat dibaca. Silakan coba pilih foto lain.",
        });
        return;
      }

      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setNotifikasiFoto({
            tipe: "error",
            judul: "Foto Gagal Disimpan",
            pesan: data.message ?? "Foto gagal diperbarui. Silakan coba lagi.",
          });
          return;
        }

        setUser(data.user);

        window.dispatchEvent(new Event("jelajahRasaUserUpdated"));

        setNotifikasiFoto({
          tipe: "sukses",
          judul: "Foto Profil Berhasil Diperbarui",
          pesan: "Foto baru kini digunakan pada profil Anda.",
        });
      } catch {
        setNotifikasiFoto({
          tipe: "error",
          judul: "Foto Gagal Disimpan",
          pesan: "Tidak dapat menghubungi server. Silakan coba lagi.",
        });
      }
    };

    reader.onerror = () => {
      setNotifikasiFoto({
        tipe: "error",
        judul: "Foto Gagal Dibaca",
        pesan: "Foto tidak dapat dibaca. Silakan coba pilih foto lain.",
      });
    };

    reader.readAsDataURL(file);
  };

  /* Tutup notifikasi foto dan buka kembali pemilih file */
  const uploadUlangFoto = () => {
    setNotifikasiFoto(null);

    if (inputAvatarRef.current) {
      inputAvatarRef.current.value = "";
      inputAvatarRef.current.click();
    }
  };

  /* Simpan perubahan profil */
  const simpanProfil = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const namaBaru = nama.trim();
    const kotaBaru = kota.trim();
    const namaAsli = user.nama.trim();
    const kotaAsli = (user.kota ?? "").trim();

    let valid = true;

    /* Validasi nama */
    if (!namaBaru) {
      setErrorNama("Nama lengkap wajib diisi.");
      valid = false;
    } else if (namaBaru.length < 4) {
      setErrorNama("Nama lengkap minimal 4 karakter.");
      valid = false;
    } else {
      setErrorNama("");
    }

    /* Validasi kota/kabupaten */
    if (!kotaBaru) {
      setErrorKota("Asal kota/kabupaten wajib diisi.");
      valid = false;
    } else {
      setErrorKota("");
    }

    /* Jangan simpan jika masih ada input yang tidak valid */
    if (!valid) return;

    /* Nama dan kota yang sama bukan perubahan */
    const namaBerubah = namaBaru !== namaAsli;
    const kotaBerubah = kotaBaru !== kotaAsli;

    if (!namaBerubah && !kotaBerubah) {
      return;
    }

    setSedangSimpan(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaBaru, kota: kotaBaru }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        tampilkanNotifikasi(
          "error",
          "Perubahan Gagal Disimpan",
          data.message ?? "Profil belum berhasil disimpan. Silakan coba lagi."
        );
        return;
      }

      setUser(data.user);
      setNama(data.user.nama);
      setKota(data.user.kota ?? "");

      window.dispatchEvent(new Event("jelajahRasaUserUpdated"));

      tampilkanNotifikasi(
        "sukses",
        "Profil Berhasil Diperbarui",
        "Nama atau informasi domisili kamu berhasil diperbarui."
      );
    } catch {
      tampilkanNotifikasi(
        "error",
        "Perubahan Gagal Disimpan",
        "Tidak dapat menghubungi server. Silakan coba lagi."
      );
    } finally {
      setSedangSimpan(false);
    }
  };

  /* Buka modal edit */
  const bukaEdit = (item: Kuliner) => {
    setDiedit(item);
    setEditNama(item.nama);
    setEditKategori(item.kategori);
    setEditDaerah(item.daerah);
    setEditHarga(formatHarga(item.hargaMin, item.hargaMax));
    setEditBahan(item.bahan.join(", "));
    setEditDeskripsi(item.deskripsi);
  };

  const tutupEdit = () => setDiedit(null);

  /* Simpan hasil edit */
  const simpanEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!diedit) return;

    if (!editNama.trim()) {
      tampilkanNotifikasi(
        "error",
        "Nama Kuliner Belum Diisi",
        "Silakan isi nama kuliner sebelum menyimpan perubahan."
      );
      return;
    }

    setSedangSimpan(true);

    try {
      const response = await fetch(`/api/profile/kuliner/${diedit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: editNama.trim(),
          kategori: editKategori,
          daerah: editDaerah,
          harga: editHarga.trim(),
          bahan: editBahan.trim(),
          deskripsi: editDeskripsi.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        tampilkanNotifikasi(
          "error",
          "Perubahan Gagal Disimpan",
          data.message ?? "Kuliner belum berhasil diperbarui. Silakan coba lagi."
        );
        return;
      }

      setKuliner((sebelumnya) =>
        sebelumnya.map((item) =>
          item.id === diedit.id ? data.kuliner : item
        )
      );

      tutupEdit();

      tampilkanNotifikasi(
        "sukses",
        "Kuliner Berhasil Diperbarui",
        `Informasi kuliner "${editNama.trim()}" berhasil diperbarui dan menunggu peninjauan admin.`
      );
    } catch {
      tampilkanNotifikasi(
        "error",
        "Perubahan Gagal Disimpan",
        "Tidak dapat menghubungi server. Silakan coba lagi."
      );
    } finally {
      setSedangSimpan(false);
    }
  };

  /* Hapus usulan */
  const hapusUsulan = (item: Kuliner) => {
    setKonfirmasiHapus(item);
  };

  /* Konfirmasi hapus kuliner */
  const konfirmasiHapusUsulan = async () => {
    if (!konfirmasiHapus) return;

    const item = konfirmasiHapus;

    try {
      const response = await fetch(`/api/profile/kuliner/${item.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setKonfirmasiHapus(null);
        tampilkanNotifikasi(
          "error",
          "Gagal Menghapus Kuliner",
          data.message ?? "Kuliner belum berhasil dihapus. Silakan coba lagi."
        );
        return;
      }

      setKuliner((sebelumnya) =>
        sebelumnya.filter((baris) => baris.id !== item.id)
      );
      setKonfirmasiHapus(null);

      tampilkanNotifikasi(
        "sukses",
        "Kuliner Berhasil Dihapus",
        `Kuliner "${item.nama}" berhasil dihapus dari histori kuliner kamu.`
      );
    } catch {
      setKonfirmasiHapus(null);
      tampilkanNotifikasi(
        "error",
        "Gagal Menghapus Kuliner",
        "Tidak dapat menghubungi server. Silakan coba lagi."
      );
    }
  };

  /* Logout */
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* tetap keluarkan pengguna dari halaman ini walau permintaan gagal */
    }

    window.dispatchEvent(new Event("jelajahRasaUserUpdated"));

    tampilkanNotifikasi(
      "sukses",
      "Anda Telah Keluar",
      "Kamu telah keluar dari akun. Tekan Tutup untuk kembali ke halaman masuk.",
      true
    );
  };

  if (!siap || !user) {
    return (
      <main id="main-content" className="profile-page">
        <div className="container profile-container">
          <p className="text-center text-muted py-5">Memuat profil...</p>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="profile-page">
      <div className="container profile-container">
        {/* Breadcrumb */}
        <nav id="breadcrumb-nav" className="mb-3">
          <ol className="breadcrumb breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/" className="nav-home-link">
                <i className="bx bx-home-alt me-1"></i>
                Beranda
              </Link>
            </li>
            <li className="breadcrumb-item active">Profil Saya</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Kolom kiri */}
          <div className="col-lg-4">
            <div className="profile-card-main">
              <div className="position-relative d-inline-block mx-auto mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar || "/images/homepage/default-avatar.png"}
                  id="user-avatar-profile"
                  alt="Foto Profil"
                  className="profil-avatar-large"
                />

                <label
                  htmlFor="input-upload-avatar"
                  className="avatar-upload-btn"
                  title="Ubah Foto"
                >
                  <i className="bx bx-camera fs-6"></i>
                  <input
                    type="file"
                    id="input-upload-avatar"
                    className="d-none"
                    accept="image/jpeg,image/png,image/webp"
                    ref={inputAvatarRef}
                    onChange={handleAvatar}
                  />
                </label>
              </div>

              <h5 className="profile-display-name" id="profile-display-name">
                {user.nama}
              </h5>
              <p className="profile-display-role" id="profile-display-role">
                Tukang Kuliner
              </p>

              {/* Statistik */}
              <div className="profile-stats-wrapper">
                <div className="profile-stat-item">
                  <h6
                    className="profile-stat-number text-success"
                    id="total-added-count"
                  >
                    {kuliner.length}
                  </h6>
                  <small className="profile-stat-label">
                    Kuliner Ditambahkan
                  </small>
                </div>

                <div className="profile-stat-divider"></div>

                <div className="profile-stat-item">
                  <Link
                    href="/favorit"
                    id="link-to-favorite"
                    className="profile-stat-link"
                  >
                    <h6
                      className="profile-stat-number text-danger"
                      id="total-favorite-count"
                    >
                      {jumlahFavorit}
                    </h6>
                    <small className="profile-stat-label">Favorit</small>
                  </Link>
                </div>
              </div>

              <button
                type="button"
                id="btn-logout"
                className="btn-logout-profile"
                onClick={logout}
              >
                <i className="bx bx-log-out"></i> Keluar Akun
              </button>
            </div>

            {/* Form informasi personal */}
            <div className="profile-card-form">
              <h6 className="profile-form-title">
                <i className="bx bx-user-pin"></i>
                Informasi Personal
              </h6>

              <form id="form-edit-profile" onSubmit={simpanProfil} noValidate>
                <div className="profile-form-group">
                  <label
                    htmlFor="input-profile-name"
                    className="profile-form-label"
                  >
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    className={`profile-form-input ${errorNama ? "profile-form-input-error" : ""}`}
                    id="input-profile-name"
                    placeholder="Nama Anda"
                    value={nama}
                    onChange={(e) => {
                      setNama(e.target.value);

                      if (e.target.value.trim().length >= 4) {
                        setErrorNama("");
                      } else if (!e.target.value.trim()) {
                        setErrorNama("Nama lengkap wajib diisi.");
                      } else {
                        setErrorNama("Nama lengkap minimal 4 karakter.");
                      }
                    }}
                    required
                  />
                  {errorNama && (
                    <p className="profile-form-error">{errorNama}</p>
                  )}
                </div>

                <div className="profile-form-group">
                  <label
                    htmlFor="input-profile-email"
                    className="profile-form-label"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="profile-form-input"
                    id="input-profile-email"
                    value={user.email}
                    disabled
                  />
                </div>

                <div className="profile-form-group">
                  <label
                    htmlFor="input-profile-city"
                    className="profile-form-label"
                  >
                    Kota/Kabupaten
                  </label>
                  <input
                    type="text"
                    className={`profile-form-input ${errorKota ? "profile-form-input-error" : ""}`}
                    id="input-profile-city"
                    placeholder="Domisili Anda (Contoh: Kota Bandung / Kab. Bandung)"
                    value={kota}
                    onChange={(e) => {
                      setKota(e.target.value);

                      if (e.target.value.trim()) {
                        setErrorKota("");
                      } else {
                        setErrorKota("Asal kota/kabupaten wajib diisi.");
                      }
                    }}
                    required
                  />
                  {errorKota && (
                    <p className="profile-form-error">{errorKota}</p>
                  )}
                </div>

                <button
                  type="submit"
                  id="btn-save-profile"
                  className="btn-save-profile"
                  disabled={sedangSimpan}
                >
                  {sedangSimpan ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </div>
          </div>

          {/* Kolom kanan: histori */}
          <div className="col-lg-8">
            <div className="profile-card-history">
              <div className="history-header-wrapper">
                <div>
                  <h5 className="history-title">Histori Kuliner Ditambahkan</h5>
                  <p className="history-subtitle">
                    Kelola informasi kuliner yang pernah Anda kontribusikan ke
                    JelajahRasa.
                  </p>
                </div>
              </div>

              <div
                className={`history-list-container ${kuliner.length === 0 ? "d-none" : ""}`}
                id="history-list-container"
              >
                {kuliner.map((item) => (
                  <div className="history-item" key={item.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.gambar || "/images/homepage/default-avatar.png"}
                      alt={item.nama}
                      className="history-item-img"
                    />

                    <div className="history-item-body">
                      <h6 className="history-item-title">{item.nama}</h6>

                      <p className="history-item-meta">
                        <i className="bx bx-map-pin"></i>
                        {item.daerah}
                      </p>

                      <p className="history-item-meta">
                        <i className="bx bx-calendar"></i>
                        Ditambahkan pada: {formatTanggal(item.createdAt)}
                      </p>

                      <p className="history-item-meta">
                        <BadgeStatus status={item.status as StatusKuliner} />
                      </p>

                      {item.status === "REJECTED" && item.catatanAdmin && (
                        <p className="history-item-meta text-danger">
                          <i className="bx bx-info-circle"></i>
                          Catatan admin: {item.catatanAdmin}
                        </p>
                      )}
                    </div>

                    <div className="history-item-actions">
                      <button
                        type="button"
                        className="history-btn btn-edit-histori"
                        title="Edit"
                        onClick={() => bukaEdit(item)}
                      >
                        <i className="bx bx-edit"></i>
                      </button>

                      <button
                        type="button"
                        className="history-btn btn-hapus btn-hapus-histori"
                        title="Hapus"
                        onClick={() => hapusUsulan(item)}
                      >
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tampilan jika histori kosong */}
              {kuliner.length === 0 && (
                <div id="empty-history-state" className="empty-history-state">
                  <i className="bx bx-folder-open empty-history-icon"></i>
                  <h6 className="empty-history-title">
                    Belum ada kuliner yang ditambahkan
                  </h6>
                  <p className="empty-history-text">
                    Bagikan kuliner khas Jawa Barat favoritmu ke komunitas kami.
                  </p>
                  <Link href="/tambah-kuliner" className="btn-empty-history">
                    Tambah Kuliner Sekarang
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal edit kuliner */}
      {diedit && (
        <div
          className="modal fade show d-block"
          id="modal-edit-kuliner"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          onClick={tutupEdit}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bx bx-edit me-1"></i> Edit Kuliner
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Tutup"
                  onClick={tutupEdit}
                />
              </div>

              <div className="modal-body">
                <form id="form-edit-kuliner" onSubmit={simpanEdit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="input-edit-nama" className="form-label">
                        Nama Kuliner *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="input-edit-nama"
                        value={editNama}
                        onChange={(e) => setEditNama(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="input-edit-kategori" className="form-label">
                        Kategori *
                      </label>
                      <select
                        className="form-select"
                        id="input-edit-kategori"
                        value={editKategori}
                        onChange={(e) => setEditKategori(e.target.value)}
                        required
                      >
                        {DAFTAR_KATEGORI.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="input-edit-daerah" className="form-label">
                        Asal Daerah *
                      </label>
                      <select
                        className="form-select"
                        id="input-edit-daerah"
                        value={editDaerah}
                        onChange={(e) => setEditDaerah(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          -- Pilih Kota/Kabupaten --
                        </option>
                        {DAFTAR_DAERAH.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="input-edit-harga" className="form-label">
                        Estimasi Harga
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="input-edit-harga"
                        placeholder="Misal: 15.000 - 25.000"
                        value={editHarga}
                        onChange={(e) => setEditHarga(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="input-edit-bahan" className="form-label">
                        Bahan Utama
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="input-edit-bahan"
                        value={editBahan}
                        onChange={(e) => setEditBahan(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label
                        htmlFor="input-edit-deskripsi"
                        className="form-label"
                      >
                        Deskripsi
                      </label>
                      <textarea
                        className="form-control"
                        id="input-edit-deskripsi"
                        rows={3}
                        value={editDeskripsi}
                        onChange={(e) => setEditDeskripsi(e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={tutupEdit}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="form-edit-kuliner"
                  className="btn btn-success"
                  disabled={sedangSimpan}
                >
                  {sedangSimpan ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal hasil upload foto profil */}
      {notifikasiFoto && (
        <>
          <div
            className="modal fade show d-block profile-popup-modal"
            id="modal-upload-foto-profil"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-upload-title"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  {notifikasiFoto.tipe === "sukses" && (
                    <div className="my-3">
                      <i className="bx bx-check-circle text-success display-1"></i>
                    </div>
                  )}
                  <h4
                    id="profile-upload-title"
                    className="fw-bold text-dark mb-2"
                  >
                    {notifikasiFoto.judul}
                  </h4>
                  <p className="text-muted small mb-4">
                    {notifikasiFoto.pesan}
                  </p>
                  {notifikasiFoto.tipe === "sukses" ? (
                    <div className="d-flex justify-content-center">
                      <button
                        type="button"
                        id="btn-profile-upload-close"
                        className="btn btn-success px-4"
                        onClick={() => setNotifikasiFoto(null)}
                      >
                        Tutup
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        type="button"
                        id="btn-profile-upload-cancel"
                        className="btn btn-light border px-4"
                        onClick={() => setNotifikasiFoto(null)}
                      >
                        Tutup
                      </button>
                      <button
                        type="button"
                        id="btn-profile-upload-retry"
                        className="btn btn-success px-4"
                        onClick={uploadUlangFoto}
                      >
                        Upload Ulang
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show profile-popup-backdrop"></div>
        </>
      )}

      {/* Modal notifikasi */}
      {notifikasi && (
        <>
          <div
            className="modal fade show d-block profile-popup-modal"
            id="modal-notifikasi-profil"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  {notifikasi.tipe === "sukses" && (
                    <div className="my-3">
                      <i className="bx bx-check-circle text-success display-1"></i>
                    </div>
                  )}
                  <h4 className="fw-bold text-dark mb-2">
                    {notifikasi.judul}
                  </h4>
                  <p className="text-muted small mb-4">
                    {notifikasi.pesan}
                  </p>
                  <div className="d-flex justify-content-center">
                    <button
                      type="button"
                      id="btn-profile-notification-close"
                      className="btn btn-success px-4"
                      onClick={tutupNotifikasi}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show profile-popup-backdrop"></div>
        </>
      )}

      {/* Modal konfirmasi hapus kuliner */}
      {konfirmasiHapus && (
        <>
          <div
            className="modal fade show d-block profile-popup-modal"
            id="modal-konfirmasi-hapus-profil"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-confirm-title"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body text-center">
                  <h4
                    id="profile-confirm-title"
                    className="fw-bold text-dark mb-2"
                  >
                    Hapus Kuliner?
                  </h4>
                  <p className="text-muted small mb-4">
                    Apakah Anda yakin ingin menghapus{" "}
                    <strong>{konfirmasiHapus.nama}</strong> dari histori kuliner
                    kamu? Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      type="button"
                      id="btn-profile-confirm-cancel"
                      className="btn btn-light border px-4"
                      onClick={() => setKonfirmasiHapus(null)}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      id="btn-profile-confirm-delete"
                      className="btn btn-success px-4"
                      onClick={konfirmasiHapusUsulan}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show profile-popup-backdrop"></div>
        </>
      )}
    </main>
  );
}
