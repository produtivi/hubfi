import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, platform, presellUrl } = body

    // Validações básicas
    if (!name || !platform || !presellUrl) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: name, platform, presellUrl' },
        { status: 400 }
      )
    }

    // Gerar ID único para o pixel
    const pixelId = `px_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // TODO: Obter userId da sessão autenticada
    // Por enquanto, vamos usar um userId fixo para teste
    const userId = 1

    // Criar pixel no banco
    const pixel = await prisma.pixel.create({
      data: {
        userId,
        name,
        platform,
        presellUrl,
        pixelId,
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: pixel.id,
        pixelId: pixel.pixelId,
        name: pixel.name,
        platform: pixel.platform,
        presellUrl: pixel.presellUrl,
        status: pixel.status,
        createdAt: pixel.createdAt
      }
    })

  } catch (error) {
    console.error('Erro ao criar pixel:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Obter userId da sessão autenticada
    const userId = 1

    const pixels = await prisma.pixel.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            events: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: pixels.map(pixel => ({
        id: pixel.id,
        pixelId: pixel.pixelId,
        name: pixel.name,
        platform: pixel.platform,
        presellUrl: pixel.presellUrl,
        status: pixel.status,
        visits: pixel.visits,
        uniqueVisits: pixel.uniqueVisits,
        cleanVisits: pixel.cleanVisits,
        paidTrafficVisits: pixel.paidTrafficVisits,
        clicks: pixel.clicks,
        checkouts: pixel.checkouts,
        sales: pixel.sales,
        conversions: pixel.conversions,
        bounceRate: pixel.bounceRate ? parseFloat(pixel.bounceRate.toString()) : 0,
        blockedIps: pixel.blockedIps,
        totalEvents: pixel._count.events,
        createdAt: pixel.createdAt,
        updatedAt: pixel.updatedAt
      }))
    })

  } catch (error) {
    console.error('Erro ao buscar pixels:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}