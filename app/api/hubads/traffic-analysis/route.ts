import { NextRequest, NextResponse } from 'next/server';

interface SimilarwebResponse {
  SiteName: string;
  Description: string;
  GlobalRank: {
    Rank: number;
  };
  CountryRank: {
    Country: number;
    Rank: number;
  };
  CategoryRank: {
    Rank: string;
    Category: string;
  };
  Title: string;
  Engagments: {
    BounceRate: string;
    Month: string;
    Year: string;
    PagePerVisit: string;
    Visits: string;
    TimeOnSite: string;
  };
  EstimatedMonthlyVisits: Record<string, number>;
  TopCountryShares: Array<{
    Country: number;
    CountryCode: string;
    Value: number;
  }>;
  TrafficSources: Record<string, number>;
  TopKeywords: Array<{
    Name: string;
    EstimatedValue: number;
    Volume: number;
    Cpc: number;
  }>;
  LargeScreenshot: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL é obrigatória' },
        { status: 400 }
      );
    }

    // Extrair domínio da URL
    let domain: string;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname.replace('www.', '');
    } catch {
      return NextResponse.json(
        { success: false, error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Chamar Similarweb API
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key não configurada' },
        { status: 500 }
      );
    }

    const response = await fetch('https://similarweb-api1.p.rapidapi.com/v1/visitsInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'similarweb-api1.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      },
      body: JSON.stringify({ q: domain })
    });

    if (!response.ok) {
      console.error('[Traffic Analysis] API error:', response.status);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar dados de tráfego' },
        { status: response.status }
      );
    }

    const data: SimilarwebResponse = await response.json();

    const formattedData = {
      siteName: data.SiteName,
      title: data.Title,
      description: data.Description,
      screenshot: data.LargeScreenshot,
      globalRank: data.GlobalRank?.Rank || null,
      countryRank: data.CountryRank?.Rank || null,
      countryCode: data.CountryRank?.Country || null,
      categoryRank: data.CategoryRank?.Rank || null,
      category: data.CategoryRank?.Category || null,
      engagements: {
        visits: parseInt(data.Engagments?.Visits || '0'),
        bounceRate: parseFloat(data.Engagments?.BounceRate || '0'),
        pagePerVisit: parseFloat(data.Engagments?.PagePerVisit || '0'),
        timeOnSite: parseFloat(data.Engagments?.TimeOnSite || '0'),
        month: data.Engagments?.Month,
        year: data.Engagments?.Year
      },
      monthlyVisits: data.EstimatedMonthlyVisits || {},
      topCountries: (data.TopCountryShares || []).map(country => ({
        code: country.CountryCode,
        share: country.Value
      })),
      trafficSources: data.TrafficSources || {},
      topKeywords: (data.TopKeywords || []).slice(0, 10).map(kw => ({
        keyword: kw.Name,
        volume: kw.Volume,
        cpc: kw.Cpc
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Erro no endpoint traffic-analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
