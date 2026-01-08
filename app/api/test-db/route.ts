import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Teste simples de conexão
    const result = await db.query('SELECT NOW() as current_time');
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com banco bem sucedida',
      data: result[0]
    });

  } catch (error) {
    console.error('Erro de conexão com banco:', error);
    
    let errorMessage = 'Erro de conexão com banco';
    if (error instanceof Error) {
      errorMessage = `Erro: ${error.message}`;
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}