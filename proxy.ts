import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

// Rotas de API públicas
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

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

// Padrões de injeção de comando e RCE
const COMMAND_INJECTION_PATTERNS = [
  /\$\(/,
  /`/,
  /&&/,
  /\|\|/,
  /;(?![&])/,
  /\n/,
  /\r/,
  /exec/i,
  /eval/i,
  /system/i,
  /passthru/i,
  /shell_exec/i,
  /printenv/i,
  /\/bin\//i,
  /\/usr\/bin/i,
  /wget/i,
  /curl.*\|/i,
  /bash.*-c/i,
  /sh.*-c/i,
  /\.\.\/\.\.\//,
]

// Padrões específicos do ataque XMRig
const MINING_PATTERNS = [
  /moneroocean/i,
  /xmrig/i,
  /xmr-stak/i,
  /cryptonight/i,
  /stratum\+tcp/i,
  /pool\.minexmr/i,
  /supportxmr\.com/i,
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

function containsMiningPattern(value: string): boolean {
  return MINING_PATTERNS.some(pattern => pattern.test(value))
}

function checkRequestForInjection(request: NextRequest): boolean {
  const url = request.url
  if (containsCommandInjection(url)) {
    return true
  }

  request.headers.forEach((value) => {
    if (containsCommandInjection(value)) {
      return true
    }
  })

  return false
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''

  // Log de segurança para auditoria
  console.log(`[Security] ${new Date().toISOString()} - IP: ${ip} - Path: ${pathname}`)

  // Permite acesso a arquivos estáticos e assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/logos') ||
    pathname.startsWith('/platforms') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next()
  }

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
    console.error(`[Security] COMMAND INJECTION ATTEMPT DETECTED - IP: ${ip}`)
    BLOCKED_IPS.add(ip)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 5. Detectar padrões de mineração
  const fullUrl = request.url
  if (containsMiningPattern(fullUrl) || containsMiningPattern(userAgent)) {
    console.error(`[Security] CRYPTOMINING ATTEMPT DETECTED - IP: ${ip}`)
    BLOCKED_IPS.add(ip)
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Verifica se é rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // Verifica token no cookie
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // Para rotas de API, retorna 401 em vez de redirect
  if (pathname.startsWith('/api/')) {
    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  // Para rotas de páginas, redireciona para login se não tiver NENHUM token
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se tem refresh token mas não tem access, permite passar
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
