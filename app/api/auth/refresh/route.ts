import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    // TODO: Aqui você deve validar o refreshToken com seu backend/database
    // Por enquanto, vamos simular a validação

    // Simula validação do refresh token
    const isValidRefreshToken = true; // Substituir por validação real

    if (!isValidRefreshToken) {
      return NextResponse.json(
        { error: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // Gera novo access token
    // TODO: Implementar geração real de JWT
    const newAccessToken = `access_${Date.now()}_${Math.random().toString(36)}`;

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
