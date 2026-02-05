// API para gerenciar domínios customizados

import { NextRequest, NextResponse } from 'next/server'
import {
  addCustomHostname,
  getCustomHostname,
  listCustomHostnames,
  updateWorkerKV,
  createWorkerRoute,
} from '@/lib/cloudflare'
import { prisma } from '@/lib/prisma'
import { AddDomainRequest, CustomDomain } from '@/types/custom-domain'

// GET: Listar domínios do usuário
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Buscar domínios do banco filtrados por userId
    const dbDomains = await prisma.customDomain.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    })

    // Buscar status atualizado do Cloudflare para cada domínio
    const domains: CustomDomain[] = await Promise.all(
      dbDomains.map(async (dbDomain) => {
        try {
          const cfHostname = await getCustomHostname(dbDomain.cloudflareHostnameId)
          return {
            id: dbDomain.cloudflareHostnameId,
            hostname: dbDomain.hostname,
            userId: dbDomain.userId,
            status: mapCloudflareStatus(cfHostname.status),
            sslStatus: mapSSLStatus(cfHostname.ssl.status),
            cnameTarget: process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'customers.hubfi.com',
            createdAt: dbDomain.createdAt.toISOString(),
            updatedAt: dbDomain.updatedAt.toISOString(),
            errorMessage: cfHostname.verification_errors?.[0] || cfHostname.ssl.validation_errors?.[0]?.message,
          }
        } catch {
          // Se falhar ao buscar do Cloudflare, retorna dados do banco
          return {
            id: dbDomain.cloudflareHostnameId,
            hostname: dbDomain.hostname,
            userId: dbDomain.userId,
            status: dbDomain.status as CustomDomain['status'],
            sslStatus: dbDomain.sslStatus as CustomDomain['sslStatus'],
            cnameTarget: process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'customers.hubfi.com',
            createdAt: dbDomain.createdAt.toISOString(),
            updatedAt: dbDomain.updatedAt.toISOString(),
          }
        }
      })
    )

    return NextResponse.json({ domains })
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

// POST: Adicionar novo domínio customizado
export async function POST(request: NextRequest) {
  try {
    const body: AddDomainRequest = await request.json()
    const { hostname, userId } = body

    if (!hostname || !userId) {
      return NextResponse.json(
        { error: 'hostname and userId are required' },
        { status: 400 }
      )
    }

    // Validar formato do hostname
    if (!isValidHostname(hostname)) {
      return NextResponse.json(
        { error: 'Invalid hostname format' },
        { status: 400 }
      )
    }

    // Verificar se já existe no banco local
    const existingInDb = await prisma.customDomain.findUnique({
      where: { hostname }
    })

    if (existingInDb) {
      return NextResponse.json(
        { error: 'Domínio já cadastrado' },
        { status: 409 }
      )
    }

    // Verificar se já existe no Cloudflare
    let cloudflareHostname
    const existingHostnames = await listCustomHostnames()
    const existingCf = existingHostnames.find(h => h.hostname === hostname)

    if (existingCf) {
      // Já existe no Cloudflare, usar o existente
      console.log(`[Domain] ${hostname} já existe no Cloudflare, vinculando ao usuário`)
      cloudflareHostname = existingCf
    } else {
      // Criar no Cloudflare
      cloudflareHostname = await addCustomHostname(hostname)
    }

    // Criar Worker Route para o domínio
    console.log(`[Domain] Criando Worker Route para ${hostname}`)
    try {
      const route = await createWorkerRoute(hostname)
      console.log(`[Domain] Worker Route criado: ${route.pattern}`)
    } catch (routeError) {
      console.error(`[Domain] Erro ao criar Worker Route:`, routeError)
      // Continua mesmo se falhar - o route pode ser criado manualmente depois
    }

    // Adicionar ao KV do Worker (ativo imediatamente)
    console.log(`[Domain] Adicionando ${hostname} ao KV`)
    await updateWorkerKV(hostname, {
      active: true, // Ativo imediatamente - o Worker vai responder assim que o SSL estiver pronto
      bucket: process.env.DO_SPACES_BUCKET || '',
      userId,
      presells: [],
    })
    console.log(`[Domain] ${hostname} configurado no KV como ativo`)

    // Salvar no banco de dados
    await prisma.customDomain.create({
      data: {
        userId,
        cloudflareHostnameId: cloudflareHostname.id,
        hostname: cloudflareHostname.hostname,
        status: 'pending',
        sslStatus: 'pending',
      }
    })
    console.log(`[Domain] ${hostname} salvo no banco de dados`)

    const domain: CustomDomain = {
      id: cloudflareHostname.id,
      hostname: cloudflareHostname.hostname,
      userId,
      status: 'pending',
      sslStatus: 'pending',
      cnameTarget: process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'customers.hubfi.com',
      createdAt: cloudflareHostname.created_at,
      updatedAt: cloudflareHostname.created_at,
    }

    return NextResponse.json({ success: true, domain })
  } catch (error) {
    console.error('Error adding domain:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add domain' },
      { status: 500 }
    )
  }
}

// Helpers
function isValidHostname(hostname: string): boolean {
  const hostnameRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i
  return hostnameRegex.test(hostname)
}

function mapCloudflareStatus(status: string): CustomDomain['status'] {
  switch (status) {
    case 'active':
      return 'active'
    case 'pending':
    case 'pending_validation':
      return 'pending'
    case 'moved':
    case 'deleted':
      return 'error'
    default:
      return 'pending'
  }
}

function mapSSLStatus(status: string): CustomDomain['sslStatus'] {
  switch (status) {
    case 'active':
      return 'active'
    case 'pending_validation':
    case 'pending_issuance':
    case 'pending_deployment':
      return 'pending'
    default:
      return 'error'
  }
}
