'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Activity, MousePointer, Target, Calendar, Download } from 'lucide-react'

interface Pixel {
  id: string
  pixelId: string
  name: string
  platform: string
  presellUrl: string
  visits: number
  clicks: number
  conversions: number
  lastConversion: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface AnalyticsEvent {
  id: string
  eventType: string
  timestamp: string
  url: string
  referrer: string
}

interface PixelAnalyticsModalProps {
  pixel: Pixel
  isOpen: boolean
  onClose: () => void
}

export function PixelAnalyticsModal({ pixel, isOpen, onClose }: PixelAnalyticsModalProps) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  useEffect(() => {
    if (isOpen && pixel) {
      loadEvents()
    }
  }, [isOpen, pixel, selectedPeriod])

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/pixels/${pixel.pixelId}/events?period=${selectedPeriod}`)
      const result = await response.json()
      
      if (result.success) {
        setEvents(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const ctr = pixel.visits > 0 ? ((pixel.clicks / pixel.visits) * 100) : 0
  const cvr = pixel.clicks > 0 ? ((pixel.conversions / pixel.clicks) * 100) : 0

  const exportToCsv = () => {
    const csvData = [
      ['Tipo de Evento', 'Data/Hora', 'URL', 'Referrer'],
      ...events.map(event => [
        event.eventType,
        new Date(event.timestamp).toLocaleString('pt-BR'),
        event.url,
        event.referrer || 'Direto'
      ])
    ]

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `pixel-${pixel.name}-analytics.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-title">Analytics - {pixel.name}</h2>
            <p className="text-body-muted mt-1">{pixel.platform}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Período Selector */}
          <div className="mb-6">
            <div className="flex gap-2">
              {[
                { value: '1d', label: 'Hoje' },
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: 'all', label: 'Tudo' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-foreground text-background'
                      : 'bg-card border border-border hover:bg-accent'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-label text-muted-foreground">Visitas</span>
              </div>
              <p className="text-title">{pixel.visits}</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-4 h-4 text-primary" />
                <span className="text-label text-muted-foreground">Cliques</span>
              </div>
              <p className="text-title">{pixel.clicks}</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-success" />
                <span className="text-label text-muted-foreground">Conversões</span>
              </div>
              <p className="text-title text-success">{pixel.conversions}</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-label text-muted-foreground">CTR</span>
              </div>
              <p className="text-title">{ctr.toFixed(1)}%</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-label text-muted-foreground">CVR</span>
              </div>
              <p className="text-title">{cvr.toFixed(1)}%</p>
            </div>
          </div>

          {/* Eventos Recentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-title">Eventos Recentes</h3>
              <button
                onClick={exportToCsv}
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-accent rounded-md transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>

            {isLoading ? (
              <div className="bg-background border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Carregando eventos...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="bg-background border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent">
                      <tr>
                        <th className="text-left px-4 py-3 text-label font-semibold">Tipo</th>
                        <th className="text-left px-4 py-3 text-label font-semibold">Data/Hora</th>
                        <th className="text-left px-4 py-3 text-label font-semibold">URL</th>
                        <th className="text-left px-4 py-3 text-label font-semibold">Referrer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event, index) => (
                        <tr key={event.id} className={index % 2 === 0 ? 'bg-card' : 'bg-background'}>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              event.eventType === 'visit' ? 'bg-primary/10 text-primary' :
                              event.eventType === 'click' ? 'bg-accent text-foreground' :
                              'bg-success/10 text-success'
                            }`}>
                              {event.eventType === 'visit' ? 'Visita' : 
                               event.eventType === 'click' ? 'Clique' : 'Conversão'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-body">
                            {new Date(event.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-body truncate max-w-xs" title={event.url}>
                            {event.url}
                          </td>
                          <td className="px-4 py-3 text-body truncate max-w-xs" title={event.referrer || 'Direto'}>
                            {event.referrer || 'Direto'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum evento encontrado no período selecionado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}