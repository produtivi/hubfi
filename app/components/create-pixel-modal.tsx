'use client'

import { useState } from 'react'
import { X, CheckCircle, Download } from 'lucide-react'

interface CreatePixelModalProps {
  onClose: () => void
}

export function CreatePixelModal({ onClose }: CreatePixelModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    campaignConfirmation: false,
    gmailAccount: '',
    googleAdsAccount: '',
    conversionAction: '',
    presellUrl: ''
  })
  const [confirmations, setConfirmations] = useState({
    confirmation1: false,
    confirmation2: false,
    confirmation3: false,
    confirmation4: false,
    confirmation4b: false,
    confirmation5: false
  })

  const handleStepAdvance = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Finalizar criação do pixel
      console.log('Criando pixel com dados:', formData)
      onClose()
    }
  }

  // Verificar se todos os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    return (
      formData.campaignConfirmation &&
      formData.gmailAccount &&
      formData.googleAdsAccount &&
      formData.conversionAction &&
      formData.presellUrl
    )
  }

  // Verificar se todas as confirmações estão marcadas
  const areAllConfirmationsValid = () => {
    return (
      confirmations.confirmation1 &&
      confirmations.confirmation2 &&
      confirmations.confirmation3 &&
      (confirmations.confirmation4 || confirmations.confirmation4b)
    )
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Dados mockados para os selects
  const mockGmailAccounts = [
    'caioberto10@gmail.com',
    'contato@hubfi.com',
    'admin@exemplo.com'
  ]

  const mockGoogleAdsAccounts = [
    { id: '845-371-6990', name: 'OP - | 14:04 (845-371-6990)' },
    { id: '123-456-7890', name: 'Conta Principal (123-456-7890)' },
    { id: '987-654-3210', name: 'Conta Teste (987-654-3210)' }
  ]

  const mockConversionActions = [
    'Dental',
    'Compra',
    'Lead',
    'Cadastro',
    'Download'
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
              {/* Switch de confirmação */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.campaignConfirmation}
                    onChange={(e) => setFormData({...formData, campaignConfirmation: e.target.checked})}
                  />
                  <div className="relative w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-600"></div>
                  <span className="text-body">
                    Criei minha campanha no HubFi ou minha ação de conversão (pixel) está na MCC
                  </span>
                </label>
              </div>

              {/* Botão adicionar conta Google */}
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-accent transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-body">Adicionar conta Google</span>
              </button>

              {/* Suas contas do Gmail */}
              <div>
                <label className="block text-body mb-2">
                  Suas contas do Gmail
                </label>
                <select 
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.gmailAccount}
                  onChange={(e) => setFormData({...formData, gmailAccount: e.target.value})}
                >
                  <option value="">Escolha o email da conta</option>
                  {mockGmailAccounts.map((account) => (
                    <option key={account} value={account}>{account}</option>
                  ))}
                </select>
              </div>

              {/* Suas contas do Google ADS */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-body">Suas contas do Google ADS</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.googleAdsAccount}
                  onChange={(e) => setFormData({...formData, googleAdsAccount: e.target.value})}
                >
                  <option value="">Sua conta do google ADS</option>
                  {mockGoogleAdsAccounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>

              {/* Suas ações de conversão */}
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-body">Suas ações de conversão do Google ADS</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.conversionAction}
                  onChange={(e) => setFormData({...formData, conversionAction: e.target.value})}
                >
                  <option value="">Suas metas de conversão</option>
                  {mockConversionActions.map((action) => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              {/* URL da presell */}
              <div>
                <label className="block text-body mb-2">
                  Cole aqui o endereço (URL) da sua presell
                </label>
                <input
                  type="url"
                  placeholder=""
                  className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.presellUrl}
                  onChange={(e) => setFormData({...formData, presellUrl: e.target.value})}
                />
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
              <h2 className="text-headline">Resumo da criação do Pixel para Dental</h2>
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
                Após gerar o código do Pixel, não será mais possível editar
              </p>

              {/* Informações do resumo */}
              <div className="space-y-4">
                <div>
                  <p className="text-label text-muted-foreground mb-1">Sua conta do Gmail</p>
                  <p className="text-body font-medium">{formData.gmailAccount || 'caioberto10@gmail.com'}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Sua conta do Google ADS</p>
                  <p className="text-body font-medium">{formData.googleAdsAccount || 'OP - | 14:04 (845-371-6990)'}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Sua meta de conversão do Google ADS</p>
                  <p className="text-body font-medium">{formData.conversionAction || 'Dental'}</p>
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-1">Endereço da URL da sua presell</p>
                  <p className="text-body font-medium break-all">{formData.presellUrl || 'https://lojaonlineproducts.site/lojaonlineproductssite/teste/index.html'}</p>
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
                    Estou ciente que este Pixel só poderá ser instalado na presell que eu defini na etapa anterior.
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
                    Estou ciente que não poderei instalar mais de um Pixel na mesma presell.
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
                    Estou ciente que o Pixel não funciona com "links camuflados", encurtadores e etc.
                  </p>
                </label>

                <div className="p-4 bg-accent/30 rounded-md space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer hover:bg-accent/20 p-2 rounded transition-colors">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 accent-foreground cursor-pointer shrink-0"
                      checked={confirmations.confirmation4}
                      onChange={(e) => setConfirmations({...confirmations, confirmation4: e.target.checked, confirmation4b: false})}
                    />
                    <p className={`text-body transition-colors ${confirmations.confirmation4 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      O meu link de afiliado precisa estar nos botões da minha presell (não é permitido o uso do "pretty links" e os botão precisam ser do tipo "a href" - links html padrão)
                    </p>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer hover:bg-accent/20 p-2 rounded transition-colors">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 accent-foreground cursor-pointer shrink-0"
                      checked={confirmations.confirmation4b}
                      onChange={(e) => setConfirmations({...confirmations, confirmation4b: e.target.checked, confirmation4: false})}
                    />
                    <p className={`text-body transition-colors ${confirmations.confirmation4b ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      Minha página tem um formulário que acessa a API do produtor
                    </p>
                  </label>
                </div>

                <div className="mt-6">
                  <p className="text-body text-muted-foreground">
                    Presell que redireciona automático para o produtor ("presell fantasma") também não é permitido pelo Pixel pois Google ADS repudia essa prática.
                  </p>
                </div>
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
                    disabled={!areAllConfirmationsValid()}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      areAllConfirmationsValid() 
                        ? 'bg-white hover:bg-white/90 text-black cursor-pointer' 
                        : 'bg-border text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    Gerar código Pixel
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
                <h3 className="text-title mb-4">Pixel criado, agora vamos instalar na sua Presell</h3>
                <p className="text-body text-muted-foreground">
                  Clique em avançar para iniciar a instalação
                </p>
              </div>

              {/* Botão de ação */}
              <div className="flex justify-center">
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

        {currentStep === 4 && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-headline">Instalação Concluída</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Step 4 */}
            <div className="p-8 text-center">
              {/* Ícone de sucesso */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-background" />
                </div>
              </div>

              {/* Título de sucesso */}
              <h3 className="text-title text-foreground mb-4">Parabéns, tudo pronto!</h3>

              {/* Mensagem */}
              <p className="text-body text-muted-foreground mb-2">
                Seu <strong>Pixel</strong> foi instalado com sucesso
              </p>
              <p className="text-body text-muted-foreground">
                na sua <strong>Presell</strong>. Agora é só aguardar a sua primeira venda.
              </p>

              {/* Botão para fechar */}
              <button 
                onClick={onClose}
                className="mt-8 px-6 py-2 bg-white hover:bg-white/90 text-black rounded-md transition-colors"
              >
                Finalizar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}