"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./login.css";

const USERS_KEY = "jelajahRasaUsers";
const CURRENT_USER_KEY = "jelajahRasaCurrentUser";

interface User {
    name: string;
    email: string;
    city: string;
    password: string;
    avatar?: string;
}

type Notifikasi = {
    tipe: "sukses" | "error";
    judul: string;
    pesan: string;
    redirect?: boolean;
};

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    // state dan router
    const router = useRouter();

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerCity, setRegisterCity] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loginEmailError, setLoginEmailError] = useState("");
    const [loginPasswordError, setLoginPasswordError] = useState("");
    const [registerNameError, setRegisterNameError] = useState("");
    const [registerEmailError, setRegisterEmailError] = useState("");
    const [registerCityError, setRegisterCityError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const [notifikasi, setNotifikasi] = useState<Notifikasi | null>(null);

    // function handler
    function getUsers(): User[] {
        try {
            const data = JSON.parse(
                localStorage.getItem(USERS_KEY) || "[]"
            );

            return Array.isArray(data) ? (data as User[]) : [];
        } catch {
            return [];
        }
    }

    // Memeriksa format email
    function validasiEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Memeriksa apakah email sudah terdaftar
    function emailSudahTerdaftar(email: string): boolean {
        return getUsers().some(
            (user) => user.email.trim().toLowerCase() === email
        );
    }

    // Menampilkan modal notifikasi
    function tampilkanNotifikasi(
        tipe: "sukses" | "error",
        judul: string,
        pesan: string,
        redirect = false
    ) {
        setNotifikasi({
            tipe,
            judul,
            pesan,
            redirect,
        });
    }

    // Menutup modal notifikasi
    function tutupNotifikasi() {
        const perluRedirect = notifikasi?.redirect;

        setNotifikasi(null);

        if (perluRedirect) {
            router.push("/");
            router.refresh();
        }
    }

    // Memeriksa kecocokan email dan kata sandi saat login
    function validasiKredensialLogin(
        email: string,
        password: string
    ) {
        const emailBersih = email.trim().toLowerCase();

        if (!emailBersih || !password || !validasiEmail(emailBersih)) {
            return;
        }

        const user = getUsers().find(
            (item) =>
                item.email.trim().toLowerCase() === emailBersih &&
                item.password === password
        );

        if (!user) {
            // Karena salah satu atau kedua data bisa salah, tandai kedua kolom.
            const pesan = "Email atau kata sandi salah.";

            setLoginEmailError(pesan);
            setLoginPasswordError(pesan);
        } else {
            setLoginEmailError("");
            setLoginPasswordError("");
        }
    }

    // handle register
    function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const email = registerEmail.trim().toLowerCase();
        const name = registerName.trim();
        const city = registerCity.trim();

        // Reset pesan validasi sebelumnya
        setRegisterNameError("");
        setRegisterEmailError("");
        setRegisterCityError("");
        setPasswordError("");
        setConfirmPasswordError("");

        let adaError = false;

        // Validasi nama
        if (!name) {
            setRegisterNameError("Nama lengkap wajib diisi.");
            adaError = true;
        } else if (name.length < 4) {
            setRegisterNameError("Nama lengkap minimal 4 karakter.");
            adaError = true;
        }

        // Validasi email
        if (!email) {
            setRegisterEmailError("Email wajib diisi.");
            adaError = true;
        } else if (!validasiEmail(email)) {
            setRegisterEmailError(
                "Masukkan alamat email dengan format yang benar."
            );
            adaError = true;
        } else if (emailSudahTerdaftar(email)) {
            setRegisterEmailError(
                "Email sudah terdaftar. Gunakan email lain."
            );
            adaError = true;
        }

        // Validasi kota atau kabupaten
        if (!city) {
            setRegisterCityError("Kota atau kabupaten wajib diisi.");
            adaError = true;
        }

        // Validasi kata sandi
        if (!registerPassword) {
            setPasswordError("Kata sandi wajib diisi.");
            adaError = true;
        } else if (registerPassword.length < 6) {
            setPasswordError("Kata sandi minimal 6 karakter.");
            adaError = true;
        }

        // Validasi konfirmasi kata sandi
        if (!confirmPassword) {
            setConfirmPasswordError("Konfirmasi kata sandi wajib diisi.");
            adaError = true;
        } else if (registerPassword !== confirmPassword) {
            setConfirmPasswordError("Konfirmasi kata sandi tidak cocok.");
            adaError = true;
        }

        if (adaError) {
            return;
        }

        const newUser: User = {
            name,
            email,
            city,
            password: registerPassword,
        };

        const updatedUsers = [...getUsers(), newUser];

        try {
            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(updatedUsers)
            );

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(newUser)
            );
        } catch {
            tampilkanNotifikasi(
                "error",
                "Pendaftaran Gagal",
                "Data akun tidak dapat disimpan. Silakan coba kembali."
            );
            return;
        }

        window.dispatchEvent(new Event("jelajahRasaUserUpdated"));

        tampilkanNotifikasi(
            "sukses",
            "Pendaftaran Berhasil",
            `Selamat datang, ${newUser.name}! Akun kamu berhasil dibuat.`,
            true
        );
    }

    // handle login
    function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const email = loginEmail.trim().toLowerCase();

        // Reset pesan validasi sebelumnya
        setLoginEmailError("");
        setLoginPasswordError("");

        let adaError = false;

        // Validasi email login
        if (!email) {
            setLoginEmailError("Email wajib diisi.");
            adaError = true;
        } else if (!validasiEmail(email)) {
            setLoginEmailError(
                "Masukkan alamat email dengan format yang benar."
            );
            adaError = true;
        }

        // Validasi kata sandi login
        if (!loginPassword) {
            setLoginPasswordError("Kata sandi wajib diisi.");
            adaError = true;
        }

        if (adaError) {
            return;
        }

        const user = getUsers().find(
            (item) =>
                item.email.trim().toLowerCase() === email &&
                item.password === loginPassword
        );

        if (!user) {
            // Tampilkan error pada kedua kolom karena email atau kata sandi mungkin salah.
            const pesan = "Email atau kata sandi salah.";

            setLoginEmailError(pesan);
            setLoginPasswordError(pesan);

            return;
        }

        try {
            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(user)
            );
        } catch {
            tampilkanNotifikasi(
                "error",
                "Login Gagal",
                "Data akun tidak dapat disimpan. Silakan coba kembali."
            );
            return;
        }

        window.dispatchEvent(new Event("jelajahRasaUserUpdated"));

        tampilkanNotifikasi(
            "sukses",
            "Login Berhasil",
            `Selamat datang kembali, ${user.name}!`,
            true
        );
    }

    return (
        <main id="main-content" className="login-page">
            <div className="login-container">

                {/* Logo Navigasi ke Beranda */}
                <div className="login-logo-wrapper">
                    <Link id="logo-brand" href="/" className="login-logo">
                        <i className="bx bx-map-pin"></i> JelajahRasa
                    </Link>
                </div>

                <div className="login-card">
                    <div className="login-card-body">

                        {/* Tab Navigasi Switch Form */}
                        <ul className="nav nav-pills nav-justified login-tabs" id="auth-tab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === "login" ? "active" : ""}`}
                                    id="tab-login"
                                    type="button"
                                    role="tab"
                                    onClick={() => setActiveTab("login")}
                                >
                                    Masuk
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === "register" ? "active" : ""}`}
                                    id="tab-register"
                                    type="button"
                                    role="tab"
                                    onClick={() => setActiveTab("register")}
                                >
                                    Daftar
                                </button>
                            </li>
                        </ul>

                        <div className="tab-content" id="auth-tab-content">

                            {/* Form Masuk (Login) */}
                            <div className={`tab-pane fade ${activeTab === "login" ? "show active" : ""}`} id="content-login" role="tabpanel">
                                <form id="form-login" onSubmit={handleLogin} noValidate>
                                    <div className="login-form-group">
                                        <label htmlFor="login-email" className="login-label">Email</label>
                                        <input
                                            type="email"
                                            className={`login-input ${loginEmailError ? "is-invalid" : ""}`}
                                            id="login-email"
                                            placeholder="nama@email.com"
                                            value={loginEmail}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const email = value.trim().toLowerCase();

                                                setLoginEmail(value);

                                                // Saat pengguna memperbaiki email, hapus error login lama.
                                                setLoginEmailError("");
                                                setLoginPasswordError("");

                                                if (!email) {
                                                    setLoginEmailError("Email wajib diisi.");
                                                } else if (!validasiEmail(email)) {
                                                    setLoginEmailError(
                                                        "Masukkan alamat email dengan format yang benar."
                                                    );
                                                }
                                            }}
                                            onBlur={() => {
                                                if (loginEmail.trim() && loginPassword) {
                                                    validasiKredensialLogin(
                                                        loginEmail,
                                                        loginPassword
                                                    );
                                                }
                                            }}
                                            required
                                        />

                                        {/* Pesan kesalahan kredensial tidak ditampilkan di sini agar hanya muncul sekali. */}
                                        {loginEmailError &&
                                            loginEmailError !== "Email atau kata sandi salah." && (
                                                <small className="login-field-error">
                                                    {loginEmailError}
                                                </small>
                                            )}
                                    </div>

                                    <div className="login-form-group">
                                        <label htmlFor="login-password" className="login-label">Kata Sandi</label>
                                        <input
                                            type="password"
                                            className={`login-input ${loginPasswordError ? "is-invalid" : ""}`}
                                            id="login-password"
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => {
                                                setLoginPassword(e.target.value);

                                                // Hapus error lama saat pengguna memperbaiki kata sandi.
                                                setLoginPasswordError("");
                                                setLoginEmailError("");
                                            }}
                                            onBlur={() => {
                                                if (!loginPassword) {
                                                    setLoginPasswordError(
                                                        "Kata sandi wajib diisi."
                                                    );
                                                } else {
                                                    validasiKredensialLogin(
                                                        loginEmail,
                                                        loginPassword
                                                    );
                                                }
                                            }}
                                            required
                                        />

                                        {loginPasswordError && (
                                            <small className="login-field-error">
                                                {loginPasswordError}
                                            </small>
                                        )}
                                    </div>

                                    <button type="submit" id="btn-submit-login" className="login-submit-btn">
                                        Masuk
                                    </button>
                                </form>
                            </div>

                            {/* Form Daftar (Register) */}
                            <div className={`tab-pane fade ${activeTab === "register" ? "show active" : ""}`} id="content-register" role="tabpanel">
                                <form id="form-register" onSubmit={handleRegister} noValidate>
                                    <div className="login-form-group">
                                        <label htmlFor="register-name" className="login-label">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            className={`login-input ${registerNameError ? "is-invalid" : ""}`}
                                            id="register-name"
                                            placeholder="Contoh: Budi Santoso"
                                            value={registerName}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const nama = value.trim();

                                                setRegisterName(value);

                                                if (!nama) {
                                                    setRegisterNameError(
                                                        "Nama lengkap wajib diisi."
                                                    );
                                                } else if (nama.length < 4) {
                                                    setRegisterNameError(
                                                        "Nama lengkap minimal 4 karakter."
                                                    );
                                                } else {
                                                    setRegisterNameError("");
                                                }
                                            }}
                                            required
                                        />

                                        {registerNameError && (
                                            <small className="login-field-error">
                                                {registerNameError}
                                            </small>
                                        )}
                                    </div>

                                    <div className="login-form-group">
                                        <label htmlFor="register-email" className="login-label">Email</label>
                                        <input
                                            type="email"
                                            className={`login-input ${registerEmailError ? "is-invalid" : ""}`}
                                            id="register-email"
                                            placeholder="nama@email.com"
                                            value={registerEmail}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const email = value.trim().toLowerCase();

                                                setRegisterEmail(value);

                                                if (!email) {
                                                    setRegisterEmailError(
                                                        "Email wajib diisi."
                                                    );
                                                } else if (!validasiEmail(email)) {
                                                    setRegisterEmailError(
                                                        "Masukkan alamat email dengan format yang benar."
                                                    );
                                                } else if (emailSudahTerdaftar(email)) {
                                                    setRegisterEmailError(
                                                        "Email sudah terdaftar. Gunakan email lain."
                                                    );
                                                } else {
                                                    setRegisterEmailError("");
                                                }
                                            }}
                                            required
                                        />

                                        {registerEmailError && (
                                            <small className="login-field-error">
                                                {registerEmailError}
                                            </small>
                                        )}
                                    </div>

                                    <div className="login-form-group">
                                        <label htmlFor="register-city" className="login-label">Kota / Kabupaten Domisili</label>
                                        <input
                                            type="text"
                                            className={`login-input ${registerCityError ? "is-invalid" : ""}`}
                                            id="register-city"
                                            placeholder="Contoh: Kota Bandung / Kab. Bandung"
                                            value={registerCity}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                setRegisterCity(value);

                                                if (!value.trim()) {
                                                    setRegisterCityError(
                                                        "Kota atau kabupaten wajib diisi."
                                                    );
                                                } else {
                                                    setRegisterCityError("");
                                                }
                                            }}
                                            required
                                        />

                                        {registerCityError && (
                                            <small className="login-field-error">
                                                {registerCityError}
                                            </small>
                                        )}
                                    </div>

                                    <div className="login-form-group">
                                        <label htmlFor="register-password" className="login-label">Buat Kata Sandi</label>
                                        <input
                                            type="password"
                                            className={`login-input ${passwordError ? "is-invalid" : ""}`}
                                            id="register-password"
                                            placeholder="Minimal 6 karakter"
                                            value={registerPassword}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                setRegisterPassword(value);

                                                if (!value) {
                                                    setPasswordError(
                                                        "Kata sandi wajib diisi."
                                                    );
                                                } else if (value.length < 6) {
                                                    setPasswordError(
                                                        "Kata sandi minimal 6 karakter."
                                                    );
                                                } else {
                                                    setPasswordError("");
                                                }

                                                if (confirmPassword) {
                                                    setConfirmPasswordError(
                                                        value !== confirmPassword
                                                            ? "Konfirmasi kata sandi tidak cocok."
                                                            : ""
                                                    );
                                                }
                                            }}
                                            required
                                        />

                                        {passwordError && (
                                            <small className="login-field-error">
                                                {passwordError}
                                            </small>
                                        )}
                                    </div>

                                    <div className="login-form-group">
                                        <label htmlFor="register-password-confirm" className="login-label">Konfirmasi Kata Sandi</label>
                                        <input
                                            type="password"
                                            className={`login-input ${confirmPasswordError ? "is-invalid" : ""}`}
                                            id="register-password-confirm"
                                            placeholder="Ulangi kata sandi"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                setConfirmPassword(value);

                                                if (!value) {
                                                    setConfirmPasswordError(
                                                        "Konfirmasi kata sandi wajib diisi."
                                                    );
                                                } else if (value !== registerPassword) {
                                                    setConfirmPasswordError(
                                                        "Konfirmasi kata sandi tidak cocok."
                                                    );
                                                } else {
                                                    setConfirmPasswordError("");
                                                }
                                            }}
                                            required
                                        />

                                        {confirmPasswordError && (
                                            <small className="login-field-error">
                                                {confirmPasswordError}
                                            </small>
                                        )}
                                    </div>

                                    <button type="submit" id="btn-submit-register" className="login-submit-btn">
                                        Daftar Akun
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-back-wrapper">
                    <Link href="/" className="login-back-link">Kembali ke Beranda</Link>
                </div>
            </div>

            {/* Modal notifikasi */}
            {notifikasi && (
                <div
                    id="modal-notifikasi-auth"
                    className="auth-notification-overlay"
                    role="presentation"
                >
                    <div
                        className="auth-notification-card"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="auth-notification-title"
                    >
                        <div className="auth-notification-body">
                            {notifikasi.tipe === "sukses" ? (
                                <div className="auth-notification-icon success">
                                    <i className="bx bx-check-circle"></i>
                                </div>
                            ) : (
                                <div className="auth-notification-icon error">
                                    <i className="bx bx-error-circle"></i>
                                </div>
                            )}

                            <h4
                                id="auth-notification-title"
                                className="auth-notification-title"
                            >
                                {notifikasi.judul}
                            </h4>

                            <p className="auth-notification-message">
                                {notifikasi.pesan}
                            </p>

                            <button
                                id="btn-close-auth-notification"
                                type="button"
                                className="auth-notification-button"
                                onClick={tutupNotifikasi}
                            >
                                {notifikasi.redirect ? "Lanjutkan" : "Mengerti"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
