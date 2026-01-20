import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutos
const REFRESH_TOKEN_EXPIRY = 5 * 24 * 60 * 60; // 5 dias

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validações básicas
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Gerar access token (curta duração)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'access'
      },
      JWT_SECRET,
      { expiresIn: `${ACCESS_TOKEN_EXPIRY}s` }
    );

    // Gerar refresh token (longa duração)
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: `${REFRESH_TOKEN_EXPIRY}s` }
    );

    // Preparar dados do usuário (sem a senha)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    // Criar resposta com tokens
    const response = NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: userData,
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY
    });

    // Definir cookies httpOnly para segurança
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

    // Armazena timestamp da última atividade
    response.cookies.set('lastActivity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}