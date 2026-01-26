// API para gerenciar domínio específico

import { NextRequest, NextResponse } from 'next/server'
import {
  getCustomHostname,
  deleteCustomHostname,
  updateWorkerKV,
} from '@/lib/cloudflare'
import { CustomDomain } from '@/types/custom-domain'

// GET: Buscar status de um domínio específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const cloudflareHostname = await getCustomHostname(id)

    const domain: CustomDomain = {
      id: cloudflareHostname.id,
      hostname: cloudflareHostname.hostname,
      userId: 1, // TODO: Buscar do banco de dados
      status: mapStatus(cloudflareHostname.status),
      sslStatus: mapSSLStatus(cloudflareHostname.ssl.status),
      cnameTarget: process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'customers.hubfi.com',
      createdAt: cloudflareHostname.created_at,
      updatedAt: cloudflareHostname.updated_at || cloudflareHostname.created_at,
      errorMessage:
        cloudflareHostname.verification_errors?.[0] ||
        cloudflareHostname.ssl.validation_errors?.[0]?.message,
    }

    return NextResponse.json({ domain })
  } catch (error) {
    console.error('Error fetching domain:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domain' },
      { status: 500 }
    )
  }
}

// DELETE: Remover domínio customizado
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Buscar hostname antes de deletar
    const cloudflareHostname = await getCustomHostname(id)

    // Remover do Cloudflare
    await deleteCustomHostname(id)

    // TODO: Remover do KV (Cloudflare API não suporta DELETE via REST)
    // Por enquanto, apenas desativa
    await updateWorkerKV(cloudflareHostname.hostname, {
      active: false,
      bucket: '',
      userId: 0,
      presells: [],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    )
  }
}

// PATCH: Atualizar status do domínio (ativar/desativar)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { active, userId } = body

    // Buscar hostname
    const cloudflareHostname = await getCustomHostname(id)

    // Atualizar KV
    await updateWorkerKV(cloudflareHostname.hostname, {
      active: active ?? false,
      bucket: process.env.DO_SPACES_BUCKET || '',
      userId: userId || 1,
      presells: [],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating domain:', error)
    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    )
  }
}

// Helpers
function mapStatus(status: string): CustomDomain['status'] {
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
