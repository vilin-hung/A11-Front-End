const gridKatalog = document.getElementById("culinary-catalog-grid");
// ambil semua grid pakai class karena id-nya dobel (4 baris kategori)
const gridsKatalog = document.querySelectorAll(".catalog-grid");

// amankan teks dari input pengguna
function escHtml(teks) {
  return String(teks == null ? "" : teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const GRID_KATEGORI = {
  "Makanan": 0,
  "Jajanan": 1,
  "Minuman": 2,
  "Oleh-Oleh Khas": 3
};

// label yang tampil di badge kartu
const LABEL_KATEGORI = {
  "Makanan": "Makanan Utama",
  "Jajanan": "Jajanan",
  "Minuman": "Minuman",
  "Oleh-Oleh Khas": "Oleh-Oleh Khas"
};

const SLUG_KATEGORI = {
  "Makanan": "makanan",
  "Jajanan": "jajanan",
  "Minuman": "minuman",
  "Oleh-Oleh Khas": "oleh-oleh"
};

// "Kota Bandung" -> "Bandung" (buat badge & data-city)
function kotaSingkat(daerah) {
  return String(daerah || "").replace(/^Kota /, "").replace(/^Kab\. /, "").replace(/^Kabupaten /, "");
}

// "Gurih, Pedas" -> "gurih pedas" (biar cocok sama filter karakter rasa)
function petaRasa(rasa) {
  const peta = { "gurih": "gurih", "asin": "gurih", "pedas": "pedas", "manis": "manis", "asam": "segar" };
  const hasil = [];

  String(rasa || "").split(",").forEach(function (kata) {
    const slug = peta[kata.trim().toLowerCase()];

    if (slug && hasil.indexOf(slug) === -1) {
      hasil.push(slug);
    }
  });

  return hasil.join(" ");
}

// ambil usulan yang sudah diterima admin (status Aktif)
function ambilUsulanAktif() {
  try {
    const tersimpan = JSON.parse(localStorage.getItem("jelajahRasaUsulan")) || [];

    return tersimpan.filter(function (item) {
      return item.status === "Aktif";
    });
  } catch (error) {
    return [];
  }
}

// kartu usulan, disamakan tampilannya dengan kartu bawaan
function buatKartuUsulan(item) {
  const slugId = String(item.id).replace(/^item-/, "");
  const kategori = item.kategori;
  const kota = kotaSingkat(item.daerah);
  const label = LABEL_KATEGORI[kategori] || kategori;
  const gambar = item.img || "";

  return '' +
    '<div class="col-12 col-md-6 col-lg-4 catalog-col">' +
      '<div id="item-' + escHtml(slugId) + '" class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden catalog-card"' +
        ' data-city="' + escHtml(kota.toLowerCase()) + '"' +
        ' data-category="' + escHtml(SLUG_KATEGORI[kategori] || "makanan") + '"' +
        ' data-price=""' +
        ' data-taste="' + escHtml(petaRasa(item.rasa)) + '">' +
        '<div class="position-relative card-media-wrapper">' +
          '<img src="' + escHtml(gambar) + '" alt="' + escHtml(item.nama) + '" class="card-img-top item-img">' +
          '<div class="item-actions position-absolute top-0 end-0 p-2 d-flex gap-2">' +
            '<button type="button" class="btn btn-light btn-sm rounded-circle shadow-sm btn-icon btn-like" title="Tandai Suka">' +
              '<i class="bx bx-heart fs-6"></i>' +
            '</button>' +
            '<button type="button" class="btn btn-light btn-sm rounded-circle shadow-sm btn-icon btn-share" title="Bagikan Kuliner">' +
              '<i class="bx bx-share-alt fs-6"></i>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="card-body d-flex flex-column item-content">' +
          '<div class="mb-2 tag-wrapper">' +
            '<span class="badge rounded-pill item-badge">' + escHtml(label) + ' &bull; ' + escHtml(kota) + '</span>' +
          '</div>' +
          '<h5 class="card-title fw-bold text-dark mb-1 item-title">' + escHtml(item.nama) + '</h5>' +
          '<p class="card-text text-muted small mb-2 item-origin">' +
            '<i class="bx bx-map-pin me-1"></i>Asal: ' + escHtml(item.daerah) +
          '</p>' +
          '<p class="card-text text-secondary small mb-3 item-description">' + escHtml(item.deskripsi || "-") + '</p>' +
          '<div class="mt-auto detail-toggle-wrapper">' +
            '<button class="btn btn-outline-success btn-sm w-100 rounded-pill btn-toggle-detail d-flex align-items-center justify-content-center gap-1" type="button" data-bs-toggle="collapse" data-bs-target="#detail-' + escHtml(slugId) + '" aria-expanded="false">' +
              '<span>Lihat Detail</span> <i class="bx bx-chevron-down"></i>' +
            '</button>' +
            '<div id="detail-' + escHtml(slugId) + '" class="collapse mt-3 detail-info-box bg-light p-3 rounded-3 border">' +
              '<p class="small mb-1"><strong>Bahan utama:</strong> ' + escHtml(item.bahan || "-") + '</p>' +
              '<p class="small mb-1"><strong>Karakter Rasa:</strong> ' + escHtml(item.rasa || "-") + '</p>' +
              '<p class="small mb-0 text-success fw-bold price-range"><strong>Estimasi Harga:</strong> ' + escHtml(item.harga || "-") + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// tempel kartu usulan ke grid sesuai kategorinya
function renderUsulanKatalog() {
  ambilUsulanAktif().forEach(function (item) {
    const indeks = GRID_KATEGORI[item.kategori];

    if (indeks === undefined || !gridsKatalog[indeks]) {
      return;
    }

    gridsKatalog[indeks].insertAdjacentHTML("beforeend", buatKartuUsulan(item));
  });
}

renderUsulanKatalog();

if (gridKatalog) {
  const filterForm = document.getElementById("culinary-search-form");

  if (filterForm) {
    const inputCari = document.getElementById("input-search");

    function nilaiTerpilih(idSelect) {
      const select = document.getElementById(idSelect);

      if (!select) {
        return [];
      }

      return Array.from(select.selectedOptions).map(function (option) {
        return option.value;
      });
    }

    // cocok kalau salah satu pilihan ada di data-attribute
    function cocok(nilaiKartu, pilihan) {
      if (pilihan.length === 0) {
        return true;
      }

      return pilihan.some(function (nilai) {
        return String(nilaiKartu || "").split(" ").indexOf(nilai) !== -1;
      });
    }

    // cocokkan kata kunci search bar header dengan judul / asal kartu
    function cocokCari(kartu, kata) {
      if (!kata) {
        return true;
      }

      const teks = kartu.querySelector(".item-title").textContent + " " +
        kartu.querySelector(".item-origin").textContent;

      return teks.toLowerCase().includes(kata);
    }

    // tampilkan kartu yang lolos semua filter (antar jenis = AND)
    function terapkanFilter() {
      const kota = nilaiTerpilih("select-city");
      const kategori = nilaiTerpilih("select-category");
      const harga = nilaiTerpilih("select-price");
      const rasa = nilaiTerpilih("select-taste");
      const kataCari = inputCari ? inputCari.value.trim().toLowerCase() : "";
      let jumlahTampil = 0;

      document.querySelectorAll(".catalog-card").forEach(function (kartu) {
        const tampil =
          cocokCari(kartu, kataCari) &&
          cocok(kartu.dataset.city, kota) &&
          cocok(kartu.dataset.category, kategori) &&
          cocok(kartu.dataset.price, harga) &&
          cocok(kartu.dataset.taste, rasa);

        kartu.closest(".catalog-col").classList.toggle("d-none", !tampil);

        if (tampil) {
          jumlahTampil++;
        }
      });

      tampilkanPesanKosong(jumlahTampil === 0);
    }

    // pesan "tidak ada hasil"
    function tampilkanPesanKosong(tampil) {
      let pesan = document.getElementById("pesan-filter-kosong");

      if (tampil && !pesan) {
        return;
      }

      if (!pesan) {
        pesan = document.createElement("div");
        pesan.id = "pesan-filter-kosong";
        pesan.className = "col-12 text-center text-muted py-5";
        pesan.innerHTML = '<i class="bx bx-search-alt d-block display-4 mb-2"></i>' +
          '<p>Tidak ada kuliner yang cocok dengan filter.</p>';
        gridsKatalog[gridsKatalog.length - 1].insertAdjacentElement("afterend", pesan);
      }

      pesan.classList.toggle("d-none", !tampil);
    }

    // terapkan saat tombol diklik/saat pilihan berubah
    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      terapkanFilter();
    });

    const btnClearFilter = document.getElementById("btn-clear-filter");

    if (btnClearFilter) {
      btnClearFilter.addEventListener("click", function () {
        document.querySelectorAll("#culinary-search-form select").forEach(function (select) {
          Array.from(select.options).forEach(function (option) {
            option.selected = false;
          });
        });

        if (inputCari) {
          inputCari.value = "";
        }

        terapkanFilter();
      });
    }

    // search bar header
    if (inputCari) {
      const kataDariUrl = new URLSearchParams(window.location.search).get("search");

      if (kataDariUrl) {
        inputCari.value = kataDariUrl;
        terapkanFilter();
      }

      inputCari.addEventListener("input", terapkanFilter);

      const formHeader = document.getElementById("form-search-header");

      if (formHeader) {
        formHeader.addEventListener("submit", function (event) {
          event.preventDefault();
          terapkanFilter();
        });
      }
    }

    // kategori dari tombol "Lihat Kategori" di index
    const kategoriDariUrl = new URLSearchParams(window.location.search).get("kategori");
    const selectKategori = document.getElementById("select-category");

    if (kategoriDariUrl && selectKategori) {
      for (let i = 0; i < selectKategori.options.length; i++) {
        if (selectKategori.options[i].value === kategoriDariUrl) {
          selectKategori.options[i].selected = true;
        }
      }

      terapkanFilter();
    }
  }
}

// tombol bagikan
document.querySelectorAll(".btn-share").forEach(function (tombol) {
  tombol.addEventListener("click", function () {
    const kartu = tombol.closest(".catalog-card");

    if (!kartu) {
      return;
    }

    const judul = kartu.querySelector(".item-title").textContent.trim();
    const link = window.location.origin + window.location.pathname + "#" + kartu.id;

    if (navigator.share) {
      navigator.share({ title: judul, url: link });
    } else {
      navigator.clipboard.writeText(judul + " - " + link).then(function () {
        alert("Link berhasil disalin!");
      });
    }
  });
});
