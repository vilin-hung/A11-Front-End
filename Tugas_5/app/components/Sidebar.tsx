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

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  /* Sidebar juga dipasang di layout, jadi perlu dibaca ulang tiap pindah
     halaman supaya nama pengguna ikut berubah setelah login. */
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
    <div
      className="offcanvas-sidebar"
      tabIndex={-1}
      id="offcanvasNavbar"
    >
      {/* Sidebar Navigasi */}
      <div className="sidebar-header">
        <h5 id="offcanvasNavbarLabel" className="sidebar-title">
          <i className="bx bx-map-pin"></i> JelajahRasa
        </h5>
        <button
          id="btn-close-sidebar"
          className="btn-sidebar-close"
          type="button"
          data-bs-dismiss="offcanvas"
        ></button>
      </div>

      <div className="sidebar-body">
        <div
          id="sidebar-profile-section"
          className="sidebar-profile-container"
        >
          <div className="profile-card-mobile">
            <Image
              id="user-avatar-desktop"
              className="user-avatar"
              src={user?.avatar || "/images/homepage/default-avatar.png"}
              alt="Foto Profil"
              width={48}
              height={48}
            />
            <div className="user-info-mobile">
              <h6 id="user-name-mobile" className="user-name">
                {user?.nama || "Pengunjung"}
              </h6>
              <Link
                id="user-link-mobile"
                className="user-profile-link"
                href={user ? "/profil" : "/login"}
              >
                {user ? "Profil" : "Masuk / Daftar"}
              </Link>
            </div>
          </div>
        </div>

        <ul id="sidebar-nav-list" className="sidebar-nav-list">
          <li className="nav-item">
            <Link className="nav-link" href="/">
              <i className="bx bx-home-alt"></i>Beranda
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" href="/daftar-kuliner">
              <i className="bx bx-restaurant"></i>Daftar Kuliner
            </Link>
          </li>
          <li className="nav-item link-requires-login">
            <Link
              className="nav-link link-requires-login"
              href="/tambah-kuliner"
            >
              <i className="bx bx-plus-circle"></i>Tambah Kuliner
            </Link>
          </li>
          <li className="nav-item link-requires-login">
            <Link className="nav-link" href="/favorit">
              <i className="bx bx-heart"></i>Favorit
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" href="/faq">
              <i className="bx bx-help-circle"></i>FAQ
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
