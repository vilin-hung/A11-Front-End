"use client";

import Link from "next/link";
import "./favorit.css";

export default function FavoritPage() {
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
              <span id="favCount">0</span>
              Kuliner Disimpan
            </span>
          </div>
        </header>

        {/* Tampilan Saat Favorit Kosong */}
        <div className="empty-favorite">
          <div className="empty-favorite-icon">
            <i className="bx bx-heart"></i>
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

        {/* Grid Card Favorit */}
        <div className="favorit-grid d-none">
          {/* Card favorit */}
        </div>

      </div>
    </main>
  );
}