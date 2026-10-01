const formKuliner = document.getElementById("form-tambah-kuliner");

if (formKuliner) {
  const uploadZone = document.getElementById("upload-zone");
  const fileInput = document.getElementById("foto-kuliner");
  const uploadPlaceholder = document.getElementById("upload-placeholder");
  const previewWrapper = document.getElementById("preview-wrapper");
  const imagePreview = document.getElementById("image-preview");
  const btnGantiFoto = document.getElementById("btn-hapus-foto");
  const feedbackKategori = formKuliner.querySelector(".feedback-kategori");
  const feedbackFoto = document.getElementById("feedback-foto");

  let fotoDataUrl = "";

  // tampilkan preview foto
  function tampilkanPreview(file) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      imagePreview.src = event.target.result;
      fotoDataUrl = event.target.result;
      uploadPlaceholder.classList.add("d-none");
      previewWrapper.classList.remove("d-none");
      feedbackFoto.classList.remove("show");
    };

    reader.readAsDataURL(file);
  }

  // reset preview foto
  function resetPreview() {
    fileInput.value = "";
    imagePreview.src = "#";
    fotoDataUrl = "";
    uploadPlaceholder.classList.remove("d-none");
    previewWrapper.classList.add("d-none");
  }

  // ambil tulisan option yang dipilih, fallback ke value kalau tidak ada
  function ambilLabelDaerah() {
    const select = document.getElementById("asal-daerah");
    const terpilih = select.selectedOptions && select.selectedOptions[0];

    return terpilih ? terpilih.textContent.trim() : select.value;
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
      daerah: ambilLabelDaerah(),
      status: "Menunggu",
      bahan: document.getElementById("bahan-utama").value.trim(),
      deskripsi: document.getElementById("deskripsi").value.trim(),
      rasa: karakterRasa.join(", "),
      harga: document.getElementById("estimasi-harga").value.trim(),
      pengirim: user ? user.name : "Pengunjung",
      tanggal: new Date().toISOString().slice(0, 10),
      img: fotoDataUrl || ""
    });

    try {
      localStorage.setItem("jelajahRasaUsulan", JSON.stringify(usulan));
    } catch (error) {
      alert("Gagal menyimpan: gambar terlalu besar. Coba pilih foto yang lebih kecil.");
      return false;
    }

    return true;
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

    // cek apakah user sudah login
    const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (!user) {
      alert("Silakan login terlebih dahulu untuk mengirim rekomendasi kuliner.");
      window.location.href = "login.html";
      return;
    }

    const kategoriTerpilih = formKuliner.querySelector('input[name="kategori-kuliner"]:checked');

    feedbackKategori.classList.toggle("show", !kategoriTerpilih);
    feedbackFoto.classList.toggle("show", !fotoDataUrl);

    if (!formKuliner.checkValidity() || !kategoriTerpilih || !fotoDataUrl) {
      formKuliner.classList.add("was-validated");
      return;
    }

    // kalo gagal simpan
    if (!simpanUsulan(kategoriTerpilih.value)) {
      return;
    }

    formKuliner.classList.remove("was-validated");
    formKuliner.reset();
    resetPreview();

    bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-sukses")).show();
  });
}
