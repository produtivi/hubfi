// API para validar configuração de DNS

import { NextRequest, NextResponse } from 'next/server'
import { validateDNS } from '@/lib/cloudflare'
import { ValidateDNSResponse } from '@/types/custom-domain'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostname } = body

    if (!hostname) {
      return NextResponse.json(
        { error: 'hostname is required' },
        { status: 400 }
      )
    }

    const expectedTarget = process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'customers.hubfi.com'
    const result = await validateDNS(hostname, expectedTarget)

    const response: ValidateDNSResponse = {
      success: true,
      configured: result.configured,
      currentTarget: result.currentTarget,
      expectedTarget,
      message: result.configured
        ? 'DNS configured correctly'
        : result.currentTarget
        ? `DNS points to ${result.currentTarget} but should point to ${expectedTarget}`
        : 'DNS not configured yet',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error validating DNS:', error)
    return NextResponse.json(
      { error: 'Failed to validate DNS' },
      { status: 500 }
    )
  }
}
