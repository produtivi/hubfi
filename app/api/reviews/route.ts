import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateURL } from '@/lib/url-validator';
import { getFaviconUrl, downloadAndSaveFavicon } from '@/lib/favicon';
import { generateReviewContent } from '@/lib/generate-review-content';
import { saveReviewHTML } from '@/lib/generate-review-html';
import { uploadPresellToCustomDomain } from '@/lib/spaces-upload';

// GET - Listar reviews do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const whereClause = userId ? { userId: parseInt(userId) } : {};

    const reviews = await prisma.review.findMany({
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

    // Adicionar URL completa para cada review
    const reviewsWithUrl = reviews.map((review: typeof reviews[number]) => ({
      ...review,
      fullUrl: review.domain ? `https://${review.domain.domainName}/${review.slug}` : review.slug
    }));

    return NextResponse.json({
      success: true,
      data: reviewsWithUrl
    });

  } catch (error) {
    console.error('Erro ao buscar reviews:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      pageName,
      productName,
      domain: customDomain,
      affiliateLink,
      producerSalesPage,
      productType,
      niche,
      language
    } = body;

    // Validações básicas
    if (!userId || !pageName || !productName || !customDomain || !affiliateLink || !producerSalesPage || !productType || !niche) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Gerar slug a partir do nome da página
    const slug = pageName.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Validar URLs
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

    // Buscar ou criar domínio
    let domainRecord = await prisma.domain.findUnique({
      where: { domainName: customDomain }
    });

    if (!domainRecord) {
      domainRecord = await prisma.domain.create({
        data: {
          domainName: customDomain,
          isActive: true
        }
      });
    }

    // Verificar se já existe uma review com o mesmo pageName neste domínio
    const existingReviewByName = await prisma.review.findFirst({
      where: {
        domainId: domainRecord.id,
        pageName: {
          equals: pageName,
          mode: 'insensitive'
        }
      }
    });

    if (existingReviewByName) {
      return NextResponse.json(
        { error: `Já existe uma página com o título "${pageName}" neste domínio. Por favor, escolha outro título.` },
        { status: 409 }
      );
    }

    // Criar review primeiro para ter o ID
    const newReview = await prisma.review.create({
      data: {
        userId,
        domainId: domainRecord.id,
        pageName,
        productName,
        slug,
        affiliateLink,
        producerSalesPage,
        productType,
        niche,
        language: language || 'Português',
        status: 'draft',
        faviconUrl: null,
        screenshotDesktop: null,
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

    const reviewId = newReview.id;
    const producerSalesPageUrl = newReview.producerSalesPage;
    const finalCustomDomain = customDomain;
    const domainWithoutDots = customDomain.replace(/\./g, '');
    const finalPagePath = `${domainWithoutDots}/${slug}/index.html`;

    console.log(`[Review] Criada review ${reviewId}, iniciando geração de conteúdo...`);

    // Baixar favicon em background
    (async () => {
      try {
        const savedFaviconUrl = await downloadAndSaveFavicon(producerSalesPageUrl, reviewId);
        if (savedFaviconUrl) {
          await prisma.review.update({
            where: { id: reviewId },
            data: { faviconUrl: savedFaviconUrl }
          });
          console.log(`[Review] Favicon salvo para review ${reviewId}`);
        } else {
          const fallbackUrl = getFaviconUrl(producerSalesPageUrl, 64);
          await prisma.review.update({
            where: { id: reviewId },
            data: { faviconUrl: fallbackUrl }
          });
        }
      } catch (error) {
        console.error(`[Review] Erro ao processar favicon para review ${reviewId}:`, error);
      }
    })();

    // Gerar conteúdo com IA em background
    (async () => {
      try {
        console.log(`[Review] Iniciando geração de conteúdo IA para review ${reviewId}...`);

        // Gerar conteúdo com IA
        const content = await generateReviewContent({
          productName,
          producerSalesPage: producerSalesPageUrl,
          productType,
          niche,
          language: language || 'Português'
        });

        if (content) {
          // Atualizar review com conteúdo gerado
          await prisma.review.update({
            where: { id: reviewId },
            data: {
              headline: content.headline,
              subheadline: content.subheadline,
              introduction: content.introduction,
              benefits: JSON.stringify(content.benefits),
              features: JSON.stringify(content.features),
              whoIsItFor: content.whoIsItFor,
              callToAction: content.callToAction,
              metaTitle: content.metaTitle,
              metaDescription: content.metaDescription
            }
          });

          console.log(`[Review] Conteúdo IA gerado para review ${reviewId}`);

          // Buscar review atualizada para gerar HTML
          const updatedReview = await prisma.review.findUnique({
            where: { id: reviewId }
          });

          if (updatedReview) {
            // Gerar HTML da página
            const htmlUrl = await saveReviewHTML({
              id: updatedReview.id,
              pageName: updatedReview.pageName,
              productName: updatedReview.productName,
              faviconUrl: updatedReview.faviconUrl,
              affiliateLink: updatedReview.affiliateLink,
              headline: updatedReview.headline,
              subheadline: updatedReview.subheadline,
              introduction: updatedReview.introduction,
              benefits: updatedReview.benefits,
              features: updatedReview.features,
              whoIsItFor: updatedReview.whoIsItFor,
              callToAction: updatedReview.callToAction,
              language: updatedReview.language
            });

            if (htmlUrl) {
              await prisma.review.update({
                where: { id: reviewId },
                data: {
                  contentHtml: htmlUrl,
                  status: 'published',
                  publishedAt: new Date()
                }
              });

              console.log(`[Review] HTML gerado para review ${reviewId}: ${htmlUrl}`);

              // Upload para domínio customizado
              if (finalCustomDomain && finalPagePath) {
                try {
                  const htmlResponse = await fetch(htmlUrl);
                  const htmlContent = await htmlResponse.text();

                  const uploadResult = await uploadPresellToCustomDomain(
                    finalCustomDomain,
                    finalPagePath,
                    htmlContent
                  );

                  if (uploadResult.success) {
                    console.log(`[Review] Upload para domínio customizado bem-sucedido: ${uploadResult.url}`);
                  } else {
                    console.error(`[Review] Erro no upload: ${uploadResult.error}`);
                  }
                } catch (uploadError) {
                  console.error(`[Review] Erro ao fazer upload:`, uploadError);
                }
              }
            }
          }
        } else {
          console.error(`[Review] Falha ao gerar conteúdo IA para review ${reviewId}`);
        }
      } catch (error) {
        console.error(`[Review] Erro ao gerar conteúdo para review ${reviewId}:`, error);
      }
    })();

    const reviewWithUrl = {
      ...newReview,
      fullUrl: `https://${customDomain}/${slug}`
    };

    return NextResponse.json({
      success: true,
      message: 'Review criada com sucesso! O conteúdo está sendo gerado.',
      data: reviewWithUrl
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar review:', error);

    let errorMessage = 'Erro interno do servidor';
    if (error instanceof Error) {
      errorMessage = `Erro: ${error.message}`;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
