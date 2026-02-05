import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// POST - Gerar mais títulos e descrições para um produto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    // Buscar produto
    const product = await prisma.titleProduct.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key do Google Gemini não configurada' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Você é um especialista em Google Ads e copywriting. Gere textos para anúncios responsivos de pesquisa.

PRODUTO:
Nome: ${product.name}
Descrição: ${product.description}
${product.links ? `Links: ${product.links}` : ''}
${product.category ? `Categoria: ${product.category}` : ''}

GERE:
- 5 títulos (headlines) com NO MÁXIMO 28 caracteres cada (conte cada letra, espaço e pontuação)
- 5 descrições com NO MÁXIMO 85 caracteres cada (conte cada letra, espaço e pontuação)

REGRAS OBRIGATÓRIAS (SIGA RIGOROSAMENTE):
- TODOS os títulos DEVEM conter o nome do produto "${product.name}" (ou uma variação reconhecível dele)
- PROIBIDO usar ponto de exclamação (!) - NUNCA termine frases com !
- PROIBIDO usar ponto de interrogação (?)
- PROIBIDO usar aspas ("") em nenhum momento
- PROIBIDO usar palavras em CAIXA ALTA - apenas a primeira letra maiúscula é permitida
- PROIBIDO incluir preços (use termos como "oferta especial", "desconto")
- Seja persuasivo e orientado para ação
- Use palavras de impacto que geram cliques
- Cada título deve ser único e diferente
- Cada descrição deve ser única e diferente
- CRÍTICO: Conte TODOS os caracteres (incluindo espaços) ANTES de incluir no JSON
- Títulos: máximo 28 caracteres | Descrições: máximo 85 caracteres
- Cada texto DEVE ser uma frase COMPLETA que faz sentido sozinha
- NUNCA gere texto que será cortado - se passar do limite, reescreva mais curto

FORMATO DE RESPOSTA (JSON):
{
  "titles": ["título 1", "título 2", "título 3", "título 4", "título 5"],
  "descriptions": ["descrição 1", "descrição 2", "descrição 3", "descrição 4", "descrição 5"]
}

Retorne APENAS o JSON, sem texto adicional.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let parsedResponse
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        parsedResponse = JSON.parse(text)
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta:', text)
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

    if (!parsedResponse.titles || !parsedResponse.descriptions) {
      return NextResponse.json(
        { error: 'Resposta da IA em formato inválido' },
        { status: 500 }
      )
    }

    // Validar e truncar títulos (máx 30 caracteres) e descrições (máx 90 caracteres)
    const titles = (parsedResponse.titles || [])
      .slice(0, 5)
      .map((t: string) => t.substring(0, 30))

    const descriptions = (parsedResponse.descriptions || [])
      .slice(0, 5)
      .map((d: string) => d.substring(0, 90))

    // Salvar títulos no banco
    const savedTitles = await Promise.all(
      titles.map((content: string) =>
        prisma.generatedTitle.create({
          data: {
            productId,
            content
          }
        })
      )
    )

    // Salvar descrições no banco
    const savedDescriptions = await Promise.all(
      descriptions.map((content: string) =>
        prisma.generatedDescription.create({
          data: {
            productId,
            content
          }
        })
      )
    )

    return NextResponse.json({
      titles: savedTitles,
      descriptions: savedDescriptions
    })
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo' },
      { status: 500 }
    )
  }
}
