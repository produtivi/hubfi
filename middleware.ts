import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// IPs suspeitos de mineração (adicione mais conforme identificar)
const BLOCKED_IPS = new Set<string>([
  // Adicione IPs suspeitos aqui
])

// Padrões de User-Agent maliciosos
const MALICIOUS_USER_AGENTS = [
  /xmrig/i,
  /monero/i,
  /miner/i,
  /cryptonight/i,
  /stratum/i,
]

// Padrões de injeção de comando
const COMMAND_INJECTION_PATTERNS = [
  /\$\(/,
  /`/,
  /&&/,
  /\|\|/,
  /;/,
  /\n/,
  /\r/,
  /exec/i,
  /eval/i,
  /system/i,
  /passthru/i,
  /shell_exec/i,
]

// Rate limiting simples (em memória)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100 // requests
const RATE_LIMIT_WINDOW = 60000 // 1 minuto

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  record.count++

  if (record.count > RATE_LIMIT) {
    return true
  }

  return false
}

function containsCommandInjection(value: string): boolean {
  return COMMAND_INJECTION_PATTERNS.some(pattern => pattern.test(value))
}

function checkRequestForInjection(request: NextRequest): boolean {
  // Verificar URL
  const url = request.url
  if (containsCommandInjection(url)) {
    return true
  }

  // Verificar todos os headers
  request.headers.forEach((value) => {
    if (containsCommandInjection(value)) {
      return true
    }
  })

  return false
}

export function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''
  const pathname = request.nextUrl.pathname

  // Log de segurança para auditoria
  console.log(`[Security] ${new Date().toISOString()} - IP: ${ip} - Path: ${pathname} - UA: ${userAgent}`)

  // 1. Bloquear IPs conhecidos como maliciosos
  if (BLOCKED_IPS.has(ip)) {
    console.warn(`[Security] Blocked IP attempt: ${ip}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Bloquear User-Agents maliciosos
  if (MALICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
    console.warn(`[Security] Malicious User-Agent detected: ${userAgent}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 3. Rate limiting
  if (isRateLimited(ip)) {
    console.warn(`[Security] Rate limit exceeded for IP: ${ip}`)
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // 4. Detectar tentativas de injeção de comando
  if (checkRequestForInjection(request)) {
    console.error(`[Security] COMMAND INJECTION ATTEMPT DETECTED - IP: ${ip} - URL: ${request.url}`)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 5. Bloquear acesso a rotas sensíveis sem autenticação
  const sensitiveRoutes = ['/api/presells', '/api/pixels', '/api/hubtitle']
  if (sensitiveRoutes.some(route => pathname.startsWith(route))) {
    const authHeader = request.headers.get('authorization')
    const sessionCookie = request.cookies.get('session')

    if (!authHeader && !sessionCookie) {
      console.warn(`[Security] Unauthorized access attempt to: ${pathname} from IP: ${ip}`)
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  return NextResponse.next()
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
