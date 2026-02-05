import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getLoginTokensFromCode, getUserInfo } from '@/lib/google-oauth';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutos
const REFRESH_TOKEN_EXPIRY = 5 * 24 * 60 * 60; // 5 dias

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/login?error=cancelled', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
    }

    // Trocar código por tokens
    const tokens = await getLoginTokensFromCode(code);

    if (!tokens.access_token) {
      throw new Error('Não foi possível obter access token');
    }

    // Buscar informações do usuário no Google
    const googleUser = await getUserInfo(tokens.access_token);
    const { id: googleId, email, name } = googleUser;

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url));
    }

    // Encontrar ou criar usuário
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: String(googleId) },
          { email },
        ],
      },
    });

    if (user) {
      // Vincular googleId se ainda não tem
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: String(googleId) },
        });
      }
    } else {
      // Criar novo usuário (sem senha)
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          googleId: String(googleId),
        },
      });
    }

    // Gerar tokens JWT
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'access' },
      JWT_SECRET,
      { expiresIn: `${ACCESS_TOKEN_EXPIRY}s` }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: `${REFRESH_TOKEN_EXPIRY}s` }
    );

    // Redirecionar para home
    const response = NextResponse.redirect(new URL('/', request.url));

    // Setar cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRY,
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    });

    response.cookies.set('lastActivity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erro no login com Google:', error);
    return NextResponse.redirect(new URL('/login?error=google_failed', request.url));
  }
}
