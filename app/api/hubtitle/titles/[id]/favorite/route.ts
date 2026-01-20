import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// PATCH - Toggle favorito de título
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const titleId = parseInt(id)
    const body = await request.json()
    const { isFavorite } = body

    const title = await prisma.generatedTitle.update({
      where: { id: titleId },
      data: { isFavorite }
    })

    return NextResponse.json(title)
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar favorito' },
      { status: 500 }
    )
  }
}
