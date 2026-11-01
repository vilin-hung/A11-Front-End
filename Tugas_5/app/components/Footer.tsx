"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FooterProps = {
  variant?: "full" | "compact";
};

type SiteMetadata = {
  site_name: string;
  site_description: string;
  site_email: string;
  site_phone: string;
  footer_text: string;
};

export default function Footer({ variant = "full" }: FooterProps) {
  const [metadata, setMetadata] = useState<SiteMetadata>({
    site_name: "JelajahRasa",
    site_description:
      "Platform direktori kuliner yang merangkum kekayaan rasa dari berbagai kota dan kabupaten di Jawa Barat.",
    site_email: "halo@jelajahrasajabar.id",
    site_phone: "+62 812-1326-3927",
    footer_text: "© 2026 Jelajah Rasa Jawa Barat. All Rights Reserved.",
  });

  useEffect(() => {
    let masihAktif = true;

    const ambilMetadata = async () => {
      try {
        const response = await fetch("/api/site-metadata", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        const daftarMetadata = Array.isArray(data.metadata)
          ? data.metadata
          : Array.isArray(data)
            ? data
            : null;

        if (masihAktif) {
          if (daftarMetadata) {
            setMetadata((sebelumnya) => {
              const hasil = { ...sebelumnya };

              daftarMetadata.forEach((item: { key: string; value: string }) => {
                if (item.key in hasil) {
                  hasil[item.key as keyof SiteMetadata] = item.value;
                }
              });

              return hasil;
            });
          } else {
            setMetadata((sebelumnya) => ({
              ...sebelumnya,
              ...(data.metadata ?? data),
            }));
          }
        }
      } catch (error) {
        console.error("Gagal mengambil metadata website:", error);
      }
    };

    void ambilMetadata();

    return () => {
      masihAktif = false;
    };
  }, []);

  // Footer ringkas khusus halaman login
  if (variant === "compact") {
    return (
      <footer id="auth-footer" className="site-footer auth-footer">
        <div className="footer-container">
          <div className="footer-copyright">
            <p id="copyright-text" className="copyright-text">
              &copy; 2026 Jelajah Rasa Jawa Barat. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Footer lengkap untuk halaman utama dan halaman lain
  return (
    <footer id="main-footer" className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div id="footer-col-about" className="footer-col">
            <h5 id="footer-brand-title" className="footer-brand">
              <i className="bx bx-map-pin icon-brand"></i> {metadata.site_name}
            </h5>
            <p className="footer-desc">
              {metadata.site_description}
            </p>
          </div>

          <div id="footer-col-nav" className="footer-col">
            <h6 className="footer-heading">Navigasi Halaman</h6>
            <ul className="footer-nav-list">
              <li className="footer-nav-item">
                <Link href="/" className="footer-nav-link">
                  Beranda
                </Link>
              </li>
              <li className="footer-nav-item">
                <Link href="/daftar-kuliner" className="footer-nav-link">
                  Daftar Kuliner
                </Link>
              </li>
              <li className="footer-nav-item">
                <Link href="/tambah-kuliner" className="footer-nav-link">
                  Tambah Kuliner
                </Link>
              </li>
              <li className="footer-nav-item">
                <Link href="/favorit" className="footer-nav-link">
                  Favorit
                </Link>
              </li>
              <li className="footer-nav-item">
                <Link href="/faq" className="footer-nav-link">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div id="footer-col-contact" className="footer-col">
            <h6 className="footer-heading">Hubungi Kami</h6>
            {metadata.site_email && (
              <p className="contact-item">
                <i className="bx bx-envelope icon-contact"></i>{" "}
                {metadata.site_email}
              </p>
            )}
            {metadata.site_phone && (
              <p className="contact-item">
                <i className="bx bx-phone icon-contact"></i>{" "}
                {metadata.site_phone}
              </p>
            )}
            <div className="social-links-wrapper">
              <a href="#" id="link-instagram" className="social-link">
                <i className="bx bxl-instagram"></i>
              </a>
              <a href="#" id="link-facebook" className="social-link">
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#" id="link-youtube" className="social-link">
                <i className="bx bxl-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-copyright">
          <p id="copyright-text" className="copyright-text">
            &copy; 2026 Jelajah Rasa Jawa Barat. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
