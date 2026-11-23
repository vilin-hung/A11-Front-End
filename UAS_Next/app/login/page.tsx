"use client";

import { localData } from "@/lib/data";
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
    // state dan router
    const router = useRouter();

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [loginEmailError, setLoginEmailError] = useState("");
    const [loginPasswordError, setLoginPasswordError] = useState("");

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
            // Mengirim data login ke data lokal
            const response = await localData.auth.login({
                email,
                password: loginPassword,
            });

            // Membaca respons dari data lokal
            const data = response.data as {
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
                const responseSesi = await localData.auth.current();

                const dataSesi = responseSesi.data as {
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
            // Menangani kegagalan saat menghubungi data lokal
            console.error("Gagal menghubungi data lokal:", error);

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

                        {/* Tab Navigasi Login dan Register */}
                        <ul
                            className="nav nav-pills nav-justified login-tabs"
                            id="auth-tab"
                            role="tablist"
                        >
                            <li className="nav-item" role="presentation">
                                <Link
                                    href="/login"
                                    className="nav-link active"
                                    id="tab-login"
                                    role="tab"
                                    aria-current="page"
                                >
                                    Masuk
                                </Link>
                            </li>

                            <li className="nav-item" role="presentation">
                                <Link
                                    href="/register"
                                    className="nav-link"
                                    id="tab-register"
                                    role="tab"
                                >
                                    Daftar
                                </Link>
                            </li>
                        </ul>

                        <div className="tab-content" id="auth-tab-content">

                            {/* Form Masuk (Login) */}
                            <div
                                className="tab-pane fade show active"
                                id="content-login"
                                role="tabpanel"
                            >
                                <form id="form-login" onSubmit={handleLogin} noValidate>
                                    <div className="login-form-group">
                                        <label htmlFor="login-email" className="login-label">
                                            Email
                                        </label>
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
                                        <label htmlFor="login-password" className="login-label">
                                            Kata Sandi
                                        </label>
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

                                    <button
                                        type="submit"
                                        id="btn-submit-login"
                                        className="login-submit-btn"
                                    >
                                        Masuk
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-back-wrapper">
                    <Link href="/" className="login-back-link">
                        Kembali ke Beranda
                    </Link>
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
