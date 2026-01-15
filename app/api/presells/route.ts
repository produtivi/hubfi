import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { takeScreenshot } from '@/lib/screenshot';

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
    const presellsWithUrl = presells.map(presell => ({
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
    
    // Criar presell primeiro para ter o ID
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
        screenshotDesktop: '/screenshots/temp-desktop.png',
        screenshotMobile: '/screenshots/temp-mobile.png'
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

    // Capturar screenshots em background
    setTimeout(async () => {
      try {
        const screenshots = await takeScreenshot(producerSalesPage, newPresell.id);
        
        // Atualizar presell com screenshots reais
        await prisma.presell.update({
          where: { id: newPresell.id },
          data: {
            screenshotDesktop: screenshots.desktop,
            screenshotMobile: screenshots.mobile
          }
        });
      } catch (error) {
        console.error(`Erro ao capturar screenshots para presell ${newPresell.id}:`, error);
      }
    }, 1000);

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