const profileUser = JSON.parse(
  localStorage.getItem(CURRENT_USER_KEY)
);

// kalau belum login
if (!profileUser) {
  window.location.href = "login.html";
}

// tampilkan data user
if (profileUser) {
  document.getElementById("profile-display-name").textContent = profileUser.name;
  document.getElementById("input-profile-name").value = profileUser.name;
  document.getElementById("input-profile-email").value = profileUser.email;
  document.getElementById("input-profile-city").value = profileUser.city;
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