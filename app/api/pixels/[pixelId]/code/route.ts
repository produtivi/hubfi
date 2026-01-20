import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pixelId: string }> }
) {
  try {
    const { pixelId } = await params

    // Buscar pixel no banco
    const pixel = await prisma.pixel.findUnique({
      where: { pixelId }
    })

    if (!pixel) {
      return NextResponse.json(
        { success: false, error: 'Pixel não encontrado' },
        { status: 404 }
      )
    }

    // Obter URL base do ambiente
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Gerar código de tracking profissional
    const trackingCode = `<!-- Início HubPixel Tracking (hubpixel.min.js) -->
<!-- Adicione antes da tag </head> -->
<script data-pixel-id="${pixelId}" src="${baseUrl}/hubpixel.min.js?pixelId=${pixelId}"></script>
<!-- Fim HubPixel Tracking (hubpixel.min.js) -->

<!-- Opcional: Para rastrear conversões manualmente -->
<!-- <script>
  if (window.hubPixel) {
    window.hubPixel.conversion({ 
      value: 97.00,
      product: 'Nome do Produto'
    });
  }
</script> -->`

    return NextResponse.json({
      success: true,
      data: {
        pixelId: pixel.pixelId,
        name: pixel.name,
        platform: pixel.platform,
        trackingCode,
        instructions: {
          installation: 'Cole este código antes da tag </head> da sua página',
          requirements: [
            'O pixel rastreará automaticamente visitas, cliques e conversões',
            'Para conversões personalizadas, use window.hubPixel.conversion()',
            'O código é otimizado e não afeta a performance do site'
          ]
        }
      }
    })

  } catch (error) {
    console.error('Erro ao gerar código do pixel:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}