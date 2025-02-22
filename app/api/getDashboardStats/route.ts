import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [totalExcelA, distinctCustomers, totalExcelB, totalReviewed] =
      await Promise.all([
        prisma.excelA.count(),
        prisma.excelA
          .findMany({
            distinct: ["locationId"],
            select: { locationId: true },
          })
          .then((records: { locationId: string }[]) => records.length), // Specify the type of records
        prisma.excelB.count(),
        prisma.reviewedData.count(),
      ]);

    return NextResponse.json({
      totalExcelA,
      distinctCustomers,
      totalExcelB,
      totalReviewed,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
