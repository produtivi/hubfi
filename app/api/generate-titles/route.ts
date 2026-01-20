import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, description, links, category } = body

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'A descrição do produto é obrigatória' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key do Google Gemini não configurada' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Você é um especialista em copywriting e marketing digital. Com base nas informações do produto abaixo, gere 5 títulos persuasivos e 5 descrições atraentes para campanhas de marketing.

INFORMAÇÕES DO PRODUTO:
${productName ? `Nome: ${productName}` : ''}
Descrição: ${description}
${links ? `Links: ${links}` : ''}
${category ? `Categoria: ${category}` : ''}

INSTRUÇÕES:
1. Os títulos devem ser curtos (máximo 60 caracteres), impactantes e chamar atenção
2. As descrições devem ter entre 100-150 caracteres, focando em benefícios e gatilhos mentais
3. Use técnicas de copywriting como: urgência, escassez, prova social, autoridade
${category ? `4. Adapte o tom de voz para a categoria "${category}"` : '4. Use um tom de voz persuasivo e profissional'}
5. Cada título e descrição deve ser único e persuasivo

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

    if (parsedResponse.titles.length !== 5 || parsedResponse.descriptions.length !== 5) {
      return NextResponse.json(
        { error: 'A IA não gerou a quantidade correta de conteúdo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      titles: parsedResponse.titles,
      descriptions: parsedResponse.descriptions
    })
  } catch (error) {
    console.error('Erro na API generate-titles:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo' },
      { status: 500 }
    )
  }
}
