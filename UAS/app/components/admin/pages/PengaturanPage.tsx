import { useState } from "react";

type SiteMetadata = { key: string; value: string };
type KategoriRekomendasi = "makanan" | "jajanan" | "minuman" | "oleh_oleh";
type KulinerPilihan = {
  id: string;
  nama: string;
  kategori: string;
  daerah: string;
};
type DataRekomendasi = Record<KategoriRekomendasi, string>;
type HeroKuliner = {
  id: string;
  nama: string;
  kategori: string;
  daerah: string;
  gambar: string | null;
};

const PILIHAN_REKOMENDASI: {
  key: KategoriRekomendasi;
  label: string;
  kategori: string;
}[] = [
  { key: "makanan", label: "Makanan", kategori: "Makanan" },
  { key: "jajanan", label: "Jajanan", kategori: "Jajanan" },
  { key: "minuman", label: "Minuman", kategori: "Minuman" },
  { key: "oleh_oleh", label: "Oleh-oleh", kategori: "Oleh-oleh Khas" },
];

const PILIHAN_ICON = [
  { label: "Mangkuk nasi", value: "bx bx-bowl-rice" },
  { label: "Sup", value: "bx bx-bowl-hot" },
  { label: "Sushi", value: "bx bx-sushi" },
  { label: "Kue", value: "bx bx-cake" },
  { label: "Cookies", value: "bx bx-cookie" },
  { label: "Keju", value: "bx bx-cheese" },
  { label: "Roti", value: "bx bx-baguette" },
  { label: "Garpu", value: "bx bx-fork" },
  { label: "Menu kuliner", value: "bx bx-food-menu" },
  { label: "Kopi", value: "bx bx-coffee" },
  { label: "Minuman", value: "bx bx-drink" },
  { label: "Lemon", value: "bx bx-lemon" },
  { label: "Es loli", value: "bx bx-popsicle" },
  { label: "Oleh-oleh", value: "bx bx-gift" },
];

type Props = {
  metadata: SiteMetadata[];
  metadataLoading: boolean;
  metadataSaving: boolean;
  metadataError: string;
  metadataMessage: string;
  onMetadataChange: (key: string, value: string) => void;
  onSaveMetadata: () => void;

  kulinerRekomendasi: KulinerPilihan[];
  rekomendasi: DataRekomendasi;
  rekomendasiLoading: boolean;
  rekomendasiSaving: boolean;
  rekomendasiError: string;
  rekomendasiMessage: string;
  onRekomendasiChange: (key: KategoriRekomendasi, value: string) => void;
  onSaveRekomendasi: () => void;

  kulinerHero: HeroKuliner[];
  heroKulinerIds: string[];
  heroLoading: boolean;
  heroSaving: boolean;
  heroError: string;
  heroMessage: string;
  onToggleHero: (id: string) => void;
  onMoveHero: (index: number, direction: -1 | 1) => void;
  onSaveHero: () => void;
};

export default function PengaturanPage(props: Props) {
  const [socialVisible, setSocialVisible] = useState<Record<string, boolean>>({
    social_instagram: true,
    social_tiktok: true,
    social_youtube: true,
    social_facebook: true,
  });
  
  const labels: Record<string, string> = {
    site_name: "Nama Website",
    hero_tagline: "Tagline Hero Homepage",
    hero_description: "Deskripsi Hero Homepage",
    site_description: "Deskripsi Website",
    site_email: "Email Kontak",
    site_phone: "Nomor Telepon",
    site_address: "Alamat",
    footer_text: "Teks Footer",
    social_instagram: "URL Instagram",
    social_tiktok: "URL TikTok",
    social_youtube: "URL YouTube",
    social_facebook: "URL Facebook",
    home_icon_makanan: "Ikon Kategori Makanan",
    home_icon_minuman: "Ikon Kategori Minuman",
    home_icon_jajanan: "Ikon Kategori Jajanan",
    home_icon_oleh_oleh: "Ikon Kategori Oleh-oleh",
  };

  const domainMediaSosial: Record<string, string[]> = {
    social_instagram: ["instagram.com"],
    social_tiktok: ["tiktok.com"],
    social_youtube: ["youtube.com", "youtu.be"],
    social_facebook: ["facebook.com", "fb.com"],
  };

  const validasiURL = (key: string, value: string): string => {
    const urlValue = value.trim();

    // URL media sosial boleh dikosongkan.
    if (!urlValue) return "";

    if (!/^https?:\/\//i.test(urlValue)) {
      return "URL harus diawali http:// atau https://.";
    }

    try {
      const url = new URL(urlValue);
      const domainDiizinkan = domainMediaSosial[key];

      const domainValid = domainDiizinkan.some(
        (domain) =>
          url.hostname === domain ||
          url.hostname.endsWith(`.${domain}`)
      );

      if (!domainValid || !url.hostname.includes(".")) {
        return "Gunakan URL dari platform media sosial yang sesuai.";
      }

      return "";
    } catch {
      return "Format URL tidak valid.";
    }
  };

  const socialErrors: Record<string, string> = {};

  props.metadata.forEach((item) => {
    if (domainMediaSosial[item.key]) {
      socialErrors[item.key] = validasiURL(item.key, item.value);
    }
  });

  const handleSaveMetadata = () => {
    const adaError = Object.values(socialErrors).some(
      (error) => error !== ""
    );

    if (adaError) return;

    props.onSaveMetadata();
  };
  return (
    <section id="tab-metadata">
      <h4>Pengaturan Website</h4>
      <p className="text-muted">
        Kelola informasi umum yang ditampilkan pada website JelajahRasa.
      </p>

      <div className="box-tabel border rounded bg-white p-4">
        <h5>Metadata Website</h5>

        {props.metadataLoading ? (
          <p className="text-muted mb-0">Memuat pengaturan website...</p>
        ) : (
          <>
            {props.metadataError && (
              <div className="alert alert-danger">{props.metadataError}</div>
            )}
            {props.metadataMessage && (
              <div className="alert alert-success">{props.metadataMessage}</div>
            )}

            <div className="row g-3">
              {props.metadata.map((item) => (
                <div className="col-12 col-md-6 mb-2" key={item.key}>
                  <label
                    htmlFor={`metadata-${item.key}`}
                    className="form-label fw-semibold"
                  >
                    {labels[item.key] ?? item.key}
                  </label>

                  {[
                    "site_description",
                    "site_address",
                    "footer_text",
                    "hero_description"
                  ].includes(
                    item.key
                  ) ? (
                    <textarea
                      id={`metadata-${item.key}`}
                      className="form-control"
                      rows={item.key === "site_description" ? 3 : 2}
                      value={item.value}
                      onChange={(event) =>
                        props.onMetadataChange(item.key, event.target.value)
                      }
                    />
                  ) : (
                    <>
                      {/* icons */}
                      {item.key.startsWith("home_icon_") ? (
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className={`${item.value || "bx bx-question-mark"} fs-4`} />
                          </span>

                          <select
                            id={`metadata-${item.key}`}
                            className="form-select"
                            value={item.value}
                            onChange={(event) =>
                              props.onMetadataChange(item.key, event.target.value)
                            }
                          >
                            {PILIHAN_ICON.map((icon) => (
                              <option key={icon.value} value={icon.value}>
                                {icon.label}
                              </option>
                            ))}

                            {item.value &&
                              !PILIHAN_ICON.some((icon) => icon.value === item.value) && (
                                <option value={item.value}>Ikon tersimpan</option>
                              )}
                          </select>
                        </div>
                      ) : (
                        <input
                          id={`metadata-${item.key}`}
                          type={item.key === "site_email" ? "email" : "text"}
                          className={`form-control ${
                            socialErrors[item.key] ? "is-invalid" : ""
                          }`}
                          value={item.value}
                          onChange={(event) =>
                            props.onMetadataChange(item.key, event.target.value)
                          }
                        />
                      )}

                      {socialErrors[item.key] && (
                        <div className="invalid-feedback">
                          {socialErrors[item.key]}
                        </div>
                      )}

                      {domainMediaSosial[item.key] && (
                        <div className="form-check form-switch mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`visible-${item.key}`}
                            checked={socialVisible[item.key] ?? true}
                            onChange={(event) =>
                              setSocialVisible((prev) => ({
                                ...prev,
                                [item.key]: event.target.checked,
                              }))
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`visible-${item.key}`}
                          >
                            {socialVisible[item.key]
                              ? "Tampilkan di website"
                              : "Sembunyikan dari website"}
                          </label>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSaveMetadata}
                disabled={props.metadataSaving}
              >
                {props.metadataSaving ? "Menyimpan..." : "Simpan Metadata"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="box-tabel border rounded bg-white p-4 mt-4">
        <h5>Rekomendasi Homepage</h5>
        <p className="text-muted">
          Pilih satu kuliner approved untuk setiap kategori.
        </p>

        {props.rekomendasiError && (
          <div className="alert alert-danger">{props.rekomendasiError}</div>
        )}
        {props.rekomendasiMessage && (
          <div className="alert alert-success">{props.rekomendasiMessage}</div>
        )}

        {props.rekomendasiLoading ? (
          <p className="text-muted mb-0">Memuat pilihan kuliner...</p>
        ) : (
          <>
            <div className="row g-3">
              {PILIHAN_REKOMENDASI.map((pilihan) => {
                const cocok = props.kulinerRekomendasi.filter(
                  (item) =>
                    item.kategori.trim().toLowerCase() ===
                    pilihan.kategori.toLowerCase()
                );

                return (
                  <div className="col-12 col-md-6" key={pilihan.key}>
                    <label
                      htmlFor={`rekomendasi-${pilihan.key}`}
                      className="form-label fw-semibold"
                    >
                      {pilihan.label}
                    </label>
                    <select
                      id={`rekomendasi-${pilihan.key}`}
                      className="form-select"
                      value={props.rekomendasi[pilihan.key]}
                      onChange={(event) =>
                        props.onRekomendasiChange(
                          pilihan.key,
                          event.target.value
                        )
                      }
                    >
                      <option value="">-- Tidak dipilih --</option>
                      {cocok.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nama} — {item.daerah}
                        </option>
                      ))}
                    </select>
                    {cocok.length === 0 && (
                      <small className="text-muted">
                        Belum ada kuliner approved untuk kategori ini.
                      </small>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-success"
                onClick={props.onSaveRekomendasi}
                disabled={props.rekomendasiSaving}
              >
                {props.rekomendasiSaving ? "Menyimpan..." : "Simpan Rekomendasi"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="box-tabel border rounded bg-white p-4 mt-4">
        <h5>Hero Carousel</h5>
        <p className="text-muted">
          Pilih kuliner untuk slide Hero dan atur urutannya.
        </p>

        {props.heroError && (
          <div className="alert alert-danger">{props.heroError}</div>
        )}
        {props.heroMessage && (
          <div className="alert alert-success">{props.heroMessage}</div>
        )}

        {props.heroLoading ? (
          <p className="text-muted mb-0">Memuat pilihan kuliner...</p>
        ) : (
          <>
            <h6 className="fw-semibold mt-3">Pilih Kuliner</h6>

            {props.kulinerHero.length === 0 ? (
              <p className="text-muted">
                Belum ada kuliner approved yang memiliki gambar.
              </p>
            ) : (
              <div className="row g-3">
                {props.kulinerHero.map((item) => (
                  <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                    <label className="border rounded p-3 d-flex align-items-center gap-3 h-100">
                      <input
                        type="checkbox"
                        className="form-check-input flex-shrink-0"
                        checked={props.heroKulinerIds.includes(item.id)}
                        onChange={() => props.onToggleHero(item.id)}
                      />
                      {item.gambar && (
                        <img
                          src={item.gambar}
                          alt={item.nama}
                          style={{
                            width: 80,
                            height: 65,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      )}
                      <span>
                        <strong className="d-block">{item.nama}</strong>
                        <small className="text-muted">
                          {item.kategori} — {item.daerah}
                        </small>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <hr className="my-4" />
            <h6 className="fw-semibold">Urutan Slide</h6>
            <p className="text-muted small">
              Slide pertama akan menjadi gambar pertama yang ditampilkan.
            </p>

            {props.heroKulinerIds.length === 0 ? (
              <p className="text-muted">Belum ada kuliner yang dipilih.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {props.heroKulinerIds.map((id, index) => {
                  const item = props.kulinerHero.find(
                    (kuliner) => kuliner.id === id
                  );
                  if (!item) return null;

                  return (
                    <div
                      key={id}
                      className="border rounded p-2 d-flex align-items-center gap-3"
                    >
                      <strong>{index + 1}.</strong>
                      {item.gambar && (
                        <img
                          src={item.gambar}
                          alt={item.nama}
                          style={{
                            width: 65,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                      )}
                      <span className="flex-grow-1">
                        <strong className="d-block">{item.nama}</strong>
                        <small className="text-muted">{item.daerah}</small>
                      </span>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          disabled={index === 0}
                          onClick={() => props.onMoveHero(index, -1)}
                          title="Geser ke atas"
                        >
                          <i className="bx bx-up-arrow-alt" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          disabled={index === props.heroKulinerIds.length - 1}
                          onClick={() => props.onMoveHero(index, 1)}
                          title="Geser ke bawah"
                        >
                          <i className="bx bx-down-arrow-alt" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-success"
                onClick={props.onSaveHero}
                disabled={props.heroSaving || props.heroLoading}
              >
                {props.heroSaving ? "Menyimpan..." : "Simpan Hero"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}