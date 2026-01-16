import { NextRequest, NextResponse } from 'next/server';
import { listAccessibleAccounts } from '@/lib/google-ads';

export async function GET(request: NextRequest) {
  try {
    // TODO: Pegar userId real do token/sessão
    const userId = 2; // Temporário

    const accounts = await listAccessibleAccounts(userId);

    return NextResponse.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('Erro ao listar contas:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro ao listar contas';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}