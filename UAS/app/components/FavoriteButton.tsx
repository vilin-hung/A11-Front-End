"use client";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
};

export default function FavoriteButton({
  isFavorite,
  onToggle,
  className = "",
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-light btn-sm rounded-circle shadow-sm btn-icon btn-like ${
        isFavorite ? "active" : ""
      } ${className}`}
      title={isFavorite ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
      aria-label={
        isFavorite ? "Hapus dari Favorit" : "Tambahkan ke Favorit"
      }
      aria-pressed={isFavorite}
      onClick={onToggle}
    >
      <i
        className={`bx ${
          isFavorite ? "bxs-heart" : "bx-heart"
        } fs-6`}
        aria-hidden="true"
      />
    </button>
  );
}
