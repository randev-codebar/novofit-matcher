import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    // Clear data from both tables
    await prisma.excelA.deleteMany({});
    await prisma.excelB.deleteMany({});

    return NextResponse.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
} 