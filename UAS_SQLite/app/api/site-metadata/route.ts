import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const metadata = db.prepare("SELECT * FROM SiteMetadata").all() as {
      key: string;
      value: string;
    }[];

    const hasil = Object.fromEntries(
      metadata.map((item) => [item.key, item.value])
    );

    return NextResponse.json(hasil);
  } catch (error) {
    console.error("Gagal mengambil metadata:", error);

    return NextResponse.json(
      { message: "Gagal mengambil metadata website." },
      { status: 500 }
    );
  }
}
