"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DATA_KULINER } from "../data/kuliner";
import "./favorit.css";

export default function FavoritPage() {
  const [favorit, setFavorit] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const tersimpan = localStorage.getItem("favorit");
      if (!tersimpan) return [];

      const data: unknown = JSON.parse(tersimpan);

      return Array.isArray(data)
        ? data.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  });

  const kulinerFavorit = DATA_KULINER.filter((item) =>
    favorit.includes(item.id)
  );

  const hapusFavorit = (id: string) => {
    setFavorit((sebelumnya) => {
      const terbaru = sebelumnya.filter((itemId) => itemId !== id);

      try {
        localStorage.setItem("favorit", JSON.stringify(terbaru));
      } catch {
        // abaikan jika local storage tidak dapat ditulis
      }
      return terbaru;
    });
  };

  return (
    <main id="main-content" className="favorit-page">
      <div className="container favorit-container">

        {/* Breadcrumb */}
        <nav id="breadcrumb-nav" className="mb-3">
          <ol className="breadcrumb breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/" className="nav-home-link">
                <i className="bx bx-home-alt me-1"></i>
                Beranda
              </Link>
            </li>

            <li className="breadcrumb-item active">
              Favorit
            </li>
          </ol>
        </nav>

        {/* Header Halaman Favorit */}
        <header className="fav-header-container">
          <div className="fav-header-text">
            <h2 className="fav-title">
              Kuliner Favorit Saya
            </h2>

            <p className="fav-subtitle">
              Daftar hidangan khas Jawa Barat yang telah Anda simpan.
            </p>
          </div>

          <div className="fav-header-badge">
            <span className="fav-badge">
              <i className="bx bxs-heart fav-badge-icon"></i>
              <span id="favCount">{kulinerFavorit.length}</span>
              Kuliner Disimpan
            </span>
          </div>
        </header>

        {/* Tampilan Saat Favorit Kosong */}
        { kulinerFavorit.length === 0 ? (
            <div className="empty-favorite">
              <div className="empty-favorite-icon">
                <i className="bx bx-heart" />
              </div>

              <h4 className="empty-favorite-title">
                Belum ada kuliner favorit
              </h4>

              <p className="empty-favorite-text">
                Anda belum menambahkan kuliner Jawa Barat
                ke dalam daftar favorit Anda.
              </p>

              <Link href="/daftar-kuliner" className="btn-jelajahi">
                <i className="bx bx-restaurant"></i>
                Jelajahi Kuliner
              </Link>
            </div>
          ) : (
            // {/* Grid Card Favorit */}
            <div className="favorit-grid">
              {kulinerFavorit.map((item) => (
                <article className="favorit-item" key={item.id}>
                  <button
                    type="button"
                    className="btn-remove-favorit"
                    aria-label={`Hapus ${item.nama} dari favorit`}
                    title="Hapus dari favorit"
                    onClick={() => hapusFavorit(item.id)}
                  >
                    <i className="bx bx-trash" />
                  </button>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.gambar} 
                    alt={item.nama}
                    className="favorit-item-image"
                  />

                  <div className="p-3 p-md-4">
                    <span className="badge rounded-pill text-bg-light mb-2">
                      {item.kategoriLabel} • {item.asal}
                    </span>

                    <h5 className="fw-bold mb-2">{item.nama}</h5>

                    <p className="text-muted small mb-2">
                      <i className="bx bx-map-pin me-1" />
                      Asal: {item.asal}
                    </p>

                    <p className="small mb-3">{item.deskripsi}</p>
                    
                    <p className="small text-success fw-semibold mb-0">{item.estimasiHarga}</p>

                    <Link 
                      href={`/daftar-kuliner#item-${item.id}`}
                      className="btn btn-outline-success btn-sm rounded-pill mt-3"
                    >
                      Lihat di Daftar Kuliner
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}