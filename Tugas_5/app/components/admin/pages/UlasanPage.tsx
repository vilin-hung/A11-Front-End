"use client";

import { useMemo, useState } from "react";
import AdminFilter from "../AdminFilter";
import {
  BarisKosong,
  BarisUlasan,
  type Ulasan,
} from "../AdminTabel";

type Props = {
  ulasan: Ulasan[];
  info: string;
  error: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function UlasanPage({
  ulasan,
  info,
  error,
  onToggle,
  onDelete,
}: Props) {
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState("");
  const [ulasanToDelete, setUlasanToDelete] = useState<Ulasan | null>(null);
  

  const opsiStatus = useMemo(
    () =>
      [...new Set(ulasan.map((item) => item.status))]
        .sort()
        .map((value) => ({ value, label: value })),
    [ulasan]
  );

  const ulasanTersaring = useMemo(() => {
    const query = cari.trim().toLowerCase();

    return ulasan.filter((item) => {
      const cocokCari = `${item.namaUser} ${item.komentar}`
        .toLowerCase()
        .includes(query);

      return cocokCari && (!status || item.status === status);
    });
  }, [ulasan, cari, status]);

  return (
    <section id="tab-kelola-ulasan">
      <div className="mb-3">
        <h4 className="mb-1">Kelola Ulasan</h4>
        <p className="text-muted mb-0">
          Kelola ulasan yang diberikan pengguna.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      <AdminFilter
        searchValue={cari}
        searchPlaceholder="Cari nama pengguna atau komentar"
        onSearchChange={setCari}
        filters={[
          {
            key: "status-ulasan",
            label: "Status",
            value: status,
            options: opsiStatus,
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setCari("");
          setStatus("");
        }}
      />

      <div className="box-tabel border rounded bg-white">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama Pengguna</th>
                <th>Rating</th>
                <th>Komentar</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {ulasanTersaring.length === 0 ? (
                <BarisKosong
                  kolom={6}
                  ikon="bx-chat"
                  pesan={
                    ulasan.length === 0
                      ? "Belum ada ulasan dari pengguna."
                      : "Tidak ada ulasan yang cocok dengan filter."
                  }
                />
              ) : (
                ulasanTersaring.map((item) => (
                  <BarisUlasan
                    key={item.id}
                    item={item}
                    onToggle={() => onToggle(item.id)}
                    onHapus={() => onDelete(item.id)}
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