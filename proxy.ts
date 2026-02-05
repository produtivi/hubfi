import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/preview', '/home', '/service-terms', '/policy-and-privacy'];

// Rotas de API públicas
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/auth/verify-reset-code', '/api/auth/google/login', '/api/auth/google/login-callback'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    pathname.endsWith('.svg') ||
    pathname.endsWith('.js')
  ) {
    return NextResponse.next();
  }

  // Verifica se é rota pública - deve vir ANTES da verificação de tokens
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Permitir acesso público a rotas de pixel tracking
  if (pathname === '/api/pixels' && request.nextUrl.searchParams.get('presellId')) {
    return NextResponse.next();
  }
  if (pathname.match(/^\/api\/pixels\/[^/]+\/track$/)) {
    return NextResponse.next();
  }

  // Verifica token no cookie
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Para rotas de API, retorna 401 em vez de redirect
  if (pathname.startsWith('/api/')) {
    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verifica se tem pelo menos um token válido
    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // Para rotas de páginas, redireciona para login se não tiver NENHUM token
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se tem refresh token mas não tem access, permite passar
  // O client-side vai fazer refresh automático
  return NextResponse.next();
}

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
};