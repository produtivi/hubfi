'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Filter, Activity, Eye, EyeOff, MoreVertical, Copy, Trash2, Edit2, X, ExternalLink, LayoutDashboard, FlaskConical, Shield, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ConfirmationModal } from '../components/confirmation-modal'
import { Toast } from '../components/ui/toast'

interface Pixel {
  id: string
  pixelId: string
  name: string
  platform: string
  presellUrl: string
  visits: number
  uniqueVisits: number
  cleanVisits: number
  paidTrafficVisits: number
  clicks: number
  checkouts: number
  sales: number
  conversions: number
  bounceRate: number
  blockedIps: number
  lastConversion: string
  status: 'active' | 'inactive'
  createdAt: string
}

export default function PixelTracker() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [toast, setToast] = useState<{
    isVisible: boolean
    message: string
    type: 'success' | 'error'
  }>({ isVisible: false, message: '', type: 'success' })
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [editingPixelId, setEditingPixelId] = useState<string | null>(null)
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'activate' | 'deactivate'
    confirmText?: string
    isLoading?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })

  // Carregar pixels da API
  const loadPixels = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/pixels')
      const result = await response.json()
      
      if (result.success) {
        // Transformar dados da API para o formato da interface
        const transformedPixels = result.data.map((pixel: any) => ({
          id: pixel.id.toString(),
          pixelId: pixel.pixelId,
          name: pixel.name,
          platform: pixel.platform,
          presellUrl: pixel.presellUrl,
          visits: pixel.visits,
          uniqueVisits: pixel.uniqueVisits || 0,
          cleanVisits: pixel.cleanVisits || 0,
          paidTrafficVisits: pixel.paidTrafficVisits || 0,
          clicks: pixel.clicks,
          checkouts: pixel.checkouts || 0,
          sales: pixel.sales || 0,
          conversions: pixel.conversions,
          bounceRate: pixel.bounceRate || 0,
          blockedIps: pixel.blockedIps || 0,
          lastConversion: (pixel.sales || pixel.conversions) > 0 ? 'Recente' : 'Nunca',
          status: pixel.status,
          createdAt: new Date(pixel.createdAt).toLocaleDateString('pt-BR')
        }))
        setPixels(transformedPixels)
      }
    } catch (error) {
      console.error('Erro ao carregar pixels:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPixels()
  }, [])

  // Recarregar pixels quando a página ficar visível novamente (voltando da criação)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPixels()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', loadPixels)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', loadPixels)
    }
  }, [])

  const filteredPixels = pixels.filter(pixel => {
    const matchesSearch = pixel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pixel.platform.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = showInactive ? pixel.status === 'inactive' : pixel.status === 'active'
    return matchesSearch && matchesStatus
  })

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdownId])

  // Função para copiar código do pixel
  // Função para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ isVisible: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }))
    }, 3000)
  }

  // Função para copiar código do pixel
  const handleCopyPixelCode = async (pixelId: string) => {
    try {
      const response = await fetch(`/api/pixels/${pixelId}/code`)
      const result = await response.json()
      
      if (result.success) {
        await navigator.clipboard.writeText(result.data.trackingCode)
        showToast('Código copiado para a área de transferência!', 'success')
      } else {
        showToast('Erro ao obter código do pixel', 'error')
      }
    } catch (err) {
      console.error('Erro ao copiar código:', err)
      showToast('Erro ao copiar código', 'error')
    }
  }


  // Função para toggle do pixel
  const handleTogglePixelStatus = (pixel: Pixel) => {
    const action = pixel.status === 'active' ? 'desativar' : 'ativar'
    const actionPast = pixel.status === 'active' ? 'desativado' : 'ativado'
    
    // Se for ativar, executa direto sem modal
    if (pixel.status === 'inactive') {
      executeTogglePixelStatus(pixel, actionPast)
      return
    }
    
    // Se for desativar, mostra modal de confirmação
    setConfirmationModal({
      isOpen: true,
      title: 'Desativar pixel',
      message: `Tem certeza que deseja desativar o pixel <strong>"${pixel.name}"</strong>? Ele vai parar de registrar eventos de tracking.`,
      confirmText: 'Desativar',
      type: 'deactivate',
      onConfirm: () => executeTogglePixelStatus(pixel, actionPast)
    })
  }

  // Função para executar o toggle do pixel
  const executeTogglePixelStatus = async (pixel: Pixel, actionPast: string) => {
    try {
      setConfirmationModal(prev => ({ ...prev, isLoading: true }))

      const response = await fetch(`/api/pixels/${pixel.pixelId}/toggle`, {
        method: 'PATCH'
      })
      
      const result = await response.json()
      
      if (result.success) {
        loadPixels() // Recarregar lista
        setOpenDropdownId(null) // Fechar dropdown
        setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }))
        
        // Se ativou um pixel, mostrar ativos
        if (pixel.status === 'inactive') {
          setShowInactive(false)
        }
      } else {
        setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }))
        console.error('Erro API:', result.error)
      }
    } catch (error) {
      console.error('Erro ao alterar status do pixel:', error)
      setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }))
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-headline mb-2">HubPixel</h1>
        <p className="text-body-muted">
          Gerencie e monitore seus pixels de conversão
        </p>
      </div>

      {/* Barra de busca e ações */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Input de busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar pixels por nome ou plataforma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-md text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-4 py-3 rounded-md transition-colors ${
              showInactive 
                ? 'bg-accent text-foreground' 
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>{showInactive ? 'Inativos' : 'Ativos'}</span>
          </button>
          
          <button
            onClick={() => router.push('/pixel-tracker/create')}
            className="flex items-center gap-2 px-4 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Criar novo pixel</span>
          </button>
        </div>
      </div>

      {/* Lista de pixels */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-body text-muted-foreground">
            Carregando pixels...
          </p>
        </div>
      ) : filteredPixels.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPixels.map((pixel) => (
            <div
              key={pixel.id}
              className="bg-card border border-border rounded-md p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-row justify-between items-start pb-5">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2 group">
                        {editingPixelId === pixel.id ? (
                          <input
                            type="text"
                            defaultValue={pixel.name}
                            className="text-title bg-card border-b-2 border-primary outline-none px-1"
                            autoFocus
                            onBlur={() => setEditingPixelId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape' || e.key === 'Enter') {
                                setEditingPixelId(null)
                              }
                            }}
                          />
                        ) : (
                          <>
                            <h3 className="text-title">{pixel.name}</h3>
                            <button
                              onClick={() => setEditingPixelId(pixel.id)}
                              className="p-1 hover:bg-accent rounded transition-colors"
                              title="Editar nome"
                            >
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* Link da presell */}
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={pixel.presellUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-label text-muted-foreground hover:text-foreground transition-colors truncate max-w-xs"
                          title={pixel.presellUrl}
                        >
                          {pixel.presellUrl}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-label ${pixel.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {pixel.status === 'active' ? (
                          <>
                            <Activity className="w-3 h-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inativo
                          </>
                        )}
                      </span>

                      {/* Botão Dashboard */}
                      <button
                        onClick={() => router.push(`/pixel-tracker/dashboard/${pixel.pixelId}`)}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-accent rounded-md transition-colors"
                        title="Dashboard"
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-label text-muted-foreground">Dashboard</span>
                      </button>

                      {/* Menu de ações */}
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === pixel.id ? null : pixel.id)}
                          className="p-2 hover:bg-accent rounded-md transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {/* Dropdown menu */}
                        {openDropdownId === pixel.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-10">
                            <button 
                              onClick={() => handleTogglePixelStatus(pixel)}
                              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                                pixel.status === 'active' 
                                  ? 'text-destructive hover:bg-destructive/10' 
                                  : 'text-success hover:bg-success/10'
                              }`}
                            >
                              {pixel.status === 'active' ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  <span className="text-body">Desativar pixel</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  <span className="text-body">Ativar pixel</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-label text-muted-foreground mb-1">Visitas</p>
                      <p className="text-body font-semibold">{pixel.visits}</p>
                    </div>
                    <div>
                      <p className="text-label text-muted-foreground mb-1">Cliques</p>
                      <p className="text-body font-semibold">{pixel.clicks}</p>
                    </div>
                    <div>
                      <p className="text-label text-muted-foreground mb-1">Criado em</p>
                      <p className="text-body">{pixel.createdAt}</p>
                    </div>
                  </div>

                  {/* Ações adicionais */}
                  <div className="flex flex-row justify-between mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => handleCopyPixelCode(pixel.pixelId)}
                      className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-accent text-foreground rounded-md transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copiar código</span>
                    </button>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => console.log('Testar instalação', pixel.pixelId)}
                        className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-accent text-foreground rounded-md transition-colors text-sm"
                        title="Testar instalação"
                      >
                        <FlaskConical className="w-4 h-4" />
                        <span>Testar instalação</span>
                      </button>
                      
                      <button
                        onClick={() => console.log('Bloqueador de IPs', pixel.pixelId)}
                        className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-accent text-foreground rounded-md transition-colors text-sm"
                        title="Bloqueador de IPs"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Bloqueador de IPs</span>
                      </button>
                      
                      <button
                        onClick={() => console.log('Configurar checkout', pixel.pixelId)}
                        className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-accent text-foreground rounded-md transition-colors text-sm"
                        title="Configurar checkout"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Configurar checkout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-body text-muted-foreground mb-4">
            Nenhum pixel encontrado
          </p>
          <button
            onClick={() => router.push('/pixel-tracker/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-black hover:bg-accent/80 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Criar primeiro pixel</span>
          </button>
        </div>
      )}


      {/* Modal de confirmação */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        isLoading={confirmationModal.isLoading}
      />


      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}