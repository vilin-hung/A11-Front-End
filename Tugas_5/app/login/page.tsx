"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./login.css";

type Notifikasi = {
    tipe: "sukses" | "error";
    judul: string;
    pesan: string;
    redirect?: boolean;
    tujuan?: string;
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
    // Memeriksa format email
    function validasiEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Menampilkan modal notifikasi
    function tampilkanNotifikasi(
        tipe: "sukses" | "error",
        judul: string,
        pesan: string,
        redirect = false,
        tujuan = "/"
    ) {
        setNotifikasi({
            tipe,
            judul,
            pesan,
            redirect,
            tujuan,
        });
    }

    // Menutup modal notifikasi
    function tutupNotifikasi() {
        const perluRedirect = notifikasi?.redirect;
        const tujuan = notifikasi?.tujuan ?? "/";

        setNotifikasi(null);

        if (perluRedirect) {
            router.push(tujuan);
            router.refresh();
        }
    }

    // handle register
    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
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

        // Menghentikan proses jika validasi form gagal
        if (adaError) {
            return;
        }

        try {
            // Mengirim data pendaftaran ke API register
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nama: name,
                    email,
                    kota: city,
                    password: registerPassword,
                    confirmPassword,
                }),
            });

            // Membaca hasil respons dari API
            const data = (await response.json().catch(() => ({}))) as {
                message?: string;
                errors?: Record<string, string>;
                user?: {
                    nama?: string;
                };
            };

            // Menampilkan pesan validasi dari API
            if (!response.ok) {
                const errors = data.errors ?? {};

                if (errors.nama) {
                    setRegisterNameError(errors.nama);
                }

                if (errors.email) {
                    setRegisterEmailError(errors.email);
                }

                if (errors.kota) {
                    setRegisterCityError(errors.kota);
                }

                if (errors.password) {
                    setPasswordError(errors.password);
                }

                if (errors.confirmPassword) {
                    setConfirmPasswordError(errors.confirmPassword);
                }

                // Menampilkan modal jika error bukan kesalahan input
                if (Object.keys(errors).length === 0) {
                    tampilkanNotifikasi(
                        "error",
                        "Pendaftaran Gagal",
                        data.message ||
                            "Data akun tidak dapat disimpan. Silakan coba kembali."
                    );
                }

                return;
            }

            // Menampilkan notifikasi setelah pendaftaran berhasil
            tampilkanNotifikasi(
                "sukses",
                "Pendaftaran Berhasil",
                `Selamat datang, ${data.user?.nama ?? name}! Akun kamu berhasil dibuat.`,
                true
            );
        } catch (error) {
            // Menangani kegagalan saat menghubungi API
            console.error("Gagal menghubungi API register:", error);

            tampilkanNotifikasi(
                "error",
                "Pendaftaran Gagal",
                "Data akun tidak dapat disimpan. Silakan coba kembali."
            );
        }
    }

    // handle login
    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
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

        try {
            // Mengirim data login ke API
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password: loginPassword,
                }),
            });

            // Membaca respons dari API
            const data = (await response.json().catch(() => ({}))) as {
                message?: string;
                errors?: Record<string, string>;
                user?: {
                    nama?: string;
                    email?: string;
                };
            };

            // Menampilkan pesan jika login gagal
            if (!response.ok) {
                const errors = data.errors ?? {};

                if (errors.email) {
                    setLoginEmailError(errors.email);
                }

                if (errors.password) {
                    setLoginPasswordError(errors.password);
                }

                // Menampilkan modal jika kegagalan bukan kesalahan input
                if (Object.keys(errors).length === 0) {
                    tampilkanNotifikasi(
                        "error",
                        "Login Gagal",
                        data.message ||
                            "Data akun tidak dapat disimpan. Silakan coba kembali."
                    );
                }

                return;
            }

            // Membaca data pengguna dan role dari session
            try {
                const responseSesi = await fetch("/api/auth/me", {
                    cache: "no-store",
                });

                const dataSesi = (await responseSesi
                    .json()
                    .catch(() => ({}))) as {
                    user?: {
                        nama?: string;
                        role?: string;
                    } | null;
                };

                // Memastikan data session berhasil dibaca
                if (!responseSesi.ok || !dataSesi.user) {
                    tampilkanNotifikasi(
                        "error",
                        "Sesi Belum Terbaca",
                        "Login berhasil, tetapi data sesi belum dapat dibaca. Silakan coba kembali."
                    );
                    return;
                }

                // Menentukan halaman tujuan berdasarkan role pengguna
                const tujuan =
                    dataSesi.user.role === "ADMIN"
                        ? "/admin-dashboard"
                        : "/";

                // Menampilkan notifikasi setelah login berhasil
                tampilkanNotifikasi(
                    "sukses",
                    "Login Berhasil",
                    `Selamat datang kembali, ${dataSesi.user.nama ?? data.user?.nama ?? email}!`,
                    true,
                    tujuan
                );
            } catch (error) {
                // Menangani kegagalan saat membaca session pengguna
                console.error("Gagal membaca session pengguna:", error);

                tampilkanNotifikasi(
                    "error",
                    "Sesi Belum Terbaca",
                    "Login berhasil, tetapi data sesi belum dapat dibaca. Silakan coba kembali."
                );
            }
        } catch (error) {
            // Menangani kegagalan saat menghubungi API login
            console.error("Gagal menghubungi API login:", error);

            tampilkanNotifikasi(
                "error",
                "Login Gagal",
                "Data akun tidak dapat disimpan. Silakan coba kembali."
            );
        }
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