'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';

export default function CreatePresell() {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [formData, setFormData] = useState({
    domain: '',
    pageName: '',
    affiliateLink: '',
    producerSalesPage: '',
    presellType: '',
    presellLanguage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [presellTypes, setPresellTypes] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Carregar domínios e tipos do banco
  useEffect(() => {
    loadDomainsAndTypes();
  }, []);

  const loadDomainsAndTypes = async () => {
    try {
      setIsLoadingData(true);
      
      // Carregar domínios
      const domainsResponse = await fetch('/api/domains');
      const domainsResult = await domainsResponse.json();
      
      if (domainsResult.success) {
        setDomains(domainsResult.data.map((domain: any) => domain.domainName));
      }
      
      // Carregar tipos de presell
      const typesResponse = await fetch('/api/presell-templates');
      const typesResult = await typesResponse.json();
      
      if (typesResult.success) {
        setPresellTypes(typesResult.data.map((template: any) => template.name));
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados do formulário');
    } finally {
      setIsLoadingData(false);
    }
  };

  const languages = [
    'Português',
    'Inglês',
    'Espanhol'
  ];

  const waitForScreenshot = async (presellId: number): Promise<void> => {
    return new Promise((resolve) => {
      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/presells/${presellId}/screenshot-status`);
          const result = await response.json();

          if (result.success && !result.data.isProcessing) {
            resolve();
          } else {
            setTimeout(checkStatus, 3000); // Verificar a cada 3 segundos
          }
        } catch (error) {
          console.error('Erro ao verificar status do screenshot:', error);
          // Continuar mesmo com erro após 30 segundos
          setTimeout(() => resolve(), 30000);
        }
      };

      // Começar a verificar após 2 segundos (dar tempo do processo começar)
      setTimeout(checkStatus, 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Pegar userId real da sessão/auth
      const userId = 1;

      const response = await fetch('/api/presells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain: formData.domain,
          pageName: formData.pageName,
          affiliateLink: formData.affiliateLink,
          producerSalesPage: formData.producerSalesPage,
          presellType: formData.presellType,
          presellLanguage: formData.presellLanguage
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar presell');
      }

      console.log('Presell criada:', result.data);
      const presellId = result.data.id;
      
      // Aguardar screenshot ficar pronto
      await waitForScreenshot(presellId);
      
      // Mostrar toast de sucesso
      showSuccess(`Página "${formData.pageName}" criada com sucesso!`);
      
      // Redirecionar
      setTimeout(() => {
        router.push('/page-builder');
      }, 1000);
      
    } catch (error) {
      console.error('Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Carregando dados...</span>
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
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-headline">Criar Nova Presell</h1>
            <p className="text-label text-muted-foreground">
              Configure os detalhes da sua página de pré-venda
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="w-full">
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-6">
                <p className="text-destructive text-body">{error}</p>
              </div>
            )}

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Domínio */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Domínio <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Escolha o domínio</option>
                    {domains.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Nome da página */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Nome da página <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pageName}
                  onChange={(e) => setFormData({...formData, pageName: e.target.value})}
                  placeholder="Informe o nome da sua página"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Link de Afiliado */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Link de Afiliado <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.affiliateLink}
                  onChange={(e) => setFormData({...formData, affiliateLink: e.target.value})}
                  placeholder="Informe o link de afiliado"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Página de vendas do produtor */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Página de vendas do produtor <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.producerSalesPage}
                  onChange={(e) => setFormData({...formData, producerSalesPage: e.target.value})}
                  placeholder="Informe a página de vendas"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Tipo de Presell */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Tipo de Presell <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.presellType}
                    onChange={(e) => setFormData({...formData, presellType: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {presellTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Idioma da Presell */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Idioma <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.presellLanguage}
                    onChange={(e) => setFormData({...formData, presellLanguage: e.target.value})}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Selecione o idioma</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>


            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-border bg-background hover:bg-accent text-foreground rounded-md transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-md transition-colors font-medium bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isLoading && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isLoading ? 'Criando...' : 'Criar Presell'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

    </div>
  );
}
