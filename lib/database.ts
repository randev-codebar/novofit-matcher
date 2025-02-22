import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function uploadDataToDatabase(customersA: any[], customersB: any[]) {
  // Upload data from Excel A
  for (const customer of customersA) {
    await prisma.excelA.create({
      data: {
        customerName: customer.name,
        locationId: '', // Populate if available
        customerId: customer.id,
        eq: '', // Populate if available
        type: '', // Populate if available
        eqTracking: '', // Populate if available
        model: '', // Populate if available
        category: '', // Populate if available
        consoleSerial: '', // Populate if available
        baseSerial: '', // Populate if available
        manufacturer: '', // Populate if available
        history: '', // Populate if available
        status: '', // Populate if available
        notes: '', // Populate if available
        status2: '', // Populate if available
      },
    });
  }

  // Upload data from Excel B
  for (const customer of customersB) {
    await prisma.excelB.create({
      data: {
        internalId: customer.id,
        name: customer.name,
      },
    });
  }
} 