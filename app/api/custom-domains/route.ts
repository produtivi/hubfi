// API para gerenciar domínios customizados

import { NextRequest, NextResponse } from 'next/server'
import {
  addCustomHostname,
  listCustomHostnames,
  updateWorkerKV,
} from '@/lib/cloudflare'
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

    // Buscar domínios do Cloudflare
    const cloudflareHostnames = await listCustomHostnames()

    // TODO: Filtrar por userId quando tiver banco de dados
    // Por enquanto, retorna todos
    const domains: CustomDomain[] = cloudflareHostnames.map((cf) => ({
      id: cf.id,
      hostname: cf.hostname,
      userId: parseInt(userId),
      status: mapCloudflareStatus(cf.status),
      sslStatus: mapSSLStatus(cf.ssl.status),
      cnameTarget: process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'customers.hubfi.com',
      createdAt: cf.created_at,
      updatedAt: cf.updated_at || cf.created_at,
      errorMessage: cf.verification_errors?.[0] || cf.ssl.validation_errors?.[0]?.message,
    }))

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

    // Adicionar ao Cloudflare
    const cloudflareHostname = await addCustomHostname(hostname)

    // Adicionar ao KV do Worker (inicialmente inativo)
    await updateWorkerKV(hostname, {
      active: false, // Ativa quando DNS estiver configurado
      bucket: process.env.DO_SPACES_BUCKET || '',
      userId,
      presells: [],
    })

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
