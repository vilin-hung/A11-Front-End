import Link from "next/link";

export default function Header() {
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
          <img
            id="user-avatar-desktop"
            className="user-avatar"
            src="/images/homepage/default-avatar.png"
            alt="Foto Profil"
          />

          <div className="user-info-wrapper">
            <span id="user-name-desktop" className="user-name">
              Pengunjung
            </span>

            <Link
              id="user-link-desktop"
              className="user-profile-link"
              href="/login"
            >
              Masuk / Daftar
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}