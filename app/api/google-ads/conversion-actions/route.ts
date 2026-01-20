import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleAdsApi } from 'google-ads-api';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const googleAccountId = searchParams.get('googleAccountId');
    const customerId = searchParams.get('customerId');
    const mccId = searchParams.get('mccId'); // Opcional - para subcontas

    if (!googleAccountId || !customerId) {
      return NextResponse.json(
        { error: 'googleAccountId e customerId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a conta Google pertence ao usuário
    const googleAccount = await prisma.googleAccount.findFirst({
      where: {
        id: parseInt(googleAccountId),
        userId: user.id
      }
    });

    if (!googleAccount) {
      return NextResponse.json(
        { error: 'Conta Google não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se o developer token está configurado
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN === 'your-developer-token-here') {
      return NextResponse.json({
        success: true,
        data: [],
        error: 'GOOGLE_ADS_DEVELOPER_TOKEN não configurado'
      });
    }

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!
    });

    const customerOptions: {
      customer_id: string;
      refresh_token: string;
      login_customer_id?: string;
    } = {
      customer_id: customerId,
      refresh_token: googleAccount.refreshToken
    };

    // Se for subconta de uma MCC, usar login_customer_id
    if (mccId) {
      customerOptions.login_customer_id = mccId;
    }

    const customer = client.Customer(customerOptions);

    // Buscar ações de conversão
    const query = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.status,
        conversion_action.type,
        conversion_action.category
      FROM conversion_action
      WHERE conversion_action.status = 'ENABLED'
    `;

    const results = await customer.query(query);

    const conversionActions = results.map((row: any) => ({
      id: String(row.conversion_action?.id || ''),
      name: row.conversion_action?.name || 'Sem nome',
      status: row.conversion_action?.status || 'UNKNOWN',
      type: row.conversion_action?.type || 'UNKNOWN',
      category: row.conversion_action?.category || 'DEFAULT'
    }));

    return NextResponse.json({
      success: true,
      data: conversionActions
    });

  } catch (error) {
    console.error('Erro ao buscar ações de conversão:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro ao buscar ações de conversão';

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
