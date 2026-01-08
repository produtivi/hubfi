import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { takeScreenshot } from '@/lib/screenshot';

// POST - Processar screenshot para presell
export async function POST(request: NextRequest) {
  try {
    const { presellId, producerSalesPage, pageName } = await request.json();

    console.log(`📸 Processando screenshot para presell ${presellId}...`);
    console.log(`🔗 URL: ${producerSalesPage}`);
    
    // Capturar screenshots
    const screenshots = await takeScreenshot(producerSalesPage, presellId);
    
    console.log(`📷 Screenshots capturados:`, {
      desktop: screenshots.desktop,
      mobile: screenshots.mobile
    });
    
    // Atualizar presell com screenshots
    const updatedPresell = await prisma.presell.update({
      where: { id: parseInt(presellId) },
      data: {
        screenshotDesktop: screenshots.desktop,
        screenshotMobile: screenshots.mobile
      }
    });
    
    console.log(`✅ Screenshots salvos no banco:`, {
      desktop: updatedPresell.screenshotDesktop,
      mobile: updatedPresell.screenshotMobile
    });

    return NextResponse.json({
      success: true,
      message: 'Screenshots processados com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao processar screenshots:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao processar screenshots',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}