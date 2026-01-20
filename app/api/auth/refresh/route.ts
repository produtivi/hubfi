import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutos
const REFRESH_TOKEN_EXPIRY = 5 * 24 * 60 * 60; // 5 dias
const MAX_INACTIVITY = 5 * 24 * 60 * 60 * 1000; // 5 dias em ms

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    const lastActivity = cookieStore.get('lastActivity')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token não encontrado' },
        { status: 401 }
      );
    }

    // Verifica inatividade de 5 dias
    if (lastActivity) {
      const lastActivityTime = parseInt(lastActivity);
      const now = Date.now();
      const inactiveTime = now - lastActivityTime;

      if (inactiveTime > MAX_INACTIVITY) {
        // Limpa cookies
        const response = NextResponse.json(
          { error: 'Sessão expirada por inatividade' },
          { status: 401 }
        );

        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        response.cookies.delete('lastActivity');

        return response;
      }
    }

    // Valida o refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: number; email: string; type: string };

      if (decoded.type !== 'refresh') {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // Busca o usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Gera novo access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: `${ACCESS_TOKEN_EXPIRY}s` }
    );

    const response = NextResponse.json({
      accessToken: newAccessToken,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    // Atualiza cookies
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_EXPIRY,
      path: '/',
    });

    // Atualiza lastActivity
    response.cookies.set('lastActivity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no refresh token:', error);
    return NextResponse.json(
      { error: 'Erro ao renovar token' },
      { status: 500 }
    );
  }
}
