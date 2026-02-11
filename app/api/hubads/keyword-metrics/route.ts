import { NextRequest, NextResponse } from 'next/server';
import { getKeywordMetrics } from '@/lib/google-ads';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { keyword, location } = body;

    if (!keyword) {
      return NextResponse.json(
        { success: false, error: 'Palavra-chave é obrigatória' },
        { status: 400 }
      );
    }

    // Buscar métricas do Keyword Planner
    const result = await getKeywordMetrics(
      decoded.userId,
      keyword,
      location || 'br'
    );

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
