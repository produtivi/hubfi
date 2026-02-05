// Utilitário para comunicação com Cloudflare API

import { CloudflareCustomHostname } from '@/types/custom-domain'

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

interface CloudflareConfig {
  apiToken: string
  zoneId: string
  accountId: string
}

function getConfig(): CloudflareConfig {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

  if (!apiToken || !zoneId || !accountId) {
    throw new Error('Cloudflare credentials not configured')
  }

  return { apiToken, zoneId, accountId }
}

async function cloudflareRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { apiToken } = getConfig()

  const response = await fetch(`${CLOUDFLARE_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!data.success) {
    const errorMessage = data.errors?.[0]?.message || 'Cloudflare API request failed'
    const errorCode = data.errors?.[0]?.code

    console.error('[Cloudflare] API Error:', {
      endpoint,
      errorMessage,
      errorCode,
      errors: data.errors
    })

    // Se for erro de autenticação, dar uma mensagem mais clara
    if (errorCode === 10000 || errorMessage.includes('Authentication')) {
      throw new Error('Authentication error')
    }

    throw new Error(errorMessage)
  }

  return data.result
}

// Adicionar custom hostname ao Cloudflare
export async function addCustomHostname(
  hostname: string
): Promise<CloudflareCustomHostname> {
  const { zoneId } = getConfig()

  return cloudflareRequest<CloudflareCustomHostname>(
    `/zones/${zoneId}/custom_hostnames`,
    {
      method: 'POST',
      body: JSON.stringify({
        hostname,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: {
            min_tls_version: '1.2',
          },
        },
      }),
    }
  )
}

// Buscar status de um custom hostname
export async function getCustomHostname(
  hostnameId: string
): Promise<CloudflareCustomHostname> {
  const { zoneId } = getConfig()

  return cloudflareRequest<CloudflareCustomHostname>(
    `/zones/${zoneId}/custom_hostnames/${hostnameId}`
  )
}

// Listar todos os custom hostnames
export async function listCustomHostnames(): Promise<
  CloudflareCustomHostname[]
> {
  const { zoneId } = getConfig()

  return cloudflareRequest<CloudflareCustomHostname[]>(
    `/zones/${zoneId}/custom_hostnames`
  )
}

// Remover custom hostname
export async function deleteCustomHostname(
  hostnameId: string
): Promise<void> {
  const { zoneId } = getConfig()

  await cloudflareRequest<void>(
    `/zones/${zoneId}/custom_hostnames/${hostnameId}`,
    {
      method: 'DELETE',
    }
  )
}

// Validar DNS do domínio
export async function validateDNS(
  hostname: string,
  expectedTarget: string
): Promise<{ configured: boolean; currentTarget?: string }> {
  try {
    // Usar DNS over HTTPS do Cloudflare
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${hostname}&type=CNAME`,
      {
        headers: {
          Accept: 'application/dns-json',
        },
      }
    )

    const data = await response.json()

    if (data.Answer && data.Answer.length > 0) {
      const cnameRecord = data.Answer.find((a: any) => a.type === 5) // CNAME type
      if (cnameRecord) {
        const currentTarget = cnameRecord.data.replace(/\.$/, '') // Remove trailing dot
        return {
          configured: currentTarget === expectedTarget,
          currentTarget,
        }
      }
    }

    return { configured: false }
  } catch (error) {
    console.error('DNS validation error:', error)
    return { configured: false }
  }
}

// Atualizar KV do Worker com configuração do domínio
export async function updateWorkerKV(
  hostname: string,
  config: {
    active: boolean
    bucket: string
    userId: number
    presells: string[]
  }
): Promise<void> {
  const { accountId } = getConfig()
  const kvNamespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID

  if (!kvNamespaceId) {
    throw new Error('KV Namespace ID not configured')
  }

  await cloudflareRequest(
    `/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}/values/${hostname}`,
    {
      method: 'PUT',
      body: JSON.stringify(config),
    }
  )
}

// Criar Worker Route para um domínio customizado
export async function createWorkerRoute(
  hostname: string,
  workerName: string = 'hubfi-domains-router'
): Promise<{ id: string; pattern: string }> {
  const { zoneId } = getConfig()

  const pattern = `${hostname}/*`

  return cloudflareRequest<{ id: string; pattern: string }>(
    `/zones/${zoneId}/workers/routes`,
    {
      method: 'POST',
      body: JSON.stringify({
        pattern,
        script: workerName,
      }),
    }
  )
}

// Listar Worker Routes
export async function listWorkerRoutes(): Promise<Array<{ id: string; pattern: string; script: string }>> {
  const { zoneId } = getConfig()

  return cloudflareRequest<Array<{ id: string; pattern: string; script: string }>>(
    `/zones/${zoneId}/workers/routes`
  )
}

// Deletar Worker Route
export async function deleteWorkerRoute(routeId: string): Promise<void> {
  const { zoneId } = getConfig()

  await cloudflareRequest<void>(
    `/zones/${zoneId}/workers/routes/${routeId}`,
    {
      method: 'DELETE',
    }
  )
}
