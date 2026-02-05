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

    console.log(`[RegenerateScreenshot] Iniciando para presell ID: ${id}`);

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
      console.log(`[RegenerateScreenshot] Iniciando captura de screenshots para URL: ${urlValidation.sanitized}`);

      // Timeout agressivo: 30 segundos para capturar screenshots
      const screenshotPromise = takeScreenshot(urlValidation.sanitized!, presell.id);
      const timeoutPromise = new Promise<{ desktop: null, mobile: null }>((_, reject) => {
        setTimeout(() => reject(new Error('Screenshot timeout - 30 seconds exceeded')), 30000);
      });

      let screenshots: { desktop: string | null, mobile: string | null };

      try {
        screenshots = await Promise.race([screenshotPromise, timeoutPromise]);
        console.log(`[RegenerateScreenshot] Screenshots capturados:`, screenshots);
      } catch (timeoutError) {
        console.error('[RegenerateScreenshot] Screenshot timeout ou erro:', timeoutError);
        // Em caso de timeout, marcar como null para finalizar o processamento
        screenshots = { desktop: null, mobile: null };
      }

      // SEMPRE atualizar presell, mesmo que screenshots sejam null
      // Isso garante que o polling termine e não fique travado
      console.log(`[RegenerateScreenshot] Atualizando presell ${id} no banco...`);

      const updatedPresell = await prisma.presell.update({
        where: { id: parseInt(id) },
        data: {
          screenshotDesktop: screenshots.desktop,
          screenshotMobile: screenshots.mobile
        }
      });

      console.log(`[RegenerateScreenshot] Presell ${id} atualizado com sucesso`);

      return NextResponse.json({
        success: true,
        message: screenshots.desktop ? 'Screenshots regenerados com sucesso' : 'Screenshots não disponíveis',
        data: {
          screenshotDesktop: screenshots.desktop,
          screenshotMobile: screenshots.mobile
        }
      });

    } catch (screenshotError) {
      console.error('Erro ao capturar screenshots:', screenshotError);

      // IMPORTANTE: Mesmo em caso de erro, atualizar com null para terminar polling
      try {
        await prisma.presell.update({
          where: { id: parseInt(id) },
          data: {
            screenshotDesktop: null,
            screenshotMobile: null
          }
        });
      } catch (dbError) {
        console.error('Erro ao atualizar presell com null:', dbError);
      }

      return NextResponse.json({
        success: true,
        message: 'Screenshots não disponíveis',
        data: {
          screenshotDesktop: null,
          screenshotMobile: null
        }
      });
    }

  } catch (error) {
    console.error('Erro ao regenerar screenshot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}