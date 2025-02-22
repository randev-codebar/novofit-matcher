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
        distinct: ["locationId"],
      }),
      prisma.excelA.count(),
      prisma.excelB.findMany(),
    ]);

    // Before sending response, validate it's proper JSON
    const response = { items, total, excelB };
    console.log("API Response:", response);

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
