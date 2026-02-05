import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleAdsApi } from 'google-ads-api';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      googleAccountId,
      mccId,
      customerId,
      campaignName,
      dailyBudget,
      country,
      language,
      finalUrl,
      titles,
      descriptions,
    } = body;

    // Validações
    if (!googleAccountId || !mccId || !customerId) {
      return NextResponse.json(
        { success: false, error: 'Conta Google, MCC e conta Google Ads são obrigatórios' },
        { status: 400 }
      );
    }

    if (!campaignName || !dailyBudget || !finalUrl) {
      return NextResponse.json(
        { success: false, error: 'Nome da campanha, orçamento e URL são obrigatórios' },
        { status: 400 }
      );
    }

    if (!titles || titles.length < 3 || titles.length > 5) {
      return NextResponse.json(
        { success: false, error: 'São necessários de 3 a 5 títulos' },
        { status: 400 }
      );
    }

    if (!descriptions || descriptions.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'São necessárias exatamente 2 descrições' },
        { status: 400 }
      );
    }

    // Buscar conta Google do usuário
    const googleAccount = await prisma.googleAccount.findFirst({
      where: {
        id: parseInt(googleAccountId),
        userId: user.id,
      },
    });

    if (!googleAccount) {
      return NextResponse.json(
        { success: false, error: 'Conta Google não encontrada' },
        { status: 404 }
      );
    }

    // Configurar cliente do Google Ads
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    const customer = client.Customer({
      customer_id: customerId,
      login_customer_id: mccId, // MCC que gerencia a subconta
      refresh_token: googleAccount.refreshToken,
    });

    // Converter orçamento para micros (1 real = 1.000.000 micros)
    const budgetMicros = Math.round(dailyBudget * 1000000);

    // 1. Criar orçamento da campanha
    const budgetResult = await customer.campaignBudgets.create([
      {
        name: `Budget - ${campaignName} - ${Date.now()}`,
        amount_micros: budgetMicros,
        delivery_method: 'STANDARD',
      },
    ]);

    const budgetResourceName = budgetResult.results[0]?.resource_name;

    if (!budgetResourceName) {
      throw new Error('Falha ao criar orçamento');
    }

    // 2. Criar campanha
    const campaignResult = await customer.campaigns.create([
      {
        name: campaignName,
        campaign_budget: budgetResourceName,
        advertising_channel_type: 'SEARCH',
        status: 'PAUSED', // Começa pausada para revisão
        // Estratégia de lance: Maximizar cliques
        maximize_clicks: {
          cpc_bid_ceiling_micros: 0, // Sem limite
        },
        // Configurações de rede
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: false,
        },
        // Segmentação geográfica
        geo_target_type_setting: {
          positive_geo_target_type: 'PRESENCE_OR_INTEREST',
          negative_geo_target_type: 'PRESENCE_OR_INTEREST',
        },
      } as any,
    ]);

    const campaignResourceName = campaignResult.results[0]?.resource_name;

    if (!campaignResourceName) {
      throw new Error('Falha ao criar campanha');
    }

    // 3. Criar grupo de anúncios
    const adGroupResult = await customer.adGroups.create([
      {
        name: `Ad Group - ${campaignName}`,
        campaign: campaignResourceName,
        status: 'ENABLED',
        type: 'SEARCH_STANDARD',
        cpc_bid_micros: 1000000, // R$ 1,00 como lance inicial
      },
    ]);

    const adGroupResourceName = adGroupResult.results[0]?.resource_name;

    if (!adGroupResourceName) {
      throw new Error('Falha ao criar grupo de anúncios');
    }

    // 4. Criar anúncio responsivo de pesquisa
    const headlines = titles.slice(0, 5).map((text: string) => ({
      text: text.substring(0, 30),
    }));

    const descriptionsFormatted = descriptions.slice(0, 2).map((text: string) => ({
      text: text.substring(0, 90),
    }));

    await (customer.ads as any).create([
      {
        ad_group: adGroupResourceName,
        status: 'ENABLED',
        responsive_search_ad: {
          headlines,
          descriptions: descriptionsFormatted,
          path1: '',
          path2: '',
        },
        final_urls: [finalUrl],
      },
    ]);

    // 5. Adicionar segmentação de localização
    const countryGeoTargetConstant: Record<string, string> = {
      BR: 'geoTargetConstants/2076', // Brasil
      US: 'geoTargetConstants/2840', // Estados Unidos
      PT: 'geoTargetConstants/2620', // Portugal
      ES: 'geoTargetConstants/2724', // Espanha
      MX: 'geoTargetConstants/2484', // México
      AR: 'geoTargetConstants/2032', // Argentina
      CO: 'geoTargetConstants/2170', // Colômbia
      CL: 'geoTargetConstants/2152', // Chile
    };

    const geoTargetConstant = countryGeoTargetConstant[country] || countryGeoTargetConstant['BR'];

    await customer.campaignCriteria.create([
      {
        campaign: campaignResourceName,
        location: {
          geo_target_constant: geoTargetConstant,
        },
      },
    ] as any);

    // Extrair ID da campanha do resource name
    const campaignId = campaignResourceName.split('/').pop();

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        campaignName,
        status: 'PAUSED',
        message: 'Campanha criada com sucesso! A campanha foi criada como PAUSADA para você revisar antes de ativar.',
      },
    });

  } catch (error) {
    console.error('Erro ao criar campanha:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro ao criar campanha';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
