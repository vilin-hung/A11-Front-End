// Data awal pengguna untuk simulasi login pada tahap Next.js.
export const dataUser = [
  { nama: "Mei", email: "mei@gmail.com", password: "meimei", role: "USER" as const, kota: "Kota Bandung" },
  { nama: "Bagus", email: "bagus@gmail.com", password: "bagus123", role: "USER" as const, kota: "Kab. Garut" },
  { nama: "Admin", email: "admin@gmail.com", password: "admin123", role: "ADMIN" as const, kota: "Kota Cirebon" },
];

// FAQ bawaan
export const DEFAULT_FAQ = [
  {
    id: "faq-1",
    slug: "tentang",
    pertanyaan: "Apa itu Jelajah Rasa Jawa Barat?",
    jawaban: "Jelajah Rasa Jawa Barat adalah platform direktori kuliner yang merangkum kekayaan rasa dari berbagai kota dan kabupaten di Jawa Barat.",
    iconClass: "bx bx-info-circle",
    urutan: 1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    messages: [],
  },
  {
    id: "faq-2",
    slug: "tambah-kuliner",
    pertanyaan: "Bagaimana cara menambahkan rekomendasi kuliner baru?",
    jawaban: "Anda dapat menambahkan hidangan favorit melalui menu yang ada di navigasi samping. Isi formulir informasi makanan seperti nama hidangan, asal daerah, estimasi harga, serta foto kuliner tersebut.",
    iconClass: "bx bx-plus-circle",
    urutan: 2,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    messages: [],
  },
  {
    id: "faq-3",
    slug: "pembaruan",
    pertanyaan: "Apakah informasi kuliner di sini selalu diperbarui?",
    jawaban: "Ya, data kuliner diperbarui secara berkala berdasarkan kontribusi aktif dari pengguna lokal serta proses verifikasi bertahap oleh tim kurator kami.",
    iconClass: "bx bx-refresh",
    urutan: 3,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    messages: [],
  },
  {
    id: "faq-4",
    slug: "favorit",
    pertanyaan: "Bagaimana cara menyimpan kuliner ke daftar favorit?",
    jawaban: "Klik ikon hati pada kuliner yang kamu sukai untuk menyimpannya. Kamu dapat melihat daftar kuliner yang sudah disimpan melalui menu Kuliner Favorit.",
    iconClass: "bx bx-bookmark-heart",
    urutan: 4,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    messages: [],
  },
];

// Metadata awal 
export const DEFAULT_METADATA = [
  { key: "site_name", value: "JelajahRasa" },
  { key: "site_description", value: "Jelajahi kuliner khas Jawa Barat" },
  { key: "hero_tagline", value: "Satu Tampah Rasa, Sejuta Cerita Parahyangan" },
  { key: "hero_description", value: "Temukan cita rasa otentik yang tersebar dari pusat kota hingga sudut Pasundan." },
  { key: "site_email", value: "halo@jelajahrasa.id" },
  { key: "site_phone", value: "" },
  { key: "site_address", value: "Jawa Barat, Indonesia" },
  { key: "footer_text", value: "© 2026 JelajahRasa" },
  { key: "home_icon_makanan", value: "bx bx-bowl-rice" },
  { key: "home_icon_jajanan", value: "bx bx-cookie" },
  { key: "home_icon_minuman", value: "bx bx-drink" },
  { key: "home_icon_oleh_oleh", value: "bx bx-gift" },
];