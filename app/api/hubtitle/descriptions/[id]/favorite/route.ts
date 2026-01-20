import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// PATCH - Toggle favorito de descrição
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const descriptionId = parseInt(id)
    const body = await request.json()
    const { isFavorite } = body

    const description = await prisma.generatedDescription.update({
      where: { id: descriptionId },
      data: { isFavorite }
    })

    return NextResponse.json(description)
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar favorito' },
      { status: 500 }
    )
  }
}
