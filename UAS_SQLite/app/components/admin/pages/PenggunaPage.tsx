"use client";

import { useMemo, useState } from "react";
import AdminFilter from "../AdminFilter";
import { BarisKosong } from "../AdminTabel";

export type UserAdmin = {
  id: string;
  nama: string;
  email: string;
  kota: string | null;
  avatar: string | null;
  role: string;
};

type Props = {
  users: UserAdmin[];
  adminId: string | null;
  info: string;
  error: string;
  onUbahRole: (user: UserAdmin, role: string) => void;
};

export default function PenggunaPage({
  users,
  adminId,
  info,
  error,
  onUbahRole,
}: Props) {
  const [cari, setCari] = useState("");
  const [role, setRole] = useState("");

  const jumlahAdmin = users.filter((user) => user.role === "ADMIN").length;
  const jumlahUser = users.length - jumlahAdmin;

  const kartuStatistik = [
    {
      label: "Total Pengguna",
      value: users.length,
      id: "stat-pengguna-total",
    },
    {
      label: "Total Admin",
      value: jumlahAdmin,
      id: "stat-pengguna-admin",
    },
    {
      label: "Total User",
      value: jumlahUser,
      id: "stat-pengguna-user",
    },
  ];

  const usersTersaring = useMemo(() => {
    const query = cari.trim().toLowerCase();

    return users.filter((user) => {
      const cocokCari = [user.nama, user.email, user.kota ?? "", user.role]
        .join(" ")
        .toLowerCase()
        .includes(query);

      return cocokCari && (!role || user.role === role);
    });
  }, [users, cari, role]);

  return (
    <section id="tab-kelola-pengguna">
      <div className="mb-3">
        <h4 className="mb-1">Kelola Pengguna</h4>
        <p className="text-muted mb-0">
          Cari pengguna dan atur hak akses dashboard.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {info && <div className="alert alert-success">{info}</div>}

      <div className="row g-3 mb-3">
        {kartuStatistik.map((kartu) => (
          <div className="col-6 col-md-4" key={kartu.id}>
            <div className="kartu-stat border rounded bg-white">
              <span>{kartu.label}</span>
              <h3 id={kartu.id}>{kartu.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <AdminFilter
        searchValue={cari}
        searchPlaceholder="Cari nama, email, atau kota"
        onSearchChange={setCari}
        filters={[
          {
            key: "role-pengguna",
            label: "Role",
            value: role,
            options: [
              { value: "ADMIN", label: "Admin" },
              { value: "USER", label: "User" },
            ],
            onChange: setRole,
          },
        ]}
        onReset={() => {
          setCari("");
          setRole("");
        }}
        resetClassName="btn btn-success w-100"
      />

      <div className="box-tabel border rounded bg-white">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Kota</th>
                <th>Role</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {usersTersaring.length === 0 ? (
                <BarisKosong
                  kolom={5}
                  ikon="bx-user"
                  pesan={
                    users.length === 0
                      ? "Belum ada data pengguna."
                      : "Tidak ada pengguna yang cocok dengan pencarian."
                  }
                />
              ) : (
                usersTersaring.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nama}</td>
                    <td>{user.email}</td>
                    <td>{user.kota || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === "ADMIN" ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="text-center text-nowrap">
                      {user.id === adminId ? (
                        <span className="text-muted small">Akun Anda</span>
                      ) : (
                        <button
                          type="button"
                          className={
                            user.role === "ADMIN"
                              ? "btn btn-outline-danger btn-sm"
                              : "btn btn-success btn-sm"
                          }
                          onClick={() =>
                            onUbahRole(
                              user,
                              user.role === "ADMIN" ? "USER" : "ADMIN"
                            )
                          }
                        >
                          {user.role === "ADMIN"
                            ? "Jadikan User"
                            : "Jadikan Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <small className="text-muted d-block mt-3">
        Hanya admin yang dapat mengubah role pengguna dari dashboard.
      </small>
    </section>
  );
}
