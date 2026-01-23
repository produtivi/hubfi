import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { savePresellHTML } from '@/lib/generate-presell-html';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const presellId = parseInt(id);

    // Buscar presell com screenshots
    const presell = await prisma.presell.findUnique({
      where: { id: presellId }
    });

    if (!presell) {
      return NextResponse.json(
        { error: 'Presell não encontrada' },
        { status: 404 }
      );
    }

    console.log(`[HTML Regenerate] Regenerando HTML para presell ${presellId}`);

    // Gerar novo HTML com screenshots atualizados
    const htmlUrl = await savePresellHTML({
      id: presell.id,
      pageName: presell.pageName,
      faviconUrl: presell.faviconUrl,
      screenshotDesktop: presell.screenshotDesktop,
      screenshotMobile: presell.screenshotMobile,
      affiliateLink: presell.affiliateLink,
      presellType: presell.presellType,
      language: presell.language
    });

    if (!htmlUrl) {
      return NextResponse.json(
        { error: 'Erro ao gerar HTML' },
        { status: 500 }
      );
    }

    // Atualizar URL do HTML no banco
    await prisma.presell.update({
      where: { id: presellId },
      data: { htmlUrl }
    });

    console.log(`[HTML Regenerate] HTML atualizado para presell ${presellId}: ${htmlUrl}`);

    return NextResponse.json({
      success: true,
      htmlUrl
    });

  } catch (error) {
    console.error('[HTML Regenerate] Erro ao regenerar HTML:', error);
    return NextResponse.json(
      { error: 'Erro ao regenerar HTML' },
      { status: 500 }
    );
  }
}
