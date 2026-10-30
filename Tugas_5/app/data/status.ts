export type StatusKuliner = "PENDING" | "APPROVED" | "REJECTED";

export const LABEL_STATUS: { [status: string]: string } = {
  PENDING: "Menunggu",
  APPROVED: "Aktif",
  REJECTED: "Nonaktif",
};

export const WARNA_STATUS: { [status: string]: string } = {
  PENDING: "bg-warning text-dark",
  APPROVED: "bg-success",
  REJECTED: "bg-secondary",
};
