// DataForSEO API Integration
// Documentação: https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/

interface KeywordMetricsResult {
  success: boolean;
  data?: {
    keyword: string;
    avgMonthlySearches: number;
    avgCpc: number;
    competition: string;
    competitionIndex: number;
    monthlySearchVolumes: Array<{
      year: number;
      month: string;
      searches: number;
    }>;
    relatedKeywords: Array<{
      keyword: string;
      avgMonthlySearches: number;
      avgCpc: number;
      competition: string;
    }>;
  };
  error?: string;
}

// Mapeamento de localização para DataForSEO
const LOCATION_CODES: Record<string, number> = {
  'global': 2840,  // USA como padrão para global
  'br': 2076,      // Brazil
  'us': 2840,      // United States
  'pt': 2620,      // Portugal
  'es': 2724,      // Spain
};

// Mapeamento de idioma
const LANGUAGE_CODES: Record<string, string> = {
  'br': 'pt',      // Portuguese
  'us': 'en',      // English
  'pt': 'pt',      // Portuguese
  'es': 'es',      // Spanish
  'global': 'en',  // English
};

// Nomes dos meses
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export async function getKeywordMetricsDataForSEO(
  keyword: string,
  location: string = 'br'
): Promise<KeywordMetricsResult> {
  try {
    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;

    if (!login || !password) {
      return { success: false, error: 'Credenciais DataForSEO não configuradas' };
    }

    // Criar Basic Auth header
    const authString = Buffer.from(`${login}:${password}`).toString('base64');

    const locationCode = LOCATION_CODES[location] || LOCATION_CODES['br'];
    const languageCode = LANGUAGE_CODES[location] || LANGUAGE_CODES['br'];

    // 1. Buscar volume de busca e métricas da keyword principal
    const searchVolumeResponse = await fetch(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keywords: [keyword],
            location_code: locationCode,
            language_code: languageCode,
            include_adult_keywords: false,
          }
        ]),
      }
    );

    const searchVolumeData = await searchVolumeResponse.json();

    if (searchVolumeData.status_code !== 20000) {
      console.error('Erro DataForSEO Search Volume:', searchVolumeData);
      return {
        success: false,
        error: searchVolumeData.status_message || 'Erro ao buscar dados de volume'
      };
    }

    const taskResult = searchVolumeData.tasks?.[0]?.result?.[0];

    if (!taskResult) {
      return { success: false, error: 'Nenhum dado encontrado para esta palavra-chave' };
    }

    // Extrair dados da keyword principal
    const avgMonthlySearches = taskResult.search_volume || 0;
    const avgCpc = taskResult.cpc || 0;
    const competitionLevel = taskResult.competition || 'UNSPECIFIED';
    const competitionIndex = taskResult.competition_index || 0;

    // Converter competition para português
    const competitionMap: Record<string, string> = {
      'HIGH': 'Alta',
      'MEDIUM': 'Média',
      'LOW': 'Baixa',
      'UNSPECIFIED': 'Desconhecida',
    };

    // Processar histórico mensal
    const monthlySearchVolumes: Array<{ year: number; month: string; searches: number }> = [];
    if (taskResult.monthly_searches && Array.isArray(taskResult.monthly_searches)) {
      for (const vol of taskResult.monthly_searches) {
        monthlySearchVolumes.push({
          year: vol.year,
          month: MONTH_NAMES[vol.month - 1] || String(vol.month),
          searches: vol.search_volume || 0,
        });
      }
    }

    // 2. Buscar keywords relacionadas
    let relatedKeywords: Array<{
      keyword: string;
      avgMonthlySearches: number;
      avgCpc: number;
      competition: string;
    }> = [];

    try {
      const relatedResponse = await fetch(
        'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live',
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              keywords: [keyword],
              location_code: locationCode,
              language_code: languageCode,
              include_adult_keywords: false,
            }
          ]),
        }
      );

      const relatedData = await relatedResponse.json();

      if (relatedData.status_code === 20000 && relatedData.tasks?.[0]?.result) {
        const relatedResults = relatedData.tasks[0].result;

        // Pegar até 15 keywords relacionadas (excluindo a principal)
        relatedKeywords = relatedResults
          .filter((item: any) => item.keyword?.toLowerCase() !== keyword.toLowerCase())
          .slice(0, 15)
          .map((item: any) => ({
            keyword: item.keyword,
            avgMonthlySearches: item.search_volume || 0,
            avgCpc: item.cpc || 0,
            competition: competitionMap[item.competition] || 'Desconhecida',
          }));
      }
    } catch (relatedError) {
      console.error('Erro ao buscar keywords relacionadas:', relatedError);
      // Continuar sem keywords relacionadas
    }

    return {
      success: true,
      data: {
        keyword: keyword,
        avgMonthlySearches,
        avgCpc,
        competition: competitionMap[competitionLevel] || 'Desconhecida',
        competitionIndex,
        monthlySearchVolumes,
        relatedKeywords,
      },
    };

  } catch (error) {
    console.error('Erro DataForSEO:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
