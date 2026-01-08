import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        domainName: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: domains
    });

  } catch (error) {
    console.error('Erro ao buscar domínios:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainName, registrar } = body;

    // Validações
    if (!domainName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nome do domínio é obrigatório' 
        },
        { status: 400 }
      );
    }

    // Verificar se domínio já existe
    const existingDomain = await prisma.domain.findUnique({
      where: { domainName }
    });

    if (existingDomain) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Domínio já existe' 
        },
        { status: 409 }
      );
    }

    // Criar domínio
    const newDomain = await prisma.domain.create({
      data: {
        domainName,
        registrar: registrar || 'other',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: newDomain
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar domínio:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}