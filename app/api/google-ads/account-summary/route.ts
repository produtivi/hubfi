import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAdsAccountsSummary } from '@/lib/google-ads';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const googleAccountId = searchParams.get('googleAccountId');

    if (!googleAccountId) {
      return NextResponse.json(
        { error: 'googleAccountId é obrigatório' },
        { status: 400 }
      );
    }

    const summary = await getGoogleAdsAccountsSummary(parseInt(googleAccountId));

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Erro ao obter resumo das contas:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro ao obter resumo';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}