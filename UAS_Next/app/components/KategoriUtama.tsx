"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { localData } from "@/lib/data";

/* Ikon bawaan, dipakai sebelum/jika metadata belum diubah admin */
const IKON_AWAL: { [key: string]: string } = {
  home_icon_makanan: "bx bx-bowl-rice",
  home_icon_jajanan: "bx bx-cookie",
  home_icon_minuman: "bx bx-drink",
  home_icon_oleh_oleh: "bx bx-gift",
};

export default function KategoriUtama() {
  const [metadataByKey, setMetadataByKey] = useState(
    () => new Map(Object.entries(IKON_AWAL))
  );

  /* Ambil ikon yang diatur admin di Pengaturan > Metadata (localStorage) */
  useEffect(() => {
    const daftar = localData.site.metadata().data as { key: string; value: string }[];
    setMetadataByKey(
      new Map([
        ...Object.entries(IKON_AWAL),
        ...daftar.map((item): [string, string] => [item.key, item.value]),
      ])
    );
  }, []);

  return (
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
              <i
                className={`kategori-icon ${
                  metadataByKey.get("home_icon_makanan") || "bx bx-bowl-rice"
                }`}
              />
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
              <i
                className={`kategori-icon ${
                  metadataByKey.get("home_icon_jajanan") || "bx bx-cookie"
                }`}
              />
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
              <i
                className={`kategori-icon ${
                  metadataByKey.get("home_icon_minuman") || "bx bx-drink"
                }`}
              />
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
              <i
                className={`kategori-icon ${
                  metadataByKey.get("home_icon_oleh_oleh") || "bx bx-gift"
                }`}
              />
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
  );
}
