import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { takeScreenshot } from '@/lib/screenshot';
import { validateURL } from '@/lib/url-validator';
import { getFaviconUrl, downloadAndSaveFavicon } from '@/lib/favicon';
import { savePresellHTML } from '@/lib/generate-presell-html';

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
      domain,
      slug,
      affiliateLink,
      producerSalesPage,
      presellType,
      presellLanguage
    } = body;


    // Gerar slug se não fornecido
    const finalSlug = slug || pageName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hifens
      .replace(/^-+|-+$/g, ''); // Remove hifens no início/fim

    // Validações básicas
    if (!userId || !pageName || !domain || !finalSlug || !affiliateLink || !producerSalesPage || !presellType) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

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

    // Buscar domínio
    const domainRecord = await prisma.domain.findUnique({
      where: { domainName: domain }
    });

    if (!domainRecord) {
      return NextResponse.json(
        { error: 'Domínio não encontrado' },
        { status: 400 }
      );
    }

    // Verificar se slug já existe no domínio
    const existingPresell = await prisma.presell.findFirst({
      where: {
        domainId: domainRecord.id,
        slug: finalSlug
      }
    });

    if (existingPresell) {
      return NextResponse.json(
        { error: 'Já existe uma página com este nome neste domínio' },
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
        slug: finalSlug,
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

    console.log(`[Favicon] Iniciando download assíncrono para presell ${presellId}`);
    console.log(`[Screenshot] Iniciando geração assíncrona para presell ${presellId}`);
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
        console.log(`[Screenshot] Processando screenshots para presell ${presellId}, URL: ${producerSalesPageUrl}`);

        // Validar URL
        const { validateURL } = await import('@/lib/url-validator');
        const urlValidation = validateURL(producerSalesPageUrl);

        if (!urlValidation.isValid) {
          console.error(`[Screenshot] URL inválida para presell ${presellId}:`, urlValidation.error);
          // Atualizar com null para terminar polling
          await prisma.presell.update({
            where: { id: presellId },
            data: { screenshotDesktop: null, screenshotMobile: null }
          });
          return;
        }

        // Capturar screenshots com timeout
        const { takeScreenshot } = await import('@/lib/screenshot');
        const screenshotPromise = takeScreenshot(urlValidation.sanitized!, presellId);
        const timeoutPromise = new Promise<{ desktop: null, mobile: null }>((_, reject) => {
          setTimeout(() => reject(new Error('Screenshot timeout - 30s')), 30000);
        });

        let screenshots: { desktop: string | null, mobile: string | null };
        try {
          screenshots = await Promise.race([screenshotPromise, timeoutPromise]);
          console.log(`[Screenshot] Screenshots capturados para presell ${presellId}:`, screenshots);
        } catch (timeoutError) {
          console.error(`[Screenshot] Timeout para presell ${presellId}:`, timeoutError);
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

        console.log(`[Screenshot] Presell ${presellId} atualizado no banco`);
      } catch (error) {
        console.error(`[Screenshot] Erro geral para presell ${presellId}:`, error);
        // Garantir que polling termine mesmo em erro
        try {
          await prisma.presell.update({
            where: { id: presellId },
            data: { screenshotDesktop: null, screenshotMobile: null }
          });
        } catch (dbError) {
          console.error(`[Screenshot] Erro ao atualizar banco para presell ${presellId}:`, dbError);
        }
      }
    })();

    // Adicionar URL completa
    const presellWithUrl = {
      ...newPresell,
      fullUrl: `https://${newPresell.domain.domainName}/${newPresell.slug}`
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