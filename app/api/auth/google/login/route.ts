import { NextResponse } from 'next/server';
import { getLoginAuthUrl } from '@/lib/google-oauth';

export async function GET() {
  try {
    const authUrl = getLoginAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Erro ao gerar URL de login Google:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL de autorização' },
      { status: 500 }
    );
  }
}
