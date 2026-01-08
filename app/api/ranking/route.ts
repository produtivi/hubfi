import { NextRequest, NextResponse } from 'next/server';

// Placeholder para futuro sistema de inteligência de produtos
// Será implementado com web scraping + APIs de SEO + métricas calculadas

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: false,
      source: 'system-rebuild',
      message: 'Sistema de ranking em desenvolvimento - implementando inteligência de mercado',
      data: [],
      total: 0,
      info: 'Nova abordagem: web scraping + APIs de SEO + métricas proprietárias'
    });

  } catch (error) {
    console.error('Erro no sistema de ranking:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Sistema em reconstrução'
    }, { status: 500 });
  }
}