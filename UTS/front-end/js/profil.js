const profileUser = JSON.parse(
  localStorage.getItem(CURRENT_USER_KEY)
);

// kalau belum login
if (!profileUser) {
  window.location.href = "login.html";
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

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAFTAR_DAERAH = [
  "Kota Bandung", "Kota Cirebon", "Kota Tasikmalaya", "Kota Bogor", "Kota Garut", "Kota Sumedang",
  "Kab. Cirebon", "Kab. Garut", "Kab. Karawang", "Kab. Subang", "Kab. Sumedang"
];

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

// formatting tanggal
function formatTanggal(tanggal) {
  const bagian = String(tanggal || "").split("-");

  if (bagian.length !== 3) {
    return tanggal || "-";
  }

  return Number(bagian[2]) + " " + NAMA_BULAN[Number(bagian[1]) - 1] + " " + bagian[0];
}

// badge status usulan (Menunggu / Aktif / Nonaktif)
function badgeStatusProfil(status) {
  const warna = { "Aktif": "bg-success", "Menunggu": "bg-warning text-dark", "Nonaktif": "bg-secondary" };
  return '<span class="badge ' + (warna[status] || "bg-secondary") + '">' + escHtml(status) + '</span>';
}

// tampilkan data user
if (profileUser) {
  document.getElementById("profile-display-name").textContent = profileUser.name;
  document.getElementById("input-profile-name").value = profileUser.name;
  document.getElementById("input-profile-email").value = profileUser.email;
  document.getElementById("input-profile-city").value = profileUser.city;
  document.getElementById("user-avatar-profile").src = profileUser.avatar || "../images/homepage/default-avatar.png";
}

// upload foto profil
const inputAvatar = document.getElementById("input-upload-avatar");

if (inputAvatar && profileUser) {
  inputAvatar.addEventListener("change", function () {
    const file = inputAvatar.files[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      profileUser.avatar = event.target.result;

      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileUser));
      } catch (error) {
        alert("Gagal menyimpan: foto terlalu besar. Coba pilih foto yang lebih kecil.");
        return;
      }

      // samakan juga di daftar user (dicocokkan lewat email)
      const users = JSON.parse(localStorage.getItem("jelajahRasaUsers")) || [];

      users.forEach(function (user) {
        if (user.email === profileUser.email) {
          user.avatar = profileUser.avatar;
        }
      });

      localStorage.setItem("jelajahRasaUsers", JSON.stringify(users));

      document.getElementById("user-avatar-profile").src = profileUser.avatar;
    };

    reader.readAsDataURL(file);
  });
}

// ambil usulan milik user yang sedang login
function ambilUsulanSaya() {
  if (!profileUser) {
    return [];
  }

  try {
    const tersimpan = JSON.parse(localStorage.getItem("jelajahRasaUsulan")) || [];

    return tersimpan.filter(function (item) {
      return item.pengirim === profileUser.name;
    });
  } catch (error) {
    return [];
  }
}

function simpanSemuaUsulan(daftar) {
  localStorage.setItem("jelajahRasaUsulan", JSON.stringify(daftar));
}

// kartu histori satu kuliner
function buatItemHistori(item) {
  const gambar = item.img || "../images/homepage/default-avatar.png";

  return '<div class="history-item">' +
    '<img src="' + escHtml(gambar) + '" alt="' + escHtml(item.nama) + '" class="history-item-img">' +
    '<div class="history-item-body">' +
      '<h6 class="history-item-title">' + escHtml(item.nama) + '</h6>' +
      '<p class="history-item-meta"><i class="bx bx-map-pin"></i>' + escHtml(item.daerah) + '</p>' +
      '<p class="history-item-meta"><i class="bx bx-calendar"></i>Ditambahkan pada: ' + escHtml(formatTanggal(item.tanggal)) + '</p>' +
      '<p class="history-item-meta">' + badgeStatusProfil(item.status) + '</p>' +
    '</div>' +
    '<div class="history-item-actions">' +
      '<button type="button" class="history-btn btn-edit-histori" data-id="' + escHtml(item.id) + '" title="Edit"><i class="bx bx-edit"></i></button>' +
      '<button type="button" class="history-btn btn-hapus btn-hapus-histori" data-id="' + escHtml(item.id) + '" title="Hapus"><i class="bx bx-trash"></i></button>' +
    '</div>' +
  '</div>';
}

// tampilkan histori + counter
function renderHistori() {
  const wadah = document.getElementById("history-list-container");
  const kosong = document.getElementById("empty-history-state");
  const counter = document.getElementById("total-added-count");
  const daftar = ambilUsulanSaya();

  if (counter) {
    counter.textContent = daftar.length;
  }

  if (!wadah || !kosong) {
    return;
  }

  if (daftar.length === 0) {
    wadah.innerHTML = "";
    wadah.classList.add("d-none");
    kosong.classList.remove("d-none");
    return;
  }

  wadah.classList.remove("d-none");
  kosong.classList.add("d-none");
  wadah.innerHTML = daftar.map(buatItemHistori).join("");
}

// logout
const logoutButton = document.getElementById("btn-logout");

if (logoutButton) {
  logoutButton.addEventListener("click", function () {
    localStorage.removeItem(CURRENT_USER_KEY);
    alert("You have been logged out.");
    window.location.href = "login.html";
  });
}

// favorit
const favoriteCount = JSON.parse(
  localStorage.getItem("jelajahRasaFavorites") 
) || [];

const totalFavoriteCount = document.getElementById("total-favorite-count");

if (totalFavoriteCount) {
  totalFavoriteCount.textContent = favoriteCount.length;
}

// edit / hapus histori kuliner
const historyContainer = document.getElementById("history-list-container");

if (historyContainer) {
  historyContainer.addEventListener("click", function (event) {
    const tombolEdit = event.target.closest(".btn-edit-histori");
    const tombolHapus = event.target.closest(".btn-hapus-histori");

    if (tombolEdit) {
      const item = ambilUsulanSaya().find(function (u) {
        return String(u.id) === String(tombolEdit.dataset.id);
      });

      if (!item) {
        return;
      }

      document.getElementById("edit-kuliner-id").value = item.id;
      document.getElementById("input-edit-nama").value = item.nama;
      document.getElementById("input-edit-kategori").value = item.kategori;
      isiPilihanDaerah(document.getElementById("input-edit-daerah"), item.daerah);
      document.getElementById("input-edit-harga").value = item.harga || "";
      document.getElementById("input-edit-bahan").value = item.bahan || "";
      document.getElementById("input-edit-deskripsi").value = item.deskripsi || "";

      bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-edit-kuliner")).show();
    }

    if (tombolHapus) {
      const item = ambilUsulanSaya().find(function (u) {
        return String(u.id) === String(tombolHapus.dataset.id);
      });

      if (!item) {
        return;
      }

      if (confirm('Hapus "' + item.nama + '" dari histori kuliner Anda?')) {
        const semua = JSON.parse(localStorage.getItem("jelajahRasaUsulan")) || [];

        simpanSemuaUsulan(semua.filter(function (u) {
          return String(u.id) !== String(item.id);
        }));

        renderHistori();
      }
    }
  });
}

// form edit kuliner (histori)
const formEditKuliner = document.getElementById("form-edit-kuliner");

if (formEditKuliner) {
  formEditKuliner.addEventListener("submit", function (event) {
    event.preventDefault();

    const id = document.getElementById("edit-kuliner-id").value;
    const semua = JSON.parse(localStorage.getItem("jelajahRasaUsulan")) || [];

    semua.forEach(function (item) {
      if (String(item.id) === String(id)) {
        item.nama = document.getElementById("input-edit-nama").value.trim();
        item.kategori = document.getElementById("input-edit-kategori").value;
        item.daerah = document.getElementById("input-edit-daerah").value;
        item.harga = document.getElementById("input-edit-harga").value.trim();
        item.bahan = document.getElementById("input-edit-bahan").value.trim();
        item.deskripsi = document.getElementById("input-edit-deskripsi").value.trim();
      }
    });

    simpanSemuaUsulan(semua);
    bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-edit-kuliner")).hide();
    renderHistori();
  });
}

// form informasi personal
const formEditProfile = document.getElementById("form-edit-profile");

if (formEditProfile && profileUser) {
  formEditProfile.addEventListener("submit", function (event) {
    event.preventDefault();

    const namaBaru = document.getElementById("input-profile-name").value.trim();
    const kotaBaru = document.getElementById("input-profile-city").value.trim();
    const namaLama = profileUser.name;

    profileUser.name = namaBaru;
    profileUser.city = kotaBaru;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileUser));

    // samakan juga di daftar user (dicocokkan lewat email)
    const users = JSON.parse(localStorage.getItem("jelajahRasaUsers")) || [];

    users.forEach(function (user) {
      if (user.email === profileUser.email) {
        user.name = namaBaru;
        user.city = kotaBaru;
      }
    });

    localStorage.setItem("jelajahRasaUsers", JSON.stringify(users));

    // usulan lama tetap milik user ini walau nama berubah
    const semuaUsulan = JSON.parse(localStorage.getItem("jelajahRasaUsulan")) || [];

    semuaUsulan.forEach(function (item) {
      if (item.pengirim === namaLama) {
        item.pengirim = namaBaru;
      }
    });

    simpanSemuaUsulan(semuaUsulan);

    document.getElementById("profile-display-name").textContent = namaBaru;
    renderHistori();
    alert("Profil berhasil diperbarui.");
  });
}

renderHistori();
