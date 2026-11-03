
"use client";

import Image from "next/image";
import { useRef } from "react";

type MapPositionPickerProps = {
  posisiX: number;
  posisiY: number;
  onChange: (posisiX: number, posisiY: number) => void;
};

export default function MapPositionPicker({
  posisiX,
  posisiY,
  onChange,
}: MapPositionPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  function handleMapClick(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    const map = mapRef.current;
    if (!map) return;

    const rect = map.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onChange(
      Number(Math.max(0, Math.min(100, x)).toFixed(2)),
      Number(Math.max(0, Math.min(100, y)).toFixed(2))
    );
  }

  return (
    <div className="map-position-picker">
      <p className="text-muted small mb-2">
        Klik pada peta untuk menentukan posisi pin.
      </p>

      <div
        ref={mapRef}
        onClick={handleMapClick}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1200 / 900",
          cursor: "crosshair",
          overflow: "hidden",
          borderRadius: "12px",
          border: "1px solid #dee2e6",
        }}
      >
        <Image
          src="/images/homepage/peta-jabar.jpg"
          alt="Peta Jawa Barat untuk menentukan posisi pin"
          fill
          sizes="(max-width: 768px) 100vw, 700px"
          style={{ objectFit: "fill" }}
          priority
        />

        <div
          style={{
            position: "absolute",
            left: `${posisiX}%`,
            top: `${posisiY}%`,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 2,
            color: "#dc3545",
            fontSize: "30px",
          }}
        >
          <i className="bx bxs-map-pin" />
        </div>
      </div>

      <small className="text-muted d-block mt-2">
        Posisi pin: {posisiX}% , {posisiY}%
      </small>
    </div>
  );
}
