import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// GET - Buscar presell específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const presell = await prisma.presell.findUnique({
      where: {
        id: parseInt(id)
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

    if (!presell) {
      return NextResponse.json(
        { error: 'Presell não encontrada' },
        { status: 404 }
      );
    }

    // Adicionar URL completa
    const presellWithUrl = {
      ...presell,
      fullUrl: `https://${presell.domain.domainName}/${presell.slug}`
    };

    return NextResponse.json({
      success: true,
      data: presellWithUrl
    });

  } catch (error) {
    console.error('Erro ao buscar presell:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar presell
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const {
      pageName,
      affiliateLink,
      producerSalesPage,
      presellType,
      presellLanguage,
      status,
      headline,
      subheadline,
      contentHtml,
      metaTitle,
      metaDescription
    } = body;

    // Construir objeto de atualização
    const updateData: any = {};

    if (pageName) updateData.pageName = pageName;
    if (affiliateLink) updateData.affiliateLink = affiliateLink;
    if (producerSalesPage) updateData.producerSalesPage = producerSalesPage;
    if (presellType) updateData.presellType = presellType;
    if (presellLanguage) updateData.language = presellLanguage;
    if (status) {
      updateData.status = status;
      if (status === 'published') {
        updateData.publishedAt = new Date();
      }
    }
    if (headline !== undefined) updateData.headline = headline;
    if (subheadline !== undefined) updateData.subheadline = subheadline;
    if (contentHtml !== undefined) updateData.contentHtml = contentHtml;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    // Atualizar presell
    const updatedPresell = await prisma.presell.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
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
      ...updatedPresell,
      fullUrl: `https://${updatedPresell.domain.domainName}/${updatedPresell.slug}`
    };

    return NextResponse.json({
      success: true,
      message: 'Presell atualizada com sucesso',
      data: presellWithUrl
    });

  } catch (error) {
    console.error('Erro ao atualizar presell:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar presell
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Verificar se a presell existe e buscar dados dos screenshots
    const presell = await prisma.presell.findUnique({
      where: { id: parseInt(id) }
    });

    if (!presell) {
      return NextResponse.json(
        { error: 'Presell não encontrada' },
        { status: 404 }
      );
    }

    // Deletar arquivos de screenshot se existirem
    // Deletar screenshots (verificar se são URLs do Spaces ou arquivos locais)
    if (presell.screenshotDesktop) {
      try {
        // Se for URL do Spaces, não tentar deletar localmente
        if (presell.screenshotDesktop.startsWith('https://produtivi.nyc3.digitaloceanspaces.com/')) {
          // TODO: Implementar deleção no Spaces se necessário
        } else if (presell.screenshotDesktop.includes('/screenshots/temp-')) {
          // Não deletar arquivos temporários compartilhados
        } else {
          // É arquivo local real
          const desktopPath = path.join(process.cwd(), 'public', presell.screenshotDesktop);
          await fs.unlink(desktopPath);
        }
      } catch (error) {
      }
    }

    if (presell.screenshotMobile) {
      try {
        // Se for URL do Spaces, não tentar deletar localmente
        if (presell.screenshotMobile.startsWith('https://produtivi.nyc3.digitaloceanspaces.com/')) {
          // TODO: Implementar deleção no Spaces se necessário
        } else if (presell.screenshotMobile.includes('/screenshots/temp-')) {
          // Não deletar arquivos temporários compartilhados
        } else {
          // É arquivo local real
          const mobilePath = path.join(process.cwd(), 'public', presell.screenshotMobile);
          await fs.unlink(mobilePath);
        }
      } catch (error) {
      }
    }

    // Deletar presell (analytics serão deletadas automaticamente por cascade)
    await prisma.presell.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Presell deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar presell:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}