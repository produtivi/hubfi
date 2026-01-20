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

    if (!googleAccountId) {
      return NextResponse.json(
        { error: 'googleAccountId é obrigatório' },
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

    // Listar todas as contas acessíveis (geralmente MCCs)
    const resourceNames = await client.listAccessibleCustomers(googleAccount.refreshToken);

    const accounts: Array<{
      customerId: string;
      accountName: string;
      currencyCode: string;
      timeZone: string;
      isTestAccount: boolean;
      isManager: boolean;
      mccId?: string;
    }> = [];

    for (const resourceName of resourceNames.resource_names || []) {
      const customerId = resourceName.split('/').pop()!;

      try {
        const customer = client.Customer({
          customer_id: customerId,
          refresh_token: googleAccount.refreshToken
        });

        const query = `
          SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code,
            customer.time_zone,
            customer.test_account,
            customer.manager
          FROM customer
        `;

        const results = await customer.query(query);
        const result = results[0];

        if (result && result.customer) {
          const isManager = result.customer.manager || false;
          const isTestAccount = result.customer.test_account || false;

          // Adicionar a conta principal (MCC ou conta normal)
          accounts.push({
            customerId: String(result.customer.id),
            accountName: result.customer.descriptive_name || `Conta ${result.customer.id}`,
            currencyCode: result.customer.currency_code || 'BRL',
            timeZone: result.customer.time_zone || 'America/Sao_Paulo',
            isTestAccount,
            isManager
          });

          // Se for MCC, buscar as subcontas
          if (isManager && !isTestAccount) {
            try {
              const subAccountsQuery = `
                SELECT
                  customer_client.id,
                  customer_client.descriptive_name,
                  customer_client.currency_code,
                  customer_client.time_zone,
                  customer_client.test_account,
                  customer_client.manager,
                  customer_client.hidden,
                  customer_client.level,
                  customer_client.status
                FROM customer_client
                WHERE customer_client.status = 'ENABLED'
              `;

              const subAccountsResults = await customer.query(subAccountsQuery);

              for (const subResult of subAccountsResults) {
                if (subResult.customer_client) {
                  const subCustomerId = String(subResult.customer_client.id);

                  // Não adicionar a própria MCC novamente
                  if (subCustomerId === customerId) continue;

                  // Não adicionar contas de teste
                  if (subResult.customer_client.test_account) continue;

                  // Não adicionar contas ocultas
                  if (subResult.customer_client.hidden) continue;

                  accounts.push({
                    customerId: subCustomerId,
                    accountName: subResult.customer_client.descriptive_name || `Conta ${subCustomerId}`,
                    currencyCode: subResult.customer_client.currency_code || 'BRL',
                    timeZone: subResult.customer_client.time_zone || 'America/Sao_Paulo',
                    isTestAccount: subResult.customer_client.test_account || false,
                    isManager: subResult.customer_client.manager || false,
                    mccId: customerId // Guardar qual MCC é o pai
                  });
                }
              }
            } catch (subErr) {
              console.error(`Erro ao buscar subcontas da MCC ${customerId}:`, subErr);
            }
          }
        }
      } catch (err: any) {
        // Ignorar contas desativadas ou sem acesso (é esperado)
        const errorMessage = err?.errors?.[0]?.message || '';
        if (!errorMessage.includes('not yet enabled') && !errorMessage.includes('deactivated')) {
          console.error(`Erro ao buscar detalhes da conta ${customerId}:`, err);
        }
      }
    }

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
