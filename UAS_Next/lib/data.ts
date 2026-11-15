// Sumber data statis JelajahRasa tanpa pakai backend
import {
  dataUser,
  DEFAULT_FAQ,
  DEFAULT_METADATA,
} from "@/app/data/data";

import {
  DATA_KULINER,
  dataKuliner,
} from "@/app/data/kuliner";

import { regions as DATA_REGIONS } from "@/app/data/regions";

// Tipe data pengguna
export type UserData = {
  id: string;
  nama: string;
  email: string;
  kota: string | null;
  avatar: string | null;
  role: "USER" | "ADMIN";
};

type StoredUser = UserData & { password: string };

// Record untuk data dinamis yang disimpan di localStorage
// urutan ditambahkan secara eksplisit karena digunakan pada pengelolaan FAQ
type StoredRecord = {
  [key: string]: unknown;
  id: string;
  createdAt?: unknown;
  urutan?: unknown;
};

type LocalResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
};

type ReviewData = {
  id: string;
  komentar: string;
  rating: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    nama: string;
    kota: string | null;
    avatar: string | null;
  } | null;
  kulinerId: string;
};

const DEFAULT_USERS: StoredUser[] = dataUser.map((item) => ({
  id: `user-${item.nama.toLowerCase()}`,
  ...item,
  avatar: null,
}));

// Data hardcode utama yang bisa langsung diimpor oleh halaman
export const db = {
  kuliner: DATA_KULINER,
  ulasan: [] as ReviewData[],
  regions: DATA_REGIONS,
  faq: DEFAULT_FAQ,
  users: DEFAULT_USERS.map(publicUser),
  metadata: DEFAULT_METADATA,
};

const KEYS = {
  users: "jelajahRasaUsers",
  currentUser: "jelajahRasaCurrentUser",
  favorites: "jelajahRasaFavorites",
  favoriteDates: "jelajahRasaFavoriteDates",
  reviews: "jelajahRasaReviews",
  kuliner: "jelajahRasaKuliner",
  kulinerVersion: "jelajahRasaKulinerVersion",
  usulan: "jelajahRasaUsulan",
  messages: "jelajahRasaMessages",
  faq: "jelajahRasaFaq",
  faqVersion: "jelajahRasaFaqVersion",
  regions: "jelajahRasaRegions",
  metadata: "jelajahRasaMetadata",
  rekomendasi: "jelajahRasaRekomendasi",
  hero: "jelajahRasaHero",
};

const clone = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const result = <T,>(data: T, status = 200): LocalResult<T> => ({
  ok: status >= 200 && status < 300,
  status,
  data,
});

const makeId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const now = () => new Date().toISOString();

// Membaca data localStorage dengan nilai cadangan jika belum tersedia
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return clone(fallback);

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

// Menyimpan data ke localStorage
function write<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

// Memastikan data merupakan objek dengan ID yang valid
function isStoredRecord(value: unknown): value is StoredRecord {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  return (
    "id" in value &&
    typeof (value as Record<string, unknown>).id === "string"
  );
}

// Menghapus properti messages sebelum data FAQ disimpan kembali
function withoutFaqMessages<T extends Record<string, unknown>>(
  item: T
): Omit<T, "messages"> {
  const copy = { ...item };
  Reflect.deleteProperty(copy, "messages");

  return copy as Omit<T, "messages">;
}

// Mengubah nilai menjadi array string
function pecahNilai(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

// Membentuk data kuliner awal dari sumber hardcode
function dataKulinerAwal() {
  return dataKuliner.map((item) => ({
    id: item.id,
    nama: item.nama,
    kategori: item.kategori,
    daerah: item.daerah,
    status: item.status,
    bahan: [...item.bahan],
    deskripsi: item.deskripsi,
    sejarah: item.sejarah,
    img: item.gambar,
    gambar: item.gambar,
    rasa: [...item.rasa],
    hargaMin: item.hargaMin,
    hargaMax: item.hargaMax,
    createdAt: now(),
    user: null as { nama: string } | null,
    catatanAdmin: null as string | null,
  }));
}

// Menyamakan penulisan kategori, misalnya "jajanan" menjadi "Jajanan"
function kategoriBaku(kategori: unknown) {
  const daftar = [
    "Makanan",
    "Jajanan",
    "Minuman",
    "Oleh-Oleh Khas",
  ];

  return (
    daftar.find(
      (nama) =>
        normalisasiKategori(nama) === normalisasiKategori(kategori)
    ) ?? String(kategori ?? "")
  );
}

// Merapikan satu data kuliner agar bentuknya konsisten
function rapikanKuliner(item: StoredRecord): StoredRecord {
  const gambar = item.gambar ?? item.img ?? "";

  return {
    ...item,
    id: String(item.id),
    nama: String(item.nama ?? ""),
    kategori: kategoriBaku(item.kategori),
    daerah: String(item.daerah ?? "-"),
    status: normalisasiStatusKuliner(item.status),
    deskripsi: String(item.deskripsi ?? ""),
    bahan: pecahNilai(item.bahan),
    rasa: pecahNilai(item.rasa),
    gambar,
    img: gambar,
    hargaMin: Number(item.hargaMin ?? 0),
    hargaMax: Number(item.hargaMax ?? item.hargaMin ?? 0),
    createdAt: String(item.createdAt ?? ""),
    user: item.user ?? null,
    catatanAdmin: item.catatanAdmin ?? null,
  };
}

// Menggabungkan data kuliner tersimpan dengan data awal
function gabungKulinerTersimpan(): StoredRecord[] {
  const awal = dataKulinerAwal();
  const idSeeder = new Set(awal.map((item) => item.id));
  const tersimpan = read<unknown>(KEYS.kuliner, []);

  const valid = (Array.isArray(tersimpan) ? tersimpan : [])
    .filter(isStoredRecord)
    .filter(
      (item) =>
        idSeeder.has(String(item.id)) ||
        String(item.id).startsWith("kuliner-")
    )
    .map(rapikanKuliner);

  const idValid = new Set(valid.map((item) => item.id));

  return [
    ...valid,
    ...awal
      .filter((item) => !idValid.has(item.id))
      .map((item) => rapikanKuliner(item)),
  ];
}

// Menginisialisasi data awal pada localStorage
function seed() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, DEFAULT_USERS);
  }

  if (read<string | null>(KEYS.faqVersion, null) !== "1") {
    write(KEYS.faq, DEFAULT_FAQ);
    write(KEYS.faqVersion, "1");
  }

  if (!localStorage.getItem(KEYS.regions)) {
    write(KEYS.regions, DATA_REGIONS);
  }

  if (!localStorage.getItem(KEYS.metadata)) {
    write(KEYS.metadata, DEFAULT_METADATA);
  }

  if (!localStorage.getItem(KEYS.rekomendasi)) {
    write(KEYS.rekomendasi, {
      makanan:
        DATA_KULINER.find((item) => item.kategori === "makanan")?.id ?? "",
      jajanan:
        DATA_KULINER.find((item) => item.kategori === "jajanan")?.id ?? "",
      minuman:
        DATA_KULINER.find((item) => item.kategori === "minuman")?.id ?? "",
      oleh_oleh:
        DATA_KULINER.find((item) => item.kategori === "oleh-oleh")?.id ?? "",
    });
  }

  if (!localStorage.getItem(KEYS.hero)) {
    write(
      KEYS.hero,
      DATA_KULINER.slice(0, 3).map((item) => item.id)
    );
  }

  if (read<string | null>(KEYS.kulinerVersion, null) !== "3") {
    write(KEYS.kuliner, gabungKulinerTersimpan());
    write(KEYS.kulinerVersion, "3");
  }

  if (!localStorage.getItem(KEYS.reviews)) {
    write(KEYS.reviews, db.ulasan);
  }

  if (!localStorage.getItem(KEYS.favorites)) {
    write(KEYS.favorites, {});
  }

  if (!localStorage.getItem(KEYS.favoriteDates)) {
    write(KEYS.favoriteDates, {});
  }

  if (!localStorage.getItem(KEYS.messages)) {
    write(KEYS.messages, []);
  }

  if (!localStorage.getItem(KEYS.usulan)) {
    write(KEYS.usulan, []);
  }
}

// Mengambil data pengguna dan memastikan akun default tersedia
function users() {
  seed();

  const list = read<StoredUser[]>(KEYS.users, DEFAULT_USERS);
  let berubah = false;

  DEFAULT_USERS.forEach((defaultUser) => {
    const sudahAda = list.some(
      (user) =>
        user.email.toLowerCase() === defaultUser.email.toLowerCase()
    );

    if (!sudahAda) {
      list.push(defaultUser);
      berubah = true;
    }
  });

  if (berubah) write(KEYS.users, list);

  return list;
}

// Mengambil pengguna yang sedang login. 
function currentUser(): StoredUser | null {
  seed();

  const currentId = read<string | null>(KEYS.currentUser, null);

  return users().find((user) => user.id === currentId) ?? null;
}

// Menghilangkan password sebelum data pengguna dikirim ke halaman
function publicUser(user: StoredUser): UserData {
  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    kota: user.kota,
    avatar: user.avatar,
    role: user.role,
  };
}

// Membaca data objek dari localStorage
function readObjek<T>(key: string): Record<string, T> {
  const isi = read<unknown>(key, {});

  return isi && typeof isi === "object" && !Array.isArray(isi)
    ? (isi as Record<string, T>)
    : {};
}

// Mengambil daftar favorit berdasarkan pengguna
function favoritesFor(userId: string) {
  const daftar = readObjek<string[]>(KEYS.favorites)[userId];

  return Array.isArray(daftar) ? daftar : [];
}

// Menambahkan atau menghapus favorit beserta tanggalnya.
function setFavorite(
  userId: string,
  kulinerId: string,
  active: boolean
) {
  const all = readObjek<string[]>(KEYS.favorites);
  const selected = new Set(favoritesFor(userId));

  if (active) {
    selected.add(kulinerId);
  } else {
    selected.delete(kulinerId);
  }

  all[userId] = [...selected];
  write(KEYS.favorites, all);

  const dates = readObjek<Record<string, string>>(
    KEYS.favoriteDates
  );

  dates[userId] ??= {};

  if (active) {
    dates[userId][kulinerId] ??= now();
  } else {
    delete dates[userId][kulinerId];
  }

  write(KEYS.favoriteDates, dates);
}

// Memeriksa apakah pengguna yang login merupakan admin
function adminAllowed() {
  return currentUser()?.role === "ADMIN";
}

// Menghasilkan respons penolakan ketika pengguna bukan admin
function adminError<T>(
  data: T = { message: "Akses admin diperlukan." } as T
) {
  return adminAllowed() ? null : result(data, 403);
}

// Menyamakan status kuliner ke format internal
function normalisasiStatusKuliner(status: unknown): string {
  if (status === "Aktif") return "APPROVED";
  if (status === "Ditolak") return "REJECTED";
  if (status === "Menunggu") return "PENDING";

  return typeof status === "string" ? status : "PENDING";
}

// Menyamakan format kategori untuk proses pencocokan
function normalisasiKategori(kategori: unknown) {
  return String(kategori ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");
}

// Mengurutkan data berdasarkan tanggal terbaru
function urutkanTerbaru<T extends { createdAt?: unknown }>(
  items: T[]
) {
  return [...items].sort((a, b) =>
    String(b.createdAt ?? "").localeCompare(
      String(a.createdAt ?? "")
    )
  );
}

// Mengambil seluruh data kuliner dari localStorage
function kulinerList(): StoredRecord[] {
  seed();

  const isi = read<unknown>(KEYS.kuliner, []);

  return (Array.isArray(isi) ? isi : [])
    .filter(isStoredRecord)
    .map(rapikanKuliner);
}

// Mengambil seluruh data usulan kuliner
function submissionList(): StoredRecord[] {
  seed();

  const isi = read<unknown>(KEYS.usulan, []);

  return (Array.isArray(isi) ? isi : []).filter(isStoredRecord);
}

// Mengambil kuliner yang sudah disetujui untuk daftar favorit
function kulinerFavoritList(): StoredRecord[] {
  const usulanAktif = submissionList().filter(
    (item) => normalisasiStatusKuliner(item.status) === "APPROVED"
  );

  const semuaKuliner = [...kulinerList(), ...usulanAktif];
  const daftarId = new Set<string>();

  return semuaKuliner.filter((item) => {
    if (
      normalisasiStatusKuliner(item.status) !== "APPROVED" ||
      daftarId.has(item.id)
    ) {
      return false;
    }

    daftarId.add(item.id);

    return true;
  });
}

// Menggabungkan kuliner utama dan usulan untuk halaman admin
function adminKulinerList(): StoredRecord[] {
  const submissions = submissionList().map((item) => ({
    ...item,
    status: normalisasiStatusKuliner(item.status),
    kategori: item.kategori ?? "Makanan",
    daerah: item.daerah ?? "-",
    bahan: pecahNilai(item.bahan),
    rasa: pecahNilai(item.rasa),
    gambar: item.gambar ?? item.img ?? "",
    img: item.img ?? item.gambar ?? "",
    user: item.user ?? { nama: "Pengguna" },
  }));

  return urutkanTerbaru([...kulinerList(), ...submissions]);
}

// Mengambil data ulasan
function reviewList() {
  seed();

  return read<ReviewData[]>(KEYS.reviews, db.ulasan);
}

// Mengambil data pesan
function pesanList(): StoredRecord[] {
  seed();

  return read<StoredRecord[]>(KEYS.messages, []);
}

// Mengambil FAQ beserta pesan yang terhubung
function faqList(): StoredRecord[] {
  seed();

  const pesan = pesanList();

  return read<StoredRecord[]>(
    KEYS.faq,
    DEFAULT_FAQ as unknown as StoredRecord[]
  )
    .map((item): StoredRecord => ({
      ...item,
      messages: pesan
        .filter(
          (message) =>
            message.faqId === item.id && message.isFaqReference
        )
        .map(({ id, email, subjek, pesan: isi, status, createdAt }) => ({
          id,
          email,
          subjek,
          pesan: isi,
          status,
          createdAt,
        })),
    }))
    .sort(
      (a, b) => Number(a.urutan ?? 0) - Number(b.urutan ?? 0)
    );
}

// Mengambil data daerah. 
function regionList(): StoredRecord[] {
  seed();

  return read<StoredRecord[]>(
    KEYS.regions,
    DATA_REGIONS as unknown as StoredRecord[]
  );
}

// Mengambil data metadata
function metadataList(): unknown[] {
  seed();

  return read<unknown[]>(
    KEYS.metadata,
    DEFAULT_METADATA as unknown[]
  );
}

// Menyimpan perubahan pengguna dan mengembalikan data publiknya
function saveUpdatedUser(updated: StoredUser) {
  write(
    KEYS.users,
    users().map((item) => (item.id === updated.id ? updated : item))
  );

  return publicUser(updated);
}

// Operasi data lokal. Semua fungsi bekerja langsung dengan hardcode/localStorage, bukan HTTP/API
export const localData = {
  auth: {
    current() {
      const user = currentUser();

      return result(
        { user: user ? publicUser(user) : null },
        user ? 200 : 401
      );
    },

    login(input: { email: string; password: string }) {
      const found = users().find(
        (user) =>
          user.email.toLowerCase() ===
            String(input.email ?? "").toLowerCase() &&
          user.password === input.password
      );

      if (!found) {
        return result(
          { message: "Email atau kata sandi salah." },
          401
        );
      }

      write(KEYS.currentUser, found.id);

      return result({
        message: "Login berhasil.",
        user: publicUser(found),
      });
    },

    register(input: {
      nama: string;
      email: string;
      password: string;
      kota?: string;
      confirmPassword?: string;
    }) {
      const list = users();

      if (
        list.some(
          (user) =>
            user.email.toLowerCase() ===
            String(input.email ?? "").toLowerCase()
        )
      ) {
        return result({ message: "Email sudah terdaftar." }, 409);
      }

      const newUser: StoredUser = {
        id: makeId("user"),
        nama: String(input.nama ?? "Pengguna"),
        email: String(input.email),
        password: String(input.password),
        kota: String(input.kota ?? ""),
        avatar: null,
        role: "USER",
      };

      list.push(newUser);

      write(KEYS.users, list);
      write(KEYS.currentUser, newUser.id);

      return result(
        {
          message: "Registrasi berhasil.",
          user: publicUser(newUser),
        },
        201
      );
    },

    logout() {
      if (typeof window !== "undefined") {
        localStorage.removeItem(KEYS.currentUser);
      }

      return result({ message: "Logout berhasil." });
    },
  },

  profile: {
    get() {
      const user = currentUser();

      if (!user) {
        return result({ message: "Belum login." }, 401);
      }

      return result({
        user: publicUser(user),
        kuliner: read<StoredRecord[]>(KEYS.usulan, [])
          .filter((item) => item.userId === user.id)
          .map((item) => ({
            ...item,
            status: normalisasiStatusKuliner(item.status),
            bahan: pecahNilai(item.bahan),
            rasa: pecahNilai(item.rasa),
            gambar: item.gambar ?? item.img ?? null,
          })),
        jumlahFavorit: favoritesFor(user.id).length,
      });
    },

    update(input: Partial<Pick<UserData, "nama" | "kota" | "avatar">>) {
      const user = currentUser();

      if (!user) {
        return result({ message: "Belum login." }, 401);
      }

      const perubahan: Partial<
        Pick<UserData, "nama" | "kota" | "avatar">
      > = {};

      if (typeof input.nama === "string") {
        const nama = input.nama.trim();

        if (nama.length < 4) {
          return result(
            { message: "Nama lengkap minimal 4 karakter." },
            400
          );
        }

        perubahan.nama = nama;
      }

      if (typeof input.kota === "string") {
        const kota = input.kota.trim();

        if (!kota) {
          return result(
            { message: "Asal kota/kabupaten wajib diisi." },
            400
          );
        }

        perubahan.kota = kota;
      }

      if (typeof input.avatar === "string") {
        if (!input.avatar.startsWith("data:image/")) {
          return result(
            { message: "Format foto tidak dikenali." },
            400
          );
        }

        perubahan.avatar = input.avatar;
      }

      if (Object.keys(perubahan).length === 0) {
        return result(
          { message: "Tidak ada perubahan yang dikirim." },
          400
        );
      }

      const updated = { ...user, ...perubahan };

      return result({
        user: saveUpdatedUser(updated),
        message: "Profil berhasil diperbarui.",
      });
    },

    updateKuliner(id: string, input: Record<string, unknown>) {
      const user = currentUser();

      if (!user) {
        return result({ message: "Belum login." }, 401);
      }

      const list = read<StoredRecord[]>(KEYS.usulan, []);

      const item = list.find(
        (entry) => entry.id === id && entry.userId === user.id
      );

      if (!item) {
        return result(
          { message: "Usulan kuliner tidak ditemukan." },
          404
        );
      }

      const nama = String(input.nama ?? "").trim();

      if (!nama) {
        return result(
          { message: "Nama kuliner wajib diisi." },
          400
        );
      }

      const gambar =
        typeof input.gambar === "string" ? input.gambar : "";

      if (
        gambar &&
        (!gambar.startsWith("data:image/") || gambar.length > 3_000_000)
      ) {
        return result(
          { message: "Format atau ukuran foto tidak valid." },
          400
        );
      }

      const daftarHarga: string[] =
        String(input.harga ?? "").match(/[0-9][0-9.]*/g) ?? [];

      const hargaMin = daftarHarga.length
        ? Number(daftarHarga[0].replace(/\./g, ""))
        : Number(item.hargaMin ?? 0);

      const hargaMax =
        daftarHarga.length > 1
          ? Number(daftarHarga[1].replace(/\./g, ""))
          : daftarHarga.length === 1
            ? hargaMin
            : Number(item.hargaMax ?? hargaMin);

      // Tipe eksplisit agar properti dinamis seperti rasa tetap dikenali.
      const updated: StoredRecord = {
        ...item,
        ...input,
        nama,
        hargaMin,
        hargaMax,
        bahan: String(input.bahan ?? item.bahan ?? ""),
        ...(gambar ? { gambar, img: gambar } : {}),
        status: "PENDING",
        catatanAdmin: null,
        updatedAt: now(),
      };

      write(
        KEYS.usulan,
        list.map((entry) => (entry.id === id ? updated : entry))
      );

      return result({
        kuliner: {
          ...updated,
          status: "PENDING",
          bahan: pecahNilai(updated.bahan),
          rasa: pecahNilai(updated.rasa),
        },
      });
    },

    deleteKuliner(id: string) {
      const user = currentUser();

      if (!user) {
        return result({ message: "Belum login." }, 401);
      }

      const list = read<StoredRecord[]>(KEYS.usulan, []);

      const exists = list.some(
        (entry) => entry.id === id && entry.userId === user.id
      );

      if (!exists) {
        return result(
          { message: "Usulan kuliner tidak ditemukan." },
          404
        );
      }

      write(
        KEYS.usulan,
        list.filter(
          (entry) => !(entry.id === id && entry.userId === user.id)
        )
      );

      return result({
        message: "Usulan kuliner berhasil dihapus.",
      });
    },
  },

  kuliner: {
    listPublic() {
      return result({
        data: kulinerList().filter(
          (item) =>
            normalisasiStatusKuliner(item.status) === "APPROVED"
        ),
      });
    },

    get(id: string) {
      const item = kulinerList().find((entry) => entry.id === id);

      return item
        ? result(item)
        : result({ message: "Kuliner tidak ditemukan." }, 404);
    },

    submit(input: Record<string, unknown>) {
      const user = currentUser();

      if (!user) {
        return result(
          { message: "Silakan login terlebih dahulu." },
          401
        );
      }

      const hargaMin = Number(input.hargaMin ?? 0);
      const hargaMax = Number(input.hargaMax ?? hargaMin);
      const gambar = String(input.gambar ?? "");

      const item: StoredRecord = {
        id: makeId("kuliner"),
        ...input,
        gambar,
        img: gambar,
        bahan:
          typeof input.bahan === "string"
            ? input.bahan
            : pecahNilai(input.bahan).join(", "),
        rasa:
          typeof input.rasa === "string"
            ? input.rasa
            : pecahNilai(input.rasa).join(", "),
        harga: hargaMin
          ? `Rp ${hargaMin.toLocaleString("id-ID")} - Rp ${hargaMax.toLocaleString("id-ID")}`
          : "",
        status: "PENDING",
        user: { nama: user.nama },
        userId: user.id,
        catatanAdmin: null,
        createdAt: now(),
      };

      const list = read<StoredRecord[]>(KEYS.usulan, []);

      list.push(item);
      write(KEYS.usulan, list);

      return result({ item }, 201);
    },
  },

  favorite: {
    list() {
      const user = currentUser();
      const userId = user?.id ?? "";

      const dates = readObjek<Record<string, string>>(
        KEYS.favoriteDates
      );

      const favorites = favoritesFor(userId).flatMap((kulinerId) => {
        const item = kulinerFavoritList().find(
          (entry) => entry.id === kulinerId
        );

        if (!item) return [];

        return [
          {
            userId,
            kulinerId,
            createdAt: dates[userId]?.[kulinerId] ?? now(),
            kuliner: {
              id: item.id,
              nama: item.nama,
              deskripsi: item.deskripsi ?? "",
              kategori: item.kategori,
              daerah: item.daerah ?? "-",
              gambar: item.gambar ?? item.img ?? null,
              hargaMin: Number(item.hargaMin ?? 0),
              hargaMax: Number(
                item.hargaMax ?? item.hargaMin ?? 0
              ),
            },
          },
        ];
      });

      return result(favorites);
    },

    add(kulinerId: string) {
      const user = currentUser();

      if (!user) {
        return result({ message: "Belum login." }, 401);
      }

      setFavorite(user.id, kulinerId, true);

      return result({ message: "Favorit ditambahkan." }, 201);
    },

    remove(kulinerId: string) {
      const user = currentUser();

      if (!user) {
        return result({ message: "Belum login." }, 401);
      }

      setFavorite(user.id, kulinerId, false);

      return result({ message: "Favorit dihapus." });
    },
  },

  ulasan: {
    listPublic() {
      return result({
        reviews: reviewList().filter(
          (review) => review.status === "AKTIF"
        ),
      });
    },

    create(input: {
      komentar: string;
      rating: number;
      kulinerId?: string;
    }) {
      const user = currentUser();

      if (!user) {
        return result(
          {
            message:
              "Silakan login terlebih dahulu untuk menulis ulasan.",
          },
          401
        );
      }

      const komentar = String(input.komentar ?? "").trim();
      const rating = Number(input.rating);

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return result(
          {
            message:
              "Rating harus berada pada rentang 1 sampai 5 bintang.",
          },
          400
        );
      }

      if (!komentar || komentar.length > 1000) {
        return result(
          {
            message:
              "Komentar wajib diisi dan maksimal 1000 karakter.",
          },
          400
        );
      }

      const review: ReviewData = {
        id: makeId("review"),
        komentar,
        rating,
        status: "AKTIF",
        createdAt: now(),
        user: {
          id: user.id,
          nama: user.nama,
          kota: user.kota,
          avatar: user.avatar,
        },
        kulinerId: String(input.kulinerId ?? ""),
      };

      const list = reviewList();

      list.push(review);
      write(KEYS.reviews, list);

      return result(
        {
          message: "Ulasan berhasil dikirim.",
          review,
        },
        201
      );
    },
  },

  faq: {
    listPublic() {
      return result(
        faqList().filter((item) => item.isActive !== false)
      );
    },

    submitContact(input: {
      email: string;
      subjek: string;
      pesan: string;
    }) {
      const email = String(input.email ?? "").trim();
      const subjek = String(input.subjek ?? "").trim();
      const isi = String(input.pesan ?? "").trim();

      if (!email || !subjek || !isi) {
        return result(
          { message: "Semua field wajib diisi." },
          400
        );
      }

      const list = pesanList();

      list.push({
        id: makeId("msg"),
        email,
        subjek,
        pesan: isi,
        status: "BARU",
        isFaqReference: false,
        faqId: null,
        createdAt: now(),
      });

      write(KEYS.messages, list);

      return result(
        { message: "Pesan berhasil dikirim." },
        201
      );
    },
  },

  site: {
    metadata() {
      return result(metadataList());
    },

    regions() {
      return result({ regions: regionList() });
    },

    rekomendasi() {
      seed();

      return result({
        rekomendasi: read<Record<string, string>>(
          KEYS.rekomendasi,
          {
            makanan: "",
            jajanan: "",
            minuman: "",
            oleh_oleh: "",
          }
        ),
      });
    },
  },

  admin: {
    stats() {
      const denied = adminError();

      if (denied) return denied;

      const kuliner = adminKulinerList();

      const kulinerApproved = kuliner.filter(
        (item) => item.status === "APPROVED"
      );

      const reviews = reviewList();
      const favoriteData = readObjek<string[]>(KEYS.favorites);

      const kategoriAwal = [
        "Makanan",
        "Jajanan",
        "Minuman",
        "Oleh-Oleh Khas",
      ];

      const perKategori: Record<string, number> =
        Object.fromEntries(
          kategoriAwal.map((kategori) => [kategori, 0])
        );

      const sebaran: Record<string, number> = {};

      const daftarFavorit: Record<
        string,
        {
          id: string;
          nama: string;
          kategori: string;
          jumlah: number;
        }
      > = {};

      kulinerApproved.forEach((item) => {
        const kategori = kategoriAwal.find(
          (nama) =>
            normalisasiKategori(nama) ===
            normalisasiKategori(item.kategori)
        );

        if (kategori) perKategori[kategori] += 1;

        const daerah = String(item.daerah ?? "-").replace(
          /^Kabupaten /,
          "Kab. "
        );

        sebaran[daerah] = (sebaran[daerah] ?? 0) + 1;
      });

      Object.values(favoriteData)
        .flat()
        .forEach((id) => {
          const item = kuliner.find(
            (entry) => String(entry.id) === id
          );

          if (!item) return;

          daftarFavorit[id] ??= {
            id,
            nama: String(item.nama ?? ""),
            kategori: String(item.kategori ?? ""),
            jumlah: 0,
          };

          daftarFavorit[id].jumlah += 1;
        });

      return result({
        totalPengguna: users().length,
        kulinerApproved: kuliner.filter(
          (item) => item.status === "APPROVED"
        ).length,
        kulinerPending: kuliner.filter(
          (item) => item.status === "PENDING"
        ).length,
        kulinerRejected: kuliner.filter(
          (item) => item.status === "REJECTED"
        ).length,
        totalUlasan: reviews.length,
        totalFavorit: Object.values(favoriteData).reduce(
          (jumlah, daftar) => jumlah + daftar.length,
          0
        ),
        perKategori,
        sebaranDaerah: Object.entries(sebaran)
          .map(([daerah, jumlah]) => ({ daerah, jumlah }))
          .sort((a, b) => b.jumlah - a.jumlah),
        topFavorit: Object.values(daftarFavorit)
          .sort((a, b) => b.jumlah - a.jumlah)
          .slice(0, 5),
      });
    },

    kuliner: {
      list() {
        const denied = adminError();

        if (denied) return denied;

        return result({ kuliner: adminKulinerList() });
      },

      create(input: Record<string, unknown>) {
        const denied = adminError();

        if (denied) return denied;

        const list = kulinerList();
        const gambar = String(input.gambar ?? input.img ?? "");

        const item: StoredRecord = {
          id: makeId("kuliner"),
          ...input,
          gambar,
          img: gambar,
          bahan: pecahNilai(input.bahan),
          rasa: pecahNilai(input.rasa),
          createdAt: now(),
          status: input.status ?? "APPROVED",
          user: null,
        };

        list.push(item);
        write(KEYS.kuliner, list);

        return result({ kuliner: item }, 201);
      },

      update(input: { id: string; [key: string]: unknown }) {
        const denied = adminError();

        if (denied) return denied;

        const list = kulinerList();
        const updated = list.find(
          (item) => item.id === input.id
        );

        if (updated) {
          const merged = {
            ...updated,
            ...input,
            ...(input.bahan !== undefined
              ? { bahan: pecahNilai(input.bahan) }
              : {}),
            ...(input.rasa !== undefined
              ? { rasa: pecahNilai(input.rasa) }
              : {}),
            ...(input.gambar
              ? { gambar: input.gambar, img: input.gambar }
              : {}),
          };

          write(
            KEYS.kuliner,
            list.map((item) =>
              item.id === input.id ? merged : item
            )
          );

          return result({
            kuliner: merged,
            message: "Data kuliner berhasil diperbarui.",
          });
        }

        const submissions = submissionList();

        const submission = submissions.find(
          (item) => item.id === input.id
        );

        if (!submission) {
          return result(
            { message: "Kuliner tidak ditemukan." },
            404
          );
        }

        const statusStored =
          input.status === "APPROVED"
            ? "Aktif"
            : input.status === "REJECTED"
              ? "Ditolak"
              : "Menunggu";

        const mergedSubmission: StoredRecord = {
          ...submission,
          ...input,
          status: statusStored,
          ...(input.bahan !== undefined
            ? {
                bahan: Array.isArray(input.bahan)
                  ? input.bahan.join(", ")
                  : input.bahan,
              }
            : {}),
          ...(input.rasa !== undefined
            ? {
                rasa: Array.isArray(input.rasa)
                  ? input.rasa.join(", ")
                  : input.rasa,
              }
            : {}),
          ...(input.gambar
            ? { gambar: input.gambar, img: input.gambar }
            : {}),
        };

        write(
          KEYS.usulan,
          submissions.map((item) =>
            item.id === input.id ? mergedSubmission : item
          )
        );

        return result({
          kuliner: {
            ...mergedSubmission,
            status: input.status ?? "PENDING",
          },
          message: "Data kuliner berhasil diperbarui.",
        });
      },

      remove(id: string) {
        const denied = adminError();

        if (denied) return denied;

        write(
          KEYS.kuliner,
          kulinerList().filter((item) => item.id !== id)
        );

        write(
          KEYS.usulan,
          submissionList().filter((item) => item.id !== id)
        );

        return result({ message: "Kuliner berhasil dihapus." });
      },
    },

    ulasan: {
      list() {
        const denied = adminError();

        if (denied) return denied;

        return result({ ulasan: reviewList() });
      },

      update(input: { id: string; [key: string]: unknown }) {
        const denied = adminError();

        if (denied) return denied;

        const list = reviewList();

        const item = list.find(
          (review) => review.id === input.id
        );

        if (!item) {
          return result(
            { message: "Ulasan tidak ditemukan." },
            404
          );
        }

        write(
          KEYS.reviews,
          list.map((review) =>
            review.id === input.id
              ? { ...review, ...input }
              : review
          )
        );

        return result({
          message: "Status ulasan berhasil diperbarui.",
        });
      },

      remove(id: string) {
        const denied = adminError();

        if (denied) return denied;

        write(
          KEYS.reviews,
          reviewList().filter((review) => review.id !== id)
        );

        return result({ message: "Ulasan berhasil dihapus." });
      },
    },

    users: {
      list() {
        const denied = adminError();

        if (denied) return denied;

        return result({ users: users().map(publicUser) });
      },

      update(input: { id: string; role: string }) {
        const denied = adminError();

        if (denied) return denied;

        const admin = currentUser();

        if (!input.id) {
          return result(
            { message: "id pengguna wajib diisi." },
            400
          );
        }

        if (input.role !== "ADMIN" && input.role !== "USER") {
          return result(
            { message: "Role pengguna tidak dikenali." },
            400
          );
        }

        if (input.id === admin?.id) {
          return result(
            { message: "Role akun sendiri tidak dapat diubah." },
            400
          );
        }

        const list = users();

        const found = list.find(
          (user) => user.id === input.id
        );

        if (!found) {
          return result(
            { message: "Pengguna tidak ditemukan." },
            404
          );
        }

        if (found.role === "ADMIN" && input.role !== "ADMIN") {
          const jumlahAdmin = list.filter(
            (user) => user.role === "ADMIN"
          ).length;

          if (jumlahAdmin <= 1) {
            return result(
              { message: "Minimal harus ada satu akun admin." },
              400
            );
          }
        }

        found.role = input.role;

        write(KEYS.users, list);

        return result({
          user: publicUser(found),
          message: "Role pengguna berhasil diperbarui.",
        });
      },
    },

    messages: {
      list() {
        const denied = adminError();

        if (denied) return denied;

        const faq = read<StoredRecord[]>(
          KEYS.faq,
          DEFAULT_FAQ as unknown as StoredRecord[]
        );

        const messages = urutkanTerbaru(pesanList()).map((item) => {
          const linkedFaq = faq.find(
            (entry) => entry.id === item.faqId
          );

          return {
            ...item,
            faq: linkedFaq
              ? {
                  id: linkedFaq.id,
                  pertanyaan: linkedFaq.pertanyaan,
                }
              : null,
          };
        });

        return result({ messages });
      },

      update(input: { id?: string; [key: string]: unknown }) {
        const denied = adminError();

        if (denied) return denied;

        const list = pesanList();

        if (input.action === "JADIKAN_REFERENSI") {
          const messageIds = Array.isArray(input.messageIds)
            ? input.messageIds.filter(
                (id): id is string =>
                  typeof id === "string" && id.trim() !== ""
              )
            : [];

          if (messageIds.length === 0) {
            return result(
              { message: "Pilih minimal satu pesan." },
              400
            );
          }

          if (new Set(messageIds).size !== messageIds.length) {
            return result(
              { message: "Daftar pesan referensi tidak valid." },
              400
            );
          }

          const terpilih = list.filter((item) =>
            messageIds.includes(String(item.id))
          );

          const valid =
            terpilih.length === messageIds.length &&
            terpilih.every(
              (item) =>
                item.status === "DIPROSES" &&
                item.faqId === null &&
                item.isFaqReference === false
            );

          if (!valid) {
            return result(
              {
                message:
                  "Pastikan semua pesan berstatus DIPROSES dan belum terhubung ke FAQ.",
              },
              400
            );
          }

          write(
            KEYS.messages,
            list.map((item) =>
              messageIds.includes(String(item.id))
                ? { ...item, isFaqReference: true }
                : item
            )
          );

          return result({
            message: "Pesan berhasil disimpan sebagai referensi FAQ.",
          });
        }

        if (!input.id || typeof input.status !== "string") {
          return result(
            { message: "ID dan status pesan wajib diisi." },
            400
          );
        }

        if (
          !["BARU", "DIPROSES", "SELESAI"].includes(
            String(input.status)
          )
        ) {
          return result(
            { message: "Status pesan tidak dikenali." },
            400
          );
        }

        if (!list.some((item) => item.id === input.id)) {
          return result(
            { message: "Pesan tidak ditemukan." },
            404
          );
        }

        write(
          KEYS.messages,
          list.map((item) =>
            item.id === input.id
              ? { ...item, status: input.status }
              : item
          )
        );

        return result({
          message: "Status pesan berhasil diperbarui.",
        });
      },
    },

    faq: {
      list() {
        const denied = adminError();

        if (denied) return denied;

        return result({ faq: faqList() });
      },

      create(input: Record<string, unknown>) {
        const denied = adminError();

        if (denied) return denied;

        const pertanyaan = String(input.pertanyaan ?? "").trim();
        const jawaban = String(input.jawaban ?? "").trim();
        const slug = String(input.slug ?? "").trim();
        const rawIds = input.messageIds;

        const messageIds = Array.isArray(rawIds)
          ? rawIds.filter(
              (id): id is string =>
                typeof id === "string" && id.trim() !== ""
            )
          : [];

        if (!pertanyaan || !jawaban || !slug) {
          return result(
            {
              message:
                "Pertanyaan, jawaban, dan slug wajib diisi.",
            },
            400
          );
        }

        if (
          Array.isArray(rawIds) &&
          messageIds.length !== rawIds.length
        ) {
          return result(
            { message: "Daftar pesan referensi tidak valid." },
            400
          );
        }

        if (new Set(messageIds).size !== messageIds.length) {
          return result(
            { message: "Daftar pesan referensi tidak valid." },
            400
          );
        }

        const list = faqList();

        if (list.some((item) => item.slug === slug)) {
          return result(
            {
              message:
                "Gagal menambahkan FAQ. Pastikan slug belum digunakan.",
            },
            409
          );
        }

        const pesan = pesanList();

        if (messageIds.length > 0) {
          const terpilih = pesan.filter((item) =>
            messageIds.includes(String(item.id))
          );

          const valid =
            terpilih.length === messageIds.length &&
            terpilih.every(
              (item) =>
                item.isFaqReference === true &&
                item.faqId === null &&
                item.status === "DIPROSES"
            );

          if (!valid) {
            return result(
              {
                message:
                  "Pesan referensi tidak valid atau sudah digunakan.",
              },
              400
            );
          }
        }

        const isActive =
          typeof input.isActive === "boolean"
            ? input.isActive
            : true;

        const item: StoredRecord = {
          id: makeId("faq"),
          pertanyaan,
          jawaban,
          slug,
          urutan: isActive
            ? list.filter((faq) => faq.isActive !== false).length + 1
            : 0,
          iconClass:
            typeof input.iconClass === "string" && input.iconClass
              ? input.iconClass
              : "bx bx-info-circle",
          isActive,
          createdAt: now(),
          updatedAt: now(),
          messages: [],
        };

        write(KEYS.faq, [
          ...list.map(withoutFaqMessages),
          item,
        ]);

        if (messageIds.length > 0) {
          write(
            KEYS.messages,
            pesan.map((message) =>
              messageIds.includes(String(message.id))
                ? {
                    ...message,
                    faqId: item.id,
                    status: "SELESAI",
                  }
                : message
            )
          );
        }

        return result(
          {
            faq: item,
            message: "FAQ berhasil ditambahkan.",
          },
          201
        );
      },

      update(input: { id?: string; [key: string]: unknown }) {
        const denied = adminError();

        if (denied) return denied;

        const list = faqList();

        if (input.action === "REORDER") {
          const ids = Array.isArray(input.faqIds)
            ? input.faqIds.filter(
                (id): id is string =>
                  typeof id === "string" && id.trim() !== ""
              )
            : [];

          const faqAktif = list.filter(
            (item) => item.isActive !== false
          );

          if (
            !Array.isArray(input.faqIds) ||
            ids.length !== input.faqIds.length ||
            new Set(ids).size !== ids.length ||
            ids.length !== faqAktif.length ||
            !faqAktif.every((item) =>
              ids.includes(String(item.id))
            )
          ) {
            return result(
              { message: "Daftar urutan FAQ tidak valid." },
              400
            );
          }

          const urutan = new Map(
            ids.map((id, index) => [id, index + 1])
          );

          const hasil = list
            .map(withoutFaqMessages)
            .map((item) => ({
              ...item,
              urutan:
                item.isActive === false
                  ? 0
                  : urutan.get(String(item.id)) ?? item.urutan,
            }));

          write(KEYS.faq, hasil);

          return result({
            message: "Urutan FAQ berhasil diperbarui.",
          });
        }

        if (!input.id) {
          return result(
            { message: "ID FAQ wajib diisi." },
            400
          );
        }

        const item = list.find(
          (entry) => entry.id === input.id
        );

        if (!item) {
          return result(
            { message: "FAQ tidak ditemukan." },
            404
          );
        }

        const perubahan: Record<string, unknown> = {};

        if (typeof input.pertanyaan === "string") {
          perubahan.pertanyaan = input.pertanyaan.trim();
        }

        if (typeof input.jawaban === "string") {
          perubahan.jawaban = input.jawaban.trim();
        }

        if (typeof input.slug === "string") {
          perubahan.slug = input.slug.trim();
        }

        if (Number.isInteger(input.urutan)) {
          perubahan.urutan = input.urutan;
        }

        if (typeof input.iconClass === "string") {
          perubahan.iconClass = input.iconClass;
        }

        if (typeof input.isActive === "boolean") {
          perubahan.isActive = input.isActive;
        }

        if (Object.keys(perubahan).length === 0) {
          return result(
            { message: "Tidak ada perubahan yang dikirim." },
            400
          );
        }

        if (
          typeof perubahan.pertanyaan === "string" &&
          !perubahan.pertanyaan
        ) {
          return result(
            { message: "Pertanyaan FAQ wajib diisi." },
            400
          );
        }

        if (
          typeof perubahan.jawaban === "string" &&
          !perubahan.jawaban
        ) {
          return result(
            { message: "Jawaban FAQ wajib diisi." },
            400
          );
        }

        if (
          typeof perubahan.slug === "string" &&
          (
            !perubahan.slug ||
            list.some(
              (faq) =>
                faq.id !== item.id &&
                faq.slug === perubahan.slug
            )
          )
        ) {
          return result(
            {
              message:
                "Slug FAQ tidak valid atau sudah digunakan.",
            },
            409
          );
        }

        const statusBerubah =
          typeof perubahan.isActive === "boolean" &&
          perubahan.isActive !== item.isActive;

        let hasil = list.map(withoutFaqMessages);

        if (
          statusBerubah &&
          perubahan.isActive === false
        ) {
          hasil = hasil.map((faq) =>
            faq.id === item.id
              ? {
                  ...faq,
                  ...perubahan,
                  isActive: false,
                  urutan: 0,
                  updatedAt: now(),
                }
              : faq
          );

          const aktif = hasil
            .filter((faq) => faq.isActive !== false)
            .sort(
              (a, b) => Number(a.urutan) - Number(b.urutan)
            );

          const urutan = new Map(
            aktif.map((faq, index) => [faq.id, index + 1])
          );

          hasil = hasil.map((faq) => ({
            ...faq,
            urutan:
              faq.isActive === false
                ? 0
                : urutan.get(faq.id) ?? faq.urutan,
          }));
        } else if (
          statusBerubah &&
          perubahan.isActive === true
        ) {
          const jumlahAktif = list.filter(
            (faq) => faq.isActive !== false
          ).length;

          hasil = hasil.map((faq) =>
            faq.id === item.id
              ? {
                  ...faq,
                  ...perubahan,
                  isActive: true,
                  urutan: jumlahAktif + 1,
                  updatedAt: now(),
                }
              : faq
          );
        } else {
          hasil = hasil.map((faq) =>
            faq.id === item.id
              ? {
                  ...faq,
                  ...perubahan,
                  updatedAt: now(),
                }
              : faq
          );
        }

        write(KEYS.faq, hasil);

        return result({
          faq: hasil.find((faq) => faq.id === item.id),
          message: "FAQ berhasil diperbarui.",
        });
      },

      remove(id: string) {
        const denied = adminError();

        if (denied) return denied;

        const list = faqList();

        if (!list.some((item) => item.id === id)) {
          return result(
            { message: "FAQ tidak ditemukan." },
            404
          );
        }

        const pesan = pesanList().map((item) =>
          item.faqId === id
            ? { ...item, faqId: null }
            : item
        );

        write(KEYS.messages, pesan);

        const hasil = list
          .filter((item) => item.id !== id)
          .map(withoutFaqMessages)
          .sort(
            (a, b) =>
              Number(a.urutan ?? 0) - Number(b.urutan ?? 0)
          );

        const aktif = hasil.filter(
          (item) => item.isActive !== false
        );

        const urutan = new Map(
          aktif.map((item, index) => [item.id, index + 1])
        );

        write(
          KEYS.faq,
          hasil.map((item) => ({
            ...item,
            urutan:
              item.isActive === false
                ? 0
                : urutan.get(item.id) ?? 0,
          }))
        );

        return result({
          message:
            "FAQ berhasil dihapus dan urutan berhasil diperbarui.",
        });
      },
    },

    regions: {
      list() {
        const denied = adminError();

        if (denied) return denied;

        return result({ regions: regionList() });
      },

      create(input: Record<string, unknown>) {
        const denied = adminError();

        if (denied) return denied;

        const list = regionList();

        const region: StoredRecord = {
          id: makeId("region"),
          ...input,
        };

        list.push(region);
        write(KEYS.regions, list);

        return result({ region }, 201);
      },

      update(input: { id: string; [key: string]: unknown }) {
        const denied = adminError();

        if (denied) return denied;

        const list = regionList();

        const region = list.find(
          (item) => item.id === input.id
        );

        if (!region) {
          return result(
            { message: "Daerah tidak ditemukan." },
            404
          );
        }

        const updated = { ...region, ...input };

        write(
          KEYS.regions,
          list.map((item) =>
            item.id === input.id ? updated : item
          )
        );

        return result({ region: updated });
      },

      remove(id: string) {
        const denied = adminError();

        if (denied) return denied;

        write(
          KEYS.regions,
          regionList().filter((item) => item.id !== id)
        );

        return result({
          message: "Daerah berhasil dihapus.",
        });
      },
    },

    metadata: {
      get() {
        const denied = adminError();

        if (denied) return denied;

        return result({ metadata: metadataList() });
      },

      save(metadata: unknown[]) {
        const denied = adminError();

        if (denied) return denied;

        write(KEYS.metadata, metadata);

        return result({
          metadata,
          message: "Metadata berhasil diperbarui.",
        });
      },
    },

    rekomendasi: {
      get() {
        const denied = adminError();

        if (denied) return denied;

        const rekomendasi = read<Record<string, string>>(
          KEYS.rekomendasi,
          {
            makanan: "",
            jajanan: "",
            minuman: "",
            oleh_oleh: "",
          }
        );

        return result({
          rekomendasi,
          kuliner: adminKulinerList().filter(
            (item) => item.status === "APPROVED"
          ),
        });
      },

      save(rekomendasi: Record<string, string>) {
        const denied = adminError();

        if (denied) return denied;

        const keys = [
          "makanan",
          "jajanan",
          "minuman",
          "oleh_oleh",
        ];

        if (
          !rekomendasi ||
          typeof rekomendasi !== "object" ||
          Array.isArray(rekomendasi)
        ) {
          return result(
            { message: "Format rekomendasi tidak valid." },
            400
          );
        }

        if (
          !keys.every(
            (key) => typeof rekomendasi[key] === "string"
          )
        ) {
          return result(
            { message: "Pilihan rekomendasi tidak valid." },
            400
          );
        }

        const pilihan = keys
          .map((key) => rekomendasi[key])
          .filter(Boolean);

        if (new Set(pilihan).size !== pilihan.length) {
          return result(
            {
              message:
                "Satu Kuliner tidak boleh dipilih untuk beberapa kategori.",
            },
            400
          );
        }

        const kulinerTerpilih = adminKulinerList().filter(
          (item) =>
            pilihan.includes(String(item.id)) &&
            item.status === "APPROVED"
        );

        if (kulinerTerpilih.length !== pilihan.length) {
          return result(
            {
              message:
                "Kuliner tidak ditemukan atau belum disetujui.",
            },
            400
          );
        }

        const kategoriPilihan: Record<string, string> = {
          makanan: "Makanan",
          jajanan: "Jajanan",
          minuman: "Minuman",
          oleh_oleh: "Oleh-Oleh Khas",
        };

        for (const key of keys) {
          const id = rekomendasi[key];

          if (!id) continue;

          const item = kulinerTerpilih.find(
            (kuliner) => String(kuliner.id) === id
          );

          if (
            !item ||
            normalisasiKategori(item.kategori) !==
              normalisasiKategori(kategoriPilihan[key])
          ) {
            return result(
              {
                message: `Pilihan untuk kategori ${kategoriPilihan[key]} tidak sesuai.`,
              },
              400
            );
          }
        }

        write(KEYS.rekomendasi, rekomendasi);

        return result({
          rekomendasi,
          message: "Rekomendasi berhasil diperbarui.",
        });
      },
    },

    hero: {
      get() {
        const denied = adminError();

        if (denied) return denied;

        return result({
          heroKulinerIds: read<string[]>(KEYS.hero, []),
          kuliner: adminKulinerList().filter(
            (item) =>
              item.status === "APPROVED" &&
              Boolean(item.gambar ?? item.img)
          ),
        });
      },

      save(heroKulinerIds: string[]) {
        const denied = adminError();

        if (denied) return denied;

        if (
          !Array.isArray(heroKulinerIds) ||
          !heroKulinerIds.every(
            (id) => typeof id === "string"
          )
        ) {
          return result(
            { message: "Format pilihan Hero tidak valid." },
            400
          );
        }

        if (
          new Set(heroKulinerIds).size !== heroKulinerIds.length
        ) {
          return result(
            {
              message:
                "Kuliner yang sama tidak boleh dipilih dua kali.",
            },
            400
          );
        }

        const tersedia = adminKulinerList().filter(
          (item) =>
            item.status === "APPROVED" &&
            Boolean(item.gambar ?? item.img)
        );

        const terpilih = tersedia.filter((item) =>
          heroKulinerIds.includes(String(item.id))
        );

        if (terpilih.length !== heroKulinerIds.length) {
          return result(
            {
              message:
                "Ada Kuliner yang tidak ditemukan, belum disetujui, atau belum memiliki gambar.",
            },
            400
          );
        }

        write(KEYS.hero, heroKulinerIds);

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new Event("jelajahRasaHeroChanged")
          );
        }

        return result({
          heroKulinerIds,
          message: "Hero Carousel berhasil diperbarui.",
        });
      },
    },
  },
};