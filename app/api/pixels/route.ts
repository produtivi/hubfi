import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      platform,
      googleAccountId,
      googleAdsCustomerId,
      conversionActionId,
      useMcc,
      presellId,
      presellUrl
    } = body

    // Validações básicas
    if (!platform || !googleAccountId || !googleAdsCustomerId || !conversionActionId) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: platform, googleAccountId, googleAdsCustomerId, conversionActionId' },
        { status: 400 }
      )
    }

    // Verificar se a conta Google pertence ao usuário
    const googleAccount = await prisma.googleAccount.findFirst({
      where: {
        id: parseInt(googleAccountId),
        userId: user.id
      }
    })

    if (!googleAccount) {
      return NextResponse.json(
        { success: false, error: 'Conta Google não encontrada' },
        { status: 404 }
      )
    }

    // Gerar ID único para o pixel
    const pixelId = `px_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Gerar nome automático se não fornecido
    const pixelName = name || `Pixel ${platform} - ${new Date().toLocaleDateString('pt-BR')}`

    // Criar pixel no banco
    const pixel = await prisma.pixel.create({
      data: {
        userId: user.id,
        name: pixelName,
        platform,
        pixelId,
        status: 'active',
        googleAccountId: parseInt(googleAccountId),
        googleAdsCustomerId,
        conversionActionId,
        useMcc: useMcc || false,
        presellId: presellId ? parseInt(presellId) : null,
        presellUrl: presellUrl || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: pixel.id,
        pixelId: pixel.pixelId,
        name: pixel.name,
        platform: pixel.platform,
        googleAdsCustomerId: pixel.googleAdsCustomerId,
        conversionActionId: pixel.conversionActionId,
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
    const { searchParams } = new URL(request.url)
    const presellId = searchParams.get('presellId')

    // Se está buscando por presellId (para injeção de script), não precisa de auth
    if (presellId) {
      const pixels = await prisma.pixel.findMany({
        where: {
          presellId: parseInt(presellId),
          status: 'active'
        },
        select: {
          pixelId: true,
          status: true
        }
      })

      return NextResponse.json({
        success: true,
        data: pixels
      })
    }

    // Para listagem completa, precisa de auth
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const pixels = await prisma.pixel.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        googleAccount: {
          select: {
            email: true
          }
        },
        presell: {
          select: {
            pageName: true,
            slug: true
          }
        },
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
        presell: pixel.presell,
        googleAccountEmail: pixel.googleAccount.email,
        googleAdsCustomerId: pixel.googleAdsCustomerId,
        conversionActionId: pixel.conversionActionId,
        useMcc: pixel.useMcc,
        status: pixel.status,
        clicks: pixel.clicks,
        sales: pixel.sales,
        bounceRate: pixel.bounceRate ? parseFloat(pixel.bounceRate.toString()) : 0,
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
