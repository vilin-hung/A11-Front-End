import Link from "next/link";

export default function Footer() {
  return (
    <footer id="main-footer" className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div id="footer-col-about" className="footer-col">
            <h5 id="footer-brand-title" className="footer-brand">
              <i className="bx bx-map-pin icon-brand"></i> JelajahRasa
            </h5>
            <p className="footer-desc">
              Platform direktori kuliner yang merangkum kekayaan rasa dari
              berbagai kota dan kabupaten di Jawa Barat.
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
            <p className="contact-item">
              <i className="bx bx-envelope icon-contact"></i>{" "}
              halo@jelajahrasajabar.id
            </p>
            <p className="contact-item">
              <i className="bx bx-phone icon-contact"></i> +62 812-1326-3927
            </p>
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