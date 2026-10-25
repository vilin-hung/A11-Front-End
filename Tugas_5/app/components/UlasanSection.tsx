"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ULASAN_KEY = "jelajahRasaUlasan";

type Ulasan = {
  id: number;
  nama: string;
  kota: string;
  pesan: string;
  status: "Tampil" | "Sembunyi";
  tanggal: string;
};

export default function UlasanSection() {
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [pesan, setPesan] = useState("");
  const router = useRouter();

  const ulasanTampil = ulasan.filter(
    (item) => item.status === "Tampil"
  );

  function bacaUlasan(): Ulasan[] {
    try {
      const data = JSON.parse(
        localStorage.getItem(ULASAN_KEY) || "[]"
      );

      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function handleSubmit() {
    const review = pesan.trim();

    if (!review) {
      alert("Silakan isi ulasan terlebih dahulu.");
      return;
    }

    let currentUser: { name: string; city: string } | null = null;

    try {
      currentUser = JSON.parse(
        localStorage.getItem("jelajahRasaCurrentUser") || "null"
      );
    } catch {
      currentUser = null;
    }

    if (!currentUser) {
      alert("Silakan login terlebih dahulu untuk menulis ulasan.");
      setModalTerbuka(false);
      router.push("/login");
      return;
    }

    const ulasanBaru: Ulasan = {
      id: Date.now(),
      nama: currentUser.name,
      kota: currentUser.city,
      pesan: review,
      status: "Tampil",
      tanggal: new Date().toISOString().slice(0, 10),
    };

    const dataTerbaru = [...ulasan, ulasanBaru];

    localStorage.setItem(
      ULASAN_KEY,
      JSON.stringify(dataTerbaru)
    );

    setUlasan(dataTerbaru);
    setPesan("");
    setModalTerbuka(false);

    alert("Ulasan berhasil dikirim!");
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
          {/* Testimoni statis: Rina */}
          <div id="testi-card-rina" className="testimoni-card-item">
            <div className="testimoni-card">
              <div className="user-profile">
                <img
                  id="img-user-rina"
                  src="/images/homepage/default-avatar.png"
                  alt="Rina S."
                  className="user-avatar"
                />

                <div className="user-info">
                  <h6 id="name-rina" className="user-name">
                    Rina S.
                  </h6>
                  <span className="user-origin">
                    Wisatawan dari Jakarta
                  </span>
                </div>
              </div>

              <div className="star-rating" aria-label="5 dari 5 bintang">
                {[1, 2, 3, 4, 5].map((bintang) => (
                  <i className="bx bxs-star" key={bintang} />
                ))}
              </div>

              <p className="user-review">
                &quot;Sangat membantu pas mau road trip kuliner ke Garut
                &amp; Tasikmalaya. Pilihan makanannya mantapp!&quot;
              </p>
            </div>
          </div>

          {/* Testimoni statis: Aris */}
          <div id="testi-card-aris" className="testimoni-card-item">
            <div className="testimoni-card">
              <div className="user-profile">
                <img
                  id="img-user-aris"
                  src="/images/homepage/default-avatar.png"
                  alt="Aris Munandar"
                  className="user-avatar"
                />

                <div className="user-info">
                  <h6 id="name-aris" className="user-name">
                    Aris Munandar
                  </h6>
                  <span className="user-origin">
                    Food Blogger Bogor
                  </span>
                </div>
              </div>

              <div className="star-rating" aria-label="4,5 dari 5 bintang">
                {[1, 2, 3, 4].map((bintang) => (
                  <i className="bx bxs-star" key={bintang} />
                ))}
                <i className="bx bxs-star-half" />
              </div>

              <p className="user-review">
                &quot;Tampilannya simpel dan langsung kelihatan makanan
                khas tiap kabupaten. Sangat informatif!&quot;
              </p>
            </div>
          </div>

          {/* Testimoni statis: Dewi */}
          <div id="testi-card-dewi" className="testimoni-card-item">
            <div className="testimoni-card">
              <div className="user-profile">
                <img
                  id="img-user-dewi"
                  src="/images/homepage/default-avatar.png"
                  alt="Dewi Lestari"
                  className="user-avatar"
                />

                <div className="user-info">
                  <h6 id="name-dewi" className="user-name">
                    Dewi Lestari
                  </h6>
                  <span className="user-origin">
                    Warga Bandung
                  </span>
                </div>
              </div>

              <div className="star-rating" aria-label="5 dari 5 bintang">
                {[1, 2, 3, 4, 5].map((bintang) => (
                  <i className="bx bxs-star" key={bintang} />
                ))}
              </div>

              <p className="user-review">
                &quot;Bisa nemu resep dan rekomendasi oleh-oleh khas
                Sumedang &amp; Ciamis yang langka!&quot;
              </p>
            </div>
          </div>

          {/* Testimoni dinamis dari localStorage */}
          {ulasanTampil.map((item) => (
            <div
              className="testimoni-card-item ulasan-dinamis"
              key={item.id}
            >
              <div className="testimoni-card">
                <div className="user-profile">
                  <img
                    src="/images/homepage/default-avatar.png"
                    alt={item.nama}
                    className="user-avatar"
                  />

                  <div className="user-info">
                    <h6 className="user-name">{item.nama}</h6>
                    <span className="user-origin">{item.kota}</span>
                  </div>
                </div>

                <div
                  className="star-rating"
                  aria-label="5 dari 5 bintang"
                >
                  {[1, 2, 3, 4, 5].map((bintang) => (
                    <i className="bx bxs-star" key={bintang} />
                  ))}
                </div>

                <p className="user-review">
                  &quot;{item.pesan}&quot;
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol membuka modal */}
        <div className="testimoni-action">
          <button
            id="btn-write-review"
            className="btn-tulis-ulasan"
            type="button"
            onClick={() => {
              setUlasan(bacaUlasan());
              setModalTerbuka(true);
            }}
          >
            <i className="bx bx-edit icon-edit" /> Tulis Ulasan Anda
          </button>
        </div>

        {/* Modal ulasan yang dikendalikan React */}

        {modalTerbuka && (
          <div
            className="modal fade show d-block"
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
                    Tulis Ulasan Kuliner
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Tutup"
                    onClick={() => setModalTerbuka(false)}
                  />
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                  }}
                >
                  <div className="modal-body modal-ulasan-body">
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
                        placeholder="Bagikan cerita pengalaman kulinermu..."
                        value={pesan}
                        onChange={(event) => setPesan(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer modal-ulasan-footer">
                    <button
                      id="btn-cancel-ulasan"
                      type="button"
                      className="btn-modal-cancel"
                      onClick={() => {
                        setModalTerbuka(false);
                        setPesan("");
                      }}
                    >
                      Batal
                    </button>

                    <button
                      id="btn-submit-ulasan"
                      type="submit"
                      className="btn-modal-submit"
                    >
                      Kirim Ulasan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
