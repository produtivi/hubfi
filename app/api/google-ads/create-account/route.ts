import { NextRequest, NextResponse } from 'next/server';
import { createSubAccount } from '@/lib/google-ads';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountName, currencyCode, timeZone } = body;

    // Validações
    if (!accountName) {
      return NextResponse.json(
        { error: 'Nome da conta é obrigatório' },
        { status: 400 }
      );
    }

    // TODO: Pegar userId real do token/sessão
    const userId = 2; // Temporário

    const result = await createSubAccount({
      userId,
      accountName,
      currencyCode,
      timeZone
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erro ao criar subconta:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro ao criar subconta';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}