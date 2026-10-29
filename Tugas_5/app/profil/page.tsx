"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./profil.css";

/* =========================
   KEY LOCAL STORAGE
   ========================= */
const CURRENT_USER_KEY = "jelajahRasaCurrentUser";
const USERS_KEY = "jelajahRasaUsers";
const USULAN_KEY = "jelajahRasaUsulan";
const FAVORIT_KEY = "jelajahRasaFavorites";

/* =========================
   TIPE DATA
   ========================= */
type User = {
  name: string;
  email: string;
  city: string;
  password?: string;
  avatar?: string;
};

type StatusUsulan = "Menunggu" | "Aktif" | "Nonaktif";

type Usulan = {
  id: number;
  nama: string;
  kategori: string;
  daerah: string;
  status: StatusUsulan;
  bahan?: string;
  deskripsi?: string;
  rasa?: string;
  harga?: string;
  pengirim?: string;
  tanggal?: string;
  img?: string;
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

function simpanJson(key: string, nilai: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(nilai));
    return true;
  } catch {
    return false;
  }
}

function formatTanggal(tanggal?: string) {
  if (!tanggal) return "-";

  const bagian = tanggal.split("-");
  if (bagian.length !== 3) return tanggal;

  return `${Number(bagian[2])} ${NAMA_BULAN[Number(bagian[1]) - 1]} ${bagian[0]}`;
}

/* =========================
   BADGE STATUS
   ========================= */
function BadgeStatus({ status }: { status: StatusUsulan }) {
  const warna = {
    Aktif: "bg-success",
    Menunggu: "bg-warning text-dark",
    Nonaktif: "bg-secondary",
  };

  return <span className={`badge ${warna[status] ?? "bg-secondary"}`}>{status}</span>;
}

/* =========================
   HALAMAN
   ========================= */
export default function ProfilPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [siap, setSiap] = useState(false);
  const [usulan, setUsulan] = useState<Usulan[]>([]);
  const [jumlahFavorit, setJumlahFavorit] = useState(0);
  const [notifikasi, setNotifikasi] = useState<Notifikasi | null>(null);
  const [notifikasiFoto, setNotifikasiFoto] = useState<NotifikasiFoto | null>(null);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState<Usulan | null>(null);
  const inputAvatarRef = useRef<HTMLInputElement>(null);

  /* Form informasi personal */
  const [nama, setNama] = useState("");
  const [kota, setKota] = useState("");
  const [errorNama, setErrorNama] = useState("");
  const [errorKota, setErrorKota] = useState("");

  /* Modal edit kuliner */
  const [diedit, setDiedit] = useState<Usulan | null>(null);
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
      router.push("/login");
    }
  };

  /* Ambil data saat halaman dibuka */
  useEffect(() => {
    const aktif = bacaJson(CURRENT_USER_KEY, null) as User | null;

    if (!aktif) {
      router.replace("/login");
      return;
    }

    const semuaUsulan = bacaJson(USULAN_KEY, []) as Usulan[];
    const favorit = bacaJson(FAVORIT_KEY, []) as string[];

    /* localStorage baru bisa dibaca setelah komponen terpasang di browser */
    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(aktif);
    setNama(aktif.name);
    setKota(aktif.city);
    setUsulan(
      semuaUsulan.filter((item) => item.pengirim === aktif.name)
    );
    setJumlahFavorit(Array.isArray(favorit) ? favorit.length : 0);
    setSiap(true);
  }, [router]);

  /* Simpan ulang daftar usulan milik user + semua usulan */
  const perbaruiUsulan = (daftarMilikUser: Usulan[]) => {
    const semua = bacaJson(USULAN_KEY, []) as Usulan[];
    const lain = semua.filter(
      (item) => item.pengirim !== user?.name
    );

    simpanJson(USULAN_KEY, [...lain, ...daftarMilikUser]);
    setUsulan(daftarMilikUser);
  };

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

    reader.onload = (e) => {
      const avatar = e.target?.result;

      if (typeof avatar !== "string" || !avatar) {
        setNotifikasiFoto({
          tipe: "error",
          judul: "Foto Gagal Dibaca",
          pesan: "Foto tidak dapat dibaca. Silakan coba pilih foto lain.",
        });
        return;
      }

      const userBaru = { ...user, avatar };

      if (!simpanJson(CURRENT_USER_KEY, userBaru)) {
        setNotifikasiFoto({
          tipe: "error",
          judul: "Foto Gagal Disimpan",
          pesan: "Penyimpanan foto gagal. Coba pilih foto yang lebih kecil.",
        });
        return;
      }

      const users = bacaJson(USERS_KEY, []) as User[];
      const usersBaru = users.map((item) =>
        item.email === user.email ? { ...item, avatar } : item
      );

      if (!simpanJson(USERS_KEY, usersBaru)) {
        simpanJson(CURRENT_USER_KEY, user);
        setNotifikasiFoto({
          tipe: "error",
          judul: "Foto Gagal Disimpan",
          pesan: "Foto gagal diperbarui pada data pengguna. Silakan coba lagi.",
        });
        return;
      }

      setUser(userBaru);
      
      window.dispatchEvent(new Event("jelajahRasaUserUpdated"));

      setNotifikasiFoto({
        tipe: "sukses",
        judul: "Foto Profil Berhasil Diperbarui",
        pesan: "Foto baru kini digunakan pada profil Anda.",
      });
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
  const simpanProfil = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const namaBaru = nama.trim();
    const kotaBaru = kota.trim();
    const namaLama = user.name;
    const namaAsli = user.name.trim();
    const kotaAsli = user.city.trim();

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

    const userBaru = {
      ...user,
      name: namaBerubah ? namaBaru : user.name,
      city: kotaBerubah ? kotaBaru : user.city,
    };

    if (!simpanJson(CURRENT_USER_KEY, userBaru)) {
      tampilkanNotifikasi(
        "error",
        "Perubahan Gagal Disimpan",
        "Profil belum berhasil disimpan. Silakan coba lagi."
      );
      return;
    }

    const users = bacaJson(USERS_KEY, []) as User[];
    simpanJson(
      USERS_KEY,
      users.map((item) =>
        item.email === user.email
          ? { ...item, name: userBaru.name, city: userBaru.city }
          : item
      )
    );

    /* Usulan lama tetap milik user ini walau nama berubah */
    if (namaBerubah) {
      const semuaUsulan = bacaJson(USULAN_KEY, []) as Usulan[];
      const usulanBaru = semuaUsulan.map((item) =>
        item.pengirim === namaLama
          ? { ...item, pengirim: namaBaru }
          : item
      );

      simpanJson(USULAN_KEY, usulanBaru);
      setUsulan(
        usulanBaru.filter((item) => item.pengirim === namaBaru)
      );
    }

    setUser(userBaru);
    setNama(userBaru.name);
    setKota(userBaru.city);

    tampilkanNotifikasi(
      "sukses",
      "Profil Berhasil Diperbarui",
      "Nama atau informasi domisili kamu berhasil diperbarui."
    );
  };

  /* Buka modal edit */
  const bukaEdit = (item: Usulan) => {
    setDiedit(item);
    setEditNama(item.nama);
    setEditKategori(item.kategori);
    setEditDaerah(item.daerah);
    setEditHarga(item.harga ?? "");
    setEditBahan(item.bahan ?? "");
    setEditDeskripsi(item.deskripsi ?? "");
  };

  const tutupEdit = () => setDiedit(null);

  /* Simpan hasil edit */
  const simpanEdit = (event: React.FormEvent<HTMLFormElement>) => {
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

    perbaruiUsulan(
      usulan.map((item) =>
        item.id === diedit.id
          ? {
              ...item,
              nama: editNama.trim(),
              kategori: editKategori,
              daerah: editDaerah,
              harga: editHarga.trim(),
              bahan: editBahan.trim(),
              deskripsi: editDeskripsi.trim(),
            }
          : item
      )
    );

    tutupEdit();

    tampilkanNotifikasi(
      "sukses",
      "Kuliner Berhasil Diperbarui",
      `Informasi kuliner "${editNama.trim()}" berhasil diperbarui.`
    );
  };

  /* Hapus usulan */
  const hapusUsulan = (item: Usulan) => {
    setKonfirmasiHapus(item);
  };

  /* Konfirmasi hapus kuliner */
  const konfirmasiHapusUsulan = () => {
    if (!konfirmasiHapus) return;

    const item = konfirmasiHapus;

    perbaruiUsulan(
      usulan.filter((baris) => baris.id !== item.id)
    );

    setKonfirmasiHapus(null);

    tampilkanNotifikasi(
      "sukses",
      "Kuliner Berhasil Dihapus",
      `Kuliner "${item.nama}" berhasil dihapus dari histori kuliner kamu.`
    );
  };

  /* Logout */
  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);

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
                {user.name}
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
                    {usulan.length}
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
                >
                  Simpan Perubahan
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
                className={`history-list-container ${usulan.length === 0 ? "d-none" : ""}`}
                id="history-list-container"
              >
                {usulan.map((item) => (
                  <div className="history-item" key={item.id}>
                    <img
                      src={item.img || "/images/homepage/default-avatar.png"}
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
                        Ditambahkan pada: {formatTanggal(item.tanggal)}
                      </p>

                      <p className="history-item-meta">
                        <BadgeStatus status={item.status} />
                      </p>
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
              {usulan.length === 0 && (
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
                >
                  Simpan Perubahan
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