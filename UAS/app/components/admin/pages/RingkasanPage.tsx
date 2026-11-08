import {
  BarisKosong,
  BarisUsulan,
  KATEGORI,
  type ItemAdmin,
} from "../AdminTabel";

type StatistikAdmin = {
  totalPengguna: number;
  kulinerApproved: number;
  kulinerPending: number;
  kulinerRejected: number;
  totalUlasan: number;
  totalFavorit: number;
  perKategori: Record<string, number>;
};

type Props = {
  statistik: StatistikAdmin | null;
  usulanTerbaru: ItemAdmin[];
  onPeringkat: () => void;
  onTerima: (id: string) => void;
  onTolak: (item: ItemAdmin) => void;
  onFoto: (item: ItemAdmin) => void;
};

export default function RingkasanPage({
  statistik,
  usulanTerbaru,
  onPeringkat,
  onTerima,
  onTolak,
  onFoto,
}: Props) {
  const statistikCards = [
    {
      label: "Kuliner Disetujui",
      value: statistik?.kulinerApproved ?? 0,
      note: "Tampil di katalog",
      id: "stat-total-kuliner",
    },
    {
      label: "Menunggu Tinjauan",
      value: statistik?.kulinerPending ?? 0,
      note: "Perlu ditinjau admin",
      id: "stat-perlu-menunggu",
    },
    {
      label: "Ditolak",
      value: statistik?.kulinerRejected ?? 0,
      note: "Tidak tampil di katalog",
      id: "stat-total-ditolak",
    },
    {
      label: "Total Pengguna",
      value: statistik?.totalPengguna ?? 0,
      note: "Akun terdaftar",
      id: "stat-total-pengguna",
    },
    {
      label: "Total Ulasan",
      value: statistik?.totalUlasan ?? 0,
      note: "Ulasan pengguna",
      id: "stat-total-ulasan",
    },
  ];

  return (
    <section id="tab-ringkasan">
      <h3>Ringkasan Statistik</h3>

      <div className="row g-3">
        {statistikCards.map((card) => (
          <div className="col-6 col-lg-4 col-xl-2" key={card.id}>
            <div className="kartu-stat border rounded bg-white">
              <span>{card.label}</span>
              <h3 id={card.id}>{card.value}</h3>
              <small>{card.note}</small>
            </div>
          </div>
        ))}

        <div className="col-6 col-lg-4 col-xl-2">
          <button
            type="button"
            className="kartu-stat kartu-tombol border rounded bg-white w-100 text-start"
            onClick={onPeringkat}
          >
            <span className="d-flex justify-content-between align-items-center">
              Total Favorit
              <i className="bx bx-chevron-right" />
            </span>
            <h3 id="stat-total-favorit">{statistik?.totalFavorit ?? 0}</h3>
            <small className="text-danger">
              <i className="bx bx-trophy me-1" />
              Top 5 Terfavorit
            </small>
          </button>
        </div>
      </div>

      {statistik &&
        statistik.kulinerApproved === 0 &&
        statistik.kulinerPending === 0 &&
        statistik.kulinerRejected === 0 && (
          <p className="text-muted small">
            Belum ada data kuliner di database.
          </p>
        )}

      <div className="box-stat-kategori border rounded bg-white">
        <h5>Sebaran Data per Kategori</h5>
        <div className="row text-center g-2" id="wadah-stat-kategori">
          {KATEGORI.map((item) => (
            <div className="col-6 col-md-3" key={item.id}>
              <div className="border rounded bg-light">
                <small className="text-muted d-block">{item.nama}</small>
                <h4 id={item.id}>
                  {statistik?.perKategori[item.nama] ?? 0}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="box-stat-kategori border rounded bg-white">
        <h5>Sebaran Kuliner per Daerah</h5>
        <div style={{ height: 240 }}>
          <canvas id="chart-daerah" />
        </div>
      </div>

      <div className="box-tabel border rounded bg-white">
        <h5>Pengajuan Rekomendasi Terbaru</h5>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama Kuliner</th>
                <th>Pengirim</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {usulanTerbaru.length === 0 ? (
                <BarisKosong
                  kolom={5}
                  ikon="bx-inbox"
                  pesan="Belum ada pengajuan rekomendasi kuliner baru."
                />
              ) : (
                usulanTerbaru.map((item) => (
                  <BarisUsulan
                    key={item.id}
                    item={item}
                    onTerima={() => onTerima(item.id)}
                    onTolak={() => onTolak(item)}
                    onFoto={() => onFoto(item)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}