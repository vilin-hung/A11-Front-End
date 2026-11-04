"use client";

import { useMemo, useState } from "react";
import AdminFilter from "../AdminFilter";
import {
  BarisKosong,
  BarisKuliner,
  type ItemAdmin,
} from "../AdminTabel";

type Props = {
  items: ItemAdmin[];
  info: string;
  error: string;
  onAdd: () => void;
  onEdit: (item: ItemAdmin) => void;
  onDelete: (item: ItemAdmin) => void;
  onPhoto: (item: ItemAdmin) => void;
};

export default function KulinerPage({
  items,
  info,
  error,
  onAdd,
  onEdit,
  onDelete,
  onPhoto,
}: Props) {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState("");
  const [status, setStatus] = useState("");

  const opsiKategori = useMemo(
    () =>
      [...new Set(items.map((item) => item.kategori).filter(Boolean))]
        .sort()
        .map((value) => ({ value, label: value })),
    [items]
  );

  const opsiStatus = useMemo(
    () =>
      [...new Set(items.map((item) => item.status))]
        .sort()
        .map((value) => ({ value, label: value })),
    [items]
  );

  const itemsTersaring = useMemo(() => {
    const query = cari.trim().toLowerCase();

    return items.filter((item) => {
      const cocokCari = [
        item.nama,
        item.kategori,
        item.daerah,
        item.pengirim,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      return (
        cocokCari &&
        (!kategori || item.kategori === kategori) &&
        (!status || item.status === status)
      );
    });
  }, [items, cari, kategori, status]);

  return (
    <section id="tab-kelola-kuliner">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h4 className="mb-1">Kelola Kuliner</h4>
          <p className="text-muted mb-0">
            Cari, filter, dan moderasi data kuliner.
          </p>
        </div>

        <button type="button" className="btn btn-success" onClick={onAdd}>
          <i className="bx bx-plus me-1" />
          Tambah Kuliner
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      <AdminFilter
        searchValue={cari}
        searchPlaceholder="Cari nama, kategori, daerah, atau pengirim"
        onSearchChange={setCari}
        filters={[
          {
            key: "kategori-kuliner",
            label: "Kategori",
            value: kategori,
            options: opsiKategori,
            onChange: setKategori,
          },
          {
            key: "status-kuliner",
            label: "Status",
            value: status,
            options: opsiStatus,
            onChange: setStatus,
          },
        ]}
        onReset={() => {
          setCari("");
          setKategori("");
          setStatus("");
        }}
      />

      <div className="box-tabel border rounded bg-white">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama Kuliner</th>
                <th>Kategori</th>
                <th>Asal Daerah</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {itemsTersaring.length === 0 ? (
                <BarisKosong
                  kolom={5}
                  ikon="bx-folder-open"
                  pesan={
                    items.length === 0
                      ? "Belum ada data kuliner."
                      : "Tidak ada kuliner yang cocok dengan filter."
                  }
                />
              ) : (
                itemsTersaring.map((item) => (
                  <BarisKuliner
                    key={item.id}
                    item={item}
                    onEdit={() => onEdit(item)}
                    onHapus={() => onDelete(item)}
                    onFoto={() => onPhoto(item)}
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