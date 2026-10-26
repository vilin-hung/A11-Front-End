/* =========================
   TIPE DATA
   ========================= */
export type StatusKuliner = 'Aktif' | 'Menunggu' | 'Nonaktif';
export type StatusUlasan = 'Tampil' | 'Sembunyi';

export type ItemAdmin = {
  id: string;
  nama: string;
  kategori: string;
  daerah: string;
  status: StatusKuliner;
  bahan: string;
  deskripsi: string;
  img: string;
  pengirim?: string;
  tanggal?: string;
  catatan?: string;
  rasa?: string;
  harga?: string;
  sumber: 'bawaan' | 'usulan';
};

export type Ulasan = {
  id: number;
  nama: string;
  pesan: string;
  status: StatusUlasan;
  tanggal: string;
};

/* =========================
   DATA OPSI
   ========================= */
export const KATEGORI = [
  { nama: 'Makanan', id: 'hitung-makanan' },
  { nama: 'Minuman', id: 'hitung-minuman' },
  { nama: 'Jajanan', id: 'hitung-jajanan' },
  { nama: 'Oleh-Oleh Khas', id: 'hitung-oleholeh' },
];

export const DAFTAR_DAERAH = [
  'Kota Bandung',
  'Kota Cirebon',
  'Kota Tasikmalaya',
  'Kota Bogor',
  'Kota Garut',
  'Kota Sumedang',
  'Kab. Cirebon',
  'Kab. Garut',
  'Kab. Karawang',
  'Kab. Subang',
  'Kab. Sumedang',
];

/* =========================
   KOMPONEN KECIL
   ========================= */
const WARNA_STATUS = {
  Aktif: 'bg-primary',
  Menunggu: 'bg-warning text-dark',
  Nonaktif: 'bg-secondary',
  Tampil: 'bg-success',
  Sembunyi: 'bg-secondary',
};

export function BadgeStatus({
  status,
}: {
  status: StatusKuliner | StatusUlasan;
}) {
  return <span className={`badge ${WARNA_STATUS[status]}`}>{status}</span>;
}

export function FotoMini({
  item,
  onKlik,
}: {
  item: ItemAdmin;
  onKlik: () => void;
}) {
  if (!item.img) {
    return <i className="bx bx-image text-muted me-2 fs-4" />;
  }

  return (
    <button
      type="button"
      className="btn btn-link p-0 me-2"
      title={`Lihat foto ${item.nama}`}
      onClick={onKlik}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.img}
        alt=""
        className="rounded"
        style={{ width: 40, height: 40, objectFit: 'cover' }}
      />
    </button>
  );
}

export function BarisKosong({
  kolom,
  ikon,
  pesan,
}: {
  kolom: number;
  ikon: string;
  pesan: string;
}) {
  return (
    <tr className="baris-kosong">
      <td colSpan={kolom} className="text-center text-muted">
        <i className={`bx ${ikon} d-block`} />
        <span>{pesan}</span>
      </td>
    </tr>
  );
}

/* =========================
   BARIS TABEL
   ========================= */
export function BarisUsulan({
  item,
  onTerima,
  onTolak,
  onFoto,
}: {
  item: ItemAdmin;
  onTerima: () => void;
  onTolak: () => void;
  onFoto: () => void;
}) {
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <FotoMini item={item} onKlik={onFoto} />
          {item.nama}
        </div>
      </td>
      <td>{item.pengirim}</td>
      <td>{item.tanggal || '-'}</td>
      <td>
        <BadgeStatus status={item.status} />
      </td>
      <td className="text-center text-nowrap">
        {item.status === 'Menunggu' ? (
          <>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={onTerima}
            >
              Terima
            </button>{' '}
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={onTolak}
            >
              Tolak
            </button>
          </>
        ) : (
          <span className="text-muted small">-</span>
        )}
      </td>
    </tr>
  );
}

export function BarisKuliner({
  item,
  onEdit,
  onHapus,
  onFoto,
}: {
  item: ItemAdmin;
  onEdit: () => void;
  onHapus: () => void;
  onFoto: () => void;
}) {
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <FotoMini item={item} onKlik={onFoto} />
          {item.nama}
        </div>
      </td>
      <td>{item.kategori}</td>
      <td>{item.daerah}</td>
      <td>
        <BadgeStatus status={item.status} />
      </td>
      <td className="text-center text-nowrap">
        <button type="button" className="btn btn-warning btn-sm" onClick={onEdit}>
          Edit
        </button>{' '}
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onHapus}
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}

export function BarisUlasan({
  item,
  onToggle,
}: {
  item: Ulasan;
  onToggle: () => void;
}) {
  return (
    <tr>
      <td>{item.nama}</td>
      <td>{item.pesan}</td>
      <td>{item.tanggal}</td>
      <td>
        <BadgeStatus status={item.status} />
      </td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className={
            item.status === 'Tampil'
              ? 'btn btn-outline-secondary btn-sm'
              : 'btn btn-success btn-sm'
          }
          onClick={onToggle}
        >
          {item.status === 'Tampil' ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </td>
    </tr>
  );
}
