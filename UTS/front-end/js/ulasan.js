const ULASAN_KEY = "jelajahRasaUlasan";

const reviewForm = document.getElementById("form-tulis-ulasan");
const reviewGrid = document.querySelector(".testimoni-grid");

// amankan teks dari input pengguna
function escHtml(teks) {
  return String(teks == null ? "" : teks)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ambilUlasan() {
  try {
    return JSON.parse(localStorage.getItem(ULASAN_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function buatKartu(ulasan) {
  return '<div class="testimoni-card-item ulasan-dinamis">' +
    '<div class="testimoni-card">' +
      '<div class="user-profile">' +
        '<img src="../images/homepage/default-avatar.png" alt="' + escHtml(ulasan.nama) + '" class="user-avatar">' +
        '<div class="user-info">' +
          '<h6 class="user-name">' + escHtml(ulasan.nama) + '</h6>' +
          '<span class="user-origin">' + escHtml(ulasan.kota) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="star-rating">' +
        '<i class="bx bxs-star"></i><i class="bx bxs-star"></i><i class="bx bxs-star"></i><i class="bx bxs-star"></i><i class="bx bxs-star"></i>' +
      '</div>' +
      '<p class="user-review">"' + escHtml(ulasan.pesan) + '"</p>' +
    '</div>' +
  '</div>';
}

function renderUlasan() {
  if (!reviewGrid) {
    return;
  }

  // hapus kartu dinamis lama dulu biar ga dobel
  reviewGrid.querySelectorAll(".ulasan-dinamis").forEach(function (kartu) {
    kartu.remove();
  });

  // cuma tampilkan ulasan yang statusnya "Tampil" (disembunyikan lewat admin)
  ambilUlasan().forEach(function (ulasan) {
    if (ulasan.status !== "Tampil") {
      return;
    }

    reviewGrid.insertAdjacentHTML("beforeend", buatKartu(ulasan));
  });
}

renderUlasan();

const btnWriteReview = document.getElementById("btn-write-review");
const modalUlasan = document.getElementById("modalUlasan");

if (btnWriteReview && modalUlasan) {
  btnWriteReview.addEventListener("click", function (event) {
    event.preventDefault();

    // cek apakah user sudah login
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (!currentUser) {
      alert("Silakan login terlebih dahulu untuk menulis ulasan.");
      window.location.href = "login.html";
      return;
    }

    const review = document.getElementById("input-pesan-ulasan").value.trim();

    if (!review) {
      alert("Silakan isi ulasan terlebih dahulu.");
      return;
    }

    const daftar = ambilUlasan();

    daftar.push({
      id: Date.now(),
      nama: currentUser.name,
      kota: currentUser.city,
      pesan: review,
      status: "Tampil",
      tanggal: new Date().toISOString().slice(0, 10)
    });

    localStorage.setItem(ULASAN_KEY, JSON.stringify(daftar));
    renderUlasan();

    alert("Ulasan berhasil dikirim!");

    reviewForm.reset();

    const modalElement = document.getElementById("modalUlasan");
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
      modal.hide();
    }
  });
}
