import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getAuthUser } from '../../../lib/auth'

// GET - Listar todos os produtos do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = user.id

    const products = await prisma.titleProduct.findMany({
      where: { userId },
      include: {
        titles: {
          orderBy: [
            { isFavorite: 'desc' },
            { createdAt: 'desc' }
          ]
        },
        descriptions: {
          orderBy: [
            { isFavorite: 'desc' },
            { createdAt: 'desc' }
          ]
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, links, category } = body

    const userId = user.id

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Nome e descrição são obrigatórios' },
        { status: 400 }
      )
    }

    const product = await prisma.titleProduct.create({
      data: {
        userId,
        name,
        description,
        links: links || null,
        category: category || null
      },
      include: {
        titles: true,
        descriptions: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
