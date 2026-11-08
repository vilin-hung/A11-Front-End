import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const metadata = await prisma.siteMetadata.findMany();

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