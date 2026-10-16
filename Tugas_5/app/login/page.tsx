"use client";

import { useState } from "react";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    return (
        <main id="main-content" className="login-page">
            <div className="login-container">
                
                {/* Logo Navigasi ke Beranda */}
                <div className="login-logo-wrapper">
                    <Link id="logo-brand" href="/" className="login-logo">
                        <i className='bx bx-map-pin'></i> JelajahRasa
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
                                <form id="form-login" onSubmit={(e) => e.preventDefault()}>
                                    <div className="login-form-group">
                                        <label htmlFor="login-email" className="login-label">Email</label>
                                        <input type="email" className="login-input" id="login-email" placeholder="nama@email.com" required />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="login-password" className="login-label">Kata Sandi</label>
                                        <input type="password" className="login-input" id="login-password" placeholder="••••••••" required />
                                    </div>
                                    <button type="submit" id="btn-submit-login" className="login-submit-btn">Masuk</button>
                                </form>
                            </div>

                            {/* Form Daftar (Register) */}
                            <div className={`tab-pane fade ${activeTab === "register" ? "show active" : ""}`} id="content-register" role="tabpanel">
                                <form id="form-register" onSubmit={(e) => e.preventDefault()}>
                                    <div className="login-form-group">
                                        <label htmlFor="register-name" className="login-label">Nama Lengkap</label>
                                        <input type="text" className="login-input" id="register-name" placeholder="Contoh: Budi Santoso" required />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-email" className="login-label">Email</label>
                                        <input type="email" className="login-input" id="register-email" placeholder="nama@email.com" required />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-city" className="login-label">Kota / Kabupaten Domisili</label>
                                        <input type="text" className="login-input" id="register-city" placeholder="Contoh: Kota Bandung / Kab. Bandung" required />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-password" className="login-label">Buat Kata Sandi</label>
                                        <input type="password" className="login-input" id="register-password" placeholder="Minimal 6 karakter" required />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-password-confirm" className="login-label">Konfirmasi Kata Sandi</label>
                                        <input type="password" className="login-input" id="register-password-confirm" placeholder="Ulangi kata sandi" required />
                                    </div>
                                    <button type="submit" id="btn-submit-register" className="login-submit-btn">Daftar Akun</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="login-back-wrapper">
                    <Link href="/" className="login-back-link">&larr; Kembali ke Beranda</Link>
                </div>
            </div>
        </main>
    );
}