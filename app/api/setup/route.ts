import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST() {
  try {
    // Criar usuário de teste com senha criptografada
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@hubfi.com' },
      update: {
        password: hashedPassword
      },
      create: {
        email: 'admin@hubfi.com',
        name: 'Admin HubFi',
        password: hashedPassword
      }
    });

    // Criar domínios
    const domains = [
      'lojaonlineproducts.site',
      'theofficialportal.store',
      'onlydiscount.site'
    ];

    const createdDomains = [];
    for (const domainName of domains) {
      const domain = await prisma.domain.upsert({
        where: { domainName },
        update: {},
        create: {
          domainName,
          isActive: true
        }
      });
      createdDomains.push(domain);
    }

    return NextResponse.json({
      success: true,
      message: 'Setup concluído',
      data: {
        user,
        domains: createdDomains
      }
    });

  } catch (error) {
    console.error('Erro no setup:', error);
    
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