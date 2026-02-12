import { NextRequest, NextResponse } from 'next/server';
import { getKeywordMetricsDataForSEO } from '@/lib/dataforseo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, location } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'Palavra-chave é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar métricas via DataForSEO
    const result = await getKeywordMetricsDataForSEO(keyword, location || 'br');

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Erro no endpoint keyword-metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
