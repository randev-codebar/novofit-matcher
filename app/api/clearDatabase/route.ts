import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    // Delete all records from all tables
    await prisma.$transaction([
      prisma.excelA.deleteMany(),
      prisma.excelB.deleteMany(),
      prisma.reviewedData.deleteMany()
    ]);

    return NextResponse.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Failed to clear database:', error);
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
} 