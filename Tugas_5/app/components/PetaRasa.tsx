"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type MapRegion = {
  id: string;
  nama: string;
  daerah: string;
  deskripsi: string;
  posisiX: number;
  posisiY: number;
};

export default function PetaRasa() {
  const [regions, setRegions] = useState<MapRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchRegions() {
      try {
        const response = await fetch("/api/map-regions");

        if (!response.ok) {
          throw new Error("Gagal mengambil data daerah");
        }

        const data: { regions: MapRegion[] } = await response.json();
        setRegions(data.regions);
      } catch (error) {
        console.error("Gagal memuat daerah peta:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchRegions();
  }, []);

  const [skalaPeta, setSkalaPeta] = useState(1);
  const [lokasiAktif, setLokasiAktif] = useState<string | null>(null);
  // const lokasiKuliner = [
  //   {
  //     nama: "Kota Bandung",
  //     className: "pin-kota-bandung",
  //     deskripsi: "Dominan Gurih, Olahan Tapioka, Herbal & Dingin Segar.",
  //   },
  //   {
  //     nama: "Kota Bogor",
  //     className: "pin-kota-bogor",
  //     deskripsi: "Segar Asam-Manis, Olahan Fermentasi (Asinan/Toge Goreng)",
  //   },
  //   {
  //     nama: "Kota Cirebon",
  //     className: "pin-kota-cirebon",
  //     deskripsi: "Gurih Asin, Kuah Rempah Daging, & Olahan Hasil Laut",
  //   },
  //   {
  //     nama: "Kota Tasikmalaya",
  //     className: "pin-kota-tasikmalaya",
  //     deskripsi: "Gurih Pedas, Oncom Fermentasi, & Olahan Bakso.",
  //   },
  //   {
  //     nama: "Kab. Sumedang",
  //     className: "pin-kab-sumedang",
  //     deskripsi: "Gurih Renyah (Tahu) & Manis Alami (Ubi Cilembu).",
  //   },
  //   {
  //     nama: "Kab. Garut",
  //     className: "pin-kab-garut",
  //     deskripsi: "Manis Legit (Dodol), Gurih Pedas, & Es Goyobod.",
  //   },
  //   {
  //     nama: "Kab. Subang",
  //     className: "pin-kab-subang",
  //     deskripsi: "Manis Asam Segar (Nanas Madu Subang)",
  //   },
  //   {
  //     nama: "Kab. Karawang",
  //     className: "pin-kab-karawang",
  //     deskripsi: "Manis Pandan (Sorabi Hijau) & Opak Ketan.",
  //   },
  //   {
  //     nama: "Kab. Pangandaran",
  //     className: "pin-kab-pangandaran",
  //     deskripsi: "Asam Gurih Pindang Gunung & Seafood Segar.",
  //   },
  //   {
  //     nama: "Kab. Bekasi",
  //     className: "pin-kab-bekasi",
  //     deskripsi: "Gurih Gabus Pucung & Sayur Asem Khas.",
  //   },
  //   {
  //     nama: "Kab. Cirebon",
  //     className: "pin-kab-cirebon",
  //     deskripsi: "Asam Manis Gurih (Tahu Gejrot) & Es Doger.",
  //   },
  // ]

  function zoomIn() {
    setSkalaPeta((skala) => Math.min(skala + 0.1, 2));
  }

  function zoomOut() {
    setSkalaPeta((skala) => Math.max(skala - 0.1, 0.5))
  }

  function resetZoom() {
    setSkalaPeta(1);
  }

  return (
    <section id="peta-rasa" className="peta-section">
      <div className="peta-container-main">
        <div className="section-header center-text">
          <h3 className="section-title">Peta Rasa Jawa Barat</h3>
          <p className="section-subtitle">
            Peta interaktif sebaran kuliner khas di seluruh wilayah Jawa
            Barat.
          </p>
        </div>

        <div className="peta-wrapper">
          <div className="peta-instruction">
            <small className="instruction-text">
              <i className="bx bx-info-circle"></i> Arahkan kursor pada
              titik lokasi
            </small>
          </div>

          <div
            id="peta-zoom-controls"
            className="zoom-controls-wrapper"
          >
            <button
              className="btn-zoom"
              id="btnZoomIn"
              title="Zoom In"
              type="button"
              onClick={zoomIn}
            >
              <i className="bx bx-plus"></i>
            </button>
            <button
              className="btn-zoom"
              id="btnZoomOut"
              title="Zoom Out"
              type="button"
              onClick={zoomOut}
            >
              <i className="bx bx-minus"></i>
            </button>
            <button
              className="btn-zoom"
              id="btnResetZoom"
              title="Reset Ukuran"
              type="button"
              onClick={resetZoom}
            >
              <i className="bx bx-reset"></i>
            </button>
          </div>

          <div className="peta-viewport" id="petaViewport">
              <div id="petaContainer" className="peta-inner-container"
              style={{
                transform: `scale(${skalaPeta})`,
                transformOrigin: "center center",
                transition: "transform 0.2s ease"
              }}
            >
              <Image
                id="img-peta-jabar"
                className="peta-image"
                src="/images/homepage/peta-jabar.jpg"
                alt="Peta Jawa Barat"
                width={1200}
                height={900}
                priority
              />

              {/* DESKRIPSI PIN */}
              {regions.map((region) => (
                <div
                  key={region.id}
                  className={"peta-pin-item"}
                  style={{
                    left: `${region.posisiX}%`,
                    top: `${region.posisiY}%`,
                  }}
                  onMouseEnter={() => setLokasiAktif(region.nama)}
                  onMouseLeave={() => setLokasiAktif(null)}
                >
                  <button
                    className="btn-pin"
                    type="button"
                    aria-label={region.nama}
                    onFocus={() => setLokasiAktif(region.nama)}
                    onBlur={() => setLokasiAktif(null)}
                  >
                    <i className="bx bx-map-pin"></i>
                  </button>

                  <span className="pin-label">{region.nama}</span>

                  {lokasiAktif === region.nama && (
                    <div className="peta-tooltip" role="tooltip">
                      <div className="peta-tooltip-header">{region.nama}</div>
                      <div className="peta-tooltip-body">{region.deskripsi}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}