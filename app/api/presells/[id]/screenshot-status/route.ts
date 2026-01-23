import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const presell = await prisma.presell.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        screenshotDesktop: true,
        screenshotMobile: true
      }
    });

    if (!presell) {
      return NextResponse.json(
        { error: 'Presell não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se ainda está processando (screenshots são null quando sendo gerados)
    const isProcessing = presell.screenshotDesktop === null || presell.screenshotMobile === null;
    const hasScreenshots = presell.screenshotDesktop !== null && presell.screenshotMobile !== null;

    return NextResponse.json({
      success: true,
      data: {
        id: presell.id,
        isProcessing,
        hasScreenshots,
        screenshotDesktop: presell.screenshotDesktop,
        screenshotMobile: presell.screenshotMobile
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status do screenshot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}