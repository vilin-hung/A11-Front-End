import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JelajahRasa - Jelajah Rasa Jawa Barat",
  description: "Temukan 200+ cita rasa otentik kuliner khas Jawa Barat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* CDN Bootstrap & Boxicons untuk mendukung ikon dan komponen lama */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable}${geistMono.variable} antialiased`}>
        {children}
        {/* Script Bootstrap JS untuk dropdown / modal / offcanvas sidebar */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  );
}