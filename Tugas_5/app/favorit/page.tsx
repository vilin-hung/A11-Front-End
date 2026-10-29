"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import "./favorit.css";

type KulinerFavorit = {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  daerah: string;
  gambar: string | null;
  hargaMin: number;
  hargaMax: number;
};

type Favorite = {
  userId: string;
  kulinerId: string;
  createdAt: string;
  kuliner: KulinerFavorit;
};

function formatHarga(min: number, max: number) {
  const format = (harga: number) => `Rp${harga.toLocaleString("id-ID")}`;
  return `${format(min)} - ${format(max)}`;
}

function labelKategori(kategori: string) {
  const labels: Record<string, string> = {
    makanan: "Makanan Utama",
    jajanan: "Jajanan",
    minuman: "Minuman",
    "oleh-oleh": "Oleh-Oleh Khas",
  };
  return labels[kategori] ?? kategori;
}

export default function FavoritPage() {
  const [favorit, setFavorit] = useState<Favorite[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ambilFavorit = useCallback(async (id: string) => {
    try {
      setError("");
      const response = await fetch(`/api/favorit?userId=${encodeURIComponent(id)}`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data favorit.");
      }

      const data: Favorite[] = await response.json();
      setFavorit(data);
    } catch (err) {
      console.error(err);
      setError("Favorit belum berhasil dimuat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function cekSesiUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok || !data.user || !data.user.id) {
          setError("Silakan masuk terlebih dahulu untuk melihat favorit.");
          setLoading(false);
          return;
        }
        
        setUserId(data.user.id);
        void ambilFavorit(data.user.id);
      } catch (err) {
        console.error(err);
        setError("Gagal memverifikasi sesi masuk pengguna.");
        setLoading(false);
      }
    }

    void cekSesiUser();
  }, [ambilFavorit]);

  async function hapusFavorit(kulinerId: string) {
    if (!userId) return;

    try {
      const response = await fetch("/api/favorite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, kulinerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus favorit.");
      }

      setFavorit((sebelumnya) =>
        sebelumnya.filter((item) => item.kulinerId !== kulinerId)
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus favorit.");
    }
  }

  const formatTanggal = (tanggal: string) =>
    new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <main id="main-content" className="favorit-page">
      <div className="container favorit-container">
        <nav id="breadcrumb-nav" className="mb-3">
          <ol className="breadcrumb breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/" className="nav-home-link">
                <i className="bx bx-home-alt me-1"></i>
                Beranda
              </Link>
            </li>
            <li className="breadcrumb-item active">Favorit</li>
          </ol>
        </nav>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h4 className="mb-1">Kuliner Favorit Saya</h4>
            <p className="text-muted mb-0">
              Kumpulan kuliner pilihanmu dari seluruh Jawa Barat.
            </p>
          </div>

          <span className="badge rounded-pill bg-success px-3 py-2">
            {favorit.length} Favorit
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-success"
              role="status"
              aria-label="Memuat favorit"
            />
            <p className="text-muted mt-3">Memuat kuliner favorit...</p>
          </div>
        ) : error ? (
          <div className="alert alert-warning rounded-4" role="alert">
            <i className="bx bx-info-circle me-2"></i>
            {error}
            {!userId && (
              <div className="mt-3">
                <Link href="/login" className="btn btn-success btn-sm rounded-pill">
                  Masuk Sekarang
                </Link>
              </div>
            )}
            {userId && (
              <button
                type="button"
                className="btn btn-outline-success btn-sm rounded-pill mt-3"
                onClick={() => {
                  setLoading(true);
                  void ambilFavorit(userId);
                }}
              >
                Coba Lagi
              </button>
            )}
          </div>
        ) : favorit.length === 0 ? (
          <div className="empty-state text-center py-5">
            <i className="bx bx-heart display-3 text-success"></i>
            <h5 className="mt-3">Belum Ada Kuliner Favorit</h5>
            <p className="text-muted">
              Yuk, temukan kuliner khas Jawa Barat dan simpan yang kamu suka!
            </p>
            <Link
              href="/daftar-kuliner"
              className="btn btn-success rounded-pill px-4"
            >
              <i className="bx bx-search me-1"></i>
              Jelajahi Kuliner
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favorit.map(({ kuliner, createdAt }) => (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={kuliner.id}
              >
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="position-relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={kuliner.gambar || "/images/placeholder.jpg"}
                      alt={kuliner.nama}
                      className="card-img-top"
                      style={{ height: "220px", objectFit: "cover" }}
                    />

                    <button
                      type="button"
                      className="btn btn-light btn-sm rounded-circle shadow-sm position-absolute top-0 end-0 m-3"
                      title={`Hapus ${kuliner.nama} dari favorit`}
                      aria-label={`Hapus ${kuliner.nama} dari favorit`}
                      onClick={() => void hapusFavorit(kuliner.id)}
                    >
                      <i className="bx bx-trash text-danger fs-5"></i>
                    </button>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      <span className="badge rounded-pill bg-success-subtle text-success">
                        {labelKategori(kuliner.kategori)}
                      </span>
                    </div>

                    <h5 className="card-title fw-bold">
                      {kuliner.nama}
                    </h5>

                    <p className="text-muted small mb-2">
                      <i className="bx bx-map-pin me-1"></i>
                      Asal: {kuliner.daerah}
                    </p>

                    <p className="card-text text-secondary small">
                      {kuliner.deskripsi}
                    </p>

                    <p className="text-success fw-bold small mt-auto mb-2">
                      {formatHarga(kuliner.hargaMin, kuliner.hargaMax)}
                    </p>

                    <p className="text-muted small mb-3">
                      <i className="bx bx-heart me-1"></i>
                      Disimpan {formatTanggal(createdAt)}
                    </p>

                    <Link
                      href={`/daftar-kuliner#item-${kuliner.id}`}
                      className="btn btn-outline-success btn-sm rounded-pill"
                    >
                      Lihat di Daftar Kuliner
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}