import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Lista de User-Agents conhecidos como bots
const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i, /facebook/i, /google/i, /yahoo/i, /bing/i,
  /baidu/i, /yandex/i, /curl/i, /wget/i, /python/i, /php/i, /ruby/i, /java/i,
  /headless/i, /phantom/i, /selenium/i, /puppeteer/i, /playwright/i
]

// Lista de referrers que indicam tráfego pago
const PAID_TRAFFIC_PATTERNS = [
  /google\.com.*gclid/i, /facebook\.com/i, /fb\.com/i, /instagram\.com/i,
  /youtube\.com/i, /tiktok\.com/i, /linkedin\.com/i, /pinterest\.com/i,
  /twitter\.com/i, /x\.com/i, /ads/i, /adwords/i, /campaign/i, /utm_source/i
]

function detectBot(userAgent: string): boolean {
  if (!userAgent) return true // Sem User-Agent é suspeito
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent))
}

function detectPaidTraffic(referrer: string): boolean {
  if (!referrer) return false
  return PAID_TRAFFIC_PATTERNS.some(pattern => pattern.test(referrer))
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pixelId: string }> }
) {
  try {
    const { pixelId } = await params
    const body = await request.json()
    const { eventType, url, referrer, userAgent, data } = body

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

    // Verificar se o pixel está ativo
    if (pixel.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Pixel está inativo - eventos não serão registrados' },
        { status: 400 }
      )
    }

    // Obter IP do cliente
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Verificar se IP está bloqueado
    const blockedIp = await prisma.blockedIp.findUnique({
      where: {
        pixelId_ipAddress: {
          pixelId: pixel.id,
          ipAddress: ipAddress
        }
      }
    })

    if (blockedIp) {
      // Incrementar tentativas de acesso
      await prisma.blockedIp.update({
        where: { id: blockedIp.id },
        data: { 
          attempts: { increment: 1 },
          updatedAt: new Date()
        }
      })
      
      return NextResponse.json(
        { success: false, error: 'IP bloqueado' },
        { status: 403 }
      )
    }

    // Análise do evento
    const isBot = detectBot(userAgent || '')
    const isPaid = detectPaidTraffic(referrer || '')
    
    // Verificar se é visita única (baseado em IP + User-Agent nas últimas 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existingEvent = await prisma.pixelEvent.findFirst({
      where: {
        pixelId: pixel.id,
        ipAddress,
        userAgent,
        eventType: 'visit',
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    })
    
    const isUnique = eventType === 'visit' && !existingEvent

    // Auto-bloqueio de bots suspeitos
    if (isBot && eventType === 'visit') {
      await prisma.blockedIp.create({
        data: {
          pixelId: pixel.id,
          ipAddress,
          reason: 'bot',
          userAgent,
          attempts: 1
        }
      }).catch(() => {
        // IP já pode estar bloqueado, ignorar erro de duplicata
      })
    }

    // Validação básica: verificar se a URL corresponde à presell configurada
    if (url && !url.includes(new URL(pixel.presellUrl).hostname)) {
      console.warn(`Pixel ${pixelId}: Evento de URL não autorizada: ${url}`)
    }

    // Registrar evento no banco com flags de análise
    await prisma.pixelEvent.create({
      data: {
        pixelId: pixel.id,
        eventType,
        ipAddress,
        userAgent,
        referer: referrer,
        url,
        timestamp: new Date(),
        isBot,
        isPaid,
        isUnique,
        data: data || {}
      }
    })

    // Atualizar contadores do pixel (somente se não for bot)
    const updateData: any = {}
    
    switch (eventType) {
      case 'visit':
        if (!isBot) {
          updateData.visits = { increment: 1 }
          updateData.cleanVisits = { increment: 1 }
          
          if (isUnique) {
            updateData.uniqueVisits = { increment: 1 }
          }
          
          if (isPaid) {
            updateData.paidTrafficVisits = { increment: 1 }
          }
        } else {
          // Apenas incrementar total de visitas mesmo para bots
          updateData.visits = { increment: 1 }
          updateData.blockedIps = { increment: 1 }
        }
        break
        
      case 'click':
        if (!isBot) {
          updateData.clicks = { increment: 1 }
        }
        break
        
      case 'checkout':
        if (!isBot) {
          updateData.checkouts = { increment: 1 }
        }
        break
        
      case 'sale':
      case 'conversion':
        if (!isBot) {
          updateData.sales = { increment: 1 }
          // Manter compatibilidade com campo antigo
          updateData.conversions = { increment: 1 }
        }
        break
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.pixel.update({
        where: { id: pixel.id },
        data: updateData
      })
    }

    return NextResponse.json({
      success: true,
      message: `Evento ${eventType} registrado com sucesso`,
      meta: {
        isBot,
        isPaid,
        isUnique: isUnique || false,
        ipBlocked: false
      }
    })

  } catch (error) {
    console.error('Erro ao registrar evento do pixel:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Permitir CORS para requisições cross-origin
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}