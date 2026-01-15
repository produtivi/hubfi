import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pixelId: string }> }
) {
  try {
    const { pixelId } = await params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    // Validar se pixelId foi fornecido
    if (!pixelId) {
      return NextResponse.json(
        { success: false, error: 'pixelId é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se pixel existe
    const pixel = await prisma.pixel.findUnique({
      where: { pixelId }
    })

    if (!pixel) {
      return NextResponse.json(
        { success: false, error: 'Pixel não encontrado' },
        { status: 404 }
      )
    }

    // Calcular data de início baseada no período
    let startDate = new Date()
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'all':
        startDate = new Date(0) // Desde o início dos tempos
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    // Buscar eventos do período
    const events = await prisma.pixelEvent.findMany({
      where: {
        pixelId: pixel.id,
        timestamp: {
          gte: period === 'all' ? undefined : startDate
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100, // Limitar a 100 eventos mais recentes
      select: {
        id: true,
        eventType: true,
        timestamp: true,
        url: true,
        referer: true
      }
    })

    return NextResponse.json({
      success: true,
      data: events.map(event => ({
        id: event.id.toString(),
        eventType: event.eventType,
        timestamp: event.timestamp.toISOString(),
        url: event.url,
        referer: event.referer
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar eventos do pixel:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}