"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type HeroSlide = {
  id: string;
  nama: string;
  gambar: string;
  gambarDefault?: string;
};

type SnapshotHero = { hero: string | null; kuliner: string | null; usulan: string | null };

const HERO_CHANGE_EVENT = "jelajahRasaHeroChanged";

// Mengawasi perubahan data Hero dari localStorage 
function subscribeHero(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(HERO_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(HERO_CHANGE_EVENT, callback);
  };
}

// Mengambil data pilihan Hero, kuliner, dan usulan kuliner dari localStorage.
function getHeroSnapshot() {
  try {
    return JSON.stringify({
      hero: window.localStorage.getItem("jelajahRasaHero"),
      kuliner: window.localStorage.getItem("jelajahRasaKuliner"),
      usulan: window.localStorage.getItem("jelajahRasaUsulan"),
    });
  } catch {
    return "";
  }
}

// Menyediakan snapshot awal untuk proses rendering di server
function getServerHeroSnapshot() {
  return "";
}

// Menentukan daftar slide berdasarkan pilihan admin dan data kuliner yang tersimpan
function resolveHeroSlides(slides: HeroSlide[], snapshot: string): HeroSlide[] {
  const slideDefault = slides.slice(0, 3);
  if (!snapshot) return slideDefault;

  try {
    const penyimpanan = JSON.parse(snapshot) as SnapshotHero;
    const pilihan = penyimpanan.hero
      ? JSON.parse(penyimpanan.hero)
      : null;
    const kulinerTersimpan = penyimpanan.kuliner
      ? JSON.parse(penyimpanan.kuliner)
      : [];
    const usulanTersimpan = penyimpanan.usulan
      ? JSON.parse(penyimpanan.usulan)
      : [];

    if (!Array.isArray(pilihan) || pilihan.length === 0) {
      return slideDefault;
    }

    const semua = new Map<string, HeroSlide>(
      slides.map((item) => [item.id, item])
    );

    // Memperbarui informasi slide berdasarkan data kuliner yang tersimpan
    const perbaruiSlide = (data: unknown, wajibDisetujui = false) => {
      if (!data || typeof data !== "object") return;

      const item = data as Record<string, unknown>;
      if (typeof item.id !== "string") return;
      if (wajibDisetujui && item.status !== "Aktif" && item.status !== "APPROVED") return;

      const slideAsli = semua.get(item.id);
      const gambarTersimpan =
        typeof item.gambar === "string" && item.gambar.trim()
          ? item.gambar
          : typeof item.img === "string" && item.img.trim()
            ? item.img
            : "";

      semua.set(item.id, {
        id: item.id,
        nama:
          typeof item.nama === "string" && item.nama.trim()
            ? item.nama
            : slideAsli?.nama ?? "Kuliner",
        gambar: gambarTersimpan || slideAsli?.gambar || "",
        gambarDefault: slideAsli?.gambar,
      });
    };

    // Memasukkan data kuliner utama ke dalam daftar slide
    if (Array.isArray(kulinerTersimpan)) {
      kulinerTersimpan.forEach((item: unknown) => perbaruiSlide(item));
    }

    // Memasukkan usulan kuliner yang sudah disetujui admin.
    if (Array.isArray(usulanTersimpan)) {
      usulanTersimpan.forEach((item: unknown) => perbaruiSlide(item, true));
    }

    // Menyusun slide sesuai urutan pilihan yang disimpan oleh admin
    const hasil = pilihan
      .map((id: unknown) =>
        typeof id === "string" ? semua.get(id) : undefined
      )
      .filter(
        (item: HeroSlide | undefined): item is HeroSlide =>
          Boolean(item && item.gambar)
      );

    return hasil.length ? hasil : slideDefault;
  } catch {
    return slideDefault;
  }
}

// Komponen utama menampilkan caraousel
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [indeksAktif, setIndeksAktif] = useState(0);

  // Memantau perubahan data Hero dari localStorage agar slide terupdate
  const snapshotHero = useSyncExternalStore(
    subscribeHero,
    getHeroSnapshot,
    getServerHeroSnapshot
  );

  // Mengolah data snapshot menjadi daftar slide yang akan ditampilkan
  const daftarSlide = useMemo(
    () => resolveHeroSlides(slides, snapshotHero),
    [slides, snapshotHero]
  );

  // Mengatur perpindahan slide secara otomatis
  useEffect(() => {
    if (daftarSlide.length < 2) return;

    const interval = window.setInterval(() => {
      setIndeksAktif((sebelumnya) => (sebelumnya + 1) % daftarSlide.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [daftarSlide.length]);

  if (!daftarSlide.length) return null;

  const indeksTampil = indeksAktif % daftarSlide.length;

  return (
    <div
      id="heroCarousel"
      className="carousel slide hero-carousel"
      aria-label="Rekomendasi kuliner Jawa Barat"
    >
      <div className="carousel-inner">
        {daftarSlide.map((item, index) => (
          <div
            key={item.id}
            className={`carousel-item ${index === indeksTampil ? "active" : ""}`}
          >
            <img
              className="carousel-image"
              src={item.gambar.startsWith("/") ? encodeURI(item.gambar) : item.gambar}
              alt={item.nama}
              onError={(event) => {
                // Menggunakan gambar cadangan jika gambar utama gagal dimuat
                const fallback = item.gambarDefault;
                const fallbackSrc = fallback?.startsWith("/")
                  ? encodeURI(fallback)
                  : fallback;
                if (fallbackSrc && event.currentTarget.getAttribute("src") !== fallbackSrc) {
                  event.currentTarget.src = fallbackSrc;
                  return;
                }

                event.currentTarget.style.display = "none";
              }}
            />
            <div className="carousel-caption-overlay">
              <h6 className="carousel-caption-title">{item.nama}</h6>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}