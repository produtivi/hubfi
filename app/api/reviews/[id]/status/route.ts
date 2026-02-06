import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        status: true,
        contentHtml: true,
        headline: true
      }
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        status: review.status,
        isProcessing: review.status === 'draft' && !review.contentHtml,
        hasContent: !!review.contentHtml
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status do review:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
