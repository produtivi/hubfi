import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './app/lib/auth';

// Rotas que precisam de autenticação
const protectedRoutes = [
  '/pixel-tracker',
  '/product-finder', 
  '/ads-analytics',
  '/ranking-hub',
  '/page-builder',
  '/campaign-wizard',
  '/settings'
];

// Rotas públicas (não precisam de autenticação)
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/google/authorize',
  '/api/auth/google/callback'
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso a rotas públicas e rotas de callback OAuth
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Permitir acesso temporário ao /settings se vier de OAuth callback
  if (pathname === '/settings' && request.nextUrl.searchParams.get('success') === 'account_connected') {
    return NextResponse.next();
  }
  
  // Permitir acesso temporário ao /settings se houver erro de OAuth
  if (pathname === '/settings' && request.nextUrl.searchParams.has('error')) {
    return NextResponse.next();
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Redirecionar para login se não houver token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verificar se o token é válido
    const decoded = verifyToken(token);
    if (!decoded) {
      // Token inválido, redirecionar para login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};