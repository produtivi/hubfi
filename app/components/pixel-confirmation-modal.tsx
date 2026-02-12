'use client'

import { useState } from 'react'
import { X, CheckCircle, Copy } from 'lucide-react'
import { Button } from '@/components/base/buttons/button'

interface PixelData {
  name: string
  platform: string
  googleAccountId: string
  googleAdsCustomerId: string
  conversionActionId: string
  useMcc: boolean
  presellId?: string
  presellUrl?: string
  // Dados para exibição
  gmailEmail?: string
  googleAdsAccountName?: string
  conversionActionName?: string
  presellName?: string
}

interface PixelConfirmationModalProps {
  pixelData: PixelData
  onClose: () => void
  onSuccess: () => void
  onError: (message: string) => void
  onPixelCreated?: (pixel: any) => void
}

export function PixelConfirmationModal({ pixelData, onClose, onSuccess, onError, onPixelCreated }: PixelConfirmationModalProps) {
  const [currentStep, setCurrentStep] = useState(1) // 1: Resumo, 2: Criado, 3: Código
  const [isLoading, setIsLoading] = useState(false)
  const [createdPixel, setCreatedPixel] = useState<any>(null)
  const [trackingCode, setTrackingCode] = useState('')

  const createPixel = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pixelData.name,
          platform: pixelData.platform,
          googleAccountId: pixelData.googleAccountId,
          googleAdsCustomerId: pixelData.googleAdsCustomerId,
          conversionActionId: pixelData.conversionActionId,
          useMcc: pixelData.useMcc,
          presellId: pixelData.presellId,
          presellUrl: pixelData.presellUrl,
        })
      })

      const result = await response.json()

      if (result.success) {
        setCreatedPixel(result.data)
        // Salvar no sessionStorage para mostrar modal na página de lista
        sessionStorage.setItem('pixelCreated', JSON.stringify(result.data))
        if (onPixelCreated) {
          onPixelCreated(result.data)
        } else {
          setCurrentStep(2)
        }
      } else {
        onError('Erro ao criar pixel: ' + result.error)
      }
    } catch (error) {
      onError('Erro ao criar pixel')
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
        setCurrentStep(3)
      } else {
        onError('Erro ao gerar código: ' + result.error)
      }
    } catch (error) {
      onError('Erro ao gerar código')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode)
  }

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
              <div>
                <h2 className="text-headline">Resumo da criação do Pixel</h2>
                {pixelData.presellUrl && (
                  <p className="text-label text-muted-foreground mt-1">
                    {pixelData.presellUrl}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteudo */}
            <div className="p-6 space-y-6">

              {/* Informacoes do resumo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-label text-muted-foreground mb-1">Nome do Pixel</p>
                  <p className="text-body font-medium">{pixelData.name}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Plataforma</p>
                  <p className="text-body font-medium">{pixelData.platform}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Conta Google</p>
                  <p className="text-body font-medium">{pixelData.gmailEmail}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Conta Google Ads</p>
                  <p className="text-body font-medium">{pixelData.googleAdsAccountName} ({pixelData.googleAdsCustomerId})</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Acao de Conversao</p>
                  <p className="text-body font-medium">{pixelData.conversionActionName}</p>
                </div>

                {pixelData.presellName && (
                  <div>
                    <p className="text-label text-muted-foreground mb-1">Presell</p>
                    <p className="text-body font-medium">{pixelData.presellName}</p>
                  </div>
                )}
              </div>

              {/* Botoes de acao */}
              <div className="flex justify-between pt-4">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={onClose}
                >
                  Voltar
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={createPixel}
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  showTextWhileLoading
                >
                  {isLoading ? 'Criando...' : 'Criar Pixel'}
                </Button>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Pixel Criado com Sucesso!</h2>
              <button
                onClick={onSuccess}
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
                <p className="text-body text-muted-foreground mb-4">
                  Seu pixel "{createdPixel?.name}" foi criado.
                </p>
                <div className="bg-card border border-border rounded-md p-4 inline-block">
                  <p className="text-label text-muted-foreground mb-1">ID do Pixel</p>
                  <p className="text-body font-medium font-mono">{createdPixel?.pixelId}</p>
                </div>
              </div>

              {/* Botao de acao */}
              <div className="flex justify-center gap-4">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={onSuccess}
                >
                  Ir para lista de pixels
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={generateTrackingCode}
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  showTextWhileLoading
                >
                  {isLoading ? 'Gerando codigo...' : 'Gerar codigo de instalacao'}
                </Button>
              </div>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Codigo de Instalacao</h2>
              <button
                onClick={onSuccess}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteudo */}
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-title mb-4">Instale este codigo na sua presell</h3>
                <p className="text-body text-muted-foreground">
                  Cole o codigo abaixo antes da tag <code className="bg-accent px-2 py-1 rounded">&lt;/head&gt;</code> da sua presell
                </p>
              </div>

              {/* Codigo de tracking */}
              <div className="relative">
                <pre className="bg-card border border-border rounded-md p-4 text-sm overflow-x-auto max-h-64 text-foreground">
                  <code>{trackingCode}</code>
                </pre>
                <button
                  onClick={copyTrackingCode}
                  className="absolute top-2 right-2 p-2 bg-background hover:bg-accent rounded-md transition-colors border border-border"
                  title="Copiar codigo"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Instrucoes */}
              <div className="bg-accent/30 rounded-md p-4">
                <h4 className="text-body font-medium mb-2">Instrucoes importantes:</h4>
                <ul className="text-label text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Cole o codigo antes da tag &lt;/head&gt;</li>
                  <li>Use links de afiliado padrao (a href)</li>
                  <li>Evite encurtadores e links camuflados</li>
                </ul>
              </div>

              {/* Botoes de acao */}
              <div className="flex justify-between">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={copyTrackingCode}
                  iconLeading={Copy}
                >
                  Copiar codigo
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={onSuccess}
                >
                  Finalizar
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
