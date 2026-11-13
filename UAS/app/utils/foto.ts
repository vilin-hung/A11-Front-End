export const FORMAT_FOTO = ["image/jpeg", "image/png", "image/webp"];
export const MAKS_UKURAN_FOTO = 5 * 1024 * 1024;

/* Perkecil foto (maks 1000px) dan ubah ke JPEG dataURL supaya ringan dikirim ke server */
export function kompresFoto(file: File, maxSisi = 1000, kualitas = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const skala = Math.min(1, maxSisi / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * skala);
      canvas.height = Math.round(img.height * skala);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", kualitas));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("");
    };
    img.src = url;
  });
}

/* Validasi file foto, kembalikan pesan error atau "" jika valid */
export function validasiFoto(file: File): string {
  if (!FORMAT_FOTO.includes(file.type)) return "Format foto harus JPG, PNG, atau WEBP.";
  if (file.size > MAKS_UKURAN_FOTO) return "Ukuran foto maksimal 5MB.";
  return "";
}