'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './faq.css';

interface FAQItem {
  id: string;
  slug: string;
  pertanyaan: string;
  jawaban: string;
  iconClass: string;
  urutan: number;
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [email, setEmail] = useState('');
  const [subjek, setSubjek] = useState('');
  const [pesan, setPesan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactTouched, setContactTouched] = useState({
    email: false,
    subjek: false,
    pesan: false,
  });
  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const response = await fetch('/api/faq');

        if (!response.ok) {
          throw new Error('Gagal mengambil data FAQ');
        }

        const data: FAQItem[] = await response.json();
        setFaqData(data);
      } catch (err) {
        console.error(err);
        setError('FAQ belum dapat dimuat. Silakan coba lagi.');
      } 
    };

    fetchFAQ();
  }, []);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setContactError('');
    setContactSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          email,
          subjek,
          pesan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim pesan.');
      }

      setContactSuccess(true);
      setEmail('');
      setSubjek('');
      setPesan('');

      setContactTouched({
        email: false,
        subjek: false,
        pesan: false,
      });
    } catch (error) {
      setContactError(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="main-content">
      <div className="container catalog-container">
        {/* Breadcrumb Navigation */}
        <nav id="breadcrumb-nav" className="mb-3">
          <ol className="breadcrumb breadcrumb-list">
            <li className="breadcrumb-item">
              <Link href="/" className="nav-home-link">
                <i className="bx bx-home-alt me-1"></i>Beranda
              </Link>
            </li>
            <li className="breadcrumb-item active">FAQ</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div id="catalog-header" className="mb-4 page-header-wrapper">
          <h4 className="mb-1 page-title">Pertanyaan Umum (FAQ)</h4>
          <p className="page-subtitle">
            Temukan jawaban atas pertanyaan yang sering diajukan seputar platform
            Jelajah Rasa Jawa Barat.
          </p>
        </div>

        {/* Accordion FAQ */}
        <div className="faq-container">
          <div className="faq-wrapper">
            <div id="accordionFAQ" className="faq-accordion">
              {error ? (
                <div className="faq-state-card">
                  <div className="faq-state-icon faq-error-icon">
                    <i className="bx bx-cloud-off"></i>
                  </div>

                  <h3>Informasi Belum Bisa Dimuat</h3>
                  <p>
                    Sepertinya ada kendala saat mengambil data. Coba periksa
                    koneksi atau muat ulang halaman.
                  </p>

                  <button
                    type="button"
                    className="faq-retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bx bx-refresh"></i>
                    Coba Lagi
                  </button>
                </div>
              ) : faqData.length === 0 ? (
                <div className="faq-state-card">
                  <div className="faq-state-icon faq-empty-icon">
                    <i className="bx bx-message-square-detail"></i>
                  </div>

                  <span className="faq-state-label">Pusat Bantuan</span>
                  <h3>Belum Ada Pertanyaan</h3>
                  <p>
                    Belum ada pertanyaan yang ditampilkan saat ini.
                    Silakan cek kembali nanti, ya!
                  </p>
                </div>
              ) : (
                faqData.map((item) => {
                  const isOpen = openId === item.id;

                  return (
                    <div key={item.id} className="faq-item">
                      <h2 className="faq-header">
                        <button
                          className={`faq-button ${!isOpen ? 'collapsed' : ''}`}
                          type="button"
                          onClick={() => toggleFAQ(item.id)}
                        >
                          <i className={`${item.iconClass} faq-icon`}></i>
                          {item.pertanyaan}
                        </button>
                      </h2>

                      {isOpen && (
                        <div className="faq-collapse">
                          <div className="faq-body">
                            {item.slug === 'tambah-kuliner' ? (
                              <>
                                {item.jawaban}{' '}
                                <Link
                                  href="/tambah-kuliner"
                                  className="faq-link"
                                >
                                  Tambah Kuliner
                                </Link>
                              </>
                            ) : item.slug === 'favorit' ? (
                              <>
                                {item.jawaban}{' '}
                                <Link href="/favorit" className="faq-link">
                                  Kuliner Favorit
                                </Link>
                              </>
                            ) : (
                              item.jawaban
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Card Bantuan Tambahan */}
            <div className="faq-contact-card">
              <div className="faq-contact-body">
                <i className="bx bx-message-rounded-dots faq-contact-icon"></i>
                <h3 className="faq-contact-title">Punya Pertanyaan Lain?</h3>
                <p className="faq-contact-text">
                  Jika pertanyaan Anda belum terjawab di atas, silakan hubungi tim
                  kami langsung.
                </p>
                <button
                  type="button"
                  className="faq-contact-btn"
                  onClick={() => {
                    setShowContact(true);
                    setContactError('');
                    setContactSuccess(false);
                  }}
                >
                  <i className="bx bx-envelope"></i> Hubungi Kami
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContact && (
        <div
          className="contact-modal-overlay"
          onClick={() => setShowContact(false)}
        >
          <div
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="contact-modal-close"
              onClick={() => setShowContact(false)}
              aria-label="Tutup popup"
            >
              <i className="bx bx-x"></i>
            </button>

            {contactSuccess ? (
              <div className="contact-success">
                <i className="bx bx-check-circle"></i>
                <h4>Pesan Berhasil Dikirim!</h4>
                <p>Terima kasih sudah menghubungi kami.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                <div className="contact-form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    className={
                      contactTouched.email && !email.trim() ? 'input-invalid' : ''
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() =>
                      setContactTouched((prev) => ({ ...prev, email: true }))
                    }
                    placeholder="Masukkan email kamu"
                    required
                  />

                  {contactTouched.email && !email.trim() && (
                    <small className="contact-field-error">
                      Email harus diisi.
                    </small>
                  )}
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-subject">Subjek</label>
                  <input
                    id="contact-subject"
                    type="text"
                    className={
                      contactTouched.subjek && !subjek.trim() ? 'input-invalid' : ''
                    }
                    value={subjek}
                    onChange={(e) => setSubjek(e.target.value)}
                    onBlur={() =>
                      setContactTouched((prev) => ({ ...prev, subjek: true }))
                    }
                    placeholder="Masukkan subjek pesan"
                    required
                    maxLength={150}
                  />

                  {contactTouched.subjek && !subjek.trim() && (
                    <small className="contact-field-error">
                      Subjek harus diisi.
                    </small>
                  )}
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-message">Pesan</label>
                  <textarea
                    id="contact-message"
                    className={
                      contactTouched.pesan && !pesan.trim() ? 'input-invalid' : ''
                    }
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    onBlur={() =>
                      setContactTouched((prev) => ({ ...prev, pesan: true }))
                    }
                    placeholder="Tuliskan pesan kamu..."
                    rows={5}
                    required
                    maxLength={2000}
                  />

                  {contactTouched.pesan && !pesan.trim() && (
                    <small className="contact-field-error">
                      Pesan harus diisi.
                    </small>
                  )}
                </div>

                {contactError && (
                  <p className="contact-error">{contactError}</p>
                )}

                <button
                  type="submit"
                  className="faq-contact-btn contact-submit-btn"
                  disabled={isSubmitting}
                >
                  <i className="bx bx-send"></i>
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </main>
  );
}