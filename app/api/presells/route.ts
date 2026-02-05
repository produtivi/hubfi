import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { takeScreenshot } from '@/lib/screenshot';
import { validateURL } from '@/lib/url-validator';
import { getFaviconUrl, downloadAndSaveFavicon } from '@/lib/favicon';
import { savePresellHTML } from '@/lib/generate-presell-html';
import { uploadPresellToCustomDomain } from '@/lib/spaces-upload';
import { updateWorkerKV } from '@/lib/cloudflare';

// GET - Listar presells do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Para desenvolvimento, buscar todas as presells se não tiver userId
    const whereClause = userId ? { userId: parseInt(userId) } : {};

    const presells = await prisma.presell.findMany({
      where: whereClause,
      include: {
        domain: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Adicionar URL completa para cada presell
    const presellsWithUrl = presells.map((presell: typeof presells[number]) => ({
      ...presell,
      fullUrl: presell.domain ? `https://${presell.domain.domainName}/${presell.slug}` : presell.slug
    }));

    return NextResponse.json({
      success: true,
      data: presellsWithUrl
    });

  } catch (error) {
    console.error('Erro ao buscar presells:', error);

    let errorMessage = 'Erro interno do servidor';
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

// POST - Criar nova presell
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      pageName,
      customDomain,
      affiliateLink,
      producerSalesPage,
      presellType,
      presellLanguage
    } = body;

    // Validações básicas
    if (!userId || !pageName || !customDomain || !affiliateLink || !producerSalesPage || !presellType) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Gerar slug a partir do nome da página
    const slug = pageName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hifens
      .replace(/^-+|-+$/g, ''); // Remove hifens no início/fim

    // Gerar pagePath no formato: {dominio-sem-pontos}/{slug}/index.html para Spaces
    // e slug para a URL pública
    // Exemplo: testando.produtive.ai -> testandoprodutiveai
    const domainWithoutDots = customDomain.replace(/\./g, '');
    const pagePath = `${domainWithoutDots}/${slug}/index.html`;

    // SEGURANÇA: Validar URLs antes de processar
    const producerPageValidation = validateURL(producerSalesPage);
    if (!producerPageValidation.isValid) {
      return NextResponse.json(
        { error: `URL da página do produtor inválida: ${producerPageValidation.error}` },
        { status: 400 }
      );
    }

    const affiliateLinkValidation = validateURL(affiliateLink);
    if (!affiliateLinkValidation.isValid) {
      return NextResponse.json(
        { error: `Link de afiliado inválido: ${affiliateLinkValidation.error}` },
        { status: 400 }
      );
    }

    // Buscar domínio customizado - criar se não existir
    let domainRecord = await prisma.domain.findUnique({
      where: { domainName: customDomain }
    });

    if (!domainRecord) {
      // Criar domínio automaticamente se não existir
      domainRecord = await prisma.domain.create({
        data: {
          domainName: customDomain,
          isActive: true
        }
      });
    }

    // VALIDAÇÃO: Verificar se já existe uma presell com o mesmo pageName neste domínio
    const existingPresellByName = await prisma.presell.findFirst({
      where: {
        domainId: domainRecord.id,
        pageName: {
          equals: pageName,
          mode: 'insensitive' // Case-insensitive
        }
      }
    });

    if (existingPresellByName) {
      return NextResponse.json(
        { error: `Já existe uma página com o título "${pageName}" neste domínio. Por favor, escolha outro título.` },
        { status: 409 }
      );
    }

    // Mapear valores do frontend para o banco
    const presellTypeMap: Record<string, string> = {
      'VSL (Video Sales Letter)': 'VSL',
      'Carta de Vendas': 'Carta de Vendas',
      'Landing Page': 'Landing Page',
      'Página de Captura': 'Página de Captura'
    };

    const mappedPresellType = presellTypeMap[presellType] || presellType;

    // Criar presell primeiro para ter o ID (sem favicon ainda)
    const newPresell = await prisma.presell.create({
      data: {
        userId,
        domainId: domainRecord.id,
        pageName,
        slug,
        affiliateLink,
        producerSalesPage,
        presellType: mappedPresellType,
        language: presellLanguage || 'Português',
        status: 'draft',
        faviconUrl: null, // Será atualizado em background
        screenshotDesktop: null, // Placeholder até screenshots serem gerados
        screenshotMobile: null
      },
      include: {
        domain: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Disparar download do favicon e geração de screenshots em background
    const presellId = newPresell.id;
    const producerSalesPageUrl = newPresell.producerSalesPage;
    const finalCustomDomain = customDomain; // Capturar para usar no background
    const finalPagePath = pagePath; // Capturar para usar no background

    console.log(`[Favicon] Iniciando download assíncrono para presell ${presellId}`);
    console.log(`[Preview] Iniciando geração assíncrona para presell ${presellId}`);
    console.log(`[HTML] Iniciando geração assíncrona de HTML para presell ${presellId}`);

    // Baixar e salvar favicon em background
    (async () => {
      try {
        const savedFaviconUrl = await downloadAndSaveFavicon(producerSalesPageUrl, presellId);

        if (savedFaviconUrl) {
          await prisma.presell.update({
            where: { id: presellId },
            data: { faviconUrl: savedFaviconUrl }
          });
          console.log(`[Favicon] Favicon salvo para presell ${presellId}: ${savedFaviconUrl}`);
        } else {
          // Fallback: usar URL do Google diretamente
          const fallbackUrl = getFaviconUrl(producerSalesPageUrl, 64);
          await prisma.presell.update({
            where: { id: presellId },
            data: { faviconUrl: fallbackUrl }
          });
          console.log(`[Favicon] Usando fallback do Google para presell ${presellId}`);
        }
      } catch (error) {
        console.error(`[Favicon] Erro ao processar favicon para presell ${presellId}:`, error);
        // Em caso de erro, usar URL do Google como fallback
        try {
          const fallbackUrl = getFaviconUrl(producerSalesPageUrl, 64);
          await prisma.presell.update({
            where: { id: presellId },
            data: { faviconUrl: fallbackUrl }
          });
        } catch (dbError) {
          console.error(`[Favicon] Erro ao salvar fallback para presell ${presellId}:`, dbError);
        }
      }
    })();

    // Gerar HTML estático em background APÓS screenshots
    (async () => {
      try {
        // Aguardar screenshots serem processados (polling)
        let attempts = 0;
        const maxAttempts = 60; // 60 tentativas = 60 segundos
        let updatedPresell = null;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;

          updatedPresell = await prisma.presell.findUnique({
            where: { id: presellId }
          });

          // Se screenshots estão prontos (não são null), gerar HTML
          if (updatedPresell &&
              updatedPresell.screenshotDesktop !== null &&
              updatedPresell.screenshotMobile !== null) {
            console.log(`[HTML] Screenshots prontos após ${attempts}s, gerando HTML...`);
            break;
          }

          console.log(`[HTML] Tentativa ${attempts}/60 - Screenshots ainda não prontos`);
        }

        if (updatedPresell) {
          console.log(`[HTML] Dados da presell para gerar HTML:`, {
            id: updatedPresell.id,
            hasDesktop: !!updatedPresell.screenshotDesktop,
            hasMobile: !!updatedPresell.screenshotMobile,
            desktopUrl: updatedPresell.screenshotDesktop,
            mobileUrl: updatedPresell.screenshotMobile
          });

          const htmlUrl = await savePresellHTML({
            id: updatedPresell.id,
            pageName: updatedPresell.pageName,
            faviconUrl: updatedPresell.faviconUrl,
            screenshotDesktop: updatedPresell.screenshotDesktop,
            screenshotMobile: updatedPresell.screenshotMobile,
            affiliateLink: updatedPresell.affiliateLink,
            presellType: updatedPresell.presellType,
            language: updatedPresell.language
          });

          if (htmlUrl) {
            await prisma.presell.update({
              where: { id: presellId },
              data: { htmlUrl }
            });
            console.log(`[HTML] HTML gerado e salvo para presell ${presellId}: ${htmlUrl}`);

            // Sempre fazer upload no domínio customizado
            if (finalCustomDomain && finalPagePath) {
              console.log(`[CustomDomain] Fazendo upload para domínio customizado: ${finalCustomDomain}/${finalPagePath}`);

              try {
                // Ler o HTML gerado
                const htmlResponse = await fetch(htmlUrl);
                const htmlContent = await htmlResponse.text();

                // Upload no Spaces
                const uploadResult = await uploadPresellToCustomDomain(
                  finalCustomDomain,
                  finalPagePath,
                  htmlContent
                );

                if (uploadResult.success) {
                  console.log(`[CustomDomain] Upload bem-sucedido: ${uploadResult.url}`);

                  // Atualizar KV para adicionar esta página à lista de presells do domínio
                  try {
                    // Buscar configuração atual do KV
                    const kvResponse = await fetch(
                      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.CLOUDFLARE_KV_NAMESPACE_ID}/values/${finalCustomDomain}`,
                      {
                        headers: {
                          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                        },
                      }
                    );

                    if (kvResponse.ok) {
                      const kvConfig = await kvResponse.json();
                      const presellsList = kvConfig.presells || [];

                      // Adicionar nova página (finalPagePath já contém o caminho completo)
                      if (!presellsList.includes(finalPagePath)) {
                        presellsList.push(finalPagePath);

                        // Atualizar KV
                        await updateWorkerKV(finalCustomDomain, {
                          ...kvConfig,
                          presells: presellsList,
                        });

                        console.log(`[CustomDomain] KV atualizado com nova página: ${finalPagePath}`);
                      }
                    }
                  } catch (kvError) {
                    console.error(`[CustomDomain] Erro ao atualizar KV:`, kvError);
                  }
                } else {
                  console.error(`[CustomDomain] Erro no upload: ${uploadResult.error}`);
                }
              } catch (uploadError) {
                console.error(`[CustomDomain] Erro ao processar upload:`, uploadError);
              }
            }
          } else {
            console.error(`[HTML] Falha ao gerar HTML para presell ${presellId}`);
          }
        } else {
          console.error(`[HTML] Presell ${presellId} não encontrada após polling`);
        }
      } catch (error) {
        console.error(`[HTML] Erro ao gerar HTML para presell ${presellId}:`, error);
      }
    })();

    // Executar em background sem await (fire-and-forget)
    (async () => {
      try {
        console.log(`[Preview] Processando prévias para presell ${presellId}, URL: ${producerSalesPageUrl}`);

        // Validar URL
        const { validateURL } = await import('@/lib/url-validator');
        const urlValidation = validateURL(producerSalesPageUrl);

        if (!urlValidation.isValid) {
          console.error(`[Preview] URL inválida para presell ${presellId}:`, urlValidation.error);
          // Atualizar com null para terminar polling
          await prisma.presell.update({
            where: { id: presellId },
            data: { screenshotDesktop: null, screenshotMobile: null }
          });
          return;
        }

        // Capturar screenshots com timeout aumentado
        const { takeScreenshot } = await import('@/lib/screenshot');
        const screenshotPromise = takeScreenshot(urlValidation.sanitized!, presellId);
        const timeoutPromise = new Promise<{ desktop: null, mobile: null }>((_, reject) => {
          setTimeout(() => reject(new Error('Screenshot timeout - 60s')), 60000);
        });

        let screenshots: { desktop: string | null, mobile: string | null };
        try {
          screenshots = await Promise.race([screenshotPromise, timeoutPromise]);
          console.log(`[Preview] Prévias capturadas para presell ${presellId}:`, screenshots);
        } catch (timeoutError) {
          console.error(`[Preview] Timeout para presell ${presellId}:`, timeoutError);
          screenshots = { desktop: null, mobile: null };
        }

        // Atualizar banco
        await prisma.presell.update({
          where: { id: presellId },
          data: {
            screenshotDesktop: screenshots.desktop,
            screenshotMobile: screenshots.mobile
          }
        });

        console.log(`[Preview] Presell ${presellId} atualizado no banco`);
      } catch (error) {
        console.error(`[Preview] Erro geral para presell ${presellId}:`, error);
        // Garantir que polling termine mesmo em erro
        try {
          await prisma.presell.update({
            where: { id: presellId },
            data: { screenshotDesktop: null, screenshotMobile: null }
          });
        } catch (dbError) {
          console.error(`[Preview] Erro ao atualizar banco para presell ${presellId}:`, dbError);
        }
      }
    })();

    // Adicionar URL completa com o caminho customizado
    // A URL pública usa apenas o slug, não o path completo do Spaces
    const presellWithUrl = {
      ...newPresell,
      fullUrl: `https://${customDomain}/${slug}`
    };

    return NextResponse.json({
      success: true,
      message: 'Presell criada com sucesso',
      data: presellWithUrl
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar presell:', error);

    // Dar mais detalhes sobre o erro para debug
    let errorMessage = 'Erro interno do servidor';
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