const formKuliner = document.getElementById("form-tambah-kuliner");

if (formKuliner) {
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("foto-kuliner");
  const uploadPlaceholder = document.getElementById("upload-placeholder");
  const previewWrapper = document.getElementById("preview-wrapper");
  const imagePreview = document.getElementById("image-preview");
  const btnGantiFoto = document.getElementById("btn-hapus-foto");
  const feedbackKategori = formKuliner.querySelector(".feedback-kategori");

  // tampilkan preview foto
  function tampilkanPreview(file) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      imagePreview.src = event.target.result;
      uploadPlaceholder.classList.add("d-none");
      previewWrapper.classList.remove("d-none");
    };

    reader.readAsDataURL(file);
  }

  // reset preview foto
  function resetPreview() {
    fileInput.value = "";
    imagePreview.src = "#";
    uploadPlaceholder.classList.remove("d-none");
    previewWrapper.classList.add("d-none");
  }

  // simpan usulan ke localStorage
  function simpanUsulan(kategori) {
    const user = JSON.parse(localStorage.getItem("jelajahRasaCurrentUser"));
    const usulan = JSON.parse(localStorage.getItem("jelajahRasaUsulan")) || [];

    // ambil semua checkbox karakter rasa yang dicentang
    const karakterRasa = Array.from(
      formKuliner.querySelectorAll('input[name="karakter-rasa"]:checked')
    ).map(function (checkbox) {
      return checkbox.value;
    });

    usulan.push({
      id: Date.now(),
      nama: document.getElementById("nama-kuliner").value.trim(),
      kategori: kategori,
      daerah: document.getElementById("asal-daerah").value,
      status: "Menunggu",
      bahan: document.getElementById("bahan-utama").value.trim(),
      deskripsi: document.getElementById("deskripsi").value.trim(),
      rasa: karakterRasa.join(", "),
      harga: document.getElementById("estimasi-harga").value.trim(),
      pengirim: user ? user.name : "Pengunjung",
      tanggal: new Date().toISOString().slice(0, 10)
    });

    localStorage.setItem("jelajahRasaUsulan", JSON.stringify(usulan));
  }

  // buka file picker
  uploadZone.addEventListener("click", function (event) {
    if (event.target !== fileInput) {
      fileInput.click();
    }
  });

  // efek drag & drop
  uploadZone.addEventListener("dragover", function (event) {
    event.preventDefault();
    uploadZone.classList.add("dragover");
  });

  uploadZone.addEventListener("dragleave", function () {
    uploadZone.classList.remove("dragover");
  });

  // lepas file di upload zone
  uploadZone.addEventListener("drop", function (event) {
    event.preventDefault();
    uploadZone.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (file) {
      fileInput.files = event.dataTransfer.files;
      tampilkanPreview(file);
    }
  });

  // pilih file dari input
  fileInput.addEventListener("change", function () {
    tampilkanPreview(fileInput.files[0]);
  });

  // tombol ganti foto
  btnGantiFoto.addEventListener("click", function (event) {
    event.stopPropagation();
    fileInput.click();
  });

  // sembunyikan pesan error kategori
  formKuliner.addEventListener("change", function (event) {
    if (event.target.name === "kategori-kuliner") {
      feedbackKategori.classList.remove("show");
    }
  });

  // validasi + kirim form
  formKuliner.addEventListener("submit", function (event) {
    event.preventDefault();

    const kategoriTerpilih = formKuliner.querySelector('input[name="kategori-kuliner"]:checked');

    feedbackKategori.classList.toggle("show", !kategoriTerpilih);

    if (!formKuliner.checkValidity() || !kategoriTerpilih) {
      formKuliner.classList.add("was-validated");
      return;
    }

    simpanUsulan(kategoriTerpilih.value);

    formKuliner.classList.remove("was-validated");
    formKuliner.reset();
    resetPreview();

    bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-sukses")).show();
  });
}
