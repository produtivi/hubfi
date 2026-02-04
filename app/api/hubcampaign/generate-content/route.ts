import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productName, productDescription, productUrl, language = 'pt' } = body;

    if (!productName || !productDescription) {
      return NextResponse.json(
        { success: false, error: 'Nome e descrição do produto são obrigatórios' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API key do Google Gemini não configurada' },
        { status: 500 }
      );
    }

    const languageMap: Record<string, string> = {
      pt: 'Português (Brasil)',
      en: 'English',
      es: 'Español',
    };

    const targetLanguage = languageMap[language] || 'Português (Brasil)';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Você é um especialista em Google Ads e copywriting. Gere textos para anúncios responsivos de pesquisa.

PRODUTO:
Nome: ${productName}
Descrição: ${productDescription}

GERE em ${targetLanguage}:
- 5 títulos (headlines) com NO MÁXIMO 28 caracteres cada (conte cada letra, espaço e pontuação)
- 5 descrições com NO MÁXIMO 85 caracteres cada (conte cada letra, espaço e pontuação)

REGRAS OBRIGATÓRIAS (SIGA RIGOROSAMENTE):
- TODOS os títulos DEVEM conter o nome do produto "${productName}" (ou uma variação reconhecível dele)
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
  "titles": ["título1", "título2", "título3", "título4", "título5"],
  "descriptions": ["desc1", "desc2", "desc3", "desc4", "desc5"]
}

Retorne APENAS o JSON, sem texto adicional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse JSON response
    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', responseText);
      return NextResponse.json(
        { success: false, error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      );
    }

    // Validate and truncate titles/descriptions
    const titles = (parsedResponse.titles || [])
      .slice(0, 5)
      .map((t: string) => t.substring(0, 30));

    const descriptions = (parsedResponse.descriptions || [])
      .slice(0, 5)
      .map((d: string) => d.substring(0, 90));

    // Salvar como produto no HubTitle
    const titleProduct = await prisma.titleProduct.create({
      data: {
        userId: user.id,
        name: productName,
        description: productDescription,
        links: productUrl || null,
        category: null,
      },
    });

    // Salvar títulos
    const savedTitles = await Promise.all(
      titles.map((content: string) =>
        prisma.generatedTitle.create({
          data: {
            productId: titleProduct.id,
            content,
          },
        })
      )
    );

    // Salvar descrições
    const savedDescriptions = await Promise.all(
      descriptions.map((content: string) =>
        prisma.generatedDescription.create({
          data: {
            productId: titleProduct.id,
            content,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: titleProduct.id,
          name: titleProduct.name,
          description: titleProduct.description,
          links: titleProduct.links,
          category: titleProduct.category,
          titles: savedTitles.map(t => ({ id: t.id, content: t.content, isFavorite: t.isFavorite })),
          descriptions: savedDescriptions.map(d => ({ id: d.id, content: d.content, isFavorite: d.isFavorite })),
        },
      },
    });

  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
