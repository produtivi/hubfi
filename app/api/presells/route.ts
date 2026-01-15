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
      domain,
      pageName,
      affiliateLink,
      producerSalesPage,
      presellType,
      presellLanguage
    } = body;

    // Validações
    if (!userId || !domain || !pageName || !affiliateLink || !producerSalesPage || !presellType || !presellLanguage) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Gerar slug a partir do nome da página
    const slug = pageName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífen
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens do início e fim

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
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
        slug: slug
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

    let screenshotDesktop = '/screenshots/temp-desktop.png';
    let screenshotMobile = '/screenshots/temp-mobile.png';
    
    try {
      // Criar promise com timeout de 30 segundos
      const screenshotPromise = takeScreenshot(producerSalesPage, Date.now());
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Screenshot timeout após 30 segundos')), 30000);
      });
      
      const screenshots = await Promise.race([screenshotPromise, timeoutPromise]);
      
      if (screenshots && screenshots.desktop && screenshots.mobile) {
        screenshotDesktop = screenshots.desktop;
        screenshotMobile = screenshots.mobile;
      }
    } catch (error) {
      // Usar screenshots temporários
    }

    // Criar presell COM screenshots já prontos
    const newPresell = await prisma.presell.create({
      data: {
        userId: parseInt(userId),
        domainId: domainRecord.id,
        pageName,
        slug,
        affiliateLink,
        producerSalesPage,
        presellType: mappedPresellType,
        language: presellLanguage,
        status: 'draft',
        screenshotDesktop: screenshotDesktop,
        screenshotMobile: screenshotMobile
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