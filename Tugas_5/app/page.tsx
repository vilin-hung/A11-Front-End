import "./globals.css";
import "./home.css";
import Link from "next/link";
import PetaRasa from "./components/PetaRasa";
import UlasanSection from "./components/UlasanSection";
import { prisma } from "../lib/prisma";

export const instant = false;

export default async function HomePage() {
  const [jumlahKuliner, heroMetadata] = await Promise.all([
    prisma.kuliner.count({
      where: {
        status: "APPROVED",
      },
    }),
    prisma.siteMetadata.findUnique({
      where: {
        key: "hero_kuliner_ids",
      },
      select: {
        value: true,
      },
    }),
  ]);

  let heroIds: string[] = [];
  try {
    const parsed = JSON.parse(heroMetadata?.value ?? "[]");

    if (Array.isArray(parsed)) {
      heroIds = parsed.filter(
        (id): id is string => typeof id === "string"
      );
    }
  } catch {
    heroIds = [];
  }

    const dataHero = await prisma.kuliner.findMany({
    where: {
      status: "APPROVED",
      gambar: {
        not: null,
      },
      ...(heroIds.length > 0
        ? {
            id: {
              in: heroIds,
            },
          }
        : {}),
    },
    select: {
      id: true,
      nama: true,
      gambar: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: heroIds.length > 0 ? heroIds.length : 3,
  });

  // Pertahankan urutan pilihan admin.
  const heroSlides =
    heroIds.length > 0
      ? heroIds
          .map((id) => dataHero.find((item) => item.id === id))
          .filter((item) => item !== undefined)
      : dataHero;

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
                Temukan {jumlahKuliner.toLocaleString("id-ID")} cita rasa otentik yang tersebar dari pusat kota
                hingga sudut Pasundan.
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
              <div
                id="heroCarousel"
                className="carousel slide hero-carousel"
                data-bs-ride="carousel"
                data-bs-interval="3500"
              >
                <div className="carousel-inner">
                  {heroSlides.map((item, index) => (
                    <div
                      key={item.id}
                      className={`carousel-item ${index === 0 ? "active" : ""}`}
                    >
                      <img
                        className="carousel-image"
                        src={item.gambar ?? ""}
                        alt={item.nama}
                      />

                      <div className="carousel-caption-overlay">
                        <h6 className="carousel-caption-title">
                          {item.nama}
                        </h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      <section id="kategori" className="kategori-section">
        <div className="kategori-container">
          <div className="section-header center-text">
            <h3 className="section-title">Kategori Utama</h3>
            <p className="section-subtitle">
              Pilih jenis kuliner khas yang ingin dicari
            </p>
          </div>

          <div className="kategori-grid">
            <div className="kategori-card-wrapper">
              <div className="kategori-card">
                <i className="kategori-icon bx bx-bowl-rice"></i>
                <h6 className="kategori-title">Makanan</h6>
                <Link
                  className="kategori-link"
                  href="/daftar-kuliner?kategori=makanan"
                >
                  Lihat Kategori
                </Link>
              </div>
            </div>

            <div className="kategori-card-wrapper">
              <div className="kategori-card">
                <i className="kategori-icon bx bx-cookie"></i>
                <h6 className="kategori-title">Jajanan</h6>
                <Link
                  className="kategori-link"
                  href="/daftar-kuliner?kategori=jajanan"
                >
                  Lihat Kategori
                </Link>
              </div>
            </div>

            <div className="kategori-card-wrapper">
              <div className="kategori-card">
                <i className="kategori-icon bx bx-drink"></i>
                <h6 className="kategori-title">Minuman</h6>
                <Link
                  className="kategori-link"
                  href="/daftar-kuliner?kategori=minuman"
                >
                  Lihat Kategori
                </Link>
              </div>
            </div>

            <div className="kategori-card-wrapper">
              <div className="kategori-card">
                <i className="kategori-icon bx bx-gift"></i>
                <h6 className="kategori-title">Oleh-Oleh Khas</h6>
                <Link
                  className="kategori-link"
                  href="/daftar-kuliner?kategori=oleh-oleh"
                >
                  Lihat Kategori
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PetaRasa />

      {/* Rekomendasi Kuliner */}
      <section id="rekomendasi" className="rekomendasi-section">
        <div className="rekomendasi-container">
          <div className="section-header center-text">
            <h3 className="section-title">Rekomendasi Kuliner</h3>
            <p className="section-subtitle">
              Pilihan favorit dari beragam kategori cita rasa khas Jawa Barat.
            </p>
          </div>

          <div className="rekomendasi-grid">
            {/* Nasi Tutug Oncom */}
            <div className="rekomendasi-card-item">
              <div id="card-tutug-oncom" className="makanan-card">
                <img
                  id="img-tutug-oncom"
                  className="food-card-img"
                  src="../images/menu/makanan/nasi tutug oncom.jpg"
                  alt="Nasi Tutug Oncom"
                />
                <div className="makanan-card-body">
                  <span className="food-badge">Makanan</span>
                  <h6 id="title-tutug-oncom" className="food-title">
                    Nasi Tutug Oncom
                  </h6>
                  <p className="food-location">
                    <i className="bx bx-map-pin"></i> Kota Tasikmalaya
                  </p>

                  <button
                    id="btn-toggle-tutug-oncom"
                    className="btn-collapse-toggle"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#detailTutugOncom"
                    aria-expanded="false"
                    aria-controls="detailTutugOncom"
                  >
                    <span className="btn-text">Lihat Detail</span>
                    <i className="bx bx-chevron-down"></i>
                  </button>

                  <div className="collapse" id="detailTutugOncom">
                    <div className="detail-info border-top">
                      <p className="deskripsi">
                        Nasi hangat yang ditumbuk bersama oncom goreng gurih
                        bumbu kencur dan bawang.
                      </p>
                      <p className="detail-item">
                        <strong>Bahan utama:</strong> Nasi, Oncom, Kencur,
                        Bawang Merah, Sambal.
                      </p>
                      <p className="detail-item">
                        <strong>Karakter Rasa:</strong> Gurih, Harum Kencur,
                        Pedas.
                      </p>
                      <p className="harga-range">
                        <strong>Estimasi Harga:</strong> Rp 15.000 - Rp
                        30.000 / porsi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Batagor */}
            <div className="rekomendasi-card-item">
              <div id="card-batagor" className="makanan-card">
                <img
                  id="img-batagor"
                  className="food-card-img"
                  src="../images/menu/jajanan/batagor.jpg"
                  alt="Batagor Bandung"
                />
                <div className="makanan-card-body">
                  <span className="food-badge">Jajanan</span>
                  <h6 id="title-batagor" className="food-title">
                    Batagor Bandung
                  </h6>
                  <p className="food-location">
                    <i className="bx bx-map-pin"></i> Kota Bandung
                  </p>

                  <button
                    id="btn-toggle-batagor"
                    className="btn-collapse-toggle"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#detailBatagor"
                    aria-expanded="false"
                    aria-controls="detailBatagor"
                  >
                    <span className="btn-text">Lihat Detail</span>
                    <i className="bx bx-chevron-down"></i>
                  </button>

                  <div className="collapse" id="detailBatagor">
                    <div className="detail-info border-top">
                      <p className="deskripsi">
                        Bakso tahu goreng berbahan dasar adonan ikan tenggiri
                        yang disiram kuah kacang gurih dan perasan jeruk purut.
                      </p>
                      <p className="detail-item">
                        <strong>Bahan utama:</strong> Tahu, Ikan Tenggiri,
                        Tepung Tapioka, Bumbu Kacang, Jeruk Purut.
                      </p>
                      <p className="detail-item">
                        <strong>Karakter Rasa:</strong> Gurih, Renyah, Manis
                        Pedas Bumbu Kacang.
                      </p>
                      <p className="harga-range">
                        <strong>Estimasi Harga:</strong> Rp 10.000 - Rp
                        25.000 / porsi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Es Goyobod */}
            <div className="rekomendasi-card-item">
              <div id="card-es-goyobod" className="makanan-card">
                <img
                  id="img-es-goyobod"
                  className="food-card-img"
                  src="../images/menu/minuman/es goyobod.jpg"
                  alt="Es Goyobod"
                />
                <div className="makanan-card-body">
                  <span className="food-badge">Minuman</span>
                  <h6 id="title-es-goyobod" className="food-title">
                    Es Goyobod
                  </h6>
                  <p className="food-location">
                    <i className="bx bx-map-pin"></i> Kab. Garut
                  </p>

                  <button
                    id="btn-toggle-es-goyobod"
                    className="btn-collapse-toggle"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#detailEsGoyobod"
                    aria-expanded="false"
                    aria-controls="detailEsGoyobod"
                  >
                    <span className="btn-text">Lihat Detail</span>
                    <i className="bx bx-chevron-down"></i>
                  </button>

                  <div className="collapse" id="detailEsGoyobod">
                    <div className="detail-info border-top">
                      <p className="deskripsi">
                        Minuman es tradisional khas Sunda berbasis santan
                        dengan potongan hunwe (tepung arena), alpukat, kelapa
                        muda, dan roti tawar.
                      </p>
                      <p className="detail-item">
                        <strong>Bahan utama:</strong> Tepung Hunkwe, Santan,
                        Sirup Merah, Alpukat, Kelapa Muda, Roti Tawar.
                      </p>
                      <p className="detail-item">
                        <strong>Karakter Rasa:</strong> Manis, Gurih Santan,
                        Segar.
                      </p>
                      <p className="harga-range">
                        <strong>Estimasi Harga:</strong> Rp 8.000 - Rp 15.000
                        / porsi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tahu Sumedang */}
            <div className="rekomendasi-card-item">
              <div id="card-tahu-sumedang" className="makanan-card">
                <img
                  id="img-tahu-sumedang"
                  className="food-card-img"
                  src="../images/menu/jajanan/tahu sumedang.jpg"
                  alt="Tahu Sumedang"
                />
                <div className="makanan-card-body">
                  <span className="food-badge">Oleh-Oleh Khas</span>
                  <h6 id="title-tahu-sumedang" className="food-title">
                    Tahu Sumedang
                  </h6>
                  <p className="food-location">
                    <i className="bx bx-map-pin"></i> Kab. Sumedang
                  </p>

                  <button
                    id="btn-toggle-tahu-sumedang"
                    className="btn-collapse-toggle"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#detailTahuSumedang"
                    aria-expanded="false"
                    aria-controls="detailTahuSumedang"
                  >
                    <span className="btn-text">Lihat Detail</span>
                    <i className="bx bx-chevron-down"></i>
                  </button>

                  <div className="collapse" id="detailTahuSumedang">
                    <div className="detail-info border-top">
                      <p className="deskripsi">
                        Tahu goreng khas Sumedang yang renyah dan gurih di
                        luar namun sangat lembut di dalam, nikmat disajikan
                        hangat bersama cabai rawit.
                      </p>
                      <p className="detail-item">
                        <strong>Bahan utama:</strong> Kedelai, Garam, Bumbu
                        Tradisional, Cabai Rawit.
                      </p>
                      <p className="detail-item">
                        <strong>Karakter Rasa:</strong> Gurih, Renyah di Luar,
                        Lembut di Dalam.
                      </p>
                      <p className="harga-range">
                        <strong>Estimasi Harga:</strong> Rp 10.000 - Rp
                        25.000 / keranjang
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="wrapper-btn-more" className="more-button-wrapper">
            <Link
              id="btn-see-more-kuliner"
              href="/daftar-kuliner"
              className="btn-see-more"
            >
              Lihat Selengkapnya{" "}
              <i className="bx bx-right-arrow-alt icon-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

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