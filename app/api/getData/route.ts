import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const skip = (page - 1) * limit;

  try {
    const [items, total, excelB] = await Promise.all([
      prisma.excelA.findMany({
        skip,
        take: limit,
      }),
      prisma.excelA.count(),
      prisma.excelB.findMany(),
    ]);

    return NextResponse.json({ items, total, excelB });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
