import "./globals.css";
import "./home.css";
import Link from "next/link";
import PetaRasa from "./components/PetaRasa";
import UlasanSection from "./components/UlasanSection";
import { db } from "@/lib/data";
import HeroCarousel from "./components/HeroCarousel";
import RekomendasiKuliner from "./components/RekomendasiKuliner";
import KategoriUtama from "./components/KategoriUtama";


export default function HomePage() {
  const jumlahKuliner = db.kuliner.length;
  const heroSlides = db.kuliner.map((item) => ({
    id: item.id, nama: item.nama, gambar: item.gambar,
  }));

  return (
    <main id="main-content" className="main-content">
      {/* Hero Section */}
      <section id="hero-section" className="hero-section">
        <div className="hero-container">
          <div className="hero-wrapper">
            <div className="hero-text-content">
              <span className="hero-quote">
                &quot;Satu Tampah Rasa, Sejuta Cerita Parahyangan&quot;
              </span>
              <h1 className="hero-title">Jelajah Rasa Jawa Barat</h1>
              <p className="hero-description">
                Temukan {jumlahKuliner.toLocaleString("id-ID")} cita rasa otentik yang tersebar dari pusat kota hingga sudut Pasundan.
              </p>
              <div className="hero-action-buttons">
                <a
                  href="#peta-rasa"
                  id="btn-hero-peta"
                  className="btn-hero btn-hero-primary"
                >
                  Jelajah Peta Rasa
                </a>
                <Link
                  href="/daftar-kuliner"
                  id="btn-hero-daftar"
                  className="btn-hero btn-hero-secondary"
                >
                  Lihat Daftar Kuliner
                </Link>
              </div>
            </div>

            <div className="hero-carousel-wrapper">
              <HeroCarousel slides={heroSlides} />
            </div>
          </div>
        </div>
      </section>

      {/* Ringkasan Statistik */}
      <section id="stats-section" className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card">
              <h5 className="stat-number">    {jumlahKuliner.toLocaleString("id-ID")}</h5>
              <small className="stat-label">Kuliner</small>
            </div>
            <div className="stat-card">
              <h5 className="stat-number">11</h5>
              <small className="stat-label">Kota/Kab</small>
            </div>
            <div className="stat-card">
              <h5 className="stat-number">4</h5>
              <small className="stat-label">Kategori</small>
            </div>
            <div className="stat-card">
              <h5 className="stat-number">100%</h5>
              <small className="stat-label">Lokal</small>
            </div>
          </div>
        </div>
      </section>

      {/* Kategori Utama */}
      <KategoriUtama />

      <PetaRasa />

      {/* Rekomendasi Kuliner */}
      <RekomendasiKuliner />

      {/* Ulasan Kata Penjelajah Kuliner */}
      <UlasanSection />

      {/* Section Favorit */}
      <section id="section-favorit" className="section-favorit-wrapper">
        <div className="favorit-container">
          <div className="favorit-card-box">
            <i className="bx bx-bookmark-heart icon-favorit"></i>
            <h4 id="title-favorit" className="favorit-title">
              Simpan Kuliner Favoritmu
            </h4>
            <p className="favorit-desc">
              Tandai makanan favorit agar mudah dicari saat hendak berwisata
              kuliner.
            </p>
            <Link
              id="btn-see-favorite"
              href="/favorit"
              className="btn-favorit-link link-requires-login"
            >
              Lihat Favorit Saya
            </Link>
          </div>
        </div>
      </section>

      {/* Section Tambah Kuliner */}
      <section
        id="section-tambah-kuliner"
        className="section-tambah-wrapper"
      >
        <div className="tambah-kuliner-container">
          <h3 id="title-tambah-kuliner" className="tambah-title">
            Punya Rekomendasi Kuliner Daerahmu?
          </h3>
          <p className="tambah-subtitle">Bagikan rekomendasimu di sini!</p>
          <Link
            id="btn-add-kuliner"
            href="/tambah-kuliner"
            className="btn-tambah-link link-requires-login"
          >
            <i className="bx bx-plus-circle icon-plus"></i> Tambah Kuliner
          </Link>
        </div>
      </section>
    </main>
  );
}