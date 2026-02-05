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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log(`[Delete] Recebido ID: ${id}`)

    try {
      // Buscar hostname antes de deletar
      const cloudflareHostname = await getCustomHostname(id)
      console.log(`[Delete] Hostname encontrado: ${cloudflareHostname.hostname}`)

      // Remover do Cloudflare
      await deleteCustomHostname(id)
      console.log(`[Delete] Custom Hostname removido do Cloudflare`)

      // Desativar no KV
      await updateWorkerKV(cloudflareHostname.hostname, {
        active: false,
        bucket: '',
        userId: 0,
        presells: [],
      })
      console.log(`[Delete] Domínio desativado no KV`)

      return NextResponse.json({ success: true })
    } catch (cfError) {
      // Se o domínio não existe mais no Cloudflare, considerar como sucesso
      console.warn(`[Delete] Domínio ${id} não encontrado no Cloudflare (possivelmente já deletado):`, cfError)
      return NextResponse.json({
        success: true,
        message: 'Domínio não encontrado (possivelmente já removido)'
      })
    }
  } catch (error) {
    console.error('Error deleting domain:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete domain' },
      { status: 500 }
    )
  }
}

// PATCH: Atualizar status do domínio (ativar/desativar)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
