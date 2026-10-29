"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type User = {
  id: string;
  nama: string;
  email: string;
  kota: string | null;
  avatar: string | null;
  role: string;
};

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  /* Header dipasang di layout, jadi tidak ikut dipasang ulang tiap pindah
     halaman. pathname dipakai supaya nama ikut berubah setelah login. */
  useEffect(() => {
    let masihAktif = true;

    const sinkronkanUser = async () => {
      try {
        // Mengambil data pengguna dari API berdasarkan session login
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          if (masihAktif) {
            setUser(null);
          }
          return;
        }

        const data = (await response.json()) as {
          user?: User | null;
        };

        if (masihAktif) {
          setUser(data.user ?? null);
        }
      } catch (error) {
        // Mengosongkan data pengguna jika sesi gagal diperiksa
        console.error("Gagal memeriksa sesi pengguna:", error);

        if (masihAktif) {
          setUser(null);
        }
      }
    };

    void sinkronkanUser();

    // Memperbarui foto dan nama ketika profil berhasil diubah
    window.addEventListener("jelajahRasaUserUpdated", sinkronkanUser);

    return () => {
      masihAktif = false;
      window.removeEventListener("jelajahRasaUserUpdated", sinkronkanUser);
    };
  }, [pathname]);

  return (
    <header id="main-header" className="site-header">
      <div className="header-container">

        {/* Kiri: Logo */}
        <div id="header-left" className="header-section-left">
          <button
            id="btn-toggle-sidebar"
            className="btn-sidebar"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
          >
            <i className="bx bx-menu"></i>
          </button>

          <Link id="logo" className="logo-link" href="/">
            <i className="bx bx-map-pin"></i>
            JelajahRasa
          </Link>
        </div>

        {/* Tengah: Search */}
        <div id="header-center" className="header-section-center">
          <form
            id="form-search-header"
            className="search-form"
            action="/daftar-kuliner"
            method="GET"
          >
            <span className="search-icon-wrapper">
              <i className="bx bx-search"></i>
            </span>

            <input
              id="input-search"
              className="search-input"
              type="text"
              name="search"
              placeholder="Cari kuliner atau daerah..."
            />

            <button
              id="btn-search-submit"
              className="btn-search-submit"
              type="submit"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Navigasi Desktop */}
        <ul id="header-nav-list" className="header-nav-list">
          <li>
            <Link href="/" className="header-nav-link">
              Beranda
            </Link>
          </li>

          <li>
            <Link href="/daftar-kuliner" className="header-nav-link">
              Daftar Kuliner
            </Link>
          </li>

          <li>
            <Link href="/tambah-kuliner" className="header-nav-link">
              Tambah Kuliner
            </Link>
          </li>

          <li>
            <Link href="/favorit" className="header-nav-link">
              Favorit
            </Link>
          </li>

          <li>
            <Link href="/faq" className="header-nav-link">
              FAQ
            </Link>
          </li>
        </ul>

        {/* Profil */}
        <div id="header-right" className="header-profile-container">
          <Image
            id="user-avatar-desktop"
            className="user-avatar"
            src={user?.avatar || "/images/homepage/default-avatar.png"}
            alt="Foto Profil"
            width={48}
            height={48}
          />

          <div className="user-info-wrapper">
            <span id="user-name-desktop" className="user-name">
              {user?.nama || "Pengunjung"}
            </span>

            <Link
              id="user-link-desktop"
              className="user-profile-link"
              href={user ? "/profil" : "/login"}
            >
              {user ? "Profil" : "Masuk / Daftar"}
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}
