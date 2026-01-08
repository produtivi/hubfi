import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { takeScreenshot } from '@/lib/screenshot';

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

    console.log(`📸 Regenerando screenshot para presell ${id}...`);
    console.log(`🔗 URL a ser capturada: ${presell.producerSalesPage}`);

    try {
      console.log(`⏳ Iniciando captura de screenshot...`);
      // Capturar novos screenshots
      const screenshots = await takeScreenshot(presell.producerSalesPage, presell.id);
      
      console.log(`📷 Screenshots capturados:`, {
        desktop: screenshots.desktop,
        mobile: screenshots.mobile
      });
      
      // Atualizar presell com novos screenshots
      const updatedPresell = await prisma.presell.update({
        where: { id: parseInt(id) },
        data: {
          screenshotDesktop: screenshots.desktop,
          screenshotMobile: screenshots.mobile
        }
      });
      
      console.log(`✅ Screenshots salvos no banco para presell ${id}`);
      console.log(`💾 Screenshots salvos:`, {
        desktop: updatedPresell.screenshotDesktop,
        mobile: updatedPresell.screenshotMobile
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