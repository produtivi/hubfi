'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';
import { PixelConfirmationModal } from '../../components/pixel-confirmation-modal';

interface Presell {
  id: string;
  name: string;
  url: string;
  domain: string | null;
}

interface GoogleAccount {
  id: number;
  email: string;
}

interface GoogleAdsAccount {
  customerId: string;
  accountName: string;
  isManager: boolean;
  isTestAccount: boolean;
  mccId?: string;
}

interface ConversionAction {
  id: string;
  name: string;
  status: string;
}

export default function CreatePixel() {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    useConversionName: true, // Por padrão usa o nome da ação de conversão
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pixelDataForModal, setPixelDataForModal] = useState<any>(null);

  // Estados para dados do banco
  const [gmailAccounts, setGmailAccounts] = useState<GoogleAccount[]>([]);
  const [googleAdsAccounts, setGoogleAdsAccounts] = useState<GoogleAdsAccount[]>([]);
  const [conversionActions, setConversionActions] = useState<ConversionAction[]>([]);
  const [isLoadingGmails, setIsLoadingGmails] = useState(false);
  const [isLoadingAdsAccounts, setIsLoadingAdsAccounts] = useState(false);
  const [isLoadingConversions, setIsLoadingConversions] = useState(false);

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
        const response = await fetch('/api/presells');
        if (!response.ok) throw new Error('Failed to fetch presells');
        const data = await response.json();

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

  // Buscar contas Gmail ao montar
  useEffect(() => {
    const fetchGmails = async () => {
      setIsLoadingGmails(true);
      try {
        const response = await fetch('/api/settings/gmails');
        if (!response.ok) throw new Error('Failed to fetch gmails');
        const data = await response.json();

        if (data.success && data.data) {
          setGmailAccounts(data.data);
        }
      } catch (error) {
        console.error('Error fetching gmails:', error);
      } finally {
        setIsLoadingGmails(false);
      }
    };

    fetchGmails();
  }, []);

  // Buscar contas Google Ads quando Gmail for selecionado
  const fetchGoogleAdsAccounts = async (googleAccountId: string) => {
    if (!googleAccountId) {
      setGoogleAdsAccounts([]);
      return;
    }

    setIsLoadingAdsAccounts(true);
    try {
      const response = await fetch(`/api/google-ads/list-accounts?googleAccountId=${googleAccountId}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setGoogleAdsAccounts(data.data);
      } else {
        setGoogleAdsAccounts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar contas Google Ads:', error);
      setGoogleAdsAccounts([]);
    } finally {
      setIsLoadingAdsAccounts(false);
    }
  };

  // Buscar ações de conversão quando conta Google Ads for selecionada
  const fetchConversionActions = async (googleAccountId: string, customerId: string, mccId?: string) => {
    if (!googleAccountId || !customerId) {
      setConversionActions([]);
      return;
    }

    setIsLoadingConversions(true);
    try {
      let url = `/api/google-ads/conversion-actions?googleAccountId=${googleAccountId}&customerId=${customerId}`;
      if (mccId) {
        url += `&mccId=${mccId}`;
      }
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.data) {
        setConversionActions(data.data);
      } else {
        setConversionActions([]);
      }
    } catch (error) {
      console.error('Erro ao buscar ações de conversão:', error);
      setConversionActions([]);
    } finally {
      setIsLoadingConversions(false);
    }
  };

  // Handler para seleção de Gmail
  const handleGmailSelect = (gmailId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGmail: gmailId,
      selectedGoogleAds: '',
      selectedConversionAction: ''
    }));
    setGoogleAdsAccounts([]);
    setConversionActions([]);
    if (gmailId) {
      fetchGoogleAdsAccounts(gmailId);
    }
  };

  // Handler para seleção de conta Google Ads
  const handleGoogleAdsSelect = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedGoogleAds: customerId,
      selectedConversionAction: ''
    }));
    setConversionActions([]);
    if (customerId && formData.selectedGmail) {
      // Encontrar a conta selecionada para pegar o mccId
      const selectedAccount = googleAdsAccounts.find(acc => acc.customerId === customerId);
      fetchConversionActions(formData.selectedGmail, customerId, selectedAccount?.mccId);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Se estiver mudando o switch Filtermagic/MCC, limpar seleção de conta e conversão
      if (field === 'useFiltermagic') {
        newData.selectedGoogleAds = '';
        newData.selectedConversionAction = '';
        setConversionActions([]);
      }

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
    setError('');

    // Determinar o nome do pixel
    let pixelName: string;
    if (formData.useConversionName) {
      const selectedAction = conversionActions.find(a => a.id === formData.selectedConversionAction);
      pixelName = selectedAction?.name || '';
    } else {
      pixelName = formData.name || '';
    }

    // Encontrar a presell selecionada para pegar a URL
    const selectedPresell = presellPages.find(p => p.id === formData.selectedPresell);
    const presellUrl = selectedPresell ? `${selectedPresell.domain || ''}/${selectedPresell.url}` : '';

    // Preparar dados para o modal
    const pixelData = {
      name: pixelName,
      platform: formData.selectedPlatform,
      googleAccountId: formData.selectedGmail,
      googleAdsCustomerId: formData.selectedGoogleAds,
      conversionActionId: formData.selectedConversionAction,
      useMcc: formData.useFiltermagic,
      presellId: formData.useHubPage ? formData.selectedPresell : undefined,
      presellUrl: formData.useHubPage ? presellUrl : undefined,
      // Dados extras para exibição no modal
      gmailEmail: gmailAccounts.find(g => g.id.toString() === formData.selectedGmail)?.email,
      googleAdsAccountName: googleAdsAccounts.find(a => a.customerId === formData.selectedGoogleAds)?.accountName,
      conversionActionName: conversionActions.find(a => a.id === formData.selectedConversionAction)?.name,
      presellName: selectedPresell?.name,
    };

    setPixelDataForModal(pixelData);
    setShowConfirmationModal(true);
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
                  className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    formData.useFiltermagic ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.useFiltermagic ? 'translate-x-6' : 'translate-x-0.5'
                    } translate-y-0.5`}
                  />
                </label>
              </div>
              <span className="text-body font-medium">
                Criei minha campanha no HubCampaign ou minha ação de conversão (pixel) está na MCC
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
                    onChange={(e) => handleGmailSelect(e.target.value)}
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                    disabled={isLoadingGmails}
                  >
                    <option value="">
                      {isLoadingGmails ? 'Carregando...' : 'Escolha o email da conta'}
                    </option>
                    {gmailAccounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.email}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {gmailAccounts.length === 0 && !isLoadingGmails && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma conta Google conectada.{' '}
                    <a href="/settings" className="text-primary hover:underline">
                      Conecte uma conta
                    </a>
                  </p>
                )}
              </div>

              {/* Suas contas do Google ADS */}
              <div className="space-y-3">
                <label className={`text-body font-medium ${!formData.selectedGmail ? 'text-muted-foreground' : ''}`}>
                  {formData.useFiltermagic ? 'Suas MCCs' : 'Suas contas do Google ADS'} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedGoogleAds}
                    onChange={(e) => handleGoogleAdsSelect(e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border rounded-md text-body appearance-none outline-none transition-all ${
                      !formData.selectedGmail || isLoadingAdsAccounts
                        ? 'bg-accent/50 border-border text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent'
                    }`}
                    required
                    disabled={!formData.selectedGmail || isLoadingAdsAccounts}
                  >
                    <option value="">
                      {isLoadingAdsAccounts
                        ? 'Carregando contas...'
                        : formData.useFiltermagic
                          ? 'Selecione uma MCC'
                          : 'Selecione uma conta Google Ads'}
                    </option>
                    {googleAdsAccounts
                      .filter(acc => !acc.isTestAccount && (formData.useFiltermagic ? acc.isManager : !acc.isManager))
                      .map((account) => (
                        <option key={account.customerId} value={account.customerId}>
                          {account.accountName.includes(account.customerId)
                            ? account.accountName
                            : `${account.accountName} - ${account.customerId}`}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    !formData.selectedGmail ? 'text-muted-foreground/50' : 'text-muted-foreground'
                  }`} />
                </div>
                {formData.selectedGmail && !isLoadingAdsAccounts &&
                  googleAdsAccounts.filter(acc => !acc.isTestAccount && (formData.useFiltermagic ? acc.isManager : !acc.isManager)).length === 0 && (
                  <p className="text-label text-muted-foreground">
                    {formData.useFiltermagic
                      ? 'Nenhuma MCC encontrada para este Gmail'
                      : 'Nenhuma subconta encontrada para este Gmail'}
                  </p>
                )}
              </div>

              {/* Suas ações de conversão do Google ADS */}
              <div className="space-y-3">
                <label className={`text-body font-medium ${!formData.selectedGoogleAds ? 'text-muted-foreground' : ''}`}>
                  Suas ações de conversão do Google ADS <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.selectedConversionAction}
                    onChange={(e) => handleInputChange('selectedConversionAction', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border rounded-md text-body appearance-none outline-none transition-all ${
                      !formData.selectedGoogleAds || isLoadingConversions
                        ? 'bg-accent/50 border-border text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent'
                    }`}
                    required
                    disabled={!formData.selectedGoogleAds || isLoadingConversions}
                  >
                    <option value="">
                      {isLoadingConversions ? 'Carregando ações...' : 'Selecione uma ação de conversão'}
                    </option>
                    {conversionActions.map((action) => (
                      <option key={action.id} value={action.id}>
                        {action.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                    !formData.selectedGoogleAds ? 'text-muted-foreground/50' : 'text-muted-foreground'
                  }`} />
                </div>
                {formData.selectedGoogleAds && !isLoadingConversions && conversionActions.length === 0 && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma ação de conversão encontrada.{' '}
                    <a href="/settings" className="text-primary hover:underline">
                      Crie uma ação de conversão
                    </a>
                  </p>
                )}
              </div>

              {/* Nome do Pixel */}
              <div className="space-y-3">
                <label className={`text-body font-medium ${!formData.selectedConversionAction ? 'text-muted-foreground' : ''}`}>
                  Nome do Pixel <span className="text-destructive">*</span>
                </label>

                {/* Switch para escolher entre nome da conversão ou customizado */}
                <div className={`flex items-center gap-2 ${!formData.selectedConversionAction ? 'opacity-60' : ''}`}>
                  <div className="relative">
                    <input
                      id="useConversionName"
                      type="checkbox"
                      checked={formData.useConversionName}
                      onChange={(e) => handleInputChange('useConversionName', e.target.checked)}
                      className="sr-only"
                      disabled={!formData.selectedConversionAction}
                    />
                    <label
                      htmlFor="useConversionName"
                      className={`block w-10 h-5 rounded-full transition-colors ${
                        !formData.selectedConversionAction ? 'cursor-not-allowed' : 'cursor-pointer'
                      } ${formData.useConversionName ? 'bg-primary' : 'bg-border'}`}
                    >
                      <span
                        className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          formData.useConversionName ? 'translate-x-5' : 'translate-x-0.5'
                        } translate-y-0.5`}
                      />
                    </label>
                  </div>
                  <span className={`text-label ${!formData.selectedConversionAction ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                    Usar nome da ação de conversão
                  </span>
                </div>

                {/* Input de nome - mostra nome da conversão ou input customizado */}
                {formData.useConversionName ? (
                  <input
                    type="text"
                    value={conversionActions.find(a => a.id === formData.selectedConversionAction)?.name || ''}
                    readOnly
                    placeholder="Nome da ação de conversão"
                    className="w-full px-4 py-3 bg-accent/50 border border-border rounded-md text-body text-muted-foreground cursor-not-allowed"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite o nome do pixel"
                    className={`w-full px-4 py-3 border rounded-md text-body outline-none transition-all ${
                      !formData.selectedConversionAction
                        ? 'bg-accent/50 border-border text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-background border-border focus:ring-2 focus:ring-primary focus:border-transparent'
                    }`}
                    disabled={!formData.selectedConversionAction}
                    required={!formData.useConversionName}
                  />
                )}
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
                      className={`w-5 h-5 border-2 rounded transition-colors ${
                        !formData.selectedPlatform 
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
                  <label htmlFor="useProductStructure" className={`cursor-pointer ${
                    !formData.selectedPlatform ? 'text-muted-foreground' : formData.useHubPage ? 'text-muted-foreground' : 'text-body'
                  }`}>
                    Utilizar a estrutura do produto
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
                      className={`w-5 h-5 border-2 rounded transition-colors ${
                        !formData.selectedPlatform 
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
                  <label htmlFor="useHubPage" className={`cursor-pointer ${
                    !formData.selectedPlatform ? 'text-muted-foreground' : formData.useProductStructure ? 'text-muted-foreground' : 'text-body'
                  }`}>
                    Utilizar página do HubPage
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

      {/* Modal de Confirmação */}
      {showConfirmationModal && pixelDataForModal && (
        <PixelConfirmationModal
          pixelData={pixelDataForModal}
          onClose={() => setShowConfirmationModal(false)}
          onSuccess={() => {
            setShowConfirmationModal(false);
            showSuccess('Pixel criado com sucesso!');
            router.push('/pixel-tracker');
          }}
          onError={(message) => {
            showError(message);
          }}
        />
      )}

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