"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Halaman login menggunakan tampilan khusus tanpa header dan sidebar
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/daftar";

  const isAdminDashboard = pathname.startsWith("/admin-dashboard");

  if (isAdminDashboard) {
    return <>{children}</>;
  }
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Header dan sidebar hanya ditampilkan pada halaman biasa */}
      {!isAuthPage && (
        <>
          <Header />
          <Sidebar />
        </>
      )}

      {/* Konten halaman tetap ditampilkan seperti biasa */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>

      {/* Login menggunakan copyright kecil, halaman lain menggunakan footer lengkap */}
      <Footer variant={isAuthPage ? "compact" : "full"} />
    </div>
  );
}
