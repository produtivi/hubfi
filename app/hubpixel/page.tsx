'use client'

import { useState, useEffect } from 'react'
import { Activity, Eye, EyeOff, MoreVertical, Trash2, Edit2, X, ExternalLink, LayoutDashboard, FlaskConical, Shield, ShoppingCart, CheckCircle } from 'lucide-react'
import { SearchLg, Plus, FilterLines, CheckCircleBroken } from '@untitledui/icons'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ConfirmationModal } from '../components/confirmation-modal'
import { Toast } from '../components/ui/toast'
import { Button } from '@/components/base/buttons/button'
import { Input } from '@/components/base/input/input'

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
  const { resolvedTheme } = useTheme()
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
    onConfirm: () => { }
  })
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean
    pixelName: string
    pixelId: string
  }>({
    isOpen: false,
    pixelName: '',
    pixelId: ''
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

    // Verificar se há pixel recém-criado no sessionStorage
    const pixelCreated = sessionStorage.getItem('pixelCreated')
    if (pixelCreated) {
      try {
        const pixel = JSON.parse(pixelCreated)
        setSuccessModal({
          isOpen: true,
          pixelName: pixel.name,
          pixelId: pixel.pixelId
        })
        // Limpar sessionStorage após ler
        sessionStorage.removeItem('pixelCreated')
      } catch (e) {
        console.error('Erro ao ler pixel do sessionStorage:', e)
        sessionStorage.removeItem('pixelCreated')
      }
    }
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

  // Função para salvar nome do pixel
  const handleSavePixelName = async (pixelId: string, newName: string) => {
    if (!newName.trim()) {
      setEditingPixelId(null)
      return
    }

    try {
      const response = await fetch('/api/pixels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixelId, name: newName.trim() })
      })

      const result = await response.json()

      if (result.success) {
        // Atualizar o nome localmente
        setPixels(prev => prev.map(p =>
          p.pixelId === pixelId ? { ...p, name: newName.trim() } : p
        ))
        showToast('Nome atualizado com sucesso')
      } else {
        showToast('Erro ao atualizar nome', 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar nome:', error)
      showToast('Erro ao atualizar nome', 'error')
    }

    setEditingPixelId(null)
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
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-headline mb-2">HubPixel</h1>
        <p className="text-body-muted">
          Gerencie e monitore seus pixels de conversão
        </p>
      </div>

      {/* Barra de busca e ações */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Input de busca */}
        <div className="flex-1">
          <Input
            placeholder="Buscar pixels por nome ou plataforma..."
            value={searchQuery}
            onChange={(value: string) => setSearchQuery(value)}
            icon={SearchLg}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <Button
            color={showInactive ? 'primary' : 'secondary'}
            size="md"
            iconLeading={FilterLines}
            onClick={() => setShowInactive(!showInactive)}
            className="flex-1 md:flex-none"
          >
            {showInactive ? 'Ver Ativos' : 'Ver Inativos'}
          </Button>

          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={() => router.push('/hubpixel/create')}
            className="flex-1 md:flex-none"
          >
            Criar novo pixel
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-label text-muted-foreground">
          <span className="text-foreground font-medium">{filteredPixels.length}</span> pixels encontrados
        </p>
      </div>

      {/* Lista de pixels */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className="text-body text-muted-foreground">
            Carregando pixels...
          </p>
        </div>
      ) : filteredPixels.length > 0 ? (
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
          {filteredPixels.map((pixel) => (
            <div
              key={pixel.id}
              className="bg-card border border-border rounded-md p-4 md:px-6 md:pt-6 md:pb-4 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Header: Nome + Status + Menu */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {editingPixelId === pixel.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        id={`pixel-name-input-${pixel.id}`}
                        type="text"
                        defaultValue={pixel.name}
                        className="text-title bg-card border-b-2 border-primary outline-none px-1 flex-1 min-w-0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingPixelId(null)
                          } else if (e.key === 'Enter') {
                            handleSavePixelName(pixel.pixelId, e.currentTarget.value)
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`pixel-name-input-${pixel.id}`) as HTMLInputElement
                          if (input) handleSavePixelName(pixel.pixelId, input.value)
                        }}
                        className="p-1 hover:bg-accent rounded border border-border transition-colors shrink-0"
                        title="Salvar"
                      >
                        <CheckCircleBroken className="w-5 h-5 text-foreground" />
                      </button>
                      <button
                        onClick={() => setEditingPixelId(null)}
                        className="p-1 hover:bg-accent rounded border border-border transition-colors shrink-0"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-title truncate">{pixel.name}</h3>
                      <button
                        onClick={() => setEditingPixelId(pixel.id)}
                        className="p-1 hover:bg-accent rounded transition-colors shrink-0"
                        title="Editar nome"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-label whitespace-nowrap ${pixel.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                      }`}
                  >
                    {pixel.status === 'active' ? (
                      <>
                        <Activity className="w-3 h-3" />
                        <span className="hidden sm:inline">Ativo</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span className="hidden sm:inline">Inativo</span>
                      </>
                    )}
                  </span>

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
                      <div className="absolute right-0 mt-2 bg-card border border-border rounded-md shadow-lg z-10 p-2">
                        <Button
                          color={pixel.status === 'active' ? 'tertiary-destructive' : 'tertiary'}
                          size="sm"
                          iconLeading={pixel.status === 'active' ? EyeOff : Eye}
                          onClick={() => handleTogglePixelStatus(pixel)}
                          className="w-full justify-start"
                        >
                          {pixel.status === 'active' ? 'Desativar pixel' : 'Ativar pixel'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Link da presell */}
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                <a
                  href={pixel.presellUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-label text-muted-foreground hover:text-foreground transition-colors truncate"
                  title={pixel.presellUrl}
                >
                  {pixel.presellUrl}
                </a>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
                <Button
                  className={`p-2 border-0 shrink-0 ${resolvedTheme === 'dark' ? 'bg-white text-black hover:bg-white/80' : 'bg-black/90 text-white hover:bg-black/70'}`}
                  color="secondary"
                  size="sm"
                  iconLeading={LayoutDashboard}
                  onClick={() => router.push(`/hubpixel/dashboard/${pixel.pixelId}`)}
                >
                  Dashboard
                </Button>

                <div className="flex gap-2 min-w-0">
                  <Button
                    className="p-2 min-w-0 [&>span]:truncate"
                    color="secondary"
                    size="sm"
                    iconLeading={FlaskConical}
                    onClick={() => console.log('Testar instalação', pixel.pixelId)}
                  >
                    Testar instalação
                  </Button>

                  <Button
                    className="p-2 min-w-0 [&>span]:truncate"
                    color="secondary"
                    size="sm"
                    iconLeading={Shield}
                    onClick={() => console.log('Bloqueador de IPs', pixel.pixelId)}
                  >
                    Bloqueador de IPs
                  </Button>

                  <Button
                    className="p-2 min-w-0 [&>span]:truncate"
                    color="secondary"
                    size="sm"
                    iconLeading={ShoppingCart}
                    onClick={() => console.log('Configurar checkout', pixel.pixelId)}
                  >
                    Configurar checkout
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-md p-12 text-center">
          <p className={`text-body text-muted-foreground ${!showInactive ? 'mb-4' : ''}`}>
            {showInactive ? 'Nenhum pixel inativo encontrado' : 'Nenhum pixel encontrado'}
          </p>
          {!showInactive && (
            <Button
              color="primary"
              size="md"
              iconLeading={Plus}
              onClick={() => router.push('/hubpixel/create')}
            >
              Criar primeiro pixel
            </Button>
          )}
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

      {/* Modal de sucesso ao criar pixel */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
          />

          {/* Modal */}
          <div className="relative bg-card border border-border rounded-lg w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Pixel Criado com Sucesso!</h2>
              <button
                onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteudo */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-accent border border-border rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-title mb-4">Pixel criado com sucesso!</h3>
                <p className="text-body text-muted-foreground">
                  Seu pixel "{successModal.pixelName}" foi criado.
                </p>
              </div>

              {/* Botao de acao */}
              <div className="flex justify-center">
                <Button
                  color="primary"
                  size="md"
                  onClick={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Toast */}
      {toast.isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            isVisible={toast.isVisible}
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
          />
        </div>
      )}
    </div>
  )
}