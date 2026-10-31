export type StatusKuliner = "PENDING" | "APPROVED" | "REJECTED";
export type StatusUlasan = "TAMPIL" | "SEMBUNYI";

export const LABEL_STATUS: { [status: string]: string } = {
  PENDING: "Menunggu",
  APPROVED: "Aktif",
  REJECTED: "Nonaktif",
  TAMPIL: "Tampil",
  SEMBUNYI: "Sembunyi",
};

export const WARNA_STATUS: { [status: string]: string } = {
  PENDING: "bg-warning text-dark",
  APPROVED: "bg-success",
  REJECTED: "bg-secondary",
  TAMPIL: "bg-success",
  SEMBUNYI: "bg-secondary",
};
