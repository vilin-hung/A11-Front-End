"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { localData } from "@/lib/data";
import { dataKuliner } from "@/app/data/kuliner";
import { bacaUsulanAktif } from "@/app/data/usulan";

type KartuRekomendasi = {
  id: string;
  nama: string;
  kategori: string;
  daerah: string;
  deskripsi: string;
  bahan: string[];
  rasa: string[];
  gambar: string;
};

const URUTAN_REKOMENDASI = ["makanan", "jajanan", "minuman", "oleh_oleh"];
const KATEGORI_REKOMENDASI: { [key: string]: string } = {
  makanan: "makanan",
  jajanan: "jajanan",
  minuman: "minuman",
  oleh_oleh: "oleh-oleh khas",
};

const kapital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function daftarTeks(nilai: unknown): string[] {
  if (Array.isArray(nilai)) return nilai.map(String);
  if (typeof nilai === "string") return nilai.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

/* Label kategori memakai tulisan yang sama dengan halaman Daftar Kuliner */
function petakanKartu(item: Record<string, unknown>): KartuRekomendasi {
  return {
    id: String(item.id),
    nama: String(item.nama ?? ""),
    kategori: String(item.kategoriLabel ?? item.kategori ?? ""),
    daerah: String(item.asal ?? item.daerah ?? ""),
    deskripsi: String(item.deskripsi ?? ""),
    bahan: daftarTeks(item.bahan),
    rasa: daftarTeks(item.karakterRasa ?? item.rasa).map(kapital),
    gambar: String(item.gambar ?? item.img ?? ""),
  };
}

/* Rekomendasi bawaan: satu kuliner untuk tiap kategori, sama seperti seeder */
function rekomendasiBawaan(): KartuRekomendasi[] {
  return URUTAN_REKOMENDASI.flatMap((key) => {
    const item = dataKuliner.find(
      (k) => k.kategori.toLowerCase() === KATEGORI_REKOMENDASI[key]
    );
    return item ? [petakanKartu(item)] : [];
  });
}

// Memantau perubahan data rekomendasi dari tab browser lain.
function subscribeRekomendasi(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

// Mengambil pilihan rekomendasi dan data kuliner dari penyimpanan lokal.
function getRekomendasiSnapshot() {
  try {
    const pilihan = localData.site.rekomendasi().data.rekomendasi;
    const publik = localData.kuliner.listPublic().data.data;
    const usulan = bacaUsulanAktif();

    return JSON.stringify({ pilihan, publik, usulan });
  } catch {
    return "";
  }
}

// Menyediakan snapshot awal saat halaman dirender di server.
function getServerRekomendasiSnapshot() {
  return "";
}

// Menentukan kuliner yang ditampilkan berdasarkan pilihan admin.
function pilihRekomendasi(snapshot: string): KartuRekomendasi[] {
  const bawaan = rekomendasiBawaan();
  if (!snapshot) return bawaan;

  try {
    const penyimpanan = JSON.parse(snapshot);

    const publik = Array.isArray(penyimpanan.publik)
      ? penyimpanan.publik
      : [];

    const usulan = Array.isArray(penyimpanan.usulan)
      ? penyimpanan.usulan
      : [];

    const semua = [...publik, ...usulan];
    const pilihan = penyimpanan.pilihan as Record<string, string>;

    const terpilih = URUTAN_REKOMENDASI.flatMap((key) => {
      const item = semua.find((k) => k.id === pilihan[key]);
      return item ? [petakanKartu(item)] : [];
    });

    return terpilih.length > 0 ? terpilih : bawaan;
  } catch {
    return bawaan;
  }
}

export default function RekomendasiKuliner() {
  // Membaca perubahan data rekomendasi dari localStorage.
  const snapshotRekomendasi = useSyncExternalStore(
    subscribeRekomendasi,
    getRekomendasiSnapshot,
    getServerRekomendasiSnapshot
  );

  // Mengolah data menjadi daftar rekomendasi yang ditampilkan.
  const rekomendasiKuliner = useMemo(
    () => pilihRekomendasi(snapshotRekomendasi),
    [snapshotRekomendasi]
  );

  return (
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
  );
}