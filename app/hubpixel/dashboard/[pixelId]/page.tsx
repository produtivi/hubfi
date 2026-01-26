'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, Activity, CheckCircle } from 'lucide-react';
import { Cursor02, CursorBox } from '@untitledui/icons';

interface PixelInfo {
  id: string;
  pixelId: string;
  name: string;
  platform: string;
  presellUrl: string;
  status: string;
  createdAt: string;
  clicks: number;
  sales: number;
  bounceRate: number;
}

interface DashboardParams {
  params: Promise<{ pixelId: string }>;
}

const PRESET_FILTERS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: '7 dias', value: '7days' },
  { label: '30 dias', value: '30days' }
];

export default function PixelDashboard({ params }: DashboardParams) {
  const router = useRouter();
  const [pixelId, setPixelId] = useState<string>('');
  const [pixelInfo, setPixelInfo] = useState<PixelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('7days');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setPixelId(resolvedParams.pixelId);
      loadPixelInfo(resolvedParams.pixelId);
    };
    loadParams();
  }, [params]);

  const loadPixelInfo = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pixels');
      const result = await response.json();
      
      if (result.success) {
        const pixel = result.data.find((p: any) => p.pixelId === id);
        if (pixel) {
          setPixelInfo({
            id: pixel.id.toString(),
            pixelId: pixel.pixelId,
            name: pixel.name,
            platform: pixel.platform,
            presellUrl: pixel.presellUrl,
            status: pixel.status,
            createdAt: new Date(pixel.createdAt).toLocaleDateString('pt-BR'),
            clicks: pixel.clicks || 0,
            sales: pixel.sales || 0,
            bounceRate: pixel.bounceRate || 0
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar informações do pixel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterValue: string) => {
    setSelectedFilter(filterValue);
    // TODO: Implementar lógica de filtro de data
  };

  const handleCustomDateChange = () => {
    // TODO: Implementar filtro de data personalizada
    setSelectedFilter('custom');
  };

  // Dados reais do pixel
  const metricsData = pixelInfo ? [
    {
      title: 'Cliques no Google',
      value: '--', // TODO: Buscar do Google Ads API
      change: '--',
      trend: 'neutral',
      icon: Cursor02,
      color: 'text-foreground'
    },
    {
      title: 'Cliques na página',
      value: pixelInfo.clicks?.toString() || '0',
      change: '--',
      trend: 'neutral',
      icon: CursorBox,
      color: 'text-foreground'
    },
    {
      title: 'Conversão',
      value: pixelInfo.sales?.toString() || '0',
      change: '--',
      trend: 'neutral',
      icon: CheckCircle,
      color: 'text-foreground'
    },
    {
      title: 'Taxa de Fuga',
      value: pixelInfo.bounceRate?.toFixed(1) + '%' || '0.0%',
      change: '--',
      trend: 'neutral',
      icon: Activity,
      color: 'text-foreground'
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-body text-muted-foreground">
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex justify-between items-center gap-3 mb-2">
              <h1 className="text-headline">Dashboard: {pixelInfo?.name || 'Carregando...'}</h1>
              {pixelInfo && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-label ${
                  pixelInfo.status === 'active' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-muted/10 text-muted-foreground'
                }`}>
                  <Activity className="w-3 h-3" />
                  {pixelInfo.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              )}
            </div>
            <p className="text-body-muted">
              Análise detalhada de performance
            </p>
          </div>
        </div>
      </div>

      {/* Filtros de Data */}
      <div className="bg-card border border-border rounded-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-title">Filtros de Período</h2>
        </div>

        {/* Filtros predefinidos */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESET_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border hover:bg-accent'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Período customizado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-label text-muted-foreground mb-2">
              Data inicial
            </label>
            <input
              type="date"
              value={customDateRange.startDate}
              onChange={(e) => setCustomDateRange(prev => ({ 
                ...prev, 
                startDate: e.target.value 
              }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          <div>
            <label className="block text-label text-muted-foreground mb-2">
              Data final
            </label>
            <input
              type="date"
              value={customDateRange.endDate}
              onChange={(e) => setCustomDateRange(prev => ({ 
                ...prev, 
                endDate: e.target.value 
              }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCustomDateChange}
              disabled={!customDateRange.startDate || !customDateRange.endDate}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar Período
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-md p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-md bg-accent ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-label font-medium ${
                  metric.trend === 'up' ? 'text-success' : 
                  metric.trend === 'down' ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {metric.change}
                </span>
              </div>
              
              <div>
                <h3 className="text-label text-muted-foreground mb-1">
                  {metric.title}
                </h3>
                <p className="text-title font-semibold">
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder para gráficos futuros */}
      <div className="mt-6 bg-card border border-border rounded-md p-6">
        <h2 className="text-title mb-4">Gráficos de Performance</h2>
        <div className="h-64 bg-accent/20 rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">
            Gráficos serão implementados quando as métricas estiverem funcionando
          </p>
        </div>
      </div>
    </div>
  );
}