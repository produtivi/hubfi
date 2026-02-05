// Endpoint temporário para testar configuração do Cloudflare

import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN,
    hasZoneId: !!process.env.CLOUDFLARE_ZONE_ID,
    hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
    hasKvNamespace: !!process.env.CLOUDFLARE_KV_NAMESPACE_ID,

    // Mostrar primeiros 10 caracteres do token para confirmar
    tokenPreview: process.env.CLOUDFLARE_API_TOKEN?.substring(0, 10) + '...',
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    kvNamespace: process.env.CLOUDFLARE_KV_NAMESPACE_ID,
  }

  return NextResponse.json(envVars)
}
