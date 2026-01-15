import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
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

    // Calcular bounce rate baseado nos eventos das últimas 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Buscar todas as sessões (agrupadas por IP + User-Agent)
    const sessions = await prisma.pixelEvent.groupBy({
      by: ['ipAddress', 'userAgent'],
      where: {
        pixelId: pixel.id,
        eventType: 'visit',
        isBot: false, // Apenas visitas reais
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      _count: {
        id: true
      }
    })

    if (sessions.length === 0) {
      return NextResponse.json({
        success: true,
        bounceRate: 0,
        totalSessions: 0,
        bouncedSessions: 0
      })
    }

    // Calcular sessões com apenas 1 evento (bounced)
    let bouncedSessions = 0
    
    for (const session of sessions) {
      // Verificar se esta sessão teve apenas 1 evento nas últimas 24h
      const sessionEvents = await prisma.pixelEvent.count({
        where: {
          pixelId: pixel.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          isBot: false,
          createdAt: {
            gte: twentyFourHoursAgo
          }
        }
      })
      
      if (sessionEvents === 1) {
        bouncedSessions++
      }
    }

    const totalSessions = sessions.length
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0

    // Atualizar bounce rate no pixel
    await prisma.pixel.update({
      where: { id: pixel.id },
      data: {
        bounceRate: Math.round(bounceRate * 100) / 100 // 2 casas decimais
      }
    })

    return NextResponse.json({
      success: true,
      bounceRate: Math.round(bounceRate * 100) / 100,
      totalSessions,
      bouncedSessions
    })

  } catch (error) {
    console.error('Erro ao calcular bounce rate:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}