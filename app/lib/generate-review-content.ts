import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface ReviewContentInput {
  productName: string;
  producerSalesPage: string;
  productType: string;
  niche: string;
  language: string;
}

interface ReviewContent {
  headline: string;
  subheadline: string;
  introduction: string;
  benefits: string[];
  features: string[];
  whoIsItFor: string;
  callToAction: string;
  metaTitle: string;
  metaDescription: string;
}

export async function generateReviewContent(input: ReviewContentInput): Promise<ReviewContent | null> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Você é um especialista em copywriting e páginas de vendas.

Analise a página de vendas do produto e crie um RESUMO persuasivo que apresente o produto de forma atrativa.

DADOS DO PRODUTO:
- Nome do produto: ${input.productName}
- URL da página de vendas: ${input.producerSalesPage}
- Tipo de produto: ${input.productType}
- Nicho: ${input.niche}
- Idioma: ${input.language}

INSTRUÇÕES:
1. Crie uma página de resumo que apresente o produto de forma clara e persuasiva
2. Use linguagem de vendas convincente
3. Destaque os principais benefícios e características do produto
4. Inclua para quem o produto é indicado
5. Finalize com um chamado para ação forte
6. Escreva no idioma: ${input.language}

RETORNE APENAS UM JSON VÁLIDO no seguinte formato (sem markdown, sem código):
{
  "headline": "Título principal chamativo e persuasivo (máx 80 caracteres)",
  "subheadline": "Subtítulo que complementa o headline e gera curiosidade (máx 120 caracteres)",
  "introduction": "Parágrafo de introdução (150-250 palavras) que apresenta o produto, o problema que resolve e desperta interesse",
  "benefits": ["Benefício transformador 1", "Benefício transformador 2", "Benefício transformador 3", "Benefício transformador 4", "Benefício transformador 5"],
  "features": ["O que está incluso 1", "O que está incluso 2", "O que está incluso 3", "O que está incluso 4"],
  "whoIsItFor": "Parágrafo (80-120 palavras) descrevendo para quem o produto é ideal",
  "callToAction": "Frase de chamada para ação persuasiva (máx 100 caracteres)",
  "metaTitle": "Título SEO (máx 60 caracteres)",
  "metaDescription": "Descrição SEO (máx 160 caracteres)"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpar o texto de possíveis marcações markdown
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const content: ReviewContent = JSON.parse(cleanedText);

    // Validar campos obrigatórios
    if (!content.headline || !content.introduction || !content.benefits || !content.callToAction) {
      console.error('[Review AI] Conteúdo gerado inválido:', content);
      return null;
    }

    console.log('[Review AI] Conteúdo gerado com sucesso');
    return content;

  } catch (error) {
    console.error('[Review AI] Erro ao gerar conteúdo:', error);
    return null;
  }
}
