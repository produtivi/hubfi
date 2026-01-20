import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-oauth';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    // Verificar se usuário está autenticado
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Gerar URL de autorização
    const authUrl = getAuthUrl(user.id);

    return NextResponse.json({ authUrl });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao gerar URL de autorização' },
      { status: 500 }
    );
  }
}