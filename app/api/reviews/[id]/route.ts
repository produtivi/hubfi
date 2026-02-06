import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar review por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
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

    if (!review) {
      return NextResponse.json(
        { error: 'Review não encontrada' },
        { status: 404 }
      );
    }

    const reviewWithUrl = {
      ...review,
      fullUrl: `https://${review.domain.domainName}/${review.slug}`
    };

    return NextResponse.json({
      success: true,
      data: reviewWithUrl
    });

  } catch (error) {
    console.error('Erro ao buscar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      pageName,
      productName,
      affiliateLink,
      producerSalesPage,
      productType,
      niche,
      language
    } = body;

    // Verificar se existe
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        pageName: pageName || existingReview.pageName,
        productName: productName || existingReview.productName,
        affiliateLink: affiliateLink || existingReview.affiliateLink,
        producerSalesPage: producerSalesPage || existingReview.producerSalesPage,
        productType: productType || existingReview.productType,
        niche: niche || existingReview.niche,
        language: language || existingReview.language
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

    const reviewWithUrl = {
      ...updatedReview,
      fullUrl: `https://${updatedReview.domain.domainName}/${updatedReview.slug}`
    };

    return NextResponse.json({
      success: true,
      data: reviewWithUrl
    });

  } catch (error) {
    console.error('Erro ao atualizar review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se existe
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review não encontrada' },
        { status: 404 }
      );
    }

    // Deletar a review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    return NextResponse.json({
      success: true,
      message: 'Review excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
