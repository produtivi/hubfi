'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, RefreshCw, Trash2, ExternalLink, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/ui/toast';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';

interface GoogleAccount {
  id: string;
  email: string;
  mccCount: number;
  adsAccountCount: number;
  conversionActionsCount: number;
  adsError?: string | null;
}

interface SubAccount {
  id: string;
  name: string;
  parentMcc: string;
  status: 'active' | 'pending' | 'suspended';
}

interface GoogleAdsAccount {
  customerId: string;
  accountName: string;
  currencyCode: string;
  timeZone: string;
  isTestAccount: boolean;
  isManager: boolean;
}

type TabType = 'accounts' | 'ads' | 'mcc' | 'subaccount' | 'conversion' | 'profile';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Estados para os formulários
  const [selectedGmail, setSelectedGmail] = useState('');
  const [selectedMcc, setSelectedMcc] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accountType, setAccountType] = useState<'normal' | 'mcc'>('normal');
  const [subAccountName, setSubAccountName] = useState('');
  const [conversionName, setConversionName] = useState('');

  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccount[]>([]);
  const [googleAdsAccounts, setGoogleAdsAccounts] = useState<GoogleAdsAccount[]>([]);
  const [isLoadingAdsAccounts, setIsLoadingAdsAccounts] = useState(false);
  const [newGmailEmail, setNewGmailEmail] = useState('');
  const [isAddingGmail, setIsAddingGmail] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Estados para o perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Verificar parâmetros da URL para mensagens de callback
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'account_connected') {
      showSuccess('Conta Google conectada com sucesso!');
      // Limpar parâmetros da URL
      window.history.replaceState({}, '', '/settings');
    } else if (error) {
      let errorMessage = 'Erro ao conectar conta Google';
      if (error === 'cancelled') {
        errorMessage = 'Autorização cancelada pelo usuário';
      } else if (error === 'oauth_failed') {
        errorMessage = 'Falha na autorização. Tente novamente.';
      }
      showError(errorMessage);
      // Limpar parâmetros da URL
      window.history.replaceState({}, '', '/settings');
    }
  }, [showSuccess, showError]);

  // Buscar contas Google ao montar componente
  useEffect(() => {
    fetchGoogleAccounts();
  }, []);

  // Buscar dados do perfil ao montar componente
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.user?.name || '',
          email: data.user?.email || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name || !profileData.email) {
      showError('Nome e email são obrigatórios');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil');
      }

      showSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      showError(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showError('Preencha todos os campos de senha');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar senha');
      }

      showSuccess('Senha alterada com sucesso!');
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditingPassword(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
      showError(errorMessage);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const fetchGoogleAccounts = async () => {
    try {
      const response = await fetch('/api/settings/gmails');
      
      if (response.status === 401) {
        // Usuário não autenticado, redirecionar para login
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erro ao buscar contas');
      }
      
      const data = await response.json();
      
      // Para cada conta Google, buscar o resumo do Google Ads
      const accountsWithSummary = await Promise.all(
        (data.data || []).map(async (account: any) => {
          try {
            const summaryResponse = await fetch(`/api/google-ads/account-summary?googleAccountId=${account.id}`);
            const summaryData = await summaryResponse.json();

            if (summaryResponse.ok && !summaryData.data?.error) {
              return {
                ...account,
                mccCount: summaryData.data?.mccCount || 0,
                adsAccountCount: summaryData.data?.accountsCount || 0,
                conversionActionsCount: summaryData.data?.conversionsCount || 0,
                adsError: null
              };
            }

            // Se tem erro, guardar a mensagem
            return {
              ...account,
              mccCount: 0,
              adsAccountCount: 0,
              conversionActionsCount: 0,
              adsError: summaryData.data?.error || summaryData.error || 'Erro ao buscar dados'
            };
          } catch (err) {
            console.error(`Erro ao buscar resumo para conta ${account.id}:`, err);
            return {
              ...account,
              mccCount: 0,
              adsAccountCount: 0,
              conversionActionsCount: 0,
              adsError: 'Erro de conexão'
            };
          }
        })
      );
      
      setGoogleAccounts(accountsWithSummary);
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao carregar contas Google');
    }
  };


  // Buscar contas Google Ads quando um Gmail for selecionado
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
        if (data.error) {
          console.error('Erro ao buscar contas:', data.error);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar contas Google Ads:', error);
      setGoogleAdsAccounts([]);
    } finally {
      setIsLoadingAdsAccounts(false);
    }
  };

  // Handler para quando o Gmail for selecionado
  const handleGmailSelect = (gmailId: string) => {
    setSelectedGmail(gmailId);
    setSelectedMcc('');
    setSelectedAccount('');
    if (gmailId) {
      fetchGoogleAdsAccounts(gmailId);
    } else {
      setGoogleAdsAccounts([]);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchGoogleAccounts(); // Recarregar dados reais
    setIsSyncing(false);
  };

  const handleRemoveAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/settings/gmails?id=${accountId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao remover conta');
      
      showSuccess('Conta removida com sucesso');
      fetchGoogleAccounts();
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao remover conta');
    }
  };

  const handleAddGoogleAccount = async () => {
    setIsAddingGmail(true);
    try {
      // Iniciar fluxo OAuth2 - redirecionar para autorização do Google
      const response = await fetch('/api/auth/google/authorize');
      const { authUrl } = await response.json();
      
      // Redirecionar para Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao iniciar autorização Google');
      setIsAddingGmail(false);
    }
  };

  const handleCreateSubAccount = async () => {
    if (!selectedGmail || !selectedMcc || !subAccountName) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-ads/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountName: subAccountName,
          currencyCode: 'BRL',
          timeZone: 'America/Sao_Paulo'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar subconta');
      }

      showSuccess(`Subconta "${subAccountName}" criada com sucesso!`);
      setSubAccountName('');
      
      // Atualizar lista de MCCs/contas
      // TODO: Implementar refresh da lista

    } catch (error) {
      console.error('Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar subconta';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversion = async () => {
    if (!selectedGmail || !selectedAccount || !conversionName) return;
    
    setIsLoading(true);
    // TODO: Implementar criação de ação de conversão
    setTimeout(() => {
      setIsLoading(false);
      setConversionName('');
    }, 1500);
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
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-headline">Configurações</h1>
        </div>
      </div>

      {/* Layout com sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Sidebar de navegação */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-card border border-border rounded-md p-4 h-[750px]">
          <div className="mb-6">
            <h3 className="text-label text-primary font-medium mb-2">CONTA</h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3 py-2 rounded-md text-body transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                Meu perfil
              </button>
            </nav>
          </div>

          <div className="mb-6">
            <h3 className="text-label text-primary font-medium mb-2">CONTAS GOOGLE</h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('accounts')}
                className={`w-full text-left px-3 py-2 rounded-md text-body transition-colors ${
                  activeTab === 'accounts'
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                Meus Gmails, contas e ações
              </button>
              
              <button
                onClick={() => setActiveTab('subaccount')}
                className={`w-full text-left px-3 py-2 rounded-md text-body transition-colors ${
                  activeTab === 'subaccount'
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                Criar subconta para MCC
              </button>
              
              <button
                onClick={() => setActiveTab('conversion')}
                className={`w-full text-left px-3 py-2 rounded-md text-body transition-colors ${
                  activeTab === 'conversion'
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                Criar ação de conversão (Pixel) Google Ads
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 bg-card border border-border rounded-md p-6 h-[750px] overflow-y-auto">
          {/* Tab: Contas Google */}
          {activeTab === 'accounts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-title mb-2">Meus Gmails, contas e ações</h2>
                  <p className="text-body-muted">
                    Gerencie suas contas Google Ads e MCCs conectadas
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>

              {/* Formulário para adicionar novo Gmail */}
              <div className="mb-6 p-4 bg-accent/30 rounded-md border border-border">
                <h3 className="text-body font-medium mb-3">Conectar conta Google</h3>
                <p className="text-label text-muted-foreground mb-3">
                  Conecte sua conta Google para gerenciar Google Ads e MCCs
                </p>
                <button 
                  onClick={handleAddGoogleAccount}
                  disabled={isAddingGmail}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{isAddingGmail ? 'Conectando...' : 'Conectar com Google'}</span>
                </button>
              </div>

              <div className="text-label text-muted-foreground mb-4">
                Gmails ({googleAccounts.length})
              </div>

              <div className="space-y-3">
                {googleAccounts.length === 0 ? (
                  <div className="text-center py-8 bg-background border border-border rounded-md">
                    <p className="text-body text-muted-foreground mb-4">
                      Nenhuma conta Google conectada
                    </p>
                    <p className="text-label text-muted-foreground">
                      Adicione uma conta Gmail acima para começar
                    </p>
                  </div>
                ) : (
                  googleAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-background border border-border rounded-md p-4 hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-foreground font-medium">
                            {account.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-body font-medium">{account.email}</p>
                            {account.adsError ? (
                              <p className="text-label text-destructive">
                                {account.adsError.includes('DEVELOPER_TOKEN')
                                  ? 'Developer Token nao configurado no servidor'
                                  : account.adsError}
                              </p>
                            ) : (
                              <p className="text-label text-muted-foreground">
                                {account.mccCount} MCC, {account.adsAccountCount} contas Google Ads, {account.conversionActionsCount} ações de conversão
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAccount(account.id)}
                          className="p-2 hover:bg-accent rounded-md transition-colors"
                          title="Remover conta"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab: Criar Subconta MCC */}
          {activeTab === 'subaccount' && (
            <div>
              <div className="mb-6">
                <h2 className="text-title mb-2">Criar subconta para MCC</h2>
                <p className="text-body-muted">
                  Adicione uma nova conta dentro de uma MCC existente
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateSubAccount(); }} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-label text-muted-foreground mb-2">
                    Selecione um Gmail
                  </label>
                  <select
                    value={selectedGmail}
                    onChange={(e) => handleGmailSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
                    required
                  >
                    <option value="">Selecione</option>
                    {googleAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.email}
                      </option>
                    ))}
                  </select>
                  {!googleAccounts.length && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('accounts')}
                      className="text-label text-primary hover:underline mt-1 inline-block"
                    >
                      + adicionar uma conta Google
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-label text-muted-foreground mb-2">
                    Selecione uma MCC
                  </label>
                  <select
                    value={selectedMcc}
                    onChange={(e) => setSelectedMcc(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
                    required
                    disabled={!selectedGmail || isLoadingAdsAccounts}
                  >
                    <option value="">
                      {isLoadingAdsAccounts ? 'Carregando...' : 'Selecione'}
                    </option>
                    {googleAdsAccounts
                      .filter(acc => acc.isManager && !acc.isTestAccount)
                      .map((account) => (
                        <option key={account.customerId} value={account.customerId}>
                          {account.accountName} - {account.customerId}
                        </option>
                      ))}
                  </select>
                  {selectedGmail && !isLoadingAdsAccounts && googleAdsAccounts.filter(acc => acc.isManager && !acc.isTestAccount).length === 0 && (
                    <p className="text-label text-muted-foreground mt-1">
                      Nenhuma MCC encontrada nesta conta
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-label text-muted-foreground mb-2">
                    Nome da conta
                  </label>
                  <input
                    type="text"
                    value={subAccountName}
                    onChange={(e) => setSubAccountName(e.target.value)}
                    placeholder="Ex.: subContaNova"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-none"
                    required
                  />
                  <p className="text-label text-muted-foreground mt-2">
                    O nome deve ter entre 4 e 128 caracteres, usando apenas letras, números, espaços, hífens e sublinhados, sem acentos, cedilha ou caracteres especiais (como & e !).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !selectedGmail || !selectedMcc || !subAccountName}
                  className="w-full px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </button>
              </form>
            </div>
          )}

          {/* Tab: Criar Ação de Conversão */}
          {activeTab === 'conversion' && (
            <div>
              <div className="mb-6">
                <h2 className="text-title mb-2">Criar ação de conversão Google Ads</h2>
                <p className="text-body-muted">
                  Configure um pixel de conversão para rastrear vendas e resultados
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateConversion(); }} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-label text-muted-foreground mb-2">
                    Selecione um Gmail
                  </label>
                  <select
                    value={selectedGmail}
                    onChange={(e) => handleGmailSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
                    required
                  >
                    <option value="">Selecione</option>
                    {googleAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.email}
                      </option>
                    ))}
                  </select>
                  {!googleAccounts.length && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('accounts')}
                      className="text-label text-primary hover:underline mt-1 inline-block"
                    >
                      + adicionar uma conta Google
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-label text-muted-foreground mb-3">
                    Ação de conversão vai pertencer a qual tipo de conta Google Ads
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="normal"
                        checked={accountType === 'normal'}
                        onChange={() => { setAccountType('normal'); setSelectedAccount(''); }}
                        className="w-4 h-4 text-foreground"
                      />
                      <span className="text-body">Conta normal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="mcc"
                        checked={accountType === 'mcc'}
                        onChange={() => { setAccountType('mcc'); setSelectedAccount(''); }}
                        className="w-4 h-4 text-foreground"
                      />
                      <span className="text-body">Conta MCC (gerente)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-label text-muted-foreground mb-2">
                    Selecione uma conta
                  </label>
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
                    required
                    disabled={!selectedGmail || isLoadingAdsAccounts}
                  >
                    <option value="">
                      {isLoadingAdsAccounts ? 'Carregando...' : 'Selecione'}
                    </option>
                    {googleAdsAccounts
                      .filter(acc => !acc.isTestAccount && (accountType === 'mcc' ? acc.isManager : !acc.isManager))
                      .map((account) => (
                        <option key={account.customerId} value={account.customerId}>
                          {account.accountName} - {account.customerId}
                        </option>
                      ))}
                  </select>
                  {selectedGmail && !isLoadingAdsAccounts && googleAdsAccounts.filter(acc => !acc.isTestAccount && (accountType === 'mcc' ? acc.isManager : !acc.isManager)).length === 0 && (
                    <p className="text-label text-muted-foreground mt-1">
                      Nenhuma conta {accountType === 'mcc' ? 'MCC' : 'normal'} encontrada
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-label text-muted-foreground mb-2">
                    Nome da ação de conversão
                  </label>
                  <input
                    type="text"
                    value={conversionName}
                    onChange={(e) => setConversionName(e.target.value)}
                    placeholder="Ex.: acaoDeConversaoNova"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-none"
                    required
                  />
                  <p className="text-label text-muted-foreground mt-2">
                    O nome deve ter entre 4 e 128 caracteres, usando apenas letras, números, espaços, hífens e sublinhados, sem acentos, cedilha ou caracteres especiais (como & e !).
                  </p>
                </div>

                <div className="bg-accent/30 border border-border rounded-md p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-label">
                      <p className="font-medium mb-1">Importante sobre conversões</p>
                      <p className="text-muted-foreground">
                        Esta ação de conversão criará um pixel do Google Ads para rastrear quando visitantes realizam ações importantes como compras ou cadastros. 
                        Você precisará instalar o código de rastreamento em suas páginas.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !selectedGmail || !selectedAccount || !conversionName}
                  className="w-full px-6 py-3 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Criando ação de conversão...' : 'Criar ação de conversão'}
                </button>
              </form>
            </div>
          )}

          {/* Tab: Meu Perfil */}
          {activeTab === 'profile' && (
            <div>
              <div className="mb-6">
                <h2 className="text-title mb-2">Meu perfil</h2>
                <p className="text-body-muted">
                  Gerencie suas informações pessoais
                </p>
              </div>

              {isLoadingProfile ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-muted-foreground">Carregando dados...</span>
                </div>
              ) : (
                <div className="w-full space-y-8">
                  {/* Informações básicas */}
                  <div className="space-y-4">
                    <h3 className="text-body font-medium">Informações básicas</h3>

                    <div className="flex items-end gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-label text-muted-foreground">Nome</span>
                        <Input
                          value={profileData.name}
                          onChange={(value) => setProfileData({ ...profileData, name: value })}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="flex-1 space-y-1">
                        <span className="text-label text-muted-foreground">Email</span>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(value) => setProfileData({ ...profileData, email: value })}
                          placeholder="seu@email.com"
                        />
                      </div>

                      <Button
                        color="primary"
                        size="md"
                        onClick={handleSaveProfile}
                        isDisabled={isSavingProfile}
                        isLoading={isSavingProfile}
                      >
                        {isSavingProfile ? 'Salvando...' : 'Salvar alterações'}
                      </Button>
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="border-t border-border" />

                  {/* Alterar senha */}
                  <div className="space-y-4">
                    <h3 className="text-body font-medium">Senha</h3>

                    <div className="space-y-4">
                      <div className="flex items-end gap-4">
                        <div className="w-1/2 space-y-1">
                          <span className="text-label text-muted-foreground">Senha atual</span>
                          <Input
                            type="password"
                            value="********"
                            onChange={() => {}}
                            isDisabled
                          />
                        </div>
                        {!isEditingPassword && (
                          <Button
                            color="secondary"
                            size="md"
                            onClick={() => setIsEditingPassword(true)}
                          >
                            Alterar senha
                          </Button>
                        )}
                      </div>

                      {isEditingPassword && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-label text-muted-foreground">Nova senha</span>
                              <Input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                                placeholder="Mínimo 6 caracteres"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-label text-muted-foreground">Confirmar nova senha</span>
                              <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                                placeholder="Repita a nova senha"
                              />
                            </div>
                          </div>

                          <div className="flex justify-start gap-3">
                            <Button
                              color="secondary"
                              size="md"
                              onClick={() => {
                                setIsEditingPassword(false);
                                setPasswordData({
                                  newPassword: '',
                                  confirmPassword: ''
                                });
                              }}
                              isDisabled={isSavingPassword}
                            >
                              Cancelar
                            </Button>
                            <Button
                              color="primary"
                              size="md"
                              onClick={handleSavePassword}
                              isDisabled={isSavingPassword}
                              isLoading={isSavingPassword}
                            >
                              {isSavingPassword ? 'Salvando...' : 'Salvar nova senha'}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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