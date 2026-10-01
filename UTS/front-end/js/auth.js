const USERS_KEY = "jelajahRasaUsers";
const CURRENT_USER_KEY = "jelajahRasaCurrentUser";

const getUsers = () => {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
};

// register
const registerForm = document.getElementById("form-register");

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const city = document.getElementById("register-city").value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-password-confirm").value;

    if (password !== confirmPassword) {
      alert("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    const users = getUsers();

    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
      alert("Email sudah terdaftar.");
      return;
    }

    const newUser = {
      name: name,
      email: email,
      city: city,
      password: password
    };

    users.push(newUser);

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    alert("Pendaftaran berhasil!");

    registerForm.reset();
  });
}

// login
const loginForm = document.getElementById("form-login");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    const users = getUsers();

    const user = users.find(function (user) {
      return user.email === email && user.password === password;
    });

    if (!user) {
      alert("Email atau kata sandi salah.");
      return;
    }

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(user)
    );

    alert(`Selamat datang, ${user.name}!`);

    window.location.href = "index.html";
  })
}

// update header user
const currentUser = JSON.parse(
  localStorage.getItem(CURRENT_USER_KEY)
);

if (currentUser) {
  const userNameDekstop = document.getElementById("user-name-desktop");
  const userLinkDesktop = document.getElementById("user-link-desktop");

  const userNameMobile = document.getElementById("user-name-mobile");
  const userLinkMobile = document.getElementById("user-link-mobile");

  if (userNameDekstop) {
    userNameDekstop.textContent = currentUser.name;
  }

  if (userLinkDesktop) {
    userLinkDesktop.textContent = "Profil";
    userLinkDesktop.href = "profil.html";
  }

  if (userNameMobile) {
    userNameMobile.textContent = currentUser.name;
  }

  if(userLinkMobile) {
    userLinkMobile.textContent = "Profil";
    userLinkMobile.href = "profil.html";
  }
}

// proteksi fitur yang membutuhkan login
const loginRequiredLinks = document.querySelectorAll(".link-requires-login");

loginRequiredLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    const currentUser = JSON.parse(
      localStorage.getItem(CURRENT_USER_KEY)
    );

    if (!currentUser) {
      event.preventDefault();
      alert("Silakan login terlebih dahulu.");
      window.location.href = "login.html";
    }
  });
})