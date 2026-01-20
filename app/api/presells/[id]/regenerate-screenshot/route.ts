import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { takeScreenshot } from '@/lib/screenshot';
import { validateURL } from '@/lib/url-validator';

// POST - Regenerar screenshot para uma presell específica
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Buscar a presell
    const presell = await prisma.presell.findUnique({
      where: { id: parseInt(id) }
    });

    if (!presell) {
      return NextResponse.json(
        { error: 'Presell não encontrada' },
        { status: 404 }
      );
    }


    // SEGURANÇA: Validar URL antes de capturar screenshot
    const urlValidation = validateURL(presell.producerSalesPage);
    if (!urlValidation.isValid) {
      console.error(`[Security] Tentativa de screenshot de URL inválida: ${presell.producerSalesPage}`);
      console.error(`[Security] Motivo: ${urlValidation.error}`);
      return NextResponse.json(
        { error: `URL inválida ou não autorizada: ${urlValidation.error}` },
        { status: 400 }
      );
    }

    try {
      // Capturar novos screenshots (URL já validada)
      const screenshots = await takeScreenshot(urlValidation.sanitized!, presell.id);


      // Atualizar presell com novos screenshots
      const updatedPresell = await prisma.presell.update({
        where: { id: parseInt(id) },
        data: {
          screenshotDesktop: screenshots.desktop,
          screenshotMobile: screenshots.mobile
        }
      });



      return NextResponse.json({
        success: true,
        message: 'Screenshots regenerados com sucesso',
        data: {
          screenshotDesktop: screenshots.desktop,
          screenshotMobile: screenshots.mobile
        }
      });

    } catch (screenshotError) {
      console.error('Erro ao capturar screenshots:', screenshotError);
      return NextResponse.json(
        { error: 'Erro ao capturar screenshots' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro ao regenerar screenshot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}