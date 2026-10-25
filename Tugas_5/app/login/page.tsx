"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import "./login.css";

const USERS_KEY = 'jelajahRasaUsers';
const CURRENT_USER_KEY = 'jelajahRasaCurrentUser';

interface User {
    name: string;
    email: string;
    city: string;
    password: string;
    avatar?: string;
}

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    // state dan router
    const router = useRouter();
    
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerCity, setRegisterCity] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // function handler
    function getUsers(): User[] {
        try {
            return JSON.parse(
                localStorage.getItem(USERS_KEY) || '[]'
            ) as User[];
        } catch {
            return [];
        }
    }

    // handle register
    function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const email = registerEmail.trim().toLowerCase();
        const name = registerName.trim();
        const city = registerCity.trim();

        if (registerPassword.length < 6) {
            alert('Kata sandi minimal 6 karakter.');
            return;
        }

        if (registerPassword !== confirmPassword) {
            alert('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        const users = getUsers();
        const emailExists = users.some(
            (user) => user.email.trim().toLowerCase() === email
        );

        if (emailExists) {
            alert('Email sudah terdaftar. Gunakan email lain');
            return;
        }

        const newUser: User = {
            name,
            email,
            city,
            password: registerPassword,
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(updatedUsers)
        );

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(newUser)
        );

        alert(`Pendaftaran berhasil! Selamat datang, ${newUser.name}!`);
        router.push('/');
        router.refresh();
    }
    
    // handle login
    function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const email = loginEmail.trim().toLowerCase();

        const user = getUsers().find(
            (item) =>
                item.email === email &&
            item.password === loginPassword
        );

        if (!user) {
            alert('Email atau kata sandi salah.');
            return;
        }

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(user)
        );

        alert(`Selamat datang, ${user.name}!`);
        router.push('/');
        router.refresh();
    }
    
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
                                <form id="form-login" onSubmit={handleLogin}>
                                    <div className="login-form-group">
                                        <label htmlFor="login-email" className="login-label">Email</label>
                                        <input
                                            type="email"
                                            className="login-input"
                                            id="login-email"
                                            placeholder="nama@email.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="login-password" className="login-label">Kata Sandi</label>
                                        <input
                                            type="password" 
                                            className="login-input" 
                                            id="login-password" 
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)} 
                                            required
                                        />
                                    </div>
                                    <button type="submit" id="btn-submit-login" className="login-submit-btn">Masuk</button>
                                </form>
                            </div>

                            {/* Form Daftar (Register) */}
                            <div className={`tab-pane fade ${activeTab === "register" ? "show active" : ""}`} id="content-register" role="tabpanel">
                                <form id="form-register" onSubmit={handleRegister}>
                                    <div className="login-form-group">
                                        <label htmlFor="register-name" className="login-label">Nama Lengkap</label>
                                        <input
                                            type="text" 
                                            className="login-input" 
                                            id="register-name" 
                                            placeholder="Contoh: Budi Santoso"
                                            value={registerName}
                                            onChange={(e) => setRegisterName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-email" className="login-label">Email</label>
                                        <input
                                            type="email" 
                                            className="login-input" 
                                            id="register-email" 
                                            placeholder="nama@email.com"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)} 
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-city" className="login-label">Kota / Kabupaten Domisili</label>
                                        <input
                                            type="text" 
                                            className="login-input" 
                                            id="register-city" 
                                            placeholder="Contoh: Kota Bandung / Kab. Bandung"
                                            value={registerCity}
                                            onChange={(e) => setRegisterCity(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-password" className="login-label">Buat Kata Sandi</label>
                                        <input
                                            type="password" 
                                            className="login-input" 
                                            id="register-password" 
                                            placeholder="Minimal 6 karakter"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="login-form-group">
                                        <label htmlFor="register-password-confirm" className="login-label">Konfirmasi Kata Sandi</label>
                                        <input
                                            type="password" 
                                            className="login-input" 
                                            id="register-password-confirm" 
                                            placeholder="Ulangi kata sandi"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            minLength={6}
                                            required
                                        />
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