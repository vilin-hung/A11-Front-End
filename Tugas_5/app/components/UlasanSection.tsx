"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type Ulasan = {
  id: string;
  rating: number;
  komentar: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    nama: string;
    kota: string | null;
    avatar: string | null;
  };
};

type Notifikasi = {
  tipe: "sukses" | "error";
  judul: string;
  pesan: string;
  redirect?: boolean;
  tujuan?: string;
};

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(tanggal));
}

export default function UlasanSection() {
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [modalBerhasilTerbuka, setModalBerhasilTerbuka] = useState(false);
  const [pesan, setPesan] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewBerhasil, setReviewBerhasil] = useState<Ulasan | null>(null);
  const [pesanError, setPesanError] = useState("");
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [sedangMengirim, setSedangMengirim] = useState(false);
  const [notifikasi, setNotifikasi] = useState<Notifikasi | null>(null);

  const router = useRouter();

  // Menampilkan modal notifikasi
  function tampilkanNotifikasi(
    tipe: "sukses" | "error",
    judul: string,
    pesan: string,
    redirect = false,
    tujuan = "/"
  ) {
    setNotifikasi({
      tipe,
      judul,
      pesan,
      redirect,
      tujuan,
    });
  }

  // Menutup modal notifikasi
  function tutupNotifikasi() {
    const perluRedirect = notifikasi?.redirect;
    const tujuan = notifikasi?.tujuan ?? "/";

    setNotifikasi(null);

    if (perluRedirect) {
      router.push(tujuan);
      router.refresh();
    }
  }

  // Mengambil enam ulasan terbaru yang berstatus aktif dari database
  useEffect(() => {
    async function bacaUlasan() {
      try {
        const response = await fetch("/api/reviews", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Gagal mengambil ulasan.");
        }

        setUlasan(Array.isArray(data.reviews) ? data.reviews : []);
      } catch (error) {
        console.error("Gagal mengambil ulasan:", error);
      } finally {
        setSedangMemuat(false);
      }
    }

    bacaUlasan();
  }, []);

  // Memeriksa session sebelum membuka form ulasan
  async function handleBukaModal() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await response.json();

      // Mengarahkan pengguna ke login jika belum memiliki session
      if (response.status === 401 || !data.user) {
        tampilkanNotifikasi(
          "error",
          "Login Diperlukan",
          "Silakan login terlebih dahulu untuk menulis ulasan.",
          true,
          "/login"
        );
        return;
      }

      if (!response.ok) {
        tampilkanNotifikasi(
          "error",
          "Gagal Memeriksa Sesi",
          data.message || "Gagal memeriksa sesi pengguna."
        );
        return;
      }

      setPesanError("");
      setModalTerbuka(true);
    } catch (error) {
      console.error("Gagal memeriksa session:", error);

      tampilkanNotifikasi(
        "error",
        "Terjadi Kesalahan",
        "Terjadi kesalahan saat memeriksa sesi pengguna. Silakan coba kembali."
      );
    }
  }

  // Mengirim ulasan ke database
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const review = pesan.trim();

    if (rating < 1 || rating > 5) {
      setPesanError("Silakan pilih rating bintang terlebih dahulu.");
      return;
    }

    if (!review) {
      setPesanError("Silakan isi ulasan terlebih dahulu.");
      return;
    }

    if (review.length > 1000) {
      setPesanError("Ulasan maksimal 1000 karakter.");
      return;
    }

    try {
      setSedangMengirim(true);
      setPesanError("");

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          komentar: review,
        }),
      });

      const data = await response.json();

      // Mengarahkan pengguna ke login jika session sudah tidak valid
      if (response.status === 401) {
        setModalTerbuka(false);

        tampilkanNotifikasi(
          "error",
          "Sesi Login Berakhir",
          "Sesi login kamu sudah berakhir. Silakan login kembali.",
          true,
          "/login"
        );
        return;
      }

      if (!response.ok) {
        setPesanError(data.message || "Gagal mengirim ulasan.");
        return;
      }

      // Menyimpan data ulasan untuk ditampilkan pada pop-up berhasil
      setReviewBerhasil(data.review);

      setPesan("");
      setRating(0);
      setModalTerbuka(false);
      setModalBerhasilTerbuka(true);
    } catch (error) {
      console.error("Gagal mengirim ulasan:", error);

      tampilkanNotifikasi(
        "error",
        "Gagal Mengirim Ulasan",
        "Terjadi kesalahan saat mengirim ulasan. Silakan coba kembali."
      );
    } finally {
      setSedangMengirim(false);
    }
  }

  // Menampilkan ulasan baru setelah pop-up berhasil ditutup
  function handleTutupBerhasil() {
    if (reviewBerhasil) {
      setUlasan((dataSebelumnya) => [
        reviewBerhasil,
        ...dataSebelumnya.filter(
          (item) => item.id !== reviewBerhasil.id
        ),
      ]);
    }

    setReviewBerhasil(null);
    setModalBerhasilTerbuka(false);
  }

  return (
    <section id="testimoni" className="section-testimoni">
      <div className="testimoni-container">
        <div className="testimoni-header">
          <h3 className="testimoni-title">
            Kata Penjelajah Kuliner
          </h3>

          <p className="testimoni-subtitle">
            Apa kata mereka tentang pengalaman menjelajah kuliner Pasundan
          </p>
        </div>

        <div className="testimoni-grid">
          {/* Testimoni dinamis dari database */}
          {sedangMemuat ? (
            <p className="ulasan-empty-state">
              Memuat ulasan...
            </p>
          ) : ulasan.length > 0 ? (
            ulasan.map((item) => (
              <div
                className="testimoni-card-item ulasan-dinamis"
                key={item.id}
              >
                <div className="testimoni-card">
                  <div className="user-profile">
                    <img
                      src={
                        item.user.avatar ||
                        "/images/homepage/default-avatar.png"
                      }
                      alt={item.user.nama}
                      className="user-avatar"
                    />

                    <div className="user-info">
                      <h6 className="user-name">
                        {item.user.nama}
                      </h6>

                      <span className="user-origin">
                        {item.user.kota || "Pengguna JelajahRasa"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="star-rating"
                    aria-label={`${item.rating} dari 5 bintang`}
                  >
                    {[1, 2, 3, 4, 5].map((bintang) => (
                      <i
                        className={`bx ${
                          bintang <= item.rating
                            ? "bxs-star"
                            : "bx-star"
                        }`}
                        key={bintang}
                        style={{
                          opacity: bintang <= item.rating ? 1 : 0.3,
                        }}
                      />
                    ))}
                  </div>

                  <p className="user-review">
                    &quot;{item.komentar}&quot;
                  </p>

                  <span className="ulasan-tanggal">
                    {formatTanggal(item.createdAt)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="ulasan-empty-state">
              Belum ada ulasan. Jadilah yang pertama membagikan pengalamanmu!
            </p>
          )}
        </div>

        {/* Tombol membuka modal */}
        <div className="testimoni-action">
          <button
            id="btn-write-review"
            className="btn-tulis-ulasan"
            type="button"
            onClick={handleBukaModal}
          >
            <i className="bx bx-edit icon-edit" /> Tulis Ulasan Anda
          </button>
        </div>

        {/* Modal ulasan yang dikendalikan React */}
        {modalTerbuka && (
          <div
            className="modal fade show d-block modal-ulasan-overlay"
            id="modalUlasan"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            onClick={() => setModalTerbuka(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-content modal-ulasan-content">
                <div className="modal-header modal-ulasan-header">
                  <h5
                    id="title-modal-ulasan"
                    className="modal-title ulasan-title"
                  >
                    Tulis Ulasan JelajahRasa
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Tutup"
                    onClick={() => setModalTerbuka(false)}
                  />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body modal-ulasan-body">
                    <div className="form-group-item">
                      <label className="form-label-custom">
                        Rating Anda
                      </label>

                      <div
                        className="ulasan-rating-input"
                        role="group"
                        aria-label="Pilih rating bintang"
                      >
                        {[1, 2, 3, 4, 5].map((bintang) => (
                          <button
                            type="button"
                            key={bintang}
                            className={`btn-rating-star ${
                              rating >= bintang ? "active" : ""
                            }`}
                            aria-label={`Berikan ${bintang} bintang`}
                            aria-pressed={rating === bintang}
                            onClick={() => {
                              setRating(bintang);
                              setPesanError("");
                            }}
                          >
                            <i
                              className={`bx ${
                                rating >= bintang
                                  ? "bxs-star"
                                  : "bx-star"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group-item">
                      <label
                        htmlFor="input-pesan-ulasan"
                        className="form-label-custom"
                      >
                        Ulasan Anda
                      </label>

                      <textarea
                        id="input-pesan-ulasan"
                        className="form-input-custom textarea-custom"
                        rows={3}
                        maxLength={1000}
                        placeholder="Bagikan pengalamanmu menggunakan website JelajahRasa..."
                        value={pesan}
                        onChange={(event) => {
                          setPesan(event.target.value);
                          setPesanError("");
                        }}
                        required
                      />

                      <small className="ulasan-character-count">
                        {pesan.length}/1000 karakter
                      </small>
                    </div>

                    {pesanError && (
                      <p className="ulasan-form-error" role="alert">
                        {pesanError}
                      </p>
                    )}
                  </div>

                  <div className="modal-footer modal-ulasan-footer">
                    <button
                      id="btn-cancel-ulasan"
                      type="button"
                      className="btn-modal-cancel"
                      disabled={sedangMengirim}
                      onClick={() => {
                        setModalTerbuka(false);
                        setPesan("");
                        setRating(0);
                        setPesanError("");
                      }}
                    >
                      Batal
                    </button>

                    <button
                      id="btn-submit-ulasan"
                      type="submit"
                      className="btn-modal-submit"
                      disabled={sedangMengirim}
                    >
                      {sedangMengirim
                        ? "Mengirim..."
                        : "Kirim Ulasan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal pemberitahuan ulasan berhasil dikirim */}
        {modalBerhasilTerbuka && reviewBerhasil && (
          <div
            className="modal fade show d-block modal-ulasan-overlay"
            id="modalUlasanBerhasil"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            onClick={handleTutupBerhasil}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-content modal-ulasan-content">
                <div className="modal-header modal-ulasan-header">
                  <h5 className="modal-title ulasan-title">
                    Ulasan Berhasil Dikirim!
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Tutup"
                    onClick={handleTutupBerhasil}
                  />
                </div>

                <div className="modal-body modal-ulasan-body">
                  <div className="ulasan-success-icon">
                    <i className="bx bx-check-circle" />
                  </div>

                  <p className="ulasan-success-message">
                    Terima kasih sudah membagikan pengalamanmu di JelajahRasa!
                  </p>

                  <div className="user-profile ulasan-success-profile">
                    <img
                      src={
                        reviewBerhasil.user.avatar ||
                        "/images/homepage/default-avatar.png"
                      }
                      alt={reviewBerhasil.user.nama}
                      className="user-avatar"
                    />

                    <div className="user-info">
                      <h6 className="user-name">
                        {reviewBerhasil.user.nama}
                      </h6>

                      <span className="user-origin">
                        {reviewBerhasil.user.kota ||
                          "Pengguna JelajahRasa"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="star-rating"
                    aria-label={`${reviewBerhasil.rating} dari 5 bintang`}
                  >
                    {[1, 2, 3, 4, 5].map((bintang) => (
                      <i
                        className={`bx ${
                          bintang <= reviewBerhasil.rating
                            ? "bxs-star"
                            : "bx-star"
                        }`}
                        key={bintang}
                        style={{
                          opacity:
                            bintang <= reviewBerhasil.rating ? 1 : 0.3,
                        }}
                      />
                    ))}
                  </div>

                  <p className="user-review ulasan-success-comment">
                    &quot;{reviewBerhasil.komentar}&quot;
                  </p>

                  <p className="ulasan-success-note">
                    Ulasan kamu berhasil disimpan dan akan ditampilkan
                    di halaman JelajahRasa.
                  </p>
                </div>

                <div className="modal-footer modal-ulasan-footer">
                  <button
                    type="button"
                    className="btn-modal-submit"
                    onClick={handleTutupBerhasil}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal notifikasi */}
        {notifikasi && (
          <div
            id="modal-notifikasi-ulasan"
            className="auth-notification-overlay"
            role="presentation"
          >
            <div
              className="auth-notification-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ulasan-notification-title"
            >
              <div className="auth-notification-body">
                {notifikasi.tipe === "sukses" ? (
                  <div className="auth-notification-icon success">
                    <i className="bx bx-check-circle" />
                  </div>
                ) : (
                  <div className="auth-notification-icon error">
                    <i className="bx bx-error-circle" />
                  </div>
                )}

                <h4
                  id="ulasan-notification-title"
                  className="auth-notification-title"
                >
                  {notifikasi.judul}
                </h4>

                <p className="auth-notification-message">
                  {notifikasi.pesan}
                </p>

                <button
                  id="btn-close-ulasan-notification"
                  type="button"
                  className="auth-notification-button"
                  onClick={tutupNotifikasi}
                >
                  {notifikasi.redirect ? "Lanjutkan" : "Mengerti"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}