import Link from "next/link";

export default function Sidebar() {
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
            <img
              id="user-avatar-mobile"
              className="user-avatar"
              src="../images/homepage/default-avatar.png"
              alt="Foto Profil"
            />
            <div className="user-info-mobile">
              <h6 id="user-name-mobile" className="user-name">
                Pengunjung
              </h6>
              <Link
                id="user-link-mobile"
                className="user-profile-link"
                href="/login"
              >
                Masuk / Daftar
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
          <li className="nav-item">
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