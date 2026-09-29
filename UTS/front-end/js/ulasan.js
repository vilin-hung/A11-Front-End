const reviewForm = document.getElementById("form-tulis-ulasan");
const reviewGrid = document.querySelector(".testimoni-grid");

if (reviewForm && reviewGrid) {
  reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const currentUser = JSON.parse(
      localStorage.getItem(CURRENT_USER_KEY)
    );

    // cek apakah user sudah login
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

    const newReview = document.createElement("div");
    newReview.className = "testimoni-card-item";

    newReview.innerHTML = `
      <div class="testimoni-card">
        <div class="user-profile">
          <img
            src="../images/homepage/default-avatar.png"
            alt="${currentUser.name}"
            class="user-avatar"
          >

          <div class="user-info">
            <h6 class="user-name">${currentUser.name}</h6>
            <span class="user-origin">${currentUser.city}</span>
          </div>
        </div>

        <div class="star-rating">
          <i class='bx bxs-star'></i>
          <i class='bx bxs-star'></i>
          <i class='bx bxs-star'></i>
          <i class='bx bxs-star'></i>
          <i class='bx bxs-star'></i>
        </div>

        <p class="user-review">"${review}"</p>
      </div>
    `;

    reviewGrid.appendChild(newReview);

    alert("Ulasan berhasil dikirim!");

    reviewForm.reset();

    const modalElement = document.getElementById("modalUlasan");
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
      modal.hide();
    }
  });
}