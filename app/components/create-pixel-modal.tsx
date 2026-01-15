'use client'

import { useState } from 'react'
import { X, CheckCircle, Download, Copy } from 'lucide-react'

interface CreatePixelModalProps {
  onClose: () => void
  onPixelCreated?: (pixel: any) => void
}

export function CreatePixelModal({ onClose, onPixelCreated }: CreatePixelModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [createdPixel, setCreatedPixel] = useState<any>(null)
  const [trackingCode, setTrackingCode] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    presellUrl: ''
  })
  const [confirmations, setConfirmations] = useState({
    confirmation1: false,
    confirmation2: false,
    confirmation3: false,
    confirmation4: false
  })

  const handleStepAdvance = async () => {
    if (currentStep === 1) {
      // Validar formulário antes de avançar
      if (!isFormValid()) {
        alert('Preencha todos os campos obrigatórios')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Criar pixel
      await createPixel()
    } else if (currentStep === 3) {
      // Gerar código
      await generateTrackingCode()
    } else {
      // Finalizar
      onClose()
    }
  }

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.platform &&
      formData.presellUrl.trim()
    )
  }

  const createPixel = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setCreatedPixel(result.data)
        onPixelCreated?.(result.data)
        setCurrentStep(3)
      } else {
        alert('Erro ao criar pixel: ' + result.error)
      }
    } catch (error) {
      alert('Erro ao criar pixel')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTrackingCode = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/pixels/${createdPixel.pixelId}/code`)
      const result = await response.json()
      
      if (result.success) {
        setTrackingCode(result.data.trackingCode)
        setCurrentStep(4)
      } else {
        alert('Erro ao gerar código: ' + result.error)
      }
    } catch (error) {
      alert('Erro ao gerar código')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode)
    alert('Código copiado!')
  }

  const areAllConfirmationsValid = () => {
    return (
      confirmations.confirmation1 &&
      confirmations.confirmation2 &&
      confirmations.confirmation3 &&
      confirmations.confirmation4
    )
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const platforms = [
    { id: 'hotmart', name: 'Hotmart' },
    { id: 'braip', name: 'Braip' },
    { id: 'monetizze', name: 'Monetizze' },
    { id: 'eduzz', name: 'Eduzz' },
    { id: 'kiwify', name: 'Kiwify' },
    { id: 'clickbank', name: 'ClickBank' },
    { id: 'warriorplus', name: 'WarriorPlus' },
    { id: 'outros', name: 'Outros' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {currentStep === 1 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Criar Novo Pixel</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário Step 1 */}
            <div className="p-6 space-y-6">
              {/* Nome do Pixel */}
              <div>
                <label className="block text-body mb-2">
                  Nome do Pixel
                </label>
                <input
                  type="text"
                  placeholder="Ex: Hotmart - Curso de Marketing"
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Plataforma */}
              <div>
                <label className="block text-body mb-2">
                  Plataforma de Afiliados
                </label>
                <select 
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                >
                  <option value="">Selecione a plataforma</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>{platform.name}</option>
                  ))}
                </select>
              </div>

              {/* URL da presell */}
              <div>
                <label className="block text-body mb-2">
                  URL da sua Presell
                </label>
                <input
                  type="url"
                  placeholder="https://suapresell.com"
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.presellUrl}
                  onChange={(e) => setFormData({...formData, presellUrl: e.target.value})}
                />
                <p className="text-label text-muted-foreground mt-2">
                  O pixel funcionará apenas nesta URL
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 border border-border bg-card hover:bg-accent text-foreground rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleStepAdvance}
                  className="px-6 py-2 bg-white hover:bg-white/90 text-black rounded-md transition-colors"
                >
                  Avançar
                </button>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Resumo da criação do Pixel</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Step 2 */}
            <div className="p-6 space-y-6">
              <p className="text-body text-muted-foreground">
                Confirme as informações antes de criar o pixel
              </p>

              {/* Informações do resumo */}
              <div className="space-y-4">
                <div>
                  <p className="text-label text-muted-foreground mb-1">Nome do Pixel</p>
                  <p className="text-body font-medium">{formData.name}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Plataforma</p>
                  <p className="text-body font-medium">{platforms.find(p => p.id === formData.platform)?.name}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">URL da Presell</p>
                  <p className="text-body font-medium break-all">{formData.presellUrl}</p>
                </div>
              </div>

              {/* Cards de avisos */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-accent/30 rounded-md cursor-pointer hover:bg-accent/40 transition-colors">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-foreground cursor-pointer shrink-0"
                    checked={confirmations.confirmation1}
                    onChange={(e) => setConfirmations({...confirmations, confirmation1: e.target.checked})}
                  />
                  <p className={`text-body transition-colors ${confirmations.confirmation1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Estou ciente que este Pixel só funcionará na URL da presell definida acima.
                  </p>
                </label>

                <label className="flex items-start gap-3 p-4 bg-accent/30 rounded-md cursor-pointer hover:bg-accent/40 transition-colors">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-foreground cursor-pointer shrink-0"
                    checked={confirmations.confirmation2}
                    onChange={(e) => setConfirmations({...confirmations, confirmation2: e.target.checked})}
                  />
                  <p className={`text-body transition-colors ${confirmations.confirmation2 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Entendo que os links de afiliado devem ser tags HTML padrão (a href), não links camuflados ou encurtadores.
                  </p>
                </label>

                <label className="flex items-start gap-3 p-4 bg-accent/30 rounded-md cursor-pointer hover:bg-accent/40 transition-colors">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-foreground cursor-pointer shrink-0"
                    checked={confirmations.confirmation3}
                    onChange={(e) => setConfirmations({...confirmations, confirmation3: e.target.checked})}
                  />
                  <p className={`text-body transition-colors ${confirmations.confirmation3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Confirmo que minha presell não faz redirecionamento automático para o produtor.
                  </p>
                </label>

                <label className="flex items-start gap-3 p-4 bg-accent/30 rounded-md cursor-pointer hover:bg-accent/40 transition-colors">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 accent-foreground cursor-pointer shrink-0"
                    checked={confirmations.confirmation4}
                    onChange={(e) => setConfirmations({...confirmations, confirmation4: e.target.checked})}
                  />
                  <p className={`text-body transition-colors ${confirmations.confirmation4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    Aceito os termos e condições do HubFi Pixel Tracking.
                  </p>
                </label>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-between pt-4">
                <button 
                  onClick={handleBack}
                  className="px-6 py-2 border border-border bg-card hover:bg-accent text-foreground rounded-md transition-colors"
                >
                  Voltar
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleStepAdvance}
                    disabled={!areAllConfirmationsValid() || isLoading}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      areAllConfirmationsValid() && !isLoading
                        ? 'bg-white hover:bg-white/90 text-black cursor-pointer' 
                        : 'bg-border text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? 'Criando...' : 'Criar Pixel'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Pixel Criado com Sucesso!</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Step 3 */}
            <div className="p-6">
              {/* Progress visual */}
              <div className="flex items-center justify-center mb-8 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-card border border-border rounded-md flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-label text-foreground font-medium">Criar Pixel</span>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-border"></div>
                  <div className="mx-2">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="w-8 h-0.5 bg-border"></div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-accent border border-border rounded-md flex items-center justify-center mb-2">
                    <Download className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <span className="text-label text-muted-foreground">Instalar Pixel</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-title mb-4">Pixel criado com sucesso!</h3>
                <p className="text-body text-muted-foreground mb-4">
                  Seu pixel "{createdPixel?.name}" foi criado.
                </p>
                <div className="bg-card border border-border rounded-md p-4">
                  <p className="text-label text-muted-foreground mb-1">ID do Pixel</p>
                  <p className="text-body font-medium font-mono">{createdPixel?.pixelId}</p>
                </div>
              </div>

              {/* Botão de ação */}
              <div className="flex justify-center">
                <button 
                  onClick={handleStepAdvance}
                  disabled={isLoading}
                  className="px-6 py-2 bg-white hover:bg-white/90 text-black rounded-md transition-colors"
                >
                  {isLoading ? 'Gerando código...' : 'Gerar código de instalação'}
                </button>
              </div>
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Código de Instalação</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Step 4 */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-title mb-4">Instale este código na sua presell</h3>
                <p className="text-body text-muted-foreground">
                  Cole o código abaixo antes da tag <code className="bg-accent px-2 py-1 rounded">&lt;/head&gt;</code> da sua presell
                </p>
              </div>

              {/* Código de tracking */}
              <div className="relative">
                <pre className="bg-card border border-border rounded-md p-4 text-sm overflow-x-auto max-h-64 text-foreground">
                  <code>{trackingCode}</code>
                </pre>
                <button 
                  onClick={copyTrackingCode}
                  className="absolute top-2 right-2 p-2 bg-background hover:bg-accent rounded-md transition-colors border border-border"
                  title="Copiar código"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Instruções */}
              <div className="bg-accent/30 rounded-md p-4">
                <h4 className="text-body font-medium mb-2">Instruções importantes:</h4>
                <ul className="text-label text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Cole o código antes da tag <code>&lt;/head&gt;</code></li>
                  <li>Funciona apenas na URL: {formData.presellUrl}</li>
                  <li>Use links de afiliado padrão (a href)</li>
                  <li>Evite encurtadores e links camuflados</li>
                </ul>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-between">
                <button 
                  onClick={copyTrackingCode}
                  className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-accent rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copiar código
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-white hover:bg-white/90 text-black rounded-md transition-colors"
                >
                  Finalizar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}