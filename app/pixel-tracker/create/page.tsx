'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';

interface Presell {
  id: string;
  name: string;
  url: string;
  domain: string | null;
}

export default function CreatePixel() {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    selectedGmail: '',
    selectedGoogleAds: '',
    selectedConversionAction: '',
    useFiltermagic: false,
    selectedPlatform: '',
    useProductStructure: false,
    useHubPage: false,
    selectedPresell: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Dados mockados para os selects
  const gmailAccounts = [
    'caio@hubfi.com',
    'marketing@hubfi.com',
    'ads@hubfi.com'
  ];

  const platforms = [
    'Hotmart',
    'Braip',
    'Eduzz',
    'Monetizze',
    'Kiwify',
    'Pepper',
    'Ticto',
    'Lastlink',
    'Others'
  ];

  const [presellPages, setPresellPages] = useState<Presell[]>([]);
  const [isLoadingPresells, setIsLoadingPresells] = useState(false);

  // Buscar presells quando o componente montar
  useEffect(() => {
    const fetchPresells = async () => {
      setIsLoadingPresells(true);
      try {
        const response = await fetch('/api/presells'); // Buscará todas as presells em dev
        if (!response.ok) throw new Error('Failed to fetch presells');
        const data = await response.json();

        // Mapear os dados para o formato esperado
        if (data.success && data.data) {
          const mappedPresells = data.data.map((presell: any) => ({
            id: presell.id.toString(),
            name: presell.pageName,
            url: presell.fullUrl || presell.slug,
            domain: presell.domain?.domainName || null
          }));
          setPresellPages(mappedPresells);
        } else {
          setPresellPages([]);
        }
      } catch (error) {
        console.error('Error fetching presells:', error);
        showError('Erro ao carregar páginas');
      } finally {
        setIsLoadingPresells(false);
      }
    };

    fetchPresells();
  }, []);

  const googleAdsAccounts = [
    { id: 'ads1', name: 'Sua conta do google ADS', account: '123-456-7890' },
    { id: 'ads2', name: 'Conta Secundária ADS', account: '098-765-4321' }
  ];

  const conversionActions = [
    { id: 'conv1', name: 'Suas metas de conversão', type: 'Compra' },
    { id: 'conv2', name: 'Lead Generation', type: 'Formulário' },
    { id: 'conv3', name: 'Newsletter Signup', type: 'Email' }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Se estiver mudando a plataforma e for para vazio, desmarcar checkboxes
      if (field === 'selectedPlatform' && !value) {
        newData.useProductStructure = false;
        newData.useHubPage = false;
        newData.selectedPresell = '';
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implementar criação real do pixel

      // Simular criação
      setTimeout(() => {
        showSuccess('Pixel criado com sucesso!');
        setTimeout(() => {
          router.push('/pixel-tracker');
        }, 1500);
        setIsLoading(false);
      }, 1000);

      return;

    } catch (error) {
      console.error('Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-headline">Criar Novo Pixel</h1>
            <p className="text-label text-muted-foreground">
              Configure os detalhes do seu pixel de tracking
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

            {/* Switch para Filtermagic */}
            <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-md border border-border">
              <div className="relative">
                <input
                  id="useFiltermagic"
                  type="checkbox"
                  checked={formData.useFiltermagic}
                  onChange={(e) => handleInputChange('useFiltermagic', e.target.checked)}
                  className="sr-only"
                />
                <label
                  htmlFor="useFiltermagic"
                  className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${formData.useFiltermagic ? 'bg-primary' : 'bg-border'
                    }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.useFiltermagic ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`}
                  />
                </label>
              </div>
              <span className="text-body font-medium">
                Criei minha campanha no Filtermagic ou minha ação de conversão (pixel) está na MCC
              </span>
            </div>

            {/* Campos principais */}
            <div className="space-y-6">
              {/* Suas contas do Gmail */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Suas contas do Gmail <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedGmail}
                    onChange={(e) => handleInputChange('selectedGmail', e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Escolha o email da conta</option>
                    {gmailAccounts.map((email) => (
                      <option key={email} value={email}>{email}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Suas contas do Google ADS */}
              <div className="space-y-3">
                <label className={`text-body font-medium ${!formData.selectedGmail ? 'text-muted-foreground' : ''}`}>
                  Suas contas do Google ADS <span className="text-destructive">*</span>
                  {!formData.selectedGmail && (
                    <span className="text-label text-muted-foreground font-normal ml-2">
                      (Selecione um Gmail primeiro)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedGoogleAds}
                    onChange={(e) => handleInputChange('selectedGoogleAds', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border rounded-md text-body appearance-none outline-none transition-all ${!formData.selectedGmail
                        ? 'bg-accent/50 border-border text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent'
                      }`}
                    required
                    disabled={!formData.selectedGmail}
                  >
                    <option value="">
                      {!formData.selectedGmail ? 'Suas contas do Google ADS' : 'Sua conta do google ADS'}
                    </option>
                    {googleAdsAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {account.account}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${!formData.selectedGmail ? 'text-muted-foreground/50' : 'text-muted-foreground'
                    }`} />
                </div>
              </div>

              {/* Suas ações de conversão do Google ADS */}
              <div className="space-y-3">
                <label className={`text-body font-medium ${!formData.selectedGoogleAds ? 'text-muted-foreground' : ''}`}>
                  Suas ações de conversão do Google ADS <span className="text-destructive">*</span>
                  {!formData.selectedGoogleAds && (
                    <span className="text-label text-muted-foreground font-normal ml-2">
                      (Selecione uma conta Google Ads primeiro)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedConversionAction}
                    onChange={(e) => handleInputChange('selectedConversionAction', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border rounded-md text-body appearance-none outline-none transition-all ${!formData.selectedGoogleAds
                        ? 'bg-accent/50 border-border text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent'
                      }`}
                    required
                    disabled={!formData.selectedGoogleAds}
                  >
                    <option value="">
                      {!formData.selectedGoogleAds ? 'Suas ações de conversão do Google ADS' : 'Suas metas de conversão'}
                    </option>
                    {conversionActions.map((action) => (
                      <option key={action.id} value={action.id}>
                        {action.name} - {action.type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${!formData.selectedGoogleAds ? 'text-muted-foreground/50' : 'text-muted-foreground'
                    }`} />
                </div>
              </div>

              {/* Plataforma */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Plataforma <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedPlatform}
                    onChange={(e) => handleInputChange('selectedPlatform', e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Selecione a plataforma</option>
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Checkboxes mutuamente exclusivos */}
              <div className="space-y-4">
                <label className="text-body font-medium">Configuração da página</label>

                {/* Utilizar estrutura do produto */}
                <div className="flex items-start gap-3 mt-2">
                  <div className="relative flex items-center">
                    <input
                      id="useProductStructure"
                      type="checkbox"
                      checked={formData.useProductStructure}
                      onChange={(e) => {
                        if (!formData.selectedPlatform) return;
                        const checked = e.target.checked;
                        handleInputChange('useProductStructure', checked);
                        if (checked) {
                          handleInputChange('useHubPage', false);
                          handleInputChange('selectedPresell', '');
                        }
                      }}
                      className={`w-5 h-5 border-2 rounded transition-colors ${!formData.selectedPlatform
                          ? 'border-border bg-accent/50 cursor-not-allowed opacity-60'
                          : formData.useHubPage
                            ? 'border-border bg-accent/50 opacity-60 cursor-pointer'
                            : 'border-border bg-background focus:ring-2 focus:ring-primary checked:bg-primary checked:border-primary cursor-pointer'
                        }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {formData.useProductStructure && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <label htmlFor="useProductStructure" className={`cursor-pointer ${!formData.selectedPlatform ? 'text-muted-foreground' : formData.useHubPage ? 'text-muted-foreground' : 'text-body'
                    }`}>
                    Utilizar a estrutura do produto
                    {!formData.selectedPlatform && (
                      <span className="text-label text-muted-foreground font-normal ml-2">
                        (Selecione uma plataforma primeiro)
                      </span>
                    )}
                  </label>
                </div>

                {/* Utilizar página do HubPage */}
                <div className="flex items-start gap-3">
                  <div className="relative flex items-center">
                    <input
                      id="useHubPage"
                      type="checkbox"
                      checked={formData.useHubPage}
                      onChange={(e) => {
                        if (!formData.selectedPlatform) return;
                        const checked = e.target.checked;
                        handleInputChange('useHubPage', checked);
                        if (checked) {
                          handleInputChange('useProductStructure', false);
                        } else {
                          handleInputChange('selectedPresell', '');
                        }
                      }}
                      className={`w-5 h-5 border-2 rounded transition-colors ${!formData.selectedPlatform
                          ? 'border-border bg-accent/50 cursor-not-allowed opacity-60'
                          : formData.useProductStructure
                            ? 'border-border bg-accent/50 opacity-60 cursor-pointer'
                            : 'border-border bg-background focus:ring-2 focus:ring-primary checked:bg-primary checked:border-primary cursor-pointer'
                        }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {formData.useHubPage && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <label htmlFor="useHubPage" className={`cursor-pointer ${!formData.selectedPlatform ? 'text-muted-foreground' : formData.useProductStructure ? 'text-muted-foreground' : 'text-body'
                    }`}>
                    Utilizar página do HubPage
                    {!formData.selectedPlatform && (
                      <span className="text-label text-muted-foreground font-normal ml-2">
                        (Selecione uma plataforma primeiro)
                      </span>
                    )}
                  </label>
                </div>

                {/* Select de presells - aparece apenas quando HubPage está selecionado */}
                {formData.useHubPage && (
                  <div className="space-y-3 mt-4">
                    <label className="text-body font-medium">
                      Selecione a presell <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.selectedPresell}
                        onChange={(e) => handleInputChange('selectedPresell', e.target.value)}
                        className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        required
                      >
                        <option value="">
                          {isLoadingPresells ? 'Carregando páginas...' : 'Escolha uma presell'}
                        </option>
                        {presellPages.map((presell) => (
                          <option key={presell.id} value={presell.id}>
                            {presell.name} {presell.domain ? `(${presell.domain})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}
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
                disabled={isLoading || (!formData.useProductStructure && !formData.useHubPage) || (formData.useHubPage && !formData.selectedPresell)}
                className="flex items-center gap-2 px-8 py-3 rounded-md transition-colors font-medium bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isLoading && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isLoading ? 'Avançando...' : 'Avançar'}</span>
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