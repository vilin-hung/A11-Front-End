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
                src="/images/homepage/peta-jabar.png"
                alt="Peta Jawa Barat"
                width={1200}
                height={900}
                priority
              />

              {/* DESKRIPSI PIN */}
              {regions.map((region) => {
                const jenisWilayah = region.nama.startsWith("Kota ")
                  ? "pin-kota"
                  : "pin-kabupaten";

                return (
                  <div
                    key={region.id}
                    className={`peta-pin-item ${jenisWilayah}`}
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}