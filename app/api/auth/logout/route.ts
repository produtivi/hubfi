import { NextResponse } from 'next/server';

function performLogout() {
  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));

  // Remove todos os cookies de autenticação
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
  response.cookies.delete('lastActivity');
  response.cookies.delete('auth-token'); // Cookie antigo

  return response;
}

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

    // Remove todos os cookies de autenticação
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('lastActivity');
    response.cookies.delete('auth-token'); // Cookie antigo

    return response;

  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Adiciona suporte para GET para permitir logout via URL
export async function GET() {
  try {
    return performLogout();
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
  }
}