import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os nichos ativos
export async function GET() {
  try {
    const niches = await prisma.niche.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: niches
    });
  } catch (error) {
    console.error('Erro ao buscar nichos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar nichos' },
      { status: 500 }
    );
  }
}
