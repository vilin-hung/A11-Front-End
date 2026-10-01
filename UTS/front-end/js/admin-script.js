// key localStorage
const USULAN_KEY = "jelajahRasaUsulan";
const ULASAN_KEY = "jelajahRasaUlasan";
const FAVORITE_KEY = "jelajahRasaFavorites";

// daftar 11 kota/kabupaten
const DAFTAR_DAERAH = [
  "Kota Bandung", "Kota Cirebon", "Kota Tasikmalaya", "Kota Bogor", "Kota Garut", "Kota Sumedang",
  "Kab. Cirebon", "Kab. Garut", "Kab. Karawang", "Kab. Subang", "Kab. Sumedang"
];

// data manual 12 kuliner
const DATA_AWAL = [
  { id: "item-empal-gentong", nama: "Empal Gentong", kategori: "Makanan", daerah: "Kab. Cirebon", status: "Aktif", bahan: "Daging Sapi, Jeroan, Santan, Bumbu Rempah Kuning, Daun Kucai.", deskripsi: "Gulai daging sapi dimasak dalam gentong tanah liat berkuah santan gurih.", img: "../images/menu/makanan/empal gentong.jpg" },
  { id: "item-mie-kocok-bandung", nama: "Mie Kocok Bandung", kategori: "Makanan", daerah: "Kota Bandung", status: "Aktif", bahan: "Mie kuning, Kaldu Sapi, Kikil, Tauge, Bakso.", deskripsi: "Mie kuah kaldu sapi khas Bandung dengan isian kikil melimpah dan tekstur mie lembut.", img: "../images/menu/makanan/mie kocok bandung.jpg" },
  { id: "item-karedok", nama: "Karedok", kategori: "Makanan", daerah: "Kab. Sumedang", status: "Aktif", bahan: "Kacang Panjang, Timun, Tauge, Kol, Daun Kemangi, Terong Bulat, Bumbu Kacang, Kencur.", deskripsi: "Makanan tradisional khas Sunda dari campuran sayuran mentah segar dengan bumbu kacang gurih.", img: "../images/menu/makanan/karedok.jpg" },
  { id: "item-burayot", nama: "Burayot", kategori: "Jajanan", daerah: "Kab. Garut", status: "Aktif", bahan: "Tepung Beras, Gula Merah, Minyak Kelapa.", deskripsi: "Jajanan pasar khas Garut dengan bentuk unik dan cita rasa manis legit.", img: "../images/menu/jajanan/burayot.jpg" },
  { id: "item-colenak", nama: "Colenak", kategori: "Jajanan", daerah: "Kota Bandung", status: "Aktif", bahan: "Tape Singkong, Gula Merah, Kelapa.", deskripsi: "Tape bakar yang disantap dengan lelehan gula merah dan parutan kelapa.", img: "../images/menu/jajanan/colenak.jpg" },
  { id: "item-jalabia", nama: "Jalabia", kategori: "Jajanan", daerah: "Kab. Bekasi", status: "Aktif", bahan: "Tepung Ketan, Kelapa Parut, Santan, Garam.", deskripsi: "Kue berbentuk mirip donat kecil dengan tekstur dan rasa khas tradisional.", img: "../images/menu/jajanan/jalabia.jpg" },
  { id: "item-bandrek", nama: "Bandrek", kategori: "Minuman", daerah: "Priangan", status: "Aktif", bahan: "Jahe Bakar, Gula Aren, Rempah Alami.", deskripsi: "Minuman hangat dari perpaduan jahe bakar, gula aren, dan rempah alami.", img: "../images/menu/minuman/bandrek.jpg" },
  { id: "item-es-cuing", nama: "Es Cuing", kategori: "Minuman", daerah: "Kota Cirebon", status: "Aktif", bahan: "Jeli Cuing, Kuah Santan, Pemanis.", deskripsi: "Minuman segar khas Cirebon yang mirip dengan es cincau.", img: "../images/menu/minuman/es cuing.jpg" },
  { id: "item-bir-kotjok", nama: "Bir Kotjok", kategori: "Minuman", daerah: "Kota Bogor", status: "Aktif", bahan: "Jahe Merah, Kayu Manis, Cengkeh, Gula Aren, Kapulaga.", deskripsi: "Minuman tradisional khas Bogor dari rempah-rempah alami, tanpa alkohol.", img: "../images/menu/minuman/bir kotjok.jpg" },
  { id: "item-wajit-cililin", nama: "Wajit Cililin", kategori: "Oleh-Oleh Khas", daerah: "Kota Bandung", status: "Aktif", bahan: "Beras Ketan, Kelapa Tua, Gula Merah, Gula Pasir.", deskripsi: "Kudapan legendaris bercita rasa manis, legit, dan bertekstur kenyal.", img: "../images/menu/oleh-oleh khas/wajit cililin.jpg" },
  { id: "item-ali-agrem", nama: "Ali Agrem", kategori: "Oleh-Oleh Khas", daerah: "Kab. Karawang", status: "Aktif", bahan: "Tepung Beras, Gula Merah, Gula Pasir, Minyak Goreng, Air.", deskripsi: "Kue cincin tradisional dengan tekstur padat dan rasa manis legit.", img: "../images/menu/oleh-oleh khas/ali agrem.jpg" },
  { id: "item-papais", nama: "Papais", kategori: "Oleh-Oleh Khas", daerah: "Kab. Subang", status: "Aktif", bahan: "Tepung Beras, Tepung Ketan, Santan, Pisang.", deskripsi: "Kue basah bertekstur lembut dan kenyal dengan rasa manis legit atau gurih.", img: "../images/menu/oleh-oleh khas/papais.jpg" }
];

let dataKuliner = DATA_AWAL.map(function (item) { return Object.assign({}, item); });

// usulan dari pengguna
let usulan = ambilUsulan();
let ulasan = ambilUlasan();

const $ = (id) => document.getElementById(id);

let chartDaerah = null;

// ambil usulan dari localStorage
function ambilUsulan() {
  try {
    return JSON.parse(localStorage.getItem(USULAN_KEY)) || [];
  } catch (error) {
    return [];
  }
}

// simpan usulan ke localStorage
function simpanUsulan() {
  localStorage.setItem(USULAN_KEY, JSON.stringify(usulan));
}

function ambilUlasan() {
  try {
    return JSON.parse(localStorage.getItem(ULASAN_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function simpanUlasan() {
  localStorage.setItem(ULASAN_KEY, JSON.stringify(ulasan));
}

// ambil favorit dari localStorage
function ambilFavorit() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

// amankan teks dari input pengguna
function escHtml(teks) {
  return String(teks == null ? "" : teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// badge status (Aktif / Menunggu / Nonaktif)
function badgeStatus(status) {
  const warna = { "Aktif": "bg-primary", "Menunggu": "bg-warning text-dark", "Nonaktif": "bg-secondary", "Tampil": "bg-success", "Sembunyi": "bg-secondary" };
  return '<span class="badge ' + (warna[status] || "bg-secondary") + '">' + escHtml(status) + '</span>';
}

// baris kosong untuk tabel
function barisKosong(colspan, ikon, pesan) {
  return '<tr class="baris-kosong"><td colspan="' + colspan + '" class="text-center text-muted">' +
    '<i class="bx ' + ikon + ' d-block"></i><span>' + pesan + '</span></td></tr>';
}

// foto kecil buat kolom nama di tabel admin
function fotoMini(item) {
  if (!item.img) {
    // data lama tanpa foto pake ikon placeholder
    return '<i class="bx bx-image text-muted me-2" style="font-size:26px"></i>';
  }

  return '<img src="' + escHtml(item.img) + '" alt="" class="rounded me-2 foto-klik"' +
    ' data-nama="' + escHtml(item.nama) + '" data-img="' + escHtml(item.img) + '"' +
    ' style="width:40px;height:40px;object-fit:cover;cursor:zoom-in">';
}

// cari kuliner berdasarkan id
function cariKuliner(id) {
  return dataKuliner.find(function (item) { return String(item.id) === String(id); });
}

// cari usulan berdasarkan id
function cariUsulan(id) {
  return usulan.find(function (item) { return String(item.id) === String(id); });
}

// cari item di data manual + usulan
function cariItem(id) {
  return cariKuliner(id) || cariUsulan(id);
}

// gabungan kuliner manual + usulan pengguna
function daftarGabungan() {
  return dataKuliner.concat(usulan);
}

// tampilkan statistik
function renderStatistik() {
  const hitung = { "Makanan": 0, "Jajanan": 0, "Minuman": 0, "Oleh-Oleh Khas": 0 };
  const semua = daftarGabungan();

  semua.forEach(function (item) {
    if (hitung[item.kategori] !== undefined) {
      hitung[item.kategori]++;
    }
  });

  $("stat-total-kuliner").textContent = semua.length;
  $("stat-perlu-menunggu").textContent = usulan.filter(function (item) {
    return item.status === "Menunggu";
  }).length;
  $("stat-total-usulan").textContent = usulan.length;
  $("stat-total-favorit").textContent = ambilFavorit().length;

  $("hitung-makanan").textContent = hitung["Makanan"];
  $("hitung-minuman").textContent = hitung["Minuman"];
  $("hitung-jajanan").textContent = hitung["Jajanan"];
  $("hitung-oleholeh").textContent = hitung["Oleh-Oleh Khas"];
  renderChartDaerah();
}

// samakan nama daerah: "Kabupaten X" -> "Kab. X" biar ga kepecah 2 bar
function rapikanDaerah(nama) {
  return String(nama || "").replace(/^Kabupaten /, "Kab. ");
}

// grafik batang jumlah kuliner per daerah
function renderChartDaerah() {
  const canvas = $("chart-daerah");

  // lewati kalau canvas ga ada / ga ke load
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  const hitungDaerah = {};

  daftarGabungan().forEach(function (item) {
    // cuma hitung yang statusnya Aktif (Menunggu/Nonaktif ga masuk grafik)
    if (item.status !== "Aktif") {
      return;
    }

    const daerah = rapikanDaerah(item.daerah);
    hitungDaerah[daerah] = (hitungDaerah[daerah] || 0) + 1;
  });

  const urut = Object.keys(hitungDaerah).sort(function (a, b) {
    return hitungDaerah[b] - hitungDaerah[a];
  });

  const dataBaru = {
    labels: urut,
    datasets: [{
      label: "Jumlah Kuliner",
      data: urut.map(function (daerah) { return hitungDaerah[daerah]; }),
      backgroundColor: "#8CA978",
      borderRadius: 4
    }]
  };

  // update data
  if (!chartDaerah) {
    chartDaerah = new Chart(canvas, {
      type: "bar",
      data: dataBaru,
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          // sumbu x = nama daerah
          x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 0 } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
    return;
  }

  chartDaerah.data = dataBaru;
  chartDaerah.update();
}

// tampilkan tabel pengajuan rekomendasi
function renderUsulan() {
  const wadah = $("tabel-usulan-terbaru");

  if (usulan.length === 0) {
    wadah.innerHTML = barisKosong(5, "bx-inbox", "Belum ada pengajuan rekomendasi kuliner baru.");
    return;
  }

  const terbaru = usulan.slice().sort(function (a, b) {
    const urutTanggal = String(b.tanggal || "").localeCompare(String(a.tanggal || ""));

    if (urutTanggal !== 0) {
      return urutTanggal;
    }

    return (Number(b.id) || 0) - (Number(a.id) || 0);
  }).slice(0, 5);

  wadah.innerHTML = terbaru.map(function (item) {
    const aksi = item.status === "Menunggu"
      ? '<button type="button" class="btn btn-success btn-sm btn-terima" data-id="' + escHtml(item.id) + '">Terima</button> ' +
        '<button type="button" class="btn btn-outline-danger btn-sm btn-tolak" data-id="' + escHtml(item.id) + '">Tolak</button>'
      : '<span class="text-muted small">-</span>';

    return '<tr>' +
      '<td><div class="d-flex align-items-center">' + fotoMini(item) + escHtml(item.nama) + '</div></td>' +
      '<td>' + escHtml(item.pengirim) + '</td>' +
      '<td>' + escHtml(item.tanggal) + '</td>' +
      '<td>' + badgeStatus(item.status) + '</td>' +
      '<td class="text-center">' + aksi + '</td>' +
    '</tr>';
  }).join("");
}

// tampilkan tabel daftar kuliner
function renderKelola() {
  const wadah = $("tabel-daftar-kuliner");
  const semua = daftarGabungan();

  if (semua.length === 0) {
    wadah.innerHTML = barisKosong(5, "bx-folder-open", "Belum ada data kuliner.");
    return;
  }

  wadah.innerHTML = semua.map(function (item) {
    return '<tr>' +
      '<td><div class="d-flex align-items-center">' + fotoMini(item) + escHtml(item.nama) + '</div></td>' +
      '<td>' + escHtml(item.kategori) + '</td>' +
      '<td>' + escHtml(item.daerah) + '</td>' +
      '<td>' + badgeStatus(item.status) + '</td>' +
      '<td class="text-center">' +
        '<button type="button" class="btn btn-warning btn-sm btn-edit" data-id="' + escHtml(item.id) + '">Edit</button> ' +
        '<button type="button" class="btn btn-outline-danger btn-sm btn-hapus" data-id="' + escHtml(item.id) + '">Hapus</button>' +
      '</td>' +
    '</tr>';
  }).join("");
}

// tampilkan tabel ulasan pengguna
function renderUlasan() {
  const wadah = $("tabel-daftar-ulasan");

  if (ulasan.length === 0) {
    wadah.innerHTML = barisKosong(5, "bx-chat", "Belum ada ulasan dari pengguna.");
    return;
  }

  wadah.innerHTML = ulasan.slice().sort(function (a, b) {
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  }).map(function (item) {
    const aksi = item.status === "Tampil"
      ? '<button type="button" class="btn btn-outline-secondary btn-sm btn-toggle-ulasan" data-id="' + escHtml(item.id) + '">Sembunyikan</button>'
      : '<button type="button" class="btn btn-success btn-sm btn-toggle-ulasan" data-id="' + escHtml(item.id) + '">Tampilkan</button>';

    return '<tr>' +
      '<td>' + escHtml(item.nama) + '</td>' +
      '<td>' + escHtml(item.pesan) + '</td>' +
      '<td>' + escHtml(item.tanggal) + '</td>' +
      '<td>' + badgeStatus(item.status) + '</td>' +
      '<td class="text-center">' + aksi + '</td>' +
    '</tr>';
  }).join("");
}

// tampilkan top 5 kuliner terfavorit
function renderTop5() {
  const wadah = $("tabel-peringkat-favorit");
  const favorit = ambilFavorit();

  const peringkat = dataKuliner.map(function (item) {
    const jumlah = favorit.filter(function (favoritItem) {
      return favoritItem.id === item.id;
    }).length;

    return { item: item, jumlah: jumlah };
  }).filter(function (baris) {
    return baris.jumlah > 0;
  }).sort(function (a, b) {
    return b.jumlah - a.jumlah;
  }).slice(0, 5);

  if (peringkat.length === 0) {
    wadah.innerHTML = barisKosong(4, "bx-heart", "Belum ada data favorit dari pengguna.");
    return;
  }

  wadah.innerHTML = peringkat.map(function (baris, indeks) {
    return '<tr>' +
      '<td>' + (indeks + 1) + '</td>' +
      '<td>' + escHtml(baris.item.nama) + '</td>' +
      '<td>' + escHtml(baris.item.kategori) + '</td>' +
      '<td class="text-end">' + baris.jumlah + '</td>' +
    '</tr>';
  }).join("");
}

// render semua bagian
function renderSemua() {
  renderStatistik();
  renderUsulan();
  renderKelola();
  renderTop5();
  renderUlasan();
}

// isi dropdown kota/kabupaten
function isiPilihanDaerah(select, nilaiTerpilih) {
  const pilihan = DAFTAR_DAERAH.slice();

  if (nilaiTerpilih && pilihan.indexOf(nilaiTerpilih) === -1) {
    pilihan.push(nilaiTerpilih);
  }

  select.innerHTML = '<option value="" disabled>-- Pilih Kota/Kabupaten --</option>' +
    pilihan.map(function (daerah) {
      return '<option value="' + escHtml(daerah) + '">' + escHtml(daerah) + '</option>';
    }).join("");

  select.value = nilaiTerpilih || "";
}

// terima / tolak usulan
$("tabel-usulan-terbaru").addEventListener("click", function (event) {
  const gambar = event.target.closest(".foto-klik");

  if (gambar) {
    bukaGambar(gambar);
    return;
  }

  const tombolTerima = event.target.closest(".btn-terima");
  const tombolTolak = event.target.closest(".btn-tolak");

  if (tombolTerima) {
    const item = cariUsulan(tombolTerima.dataset.id);

    if (item) {
      item.status = "Aktif";
      simpanUsulan();
      renderSemua();
    }
  }

  if (tombolTolak) {
    $("tolak-id-usulan").value = tombolTolak.dataset.id;
    bootstrap.Modal.getOrCreateInstance($("modal-tolak-usulan")).show();
  }
});

// edit / hapus kuliner
$("tabel-daftar-kuliner").addEventListener("click", function (event) {
  const gambar = event.target.closest(".foto-klik");

  if (gambar) {
    bukaGambar(gambar);
    return;
  }

  const tombolEdit = event.target.closest(".btn-edit");
  const tombolHapus = event.target.closest(".btn-hapus");

  if (tombolEdit) {
    const item = cariItem(tombolEdit.dataset.id);

    if (!item) {
      return;
    }

    $("edit-id").value = item.id;
    $("edit-nama").value = item.nama;
    $("edit-kategori").value = item.kategori;
    isiPilihanDaerah($("edit-daerah"), item.daerah);
    $("edit-status").value = item.status;
    $("edit-bahan").value = item.bahan || "";
    $("edit-deskripsi").value = item.deskripsi || "";

    bootstrap.Modal.getOrCreateInstance($("modal-edit-kuliner")).show();
  }

  if (tombolHapus) {
    const item = cariItem(tombolHapus.dataset.id);

    if (!item) {
      return;
    }

    if (confirm('Hapus "' + item.nama + '" dari daftar kuliner?')) {
      const itemUsulan = cariUsulan(item.id);

      if (itemUsulan) {
        usulan = usulan.filter(function (usulanItem) {
          return String(usulanItem.id) !== String(item.id);
        });
        simpanUsulan();
      } else {
        dataKuliner = dataKuliner.filter(function (kuliner) {
          return String(kuliner.id) !== String(item.id);
        });
      }

      renderSemua();
    }
  }
});

// buka gambar ukuran penuh di modal
function bukaGambar(gambar) {
  if (!gambar) {
    return;
  }

  $("judul-gambar").textContent = gambar.dataset.nama;
  $("gambar-ukuran-penuh").src = gambar.dataset.img;
  bootstrap.Modal.getOrCreateInstance($("modal-lihat-gambar")).show();
}

// tampilkan / sembunyikan ulasan
$("tabel-daftar-ulasan").addEventListener("click", function (event) {
  const tombolToggle = event.target.closest(".btn-toggle-ulasan");

  if (!tombolToggle) {
    return;
  }

  // cari ulasan yang sesuai id tombol
  const item = ulasan.find(function (u) {
    return String(u.id) === String(tombolToggle.dataset.id);
  });

  if (item) {
    // balik statusnya lalu simpan
    item.status = item.status === "Tampil" ? "Sembunyi" : "Tampil";
    simpanUlasan();
    renderSemua();
  }
});

// form edit kuliner
$("form-edit-kuliner").addEventListener("submit", function (event) {
  event.preventDefault();

  const item = cariItem($("edit-id").value);

  if (item) {
    item.nama = $("edit-nama").value.trim();
    item.kategori = $("edit-kategori").value;
    item.daerah = $("edit-daerah").value;
    item.status = $("edit-status").value;
    item.bahan = $("edit-bahan").value.trim();
    item.deskripsi = $("edit-deskripsi").value.trim();

    if (cariUsulan(item.id)) {
      simpanUsulan();
    }
  }

  bootstrap.Modal.getOrCreateInstance($("modal-edit-kuliner")).hide();
  renderSemua();
});

// form tolak usulan
$("form-tolak-usulan").addEventListener("submit", function (event) {
  event.preventDefault();

  const item = cariUsulan($("tolak-id-usulan").value);

  if (item) {
    item.status = "Nonaktif";
    simpanUsulan();
  }

  event.target.reset();
  bootstrap.Modal.getOrCreateInstance($("modal-tolak-usulan")).hide();
  renderSemua();
});

// render awal
renderSemua();
