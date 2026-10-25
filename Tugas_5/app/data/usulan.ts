import { DATA_KULINER, type Kuliner } from './kuliner';

const USULAN_KEY = 'jelajahRasaUsulan';
const KULINER_KEY = 'jelajahRasaKuliner';

/* Bentuk data kuliner bawaan setelah disimpan admin. */
type KulinerAdmin = {
  id: string;
  nama: string;
  kategori: string;
  daerah: string;
  status: string;
  bahan?: string;
  deskripsi?: string;
  img?: string;
};

/* Label yang tampil di badge kartu */
const LABEL_KATEGORI: { [kategori: string]: string } = {
  Makanan: 'Makanan Utama',
  Jajanan: 'Jajanan',
  Minuman: 'Minuman',
  'Oleh-Oleh Khas': 'Oleh-Oleh Khas',
};

/* Kategori usulan masih berupa label, kartu butuh slug */
const SLUG_KATEGORI: { [kategori: string]: Kuliner['kategori'] } = {
  Makanan: 'makanan',
  Jajanan: 'jajanan',
  Minuman: 'minuman',
  'Oleh-Oleh Khas': 'oleh-oleh',
};

/* "Kota Bandung" -> "bandung", biar cocok sama filter kota */
function slugKota(daerah: string) {
  return String(daerah || '')
    .replace(/^Kota /, '')
    .replace(/^Kab\. /, '')
    .replace(/^Kabupaten /, '')
    .toLowerCase();
}

/* "Gurih, Pedas" -> "gurih pedas", biar cocok sama filter karakter rasa */
function petaRasa(rasa: string) {
  const peta: { [kata: string]: string } = {
    gurih: 'gurih',
    asin: 'gurih',
    pedas: 'pedas',
    manis: 'manis',
    asam: 'segar',
  };
  const hasil: string[] = [];

  String(rasa || '')
    .split(',')
    .forEach((kata) => {
      const slug = peta[kata.trim().toLowerCase()];

      if (slug && !hasil.includes(slug)) hasil.push(slug);
    });

  return hasil.join(' ');
}

/* "15.000 - 25.000" -> "murah", ambil angka pertama saja */
function kelompokHarga(harga: string): Kuliner['harga'] {
  const cocok = String(harga || '').match(/[0-9][0-9.]*/);
  const angka = cocok ? Number(cocok[0].replace(/\./g, '')) : 0;

  if (!angka) return 'sedang';
  if (angka < 15000) return 'murah';
  if (angka <= 30000) return 'sedang';
  return 'tinggi';
}

/* Kuliner bawaan setelah diedit/dihapus admin. Disimpan admin dalam
   bentuk yang lebih sederhana, jadi rasa & harga tetap diambil dari
   DATA_KULINER asli supaya filter katalog tidak rusak. */
export function bacaKulinerBawaan(): Kuliner[] {
  let tersimpan: unknown = null;

  try {
    const isi = localStorage.getItem(KULINER_KEY);
    if (isi) tersimpan = JSON.parse(isi);
  } catch {
    return DATA_KULINER;
  }

  if (!Array.isArray(tersimpan)) return DATA_KULINER;

  const hasil: Kuliner[] = [];

  tersimpan.forEach((item: KulinerAdmin) => {
    if (item.status !== 'Aktif') return;

    const asli = DATA_KULINER.find((k) => k.id === item.id);

    /* item yang tidak ada di DATA_KULINER bukan kuliner bawaan */
    if (!asli) return;

    hasil.push({
      ...asli,
      nama: item.nama || asli.nama,
      kategori: SLUG_KATEGORI[item.kategori] ?? asli.kategori,
      kategoriLabel: LABEL_KATEGORI[item.kategori] ?? asli.kategoriLabel,
      asal: item.daerah || asli.asal,
      kota: slugKota(item.daerah) || asli.kota,
      bahan: item.bahan ?? asli.bahan,
      deskripsi: item.deskripsi ?? asli.deskripsi,
      gambar: item.img || asli.gambar,
    });
  });

  return hasil;
}

/* Usulan yang sudah diterima admin, dibentuk ulang supaya
   bisa dipakai di halaman yang sama dengan kuliner bawaan. */
export function bacaUsulanAktif(): Kuliner[] {
  let tersimpan: unknown = [];

  try {
    tersimpan = JSON.parse(localStorage.getItem(USULAN_KEY) || '[]');
  } catch {
    return [];
  }

  if (!Array.isArray(tersimpan)) return [];

  return tersimpan
    .filter((item) => item.status === 'Aktif')
    .map((item) => ({
      id: String(item.id),
      nama: item.nama || '(tanpa nama)',
      kota: slugKota(item.daerah),
      kategori: SLUG_KATEGORI[item.kategori] ?? 'makanan',
      kategoriLabel: LABEL_KATEGORI[item.kategori] ?? item.kategori ?? 'Makanan',
      harga: kelompokHarga(item.harga),
      rasa: petaRasa(item.rasa),
      asal: item.daerah || '-',
      gambar: item.img || '',
      deskripsi: item.deskripsi || '-',
      bahan: item.bahan || '-',
      karakterRasa: item.rasa || '-',
      estimasiHarga: item.harga || '-',
    }));
}
