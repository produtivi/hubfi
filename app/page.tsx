'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Play, Lightbulb, BookOpen } from 'lucide-react';

export default function Home() {
  const [dateFilter, setDateFilter] = useState('7days');

  const stats = [
    {
      label: 'Receita Total',
      value: 'R$ 47.500',
      change: '+12%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      label: 'Produtos Ativos',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: BarChart3,
    },
    {
      label: 'Taxa de Conversão',
      value: '3.2%',
      change: '+0.4%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      label: 'Visitantes',
      value: '12.4k',
      change: '-2%',
      changeType: 'negative' as const,
      icon: Users,
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

          <div>
            <label className="block text-label mb-2">Período</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-md text-label focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 3 meses</option>
              <option value="12months">Últimos 12 meses</option>
              <option value="all">Desde o início</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-card border border-border rounded-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent rounded-md">
                <BookOpen className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-title">Documentação</h2>
            </div>
            <p className="text-body-muted mb-4">
              Acesse nossa documentação completa para aprender mais sobre todas as funcionalidades.
            </p>
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 transition-colors text-label font-medium">
              Acessar Documentação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
