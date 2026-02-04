'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';
import { PixelConfirmationModal } from '../../components/pixel-confirmation-modal';
import { TooltipHelp } from '../../components/ui/tooltip-help';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import type { Key } from 'react-aria-components';

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

  // Buscar presells do usuário quando o componente montar
  useEffect(() => {
    const fetchPresells = async () => {
      setIsLoadingPresells(true);
      try {
        // Primeiro buscar o userId do usuário logado
        let userId;
        try {
          const userResponse = await fetch('/api/auth/me');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.user.id;
          }
        } catch {
          console.error('Erro ao buscar usuário');
        }

        // Buscar presells do usuário
        const url = userId ? `/api/presells?userId=${userId}` : '/api/presells';
        const response = await fetch(url);
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
    // url já vem como fullUrl completa (https://domain/slug) ou apenas o slug
    const presellUrl = selectedPresell?.url?.startsWith('http')
      ? selectedPresell.url
      : selectedPresell && selectedPresell.domain
        ? `https://${selectedPresell.domain}/${selectedPresell.url}`
        : '';

    // Preparar dados para o modal
    const pixelData = {
      name: pixelName,
      platform: formData.selectedPlatform,
      googleAccountId: formData.selectedGmail,
      googleAdsCustomerId: formData.selectedGoogleAds,
      conversionActionId: formData.selectedConversionAction,
      useMcc: formData.useFiltermagic,
      presellId: formData.selectedPresell,
      presellUrl: presellUrl,
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
    <div className="min-h-screen p-6 md:p-8">
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
                Criei minha campanha no HubCampaign ou minha ação de conversão (pixel) está na MCC
              </span>
            </div>

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Suas contas do Gmail */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Conta Google <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione a conta Google conectada que possui acesso ao Google Ads." />
                </span>
                <Select
                  placeholder={isLoadingGmails ? 'Carregando...' : 'Escolha o email da conta'}
                  selectedKey={formData.selectedGmail || null}
                  onSelectionChange={(key: Key | null) => handleGmailSelect(key as string || '')}
                  items={gmailAccounts.map((account) => ({ id: account.id.toString(), label: account.email }))}
                  isRequired
                  isDisabled={isLoadingGmails}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
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
              <div className="space-y-1">
                <span className={`text-body font-medium flex items-center gap-2 ${!formData.selectedGmail ? 'text-muted-foreground' : ''}`}>
                  {formData.useFiltermagic ? 'MCC' : 'Conta Google Ads'} <span className="text-destructive">*</span>
                  <TooltipHelp text={formData.useFiltermagic ? 'Selecione a MCC onde sua ação de conversão foi criada.' : 'Selecione a conta Google Ads onde sua ação de conversão foi criada.'} />
                </span>
                <Select
                  placeholder={isLoadingAdsAccounts ? 'Carregando contas...' : formData.useFiltermagic ? 'Selecione uma MCC' : 'Selecione uma conta Google Ads'}
                  selectedKey={formData.selectedGoogleAds || null}
                  onSelectionChange={(key: Key | null) => handleGoogleAdsSelect(key as string || '')}
                  items={googleAdsAccounts
                    .filter(acc => !acc.isTestAccount && (formData.useFiltermagic ? acc.isManager : !acc.isManager))
                    .map((account) => ({
                      id: account.customerId,
                      label: account.accountName.includes(account.customerId)
                        ? account.accountName
                        : `${account.accountName} - ${account.customerId}`
                    }))}
                  isRequired
                  isDisabled={!formData.selectedGmail || isLoadingAdsAccounts}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {formData.selectedGmail && !isLoadingAdsAccounts &&
                  googleAdsAccounts.filter(acc => !acc.isTestAccount && (formData.useFiltermagic ? acc.isManager : !acc.isManager)).length === 0 && (
                    <p className="text-label text-muted-foreground">
                      {formData.useFiltermagic
                        ? 'Nenhuma MCC encontrada para este Gmail'
                        : 'Nenhuma conta Google Ads encontrada para este Gmail'}
                    </p>
                  )}
              </div>

              {/* Suas ações de conversão do Google ADS */}
              <div className="space-y-1">
                <span className={`text-body font-medium flex items-center gap-2 ${!formData.selectedGoogleAds ? 'text-muted-foreground' : ''}`}>
                  Ação de Conversão <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione a ação de conversão que será disparada quando houver uma venda." />
                </span>
                <Select
                  placeholder={isLoadingConversions ? 'Carregando ações...' : 'Selecione uma ação de conversão'}
                  selectedKey={formData.selectedConversionAction || null}
                  onSelectionChange={(key: Key | null) => handleInputChange('selectedConversionAction', key as string || '')}
                  items={conversionActions.map((action) => ({ id: action.id, label: action.name }))}
                  isRequired
                  isDisabled={!formData.selectedGoogleAds || isLoadingConversions}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {formData.selectedGoogleAds && !isLoadingConversions && conversionActions.length === 0 && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma ação de conversão encontrada.{' '}
                    <a href="/settings" className="text-primary hover:underline">
                      Crie uma ação de conversão
                    </a>
                  </p>
                )}
              </div>

              {/* Plataforma */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Plataforma <span className="text-destructive">*</span>
                  <TooltipHelp text="Plataforma onde o produto está hospedado (Hotmart, Kiwify, etc)." />
                </span>
                <Select
                  placeholder="Selecione a plataforma"
                  selectedKey={formData.selectedPlatform || null}
                  onSelectionChange={(key: Key | null) => handleInputChange('selectedPlatform', key as string || '')}
                  items={platforms.map((platform) => ({ id: platform, label: platform }))}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>

              {/* Página do HubPage */}
              <div className="space-y-1">
                <span className={`text-body font-medium flex items-center gap-2 ${!formData.selectedPlatform ? 'text-muted-foreground' : ''}`}>
                  Página do HubPage <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione uma página criada no HubPage para vincular ao pixel." />
                </span>
                <Select
                  placeholder={isLoadingPresells ? 'Carregando páginas...' : 'Selecione sua página'}
                  selectedKey={formData.selectedPresell || null}
                  onSelectionChange={(key: Key | null) => handleInputChange('selectedPresell', key as string || '')}
                  items={presellPages.map((presell) => ({
                    id: presell.id,
                    label: presell.name + (presell.domain ? ` (${presell.domain})` : '')
                  }))}
                  isRequired
                  isDisabled={!formData.selectedPlatform || isLoadingPresells}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {formData.selectedPlatform && presellPages.length === 0 && !isLoadingPresells && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma página encontrada.{' '}
                    <a href="/hubpage/create-presell" className="text-primary hover:underline">
                      Criar uma página
                    </a>
                  </p>
                )}
              </div>

              {/* Nome do Pixel */}
              <div className="space-y-1">
                <span className={`text-body font-medium flex items-center gap-2 ${!formData.selectedConversionAction ? 'text-muted-foreground' : ''}`}>
                  Nome do Pixel <span className="text-destructive">*</span>
                  <TooltipHelp text="Nome para identificar o pixel. Pode usar o nome da ação de conversão ou definir um personalizado." />
                </span>

                {/* Switch para escolher entre nome da conversão ou customizado */}
                <div className={`flex items-center gap-2 mb-2 ${!formData.selectedConversionAction ? 'opacity-60' : ''}`}>
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
                      className={`block w-10 h-5 rounded-full transition-colors ${!formData.selectedConversionAction ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${formData.useConversionName ? 'bg-primary' : 'bg-border'}`}
                    >
                      <span
                        className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.useConversionName ? 'translate-x-5' : 'translate-x-0.5'
                          } translate-y-0.5`}
                      />
                    </label>
                  </div>
                  <span className="text-label text-muted-foreground">
                    Usar nome da ação de conversão
                  </span>
                </div>

                <Input
                  value={formData.useConversionName
                    ? conversionActions.find(a => a.id === formData.selectedConversionAction)?.name || ''
                    : formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder={formData.useConversionName ? 'Nome da ação de conversão' : 'Digite o nome do pixel'}
                  isDisabled={!formData.selectedConversionAction || formData.useConversionName}
                  isRequired={!formData.useConversionName}
                />
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <Button
                type="button"
                color="secondary"
                size="lg"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                color="primary"
                size="lg"
                isDisabled={isLoading || !formData.selectedPresell}
                isLoading={isLoading}
              >
                {isLoading ? 'Avançando...' : 'Avançar'}
              </Button>
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
            router.push('/hubpixel');
          }}
          onError={(message) => {
            showError(message);
          }}
          onPixelCreated={(pixel) => {
            // Salvar pixel no sessionStorage e navegar para lista
            sessionStorage.setItem('pixelCreated', JSON.stringify(pixel));
            setShowConfirmationModal(false);
            router.push('/hubpixel');
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