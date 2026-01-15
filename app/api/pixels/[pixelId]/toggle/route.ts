import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pixelId: string }> }
) {
  try {
    const { pixelId } = await params

    // Validar se pixelId foi fornecido
    if (!pixelId) {
      return NextResponse.json(
        { success: false, error: 'pixelId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar pixel no banco
    const pixel = await prisma.pixel.findUnique({
      where: { pixelId }
    })

    if (!pixel) {
      return NextResponse.json(
        { success: false, error: 'Pixel não encontrado' },
        { status: 404 }
      )
    }

    // Alternar status
    const newStatus = pixel.status === 'active' ? 'inactive' : 'active'

    // Atualizar no banco
    const updatedPixel = await prisma.pixel.update({
      where: { pixelId },
      data: { status: newStatus }
    })

    return NextResponse.json({
      success: true,
      data: {
        pixelId: updatedPixel.pixelId,
        name: updatedPixel.name,
        status: updatedPixel.status
      },
      message: `Pixel ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao alterar status do pixel:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}