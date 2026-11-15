"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import Image from "next/image";
import MapPositionPicker from "../../MapPositionPicker";

type MapRegion = {
  id: string;
  nama: string;
  deskripsi: string;
  posisiX: number;
  posisiY: number;
  jumlahKulinerApproved: number;
};

type RegionForm = {
  nama: string;
  deskripsi: string;
  posisiX: number;
  posisiY: number;
};

type Props = {
  regions: MapRegion[];
  loading: boolean;
  error: string;
  message: string;
  onAdd: () => void;
  onEdit: (region: MapRegion) => void;
  onDelete: (region: MapRegion) => void;

  regionFormOpen: boolean;
  editingRegion: MapRegion | null;
  regionForm: RegionForm;
  setRegionForm: Dispatch<SetStateAction<RegionForm>>;
  onCloseForm: () => void;
  onSaveForm: () => void;
};

export default function PetaPage({
  regions,
  loading,
  error,
  message,
  onAdd,
  onEdit,
  onDelete,
  regionFormOpen,
  editingRegion,
  regionForm,
  setRegionForm,
  onCloseForm,
  onSaveForm,
}: Props) {
  const [regionToDelete, setRegionToDelete] = useState<MapRegion | null>(null);

  return (
    <section id="tab-peta">
      <div className="box-tabel border rounded bg-white p-4">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h4 className="mb-1">Kelola Peta</h4>
            <p className="text-muted mb-0">
              Kelola deskripsi wilayah dan posisi pin pada Peta Rasa.
            </p>
          </div>
          <button type="button" className="btn btn-success" onClick={onAdd}>
            <i className="bx bx-plus me-1" />
            Tambah Daerah
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <h5 className="fw-semibold mb-3">Preview Peta Jawa Barat</h5>
        <div
          className="peta-admin-preview"
          style={{ width: "100%", maxWidth: "750px" }}
        >
          <Image
            src="/images/homepage/peta-jabar.png"
            alt="Peta Kabupaten dan Kota Jawa Barat"
            width={1200}
            height={900}
            className="w-100 h-auto"
            style={{ display: "block" }}
          />

          {regions.map((region) => {
            const jenisWilayah = region.nama.startsWith("Kota ")
              ? "kota"
              : "kabupaten";

            return (
              <div
                key={region.id}
                className={`peta-pin-item pin-${jenisWilayah}`}
                style={{ left: `${region.posisiX}%`, top: `${region.posisiY}%` }}
              >
                <button
                  type="button"
                  className="btn-pin"
                  title={`Edit ${region.nama}`}
                  aria-label={`Edit ${region.nama}`}
                  onClick={() => onEdit(region)}
                >
                  <i className="bx bx-map-pin" />
                </button>
                <span className="pin-label">{region.nama}</span>
              </div>
            );
          })}
        </div>

        <p className="text-muted small mt-2">
          Klik pin untuk mengedit informasi dan posisi daerah.
        </p>

        {loading ? (
          <p className="text-muted">Memuat data wilayah...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Kabupaten/Kota</th>
                  <th>Deskripsi</th>
                  <th>Posisi X</th>
                  <th>Posisi Y</th>
                  <th>Kuliner</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region) => (
                  <tr key={region.id}>
                    <td className="fw-semibold">{region.nama}</td>
                    <td style={{ minWidth: 220, maxWidth: 350 }}>
                      {region.deskripsi || (
                        <span className="text-muted">Belum ada deskripsi</span>
                      )}
                    </td>
                    <td>{region.posisiX}%</td>
                    <td>{region.posisiY}%</td>
                    <td>
                      <span
                        className={`badge ${
                          region.jumlahKulinerApproved > 0
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {region.jumlahKulinerApproved > 0
                          ? `${region.jumlahKulinerApproved} kuliner`
                          : "Belum ada"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-warning"
                          onClick={() => onEdit(region)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setRegionToDelete(region)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!regions.length && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Belum ada wilayah untuk ditampilkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

            {regionFormOpen && (
              <div
                className="modal-region-overlay"
                onClick={() => {
                  onCloseForm();
                }}
              >
                <div
                  className="modal-region-content"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="mb-1">
                        {editingRegion ? `Edit ${editingRegion.nama}` : "Tambah Daerah"}
                      </h5>
                      <p className="text-muted mb-0">
                        Atur deskripsi dan posisi pin wilayah.
                      </p>
                    </div>
      
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        onCloseForm()
                      }}
                    />
                  </div>
      
                  <div className="mb-3">
                    <label className="form-label">Nama Kabupaten/Kota</label>
                    <input
                      type="text"
                      className="form-control"
                      value={regionForm.nama}
                      onChange={(event) =>
                        setRegionForm({
                          ...regionForm,
                          nama: event.target.value,
                        })
                      }
                      placeholder="Contoh: Kabupaten Bandung"
                      disabled={!!editingRegion}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Deskripsi Wilayah</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={regionForm.deskripsi}
                      onChange={(event) =>
                        setRegionForm({
                          ...regionForm,
                          deskripsi: event.target.value,
                        })
                      }
                      placeholder="Masukkan deskripsi wilayah..."
                    />
                  </div>
      
                  <div className="mb-3">
                    <label className="form-label">
                      Posisi Pin pada Peta
                    </label>
      
                  <MapPositionPicker
                    posisiX={regionForm.posisiX}
                    posisiY={regionForm.posisiY}
                    onChange={(posisiX, posisiY) =>
                      setRegionForm((sebelumnya) => ({
                        ...sebelumnya,
                        posisiX,
                        posisiY,
                      }))
                    }
                  />
      
                    {/* <small className="text-muted">
                      Klik pada peta untuk menentukan posisi pin.
                    </small> */}
                  </div>
      
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Posisi X (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={regionForm.posisiX}
                        onChange={(event) =>
                          setRegionForm({
                            ...regionForm,
                            posisiX: Number(event.target.value),
                          })
                        }
                      />
                    </div>
      
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Posisi Y (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={regionForm.posisiY}
                        onChange={(event) =>
                          setRegionForm({
                            ...regionForm,
                            posisiY: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
      
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}
      
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        onCloseForm();
                      }}
                      disabled={loading}
                    >
                      Batal
                    </button>
      
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={onSaveForm}
                      disabled={
                        loading ||
                        !regionForm.deskripsi.trim() ||
                        regionForm.posisiX < 0 ||
                        regionForm.posisiX > 100 ||
                        regionForm.posisiY < 0 ||
                        regionForm.posisiY > 100
                      }
                    >
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {regionToDelete && (
              <div
                className="modal-region-overlay"
                role="presentation"
                onClick={() => setRegionToDelete(null)}
              >
                <div
                  className="modal-region-content"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="hapus-daerah-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h5 id="hapus-daerah-title">Hapus daerah?</h5>
                  <p>
                    Yakin ingin menghapus daerah <strong>{regionToDelete.nama}</strong>?
                  </p>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setRegionToDelete(null)}
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        const region = regionToDelete;
                        setRegionToDelete(null);
                        onDelete(region);
                      }}
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}
      </div>
    </section>
  );
}