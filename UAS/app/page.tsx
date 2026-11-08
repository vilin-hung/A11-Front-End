import "./globals.css";
import "./home.css";
import Link from "next/link";
import PetaRasa from "./components/PetaRasa";
import UlasanSection from "./components/UlasanSection";
import { prisma } from "../lib/prisma";

export const instant = false;

export default async function HomePage() {
  const [
    jumlahKuliner,
    heroMetadata,
    taglineMetadata,
    descriptionMetadata,
  ] = await Promise.all([
    prisma.kuliner.count({
      where: {
        status: "APPROVED",
      },
    }),
    prisma.siteMetadata.findUnique({
      where: { key: "hero_kuliner_ids" },
      select: { value: true },
    }),
    prisma.siteMetadata.findUnique({
      where: { key: "hero_tagline" },
      select: { value: true },
    }),
    prisma.siteMetadata.findUnique({
      where: { key: "hero_description" },
      select: { value: true },
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

    const FEATURED_KEYS = [
    "featured_makanan",
    "featured_jajanan",
    "featured_minuman",
    "featured_oleh_oleh",
  ];

  const featuredMetadata = await prisma.siteMetadata.findMany({
    where: { key: { in: FEATURED_KEYS } },
    select: { key: true, value: true },
  });

  const featuredIdByKey = new Map(
    featuredMetadata.map((item) => [item.key, item.value])
  );

  const featuredIds = FEATURED_KEYS
    .map((key) => featuredIdByKey.get(key))
    .filter((id): id is string => Boolean(id));

  const featuredRows = featuredIds.length
    ? await prisma.kuliner.findMany({
        where: {
          id: { in: featuredIds },
          status: "APPROVED",
        },
        select: {
          id: true,
          nama: true,
          kategori: true,
          daerah: true,
          deskripsi: true,
          bahan: true,
          rasa: true,
          gambar: true,
        },
      })
    : [];

  const rekomendasiKuliner = featuredIds.flatMap((id) => {
    const item = featuredRows.find((kuliner) => kuliner.id === id);
    return item ? [item] : [];
  });

  return (
    <main id="main-content" className="main-content">
      {/* Hero Section */}
      <section id="hero-section" className="hero-section">
        <div className="hero-container">
          <div className="hero-wrapper">
            <div className="hero-text-content">
              <span className="hero-quote">
                &quot;{taglineMetadata?.value ||
                  "Satu Tampah Rasa, Sejuta Cerita Parahyangan"}&quot;
              </span>
              <h1 className="hero-title">Jelajah Rasa Jawa Barat</h1>
              <p className="hero-description">
                {descriptionMetadata?.value ||
                  `Temukan ${jumlahKuliner.toLocaleString("id-ID")} cita rasa otentik yang tersebar dari pusat kota hingga sudut Pasundan.`}
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
            {rekomendasiKuliner.length === 0 ? (
              <p className="text-muted">
                Belum ada rekomendasi kuliner yang dipilih.
              </p>
            ) : (
              rekomendasiKuliner.map((item) => {
                const detailId = `detail-${item.id.replace(
                  /[^a-zA-Z0-9_-]/g,
                  ""
                )}`;

                return (
                  <div className="rekomendasi-card-item" key={item.id}>
                    <div className="makanan-card">
                      {item.gambar ? (
                        <img
                          className="food-card-img"
                          src={item.gambar}
                          alt={item.nama}
                        />
                      ) : (
                        <div className="food-card-img d-flex align-items-center justify-content-center bg-light">
                          <i className="bx bx-image fs-2 text-muted" />
                        </div>
                      )}

                      <div className="makanan-card-body">
                        <span className="food-badge">{item.kategori}</span>
                        <h6 className="food-title">{item.nama}</h6>
                        <p className="food-location">
                          <i className="bx bx-map-pin" /> {item.daerah}
                        </p>

                        <button
                          className="btn-collapse-toggle"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#${detailId}`}
                          aria-expanded="false"
                          aria-controls={detailId}
                        >
                          <span className="btn-text">Lihat Detail</span>
                          <i className="bx bx-chevron-down" />
                        </button>

                        <div className="collapse" id={detailId}>
                          <div className="detail-info border-top">
                            <p className="deskripsi">{item.deskripsi}</p>
                            <p className="detail-item">
                              <strong>Bahan utama:</strong>{" "}
                              {item.bahan.join(", ") || "-"}
                            </p>
                            <p className="detail-item">
                              <strong>Karakter rasa:</strong>{" "}
                              {item.rasa.join(", ") || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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