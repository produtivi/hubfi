'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import { Calculator, ChartBreakoutSquare, ChevronDown } from '@untitledui/icons';
import type { Key } from 'react-aria-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  BarChart,
  Bar
} from 'recharts';

type TabType = 'calculator' | 'traffic';

interface KeywordData {
  keyword: string;
  avgMonthlySearches: number;
  avgCpc: number;
  competition: string;
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
}

interface TrafficData {
  siteName: string;
  title: string;
  description: string;
  screenshot: string;
  globalRank: number | null;
  countryRank: number | null;
  categoryRank: string | null;
  category: string | null;
  engagements: {
    visits: number;
    bounceRate: number;
    pagePerVisit: number;
    timeOnSite: number;
    month: string;
    year: string;
  };
  monthlyVisits: Record<string, number>;
  topCountries: Array<{
    code: string;
    share: number;
  }>;
  trafficSources: Record<string, number>;
  topKeywords: Array<{
    keyword: string;
    volume: number;
    cpc: number;
  }>;
}

export default function HubAds() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState<string>('br');
  const [clicksPerSale, setClicksPerSale] = useState(20);
  const [currency, setCurrency] = useState<string>('BRL');
  const [commissionValue, setCommissionValue] = useState('');
  const [realCpc, setRealCpc] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordData, setKeywordData] = useState<KeywordData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [error, setError] = useState('');
  const [trafficError, setTrafficError] = useState('');
  const [showDistribution, setShowDistribution] = useState(false);

  const locations = [
    { id: 'global', label: 'Global' },
    { id: 'br', label: 'Brasil' },
    { id: 'us', label: 'Estados Unidos' },
    { id: 'pt', label: 'Portugal' },
    { id: 'es', label: 'Espanha' },
  ];

  const currencies = [
    { id: 'BRL', label: 'R$ Reais' },
    { id: 'USD', label: '$ Dólares' },
    { id: 'EUR', label: '€ Euros' },
  ];

  const formatCurrency = (value: number) => {
    const symbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';
    return `${symbol}${value.toFixed(2).replace('.', ',')}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR');
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError('');
    setKeywordData(null);

    try {
      const response = await fetch('/api/hubads/keyword-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location })
      });

      const result = await response.json();

      if (result.success) {
        setKeywordData(result.data);
      } else {
        setError(result.error || 'Erro ao buscar dados');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setTrafficError('');
    setTrafficData(null);

    try {
      const response = await fetch('/api/hubads/traffic-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl })
      });

      const result = await response.json();

      if (result.success) {
        setTrafficData(result.data);
      } else {
        setTrafficError(result.error || 'Erro ao buscar dados de tráfego');
      }
    } catch (err) {
      setTrafficError('Erro ao conectar com o servidor');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Cálculos de viabilidade
  const cpcUsado = realCpc ? parseFloat(realCpc) : (keywordData?.avgCpc || 0);
  const custoCliques = clicksPerSale * cpcUsado;
  const comissao = parseFloat(commissionValue) || 0;
  const resultadoEstimado = comissao - custoCliques;

  // Encontrar o valor máximo para escalar o gráfico
  const maxSearches = keywordData?.monthlySearchVolumes
    ? Math.max(...keywordData.monthlySearchVolumes.map(v => v.searches))
    : 0;

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-headline mb-1 md:mb-2">HubAds</h1>
        <p className="text-body-muted">
          Calculadora de viabilidade e análise de tráfego
        </p>
      </div>

      {/* Tabs */}
      <div className="relative mb-6">
        <div className="flex border border-border rounded-xl overflow-hidden bg-card p-1.5">
          {/* Indicador animado com efeito de glow */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              left: activeTab === 'calculator' ? '6px' : 'calc(50% + 3px)',
              right: activeTab === 'calculator' ? 'calc(50% + 3px)' : '6px',
              background: 'var(--color-primary)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
            }}
          />

          {/* Tab Calculadora */}
          <button
            onClick={() => setActiveTab('calculator')}
            className="relative z-10 flex-1 flex items-center justify-center gap-2.5 p-1 text-body font-medium rounded-lg transition-all duration-500"
            style={{
              color: activeTab === 'calculator' ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
              transform: activeTab === 'calculator' ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <Calculator
              className="w-5 h-5 transition-transform duration-500"
              style={{
                transform: activeTab === 'calculator' ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(-5deg)'
              }}
            />
            <span className="transition-all duration-500" style={{
              letterSpacing: activeTab === 'calculator' ? '0.01em' : '0'
            }}>
              Calculadora de Viabilidade
            </span>
          </button>

          {/* Tab Análise */}
          <button
            onClick={() => setActiveTab('traffic')}
            className="relative z-10 flex-1 flex items-center justify-center gap-2.5 p-1 text-body font-medium rounded-lg transition-all duration-500"
            style={{
              color: activeTab === 'traffic' ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
              transform: activeTab === 'traffic' ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <ChartBreakoutSquare
              className="w-5 h-5 transition-transform duration-500"
              style={{
                transform: activeTab === 'traffic' ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(5deg)'
              }}
            />
            <span className="transition-all duration-500" style={{
              letterSpacing: activeTab === 'traffic' ? '0.01em' : '0'
            }}>
              Análise de Tráfego
            </span>
          </button>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="relative overflow-hidden">
        {/* Calculadora de Viabilidade */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            activeTab === 'calculator'
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 -translate-x-8 scale-[0.98] absolute inset-0 pointer-events-none'
          }`}
        >
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-5">
              <div className='flex flex-col md:flex-row w-full gap-4 md:gap-8'>
                {/* Palavra-chave */}
                <div className="space-y-1 w-full">
                  <label className="text-label text-muted-foreground">Palavra-chave</label>
                  <Input
                    value={keyword}
                    onChange={setKeyword}
                    placeholder="Ex: Creme reparador"
                  />
                </div>

                {/* Localização */}
                <div className="space-y-1 w-full">
                  <label className="text-label text-muted-foreground">Localização</label>
                  <Select
                    placeholder="Selecione"
                    selectedKey={location}
                    onSelectionChange={(key: Key | null) => setLocation(key as string || 'br')}
                    items={locations}
                  >
                    {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                  </Select>
                </div>
              </div>

              <div className='flex flex-col md:flex-row gap-4 md:gap-8'>
                {/* Quantidade de cliques por venda */}
                <div className="space-y-2 w-full">
                  <label className="text-label text-muted-foreground">Quantidade de cliques por venda</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={clicksPerSale}
                      onChange={(e) => setClicksPerSale(parseInt(e.target.value))}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-primary"
                      style={{
                        background: `linear-gradient(to right, var(--color-foreground) 0%, var(--color-foreground) ${(clicksPerSale / 200) * 100}%, var(--color-border) ${(clicksPerSale / 200) * 100}%, var(--color-border) 100%)`
                      }}
                    />
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={clicksPerSale}
                      onChange={(e) => setClicksPerSale(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1.5 text-center bg-background border border-border rounded-md text-body"
                    />
                  </div>
                </div>

                {/* CPC real */}
                <div className="space-y-1 w-full">
                  <p className="text-label text-muted-foreground">
                    Se a campanha já estiver ativa no Google Ads, informe abaixo o CPC real.
                  </p>
                  <label className="text-label text-muted-foreground">CPC real (Opcional)</label>
                  <Input
                    type="number"
                    value={realCpc}
                    onChange={setRealCpc}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-end">
                <div className="space-y-1 w-full">
                  <label className="text-label text-muted-foreground">Valor da comissão</label>
                  <div className="flex gap-2">
                    <Select
                      placeholder="Moeda"
                      selectedKey={currency}
                      onSelectionChange={(key: Key | null) => setCurrency(key as string || 'BRL')}
                      items={currencies}
                      className="w-32"
                    >
                      {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                    </Select>
                    <Input
                      type="number"
                      value={commissionValue}
                      onChange={setCommissionValue}
                      placeholder="0,00"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="w-full flex justify-end">
                  <Button
                    color="primary"
                    size="md"
                    className="w-full md:w-48"
                    onClick={handleCalculate}
                    isLoading={isCalculating}
                    isDisabled={!keyword}
                  >
                    Calcular Viabilidade
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-body text-destructive">{error}</p>
            </div>
          )}

          {/* Resultados da Calculadora */}
          {keywordData && (
            <div className="mt-6 space-y-6">
              {/* Header com métricas principais */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Título */}
                  <div>
                    <p className="text-label text-muted-foreground">
                      Viabilidade de Anúncio para o termo
                    </p>
                    <h2 className="text-headline mt-1">"{keywordData.keyword}"</h2>
                    <p className="text-label text-muted-foreground mt-2">
                      Volume de buscas dos últimos 12 meses
                    </p>
                  </div>

                  {/* Métricas */}
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-label text-muted-foreground">CPC Estimado</p>
                      <p className="text-title font-semibold">{formatCurrency(keywordData.avgCpc)}</p>
                    </div>
                    <div>
                      <p className="text-label text-muted-foreground">Volume de buscas</p>
                      <p className="text-title font-semibold">{formatNumber(keywordData.avgMonthlySearches)}</p>
                    </div>
                    <div>
                      <p className="text-label text-muted-foreground">Concorrência atual</p>
                      <p className="text-title font-semibold">{keywordData.competition}</p>
                    </div>
                  </div>
                </div>

                {/* Gráfico de volume mensal */}
                {keywordData.monthlySearchVolumes.length > 0 && (
                  <div className="mt-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={keywordData.monthlySearchVolumes.map((vol) => ({
                          month: `${vol.month}/${vol.year}`,
                          buscas: vol.searches
                        }))}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                            return value.toString();
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: 'hsl(var(--foreground))'
                          }}
                          formatter={(value) => value !== undefined ? [formatNumber(Number(value)), 'Buscas'] : ['', '']}
                          labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="buscas"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Cálculo de viabilidade */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Texto explicativo */}
                    <p className="text-body text-muted-foreground max-w-md">
                      Simulando uma média de <span className="font-semibold text-foreground">{clicksPerSale} cliques</span> por{' '}
                      <span className="font-semibold text-foreground">{formatCurrency(cpcUsado)}</span> cada para obter uma venda de{' '}
                      <span className="font-semibold text-foreground">{formatCurrency(comissao)}</span> de comissão,
                      o resultado estimado é de <span className={`font-semibold ${resultadoEstimado >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(resultadoEstimado)}
                      </span> por venda.
                    </p>

                    {/* Cards de resultado */}
                    <div className="flex gap-6">
                      <div>
                        <p className="text-label text-muted-foreground">Custo {clicksPerSale} cliques</p>
                        <p className="text-xs text-muted-foreground">Qtd. de cliques × CPC Estimado</p>
                        <p className="text-title font-semibold mt-1">{formatCurrency(custoCliques)}</p>
                      </div>
                      <div>
                        <p className="text-label text-muted-foreground">Resultado estimado</p>
                        <p className="text-xs text-muted-foreground">Valor comissão - custo cliques</p>
                        <p className={`text-title font-semibold mt-1 ${resultadoEstimado >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(resultadoEstimado)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Palavras-chave relacionadas */}
              {keywordData.relatedKeywords.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-label text-muted-foreground">
                    Buscas Relacionadas para o termo
                  </p>
                  <h3 className="text-title font-semibold mt-1 mb-4">"{keywordData.keyword}"</h3>

                  <div className="flex flex-wrap gap-2">
                    {keywordData.relatedKeywords.map((related, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-accent border border-border rounded-full text-label text-foreground hover:bg-accent/80 transition-colors cursor-default"
                      >
                        {related.keyword} ({formatCurrency(related.avgCpc)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Análise de Tráfego */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            activeTab === 'traffic'
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-8 scale-[0.98] absolute inset-0 pointer-events-none'
          }`}
        >
          <div className="bg-card border border-border rounded-lg p-6 pb-10">
            {/* Barra de análise de URL */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <span className="text-lg whitespace-nowrap">
                Analisar página de venda de um produto:
              </span>
              <div className="flex-1 flex gap-2">
                <Input
                  value={productUrl}
                  onChange={setProductUrl}
                  placeholder="https://example.com/product"
                  className="flex-1"
                />
                <Button
                  color="primary"
                  onClick={handleAnalyze}
                  isLoading={isAnalyzing}
                  isDisabled={!productUrl}
                >
                  Analisar
                </Button>
              </div>
            </div>

            {/* Erro de tráfego */}
            {trafficError && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-body text-destructive">{trafficError}</p>
              </div>
            )}

            {/* Resultados da análise de tráfego */}
            {trafficData && (() => {
              // Calcular variação percentual
              const monthlyEntries = Object.entries(trafficData.monthlyVisits).sort(([a], [b]) => a.localeCompare(b));
              const currentMonth = monthlyEntries[monthlyEntries.length - 1]?.[1] || 0;
              const previousMonth = monthlyEntries[monthlyEntries.length - 2]?.[1] || 0;
              const variation = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

              return (
                <div className="mt-6">
                  {/* Layout lado a lado: Info + Gráfico */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Lado esquerdo: Métricas + Screenshot em divs separadas */}
                    <div className="w-1/3.5 shrink-0 flex flex-col gap-4">
                      {/* Métricas */}
                      <div className="border border-border rounded-lg p-4 flex justify-between">
                        <div>
                        <span className="text-label text-muted-foreground">Tráfego Atual da página</span>
                        <p className="text-body font-medium text-foreground mt-1">{trafficData.siteName}</p>
                        </div>
                        <div className="text-end">
                          <span
                            className="text-6xl font-medium block"
                            style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}
                          >
                            {trafficData.engagements.visits.toLocaleString('pt-BR')}
                          </span>
                          <span className={`text-label font-medium ${variation >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {variation >= 0 ? '+' : ''}{variation.toFixed(0)}%
                            <span className="text-muted-foreground font-normal ml-1">comparado ao mês anterior</span>
                          </span>
                        </div>
                      </div>

                      {/* Browser Window Frame */}
                      {trafficData.screenshot && (
                        <div className="border border-border rounded-lg p-3">
                          <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
                            {/* Title Bar */}
                            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-accent/50 border-b border-border">
                              {/* Traffic Lights */}
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                                <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                                <div className="w-2 h-2 rounded-full bg-[#28CA41]" />
                              </div>
                              {/* URL Bar */}
                              <div className="flex-1 flex justify-center">
                                <div className="px-2 py-0.5 bg-background/50 rounded text-[10px] text-muted-foreground truncate max-w-[140px]">
                                  {trafficData.siteName}
                                </div>
                              </div>
                            </div>
                            {/* Screenshot */}
                            <img
                              src={trafficData.screenshot}
                              alt={trafficData.siteName}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lado direito: Gráfico de linha */}
                    {monthlyEntries.length > 0 && (
                      <div className="flex-1 border border-border rounded-lg p-4">
                        <h4 className="text-body font-medium text-foreground mb-4">Tráfego dos últimos 3 meses</h4>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={monthlyEntries.map(([date, visits]) => ({
                                month: new Date(date).toLocaleDateString('pt-BR', { month: 'short' }),
                                visitas: visits
                              }))}
                              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                            >
                              <defs>
                                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={{ stroke: 'hsl(var(--border))' }}
                              />
                              <YAxis
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                  return value.toString();
                                }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  color: 'hsl(var(--foreground))'
                                }}
                                formatter={(value) => value !== undefined ? [value.toLocaleString('pt-BR'), 'Visitas'] : ['', '']}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                              />
                              <Area
                                type="monotone"
                                dataKey="visitas"
                                stroke="hsl(var(--primary))"
                                fill="url(#colorVisitas)"
                                strokeWidth={0}
                              />
                              <Line
                                type="monotone"
                                dataKey="visitas"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Dropdown para distribuição por país */}
                        {trafficData.topCountries.length > 0 && (
                          <div className="mt-4 ">
                            <button
                              onClick={() => setShowDistribution(!showDistribution)}
                              className="flex hover:bg-accent p-2 rounded-2xl items-center gap-2 text-body text-muted-foreground font-semibold hover:text-foreground transition-colors"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${showDistribution ? 'rotate-180' : ''}`}
                              />
                              Ver distribuição por país
                            </button>

                            {/* Gráfico de distribuição */}
                            <div
                              className={`overflow-hidden transition-all duration-500 ease-out ${
                                showDistribution ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={trafficData.topCountries.slice(0, 5).map((country) => {
                                      const countryNames: Record<string, string> = {
                                        'US': 'EUA', 'BR': 'Brasil', 'PT': 'Portugal', 'ES': 'Espanha',
                                        'MX': 'México', 'AR': 'Argentina', 'CO': 'Colômbia', 'CL': 'Chile',
                                        'PE': 'Peru', 'GB': 'Reino Unido', 'DE': 'Alemanha', 'FR': 'França',
                                        'IT': 'Itália', 'CA': 'Canadá', 'AU': 'Austrália', 'IN': 'Índia',
                                        'JP': 'Japão', 'CN': 'China', 'KR': 'Coreia', 'RU': 'Rússia'
                                      };
                                      return {
                                        country: countryNames[country.code] || country.code,
                                        percentage: country.share * 100
                                      };
                                    })}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis
                                      dataKey="country"
                                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                      tickLine={false}
                                      axisLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <YAxis
                                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                      tickLine={false}
                                      axisLine={false}
                                      tickFormatter={(value) => `${value}%`}
                                      domain={[0, 100]}
                                    />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: 'hsl(var(--foreground))'
                                      }}
                                      formatter={(value) => value !== undefined ? [`${Number(value).toFixed(1)}%`, 'Tráfego'] : ['', '']}
                                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <Bar
                                      dataKey="percentage"
                                      fill={theme === 'dark' ? '#e5e7eb' : '#374151'}
                                      radius={[4, 4, 0, 0]}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
