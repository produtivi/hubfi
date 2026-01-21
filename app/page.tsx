'use client';

import { useState } from 'react';
import { BarChart03 as BarChart3, TrendUp02 as TrendingUp, CurrencyDollarCircle as DollarSign, CursorClick02 as MousePointerClick, PlayCircle as Play, Lightbulb02 as Lightbulb, TrendDown02 as TrendingDown } from '@untitledui/icons';
import { Select } from '@/components/base/select/select';
import type { Key } from 'react-aria-components';

export default function Home() {
  const [dateFilter, setDateFilter] = useState('7days');

  const stats = [
    // Primeira linha - Métricas Financeiras
    {
      label: 'Lucro Total',
      value: 'R$ 12.847',
      change: '+18%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      label: 'Receita Total',
      value: 'R$ 47.832',
      change: '+22%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      label: 'Investimento',
      value: 'R$ 34.985',
      change: '+8%',
      changeType: 'positive' as const,
      icon: TrendingDown,
    },
    // Segunda linha - Métricas de Performance
    {
      label: 'Total de Cliques',
      value: '3.842',
      change: '+156',
      changeType: 'positive' as const,
      icon: MousePointerClick,
    },
    {
      label: 'Taxa de Conversão',
      value: '3.2%',
      change: '+0.4%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      label: 'Produtos Ativos',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: BarChart3,
    },
  ];

  const tutorials = [
    {
      title: 'Como usar o HubFinder',
      duration: '5:30',
      thumbnail: '/placeholder-tutorial.jpg',
    },
    {
      title: 'Configurando sua primeira campanha',
      duration: '8:15',
      thumbnail: '/placeholder-tutorial.jpg',
    },
    {
      title: 'Análise de métricas avançadas',
      duration: '12:00',
      thumbnail: '/placeholder-tutorial.jpg',
    },
  ];

  const tips = [
    {
      title: 'Otimize suas campanhas',
      description: 'Use filtros avançados para encontrar produtos com melhor conversão.',
    },
    {
      title: 'Acompanhe tendências',
      description: 'Verifique o HubRanking diariamente para identificar oportunidades.',
    },
    {
      title: 'Teste diferentes criativos',
      description: 'Use o HubPage para criar múltiplas versões de landing pages.',
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-headline mb-2">Bem-vindo ao Hubfi</h1>
            <p className="text-body-muted">
              Aqui está um resumo do seu desempenho e recursos para te ajudar
            </p>
          </div>

          <div className="w-48">
            <span className="block text-label mb-1">Período</span>
            <Select
              placeholder="Selecione o período"
              selectedKey={dateFilter}
              onSelectionChange={(key: Key | null) => setDateFilter(key as string || '7days')}
              items={[
                { id: 'today', label: 'Hoje' },
                { id: '7days', label: 'Últimos 7 dias' },
                { id: '30days', label: 'Últimos 30 dias' },
                { id: '90days', label: 'Últimos 3 meses' },
                { id: '12months', label: 'Últimos 12 meses' },
                { id: 'all', label: 'Desde o início' }
              ]}
            >
              {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-md p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-accent rounded-md">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <span
                  className={`text-label font-medium ${stat.changeType === 'positive'
                    ? 'text-success'
                    : 'text-destructive'
                    }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-label mb-1">{stat.label}</p>
              <p className="text-display text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent rounded-md">
              <Play className="w-5 h-5 text-foreground" />
            </div>
            <h2 className="text-title">Tutoriais em Vídeo</h2>
          </div>

          <div className="space-y-4">
            {tutorials.map((tutorial, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-4 p-4 rounded-md hover:bg-accent transition-colors text-left"
              >
                <div className="w-24 h-16 bg-muted rounded-md flex items-center justify-center shrink-0">
                  <Play className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-body font-medium text-foreground mb-1">
                    {tutorial.title}
                  </h3>
                  <p className="text-label">{tutorial.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent rounded-md">
                <Lightbulb className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-title">Dicas Rápidas</h2>
            </div>

            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <h3 className="text-body font-medium text-foreground mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-label">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
