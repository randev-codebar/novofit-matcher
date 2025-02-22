import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { excelA, excelB } = await request.json();

    // Upload data from Excel A
    for (const customer of excelA) {
      await prisma.excelA.create({
        data: {
          customerName: customer.customerName || "",
          locationId: customer.locationId || "",
          customerId: customer.customerId || "",
          eq: customer.eq || "",
          type: customer.type || "",
          eqTracking: customer.eqTracking || "",
          model: customer.model || "",
          category: customer.category || "",
          consoleSerial: customer.consoleSerial || "",
          baseSerial: customer.baseSerial || "",
          manufacturer: customer.manufacturer || "",
          history: customer.history || "",
          status: customer.status || "",
          notes: customer.notes || "",
          status2: customer.status2 || "",
        },
      });
    }

    // Upload data from Excel B
    for (const customer of excelB) {
      await prisma.excelB.create({
        data: {
          internalId: customer.internalId.toString(),
          name: customer.name,
        },
      });
    }

    return NextResponse.json({ message: "Data uploaded successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload data" },
      { status: 500 }
    );
  }
}
