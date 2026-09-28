const FAVORITE_KEY = "jelajahRasaFavorites";

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITE_KEY)) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites));
}

// daftar kuliner
const likeButtons = document.querySelectorAll(".btn-like");

likeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const card = button.closest(".catalog-card");

    if (!card) {
      return;
    }

    const foodId = card.id;

    const foodData = {
      id: foodId,
      image: card.querySelector(".item-img").src,
      title: card.querySelector(".item-title").textContent.trim(),
      origin: card.querySelector(".item-origin").textContent.trim(),
      description: card.querySelector(".item-description").textContent.trim()
    };

    let favorites = getFavorites();

    const existingIndex = favorites.findIndex(function (item) {
      return item.id === foodId;
    });

    if (existingIndex !== -1) {
      favorites.splice(existingIndex, 1);

      button.classList.remove("active");
      button.querySelector("i").className = "bx bx-heart fs-6";
    } else {
      favorites.push(foodData);

      button.classList.add("active");
      button.querySelector("i").className = "bx bxs-heart fs-6";
    }

    saveFavorites(favorites);
  });
});

// halaman favorit
const favoriteContainer = document.getElementById("favorite-container");
const emptyFavorite = document.getElementById("empty-favorite");
const favoritCount = document.getElementById("favCount");

if (favoriteContainer) {
  const favorites = getFavorites();
  favoritCount.textContent = favorites.length;

  if (favorites.length === 0) {
    favoriteContainer.classList.add("d-none");
    emptyFavorite.classList.remove("d-none");
  } else {
    favoriteContainer.classList.remove("d-none");
    emptyFavorite.classList.add("d-none");
   
    favorites.forEach(function (food) {
      const card = document.createElement("div");
      card.className = "favorit-item";
      card.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
          <img src="${food.image}" 
            alt="${food.title}" 
            class="card-img-top"
            style="height: 220px; object-fit: cover;">

          <div class="card-body">
            <h5 class="card-title fw-bold">${food.title}</h5>

            <p class="card-text text-muted small">
              <i class='bx bx-map-pin'></i>
              ${food.origin}
            </p>

            <p class="card-text small">
              ${food.description}
            </p>

            <button 
              type="button"
              class="btn btn-outline-danger btn-sm rounded-pill btn-remove-favorite"
              data-id="${food.id}">
              <i class='bx bx-trash'></i>
              Hapus dari Favorit
            </button>
          </div>
        </div>
      `;
      favoriteContainer.appendChild(card);
    });

    // tombol hapus favorit
    const removeButtons = document.querySelectorAll(".btn-remove-favorite");
    removeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const foodId = button.dataset.id;
        let updatedFavorites = getFavorites();
        updatedFavorites = updatedFavorites.filter(function (food) {
          return food.id !== foodId;
        });

        saveFavorites(updatedFavorites);
        button.closest(".favorit-item").remove();
        favoritCount.textContent = updatedFavorites.lengthl

        if (updatedFavorites.length === 0) {
          favoriteContainer.classList.add("d-none");
          emptyFavorite.classList.remove("d-none");
        }
      });
    });
  }
}