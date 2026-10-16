'use client';

import { useState } from 'react';
import Link from 'next/link';
import './faq.css';

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
  iconClass: string;
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const faqData: FAQItem[] = [
    {
      id: 'faq1',
      iconClass: 'bx bx-info-circle',
      question: 'Apa itu Jelajah Rasa Jawa Barat?',
      answer: 'Jelajah Rasa Jawa Barat adalah Platform direktori kuliner yang merangkum kekayaan rasa dari berbagai kota dan kabupaten di Jawa Barat.',
    },
    {
      id: 'faq2',
      iconClass: 'bx bx-plus-circle',
      question: 'Bagaimana cara menambahkan rekomendasi kuliner baru?',
      answer: (
        <>
          Anda dapat menambahkan hidangan favorit dengan masuk ke menu{' '}
          <Link href="/tambah-kuliner" className="faq-link">
            Tambah Kuliner
          </Link>{' '}
          yang ada di navigasi samping. Isi formulir informasi makanan seperti
          nama hidangan, asal daerah, estimasi harga, serta foto kuliner tersebut.
        </>
      ),
    },
    {
      id: 'faq3',
      iconClass: 'bx bx-refresh',
      question: 'Apakah informasi kuliner di sini selalu diperbarui?',
      answer: 'Ya, data kuliner diperbarui secara berkala berdasarkan kontribusi aktif dari pengguna lokal serta proses verifikasi bertahap oleh tim kurator kami.',
    },
    {
      id: 'faq4',
      iconClass: 'bx bx-bookmark-heart',
      question: 'Bagaimana cara menyimpan kuliner ke daftar favorit?',
      answer: (
        <>
          Cukup tekan ikon <strong>Hati</strong> di kartu kuliner yang ingin Anda
          simpan. Kuliner yang tersimpan secara otomatis bisa dilihat kembali di
          halaman{' '}
          <Link href="/favorit" className="faq-link">
            Kuliner Favorit
          </Link>
          .
        </>
      ),
    },
  ];

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
              {faqData.map((item) => {
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
                        {item.question}
                      </button>
                    </h2>
                    {isOpen && (
                      <div className="faq-collapse">
                        <div className="faq-body">{item.answer}</div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                <a href="mailto:halo@jelajahrasajabar.id" className="faq-contact-btn">
                  <i className="bx bx-envelope"></i> Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}