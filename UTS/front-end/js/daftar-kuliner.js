const gridKatalog = document.getElementById("culinary-catalog-grid");
// ambil semua grid pakai class karena id-nya dobel (4 baris kategori)
const gridsKatalog = document.querySelectorAll(".catalog-grid");

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

    filterForm.addEventListener("change", terapkanFilter);

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
