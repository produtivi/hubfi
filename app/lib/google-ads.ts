import { GoogleAdsApi, services } from 'google-ads-api';
import { prisma } from './prisma';

interface CreateSubAccountParams {
  userId: number;
  accountName: string;
  currencyCode?: string;
  timeZone?: string;
}

export async function createSubAccount({
  userId,
  accountName,
  currencyCode = 'BRL',
  timeZone = 'America/Sao_Paulo'
}: CreateSubAccountParams) {
  try {
    // Buscar conta Google conectada do usuário
    const googleAccount = await prisma.googleAccount.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!googleAccount) {
      throw new Error('Conta Google não conectada. Conecte sua conta primeiro.');
    }

    // Configurar cliente do Google Ads
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!
    });

    // Buscar o MCC (Manager Account) do usuário
    const resourceNames = await client.listAccessibleCustomers(googleAccount.refreshToken);

    if (!resourceNames.resource_names || resourceNames.resource_names.length === 0) {
      throw new Error('Nenhuma conta MCC encontrada. Certifique-se de ter uma conta gerenciadora.');
    }

    // Usar o primeiro MCC encontrado
    const mccResourceName = resourceNames.resource_names[0];
    const mccCustomerId = mccResourceName.split('/').pop()!;

    // Criar Customer para o MCC
    const mccCustomer = client.Customer({
      customer_id: mccCustomerId,
      refresh_token: googleAccount.refreshToken
    });

    // Criar nova conta de cliente sob o MCC
    const createResponse = await mccCustomer.customers.createCustomerClient({
      customer_id: mccCustomerId,
      customer_client: {
        descriptive_name: accountName,
        currency_code: currencyCode,
        time_zone: timeZone
      }
    } as services.CreateCustomerClientRequest);

    // Extrair o ID da nova conta
    const newCustomerId = createResponse.resource_name?.split('/').pop();

    return {
      success: true,
      customerId: newCustomerId,
      accountName,
      message: `Conta "${accountName}" criada com sucesso sob o MCC!`
    };

  } catch (error) {
    console.error('Erro ao criar subconta:', error);

    if (error instanceof Error) {
      // Tratar erros específicos do Google Ads
      if (error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Sem permissão para criar contas. Verifique se sua conta é um MCC.');
      }
      if (error.message.includes('INVALID_CUSTOMER_ID')) {
        throw new Error('ID do MCC inválido. Verifique suas credenciais.');
      }
      throw error;
    }

    throw new Error('Erro desconhecido ao criar subconta');
  }
}

// Obter resumo de contas do Google Ads (MCCs, contas e conversões)
export async function getGoogleAdsAccountsSummary(googleAccountId: number) {
  try {
    const googleAccount = await prisma.googleAccount.findUnique({
      where: { id: googleAccountId }
    });

    if (!googleAccount) {
      throw new Error('Conta Google não encontrada');
    }

    // Se não tiver developer token, retornar erro
    if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN === 'your-developer-token-here') {
      throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN não configurado no .env');
    }

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!
    });

    // Listar todas as contas acessíveis (geralmente MCCs)
    const resourceNames = await client.listAccessibleCustomers(googleAccount.refreshToken);

    let mccCount = 0;
    let accountsCount = 0;
    let conversionsCount = 0;

    for (const resourceName of resourceNames.resource_names || []) {
      const customerId = resourceName.split('/').pop()!;

      try {
        // Criar Customer para fazer queries
        const customer = client.Customer({
          customer_id: customerId,
          refresh_token: googleAccount.refreshToken
        });

        // Buscar detalhes da conta
        const customerQuery = `
          SELECT
            customer.id,
            customer.manager,
            customer.test_account
          FROM customer
        `;

        const customerResults = await customer.query(customerQuery);
        const customerResult = customerResults[0];

        if (customerResult && customerResult.customer && !customerResult.customer.test_account) {
          if (customerResult.customer.manager) {
            // É uma MCC - contar e buscar subcontas
            mccCount++;

            // Buscar subcontas da MCC
            try {
              const subAccountsQuery = `
                SELECT
                  customer_client.id,
                  customer_client.manager,
                  customer_client.test_account,
                  customer_client.hidden
                FROM customer_client
                WHERE customer_client.hidden = false
              `;

              const subAccountsResults = await customer.query(subAccountsQuery);

              for (const subResult of subAccountsResults) {
                if (subResult.customer_client &&
                    !subResult.customer_client.test_account &&
                    !subResult.customer_client.manager) {
                  accountsCount++;

                  // Buscar conversões da subconta
                  try {
                    const subCustomerId = String(subResult.customer_client.id);
                    const subCustomer = client.Customer({
                      customer_id: subCustomerId,
                      refresh_token: googleAccount.refreshToken,
                      login_customer_id: customerId // Usar MCC como login
                    });

                    const conversionQuery = `
                      SELECT
                        conversion_action.id
                      FROM conversion_action
                      WHERE conversion_action.status = 'ENABLED'
                    `;

                    const conversionResults = await subCustomer.query(conversionQuery);
                    conversionsCount += conversionResults.length;
                  } catch (convErr) {
                    // Ignorar erro de conversão em subcontas
                  }
                }
              }
            } catch (subErr) {
              console.error(`Erro ao buscar subcontas da MCC ${customerId}:`, subErr);
            }

            // Buscar conversões da própria MCC
            try {
              const conversionQuery = `
                SELECT
                  conversion_action.id
                FROM conversion_action
                WHERE conversion_action.status = 'ENABLED'
              `;

              const conversionResults = await customer.query(conversionQuery);
              conversionsCount += conversionResults.length;
            } catch (err) {
              // Ignorar erro
            }
          } else {
            // Conta normal (não MCC)
            accountsCount++;

            // Buscar conversões
            try {
              const conversionQuery = `
                SELECT
                  conversion_action.id
                FROM conversion_action
                WHERE conversion_action.status = 'ENABLED'
              `;

              const conversionResults = await customer.query(conversionQuery);
              conversionsCount += conversionResults.length;
            } catch (err) {
              // Ignorar erro
            }
          }
        }
      } catch (err) {
        console.error(`Erro ao buscar detalhes da conta ${customerId}:`, err);
      }
    }

    return {
      mccCount,
      accountsCount,
      conversionsCount
    };

  } catch (error) {
    console.error('Erro ao obter resumo das contas:', error);

    // Retornar contadores zerados em caso de erro
    return {
      mccCount: 0,
      accountsCount: 0,
      conversionsCount: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Listar todas as contas acessíveis (MCC e subcontas)
export async function listAccessibleAccounts(userId: number) {
  try {
    const googleAccount = await prisma.googleAccount.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!googleAccount) {
      throw new Error('Conta Google não conectada');
    }

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!
    });

    // Listar todas as contas acessíveis
    const resourceNames = await client.listAccessibleCustomers(googleAccount.refreshToken);

    const accounts = [];

    for (const resourceName of resourceNames.resource_names || []) {
      const customerId = resourceName.split('/').pop()!;

      try {
        // Criar Customer para fazer queries
        const customer = client.Customer({
          customer_id: customerId,
          refresh_token: googleAccount.refreshToken
        });

        // Buscar detalhes da conta
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
          accounts.push({
            customerId: result.customer.id,
            accountName: result.customer.descriptive_name,
            currencyCode: result.customer.currency_code,
            timeZone: result.customer.time_zone,
            isTestAccount: result.customer.test_account,
            isManager: result.customer.manager
          });
        }
      } catch (err) {
        console.error(`Erro ao buscar detalhes da conta ${customerId}:`, err);
      }
    }

    return accounts;
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    throw error;
  }
}