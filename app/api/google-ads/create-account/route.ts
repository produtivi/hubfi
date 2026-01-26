import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleAdsApi } from 'google-ads-api';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { googleAccountId, mccId, accountName, currencyCode = 'BRL', timeZone = 'America/Sao_Paulo' } = body;

    // Validações
    if (!googleAccountId) {
      return NextResponse.json(
        { error: 'Gmail é obrigatório' },
        { status: 400 }
      );
    }

    if (!mccId) {
      return NextResponse.json(
        { error: 'MCC é obrigatório' },
        { status: 400 }
      );
    }

    if (!accountName) {
      return NextResponse.json(
        { error: 'Nome da conta é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar conta Google do usuário
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

    // Configurar cliente do Google Ads
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!
    });

    // Criar Customer para a MCC
    const mccCustomer = client.Customer({
      customer_id: mccId,
      login_customer_id: mccId,
      refresh_token: googleAccount.refreshToken
    });

    // Criar nova conta de cliente sob a MCC
    const createResponse = await mccCustomer.customers.createCustomerClient({
      customer_id: mccId,
      customer_client: {
        descriptive_name: accountName,
        currency_code: currencyCode,
        time_zone: timeZone
      }
    });

    // Extrair o ID da nova conta
    const newCustomerId = createResponse.resource_name?.split('/').pop();

    const result = {
      success: true,
      customerId: newCustomerId,
      accountName,
      message: `Conta "${accountName}" criada com sucesso!`
    };

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