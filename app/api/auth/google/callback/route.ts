import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode, getUserInfo } from '@/lib/google-oauth';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Se houve erro (usuário cancelou)
    if (error) {
      return NextResponse.redirect(new URL('/settings/accounts?error=cancelled', BASE_URL));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings/accounts?error=missing_params', BASE_URL));
    }

    // Decodificar o state para pegar o userId
    let userId: number;
    try {
      const stateData = JSON.parse(state);
      userId = stateData.userId;
    } catch (e) {
      return NextResponse.redirect(new URL('/settings/accounts?error=invalid_state', BASE_URL));
    }

    // Trocar código por tokens
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.access_token) {
      throw new Error('Não foi possível obter access token');
    }

    // Buscar informações do usuário
    const userInfo = await getUserInfo(tokens.access_token);

    // Salvar conta Google no banco
    await prisma.googleAccount.create({
      data: {
        userId,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      }
    });

    // Redirecionar de volta para settings com sucesso
    return NextResponse.redirect(new URL('/settings/accounts?success=account_connected', BASE_URL));

  } catch (error) {
    console.error('Erro no callback OAuth:', error);
    return NextResponse.redirect(new URL('/settings/accounts?error=oauth_failed', BASE_URL));
  }
}