export type StatusKuliner = "PENDING" | "APPROVED" | "REJECTED";
export type StatusUlasan = "AKTIF" | "NONAKTIF";

export const LABEL_STATUS: { [status: string]: string } = {
  PENDING: "Menunggu",
  APPROVED: "Aktif",
  REJECTED: "Nonaktif",
  AKTIF: "AKTIF",
  NONAKTIF: "NONAKTIF",
};

export const WARNA_STATUS: { [status: string]: string } = {
  PENDING: "bg-warning text-dark",
  APPROVED: "bg-success",
  REJECTED: "bg-secondary",
  AKTIF: "bg-success",
  NONAKTIF: "bg-secondary",
};