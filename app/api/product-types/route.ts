import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todos os tipos de produto ativos
export async function GET() {
  try {
    const productTypes = await prisma.productType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: productTypes
    });
  } catch (error) {
    console.error('Erro ao buscar tipos de produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar tipos de produto' },
      { status: 500 }
    );
  }
}
