'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, RefreshCw, Trash2, ExternalLink, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/ui/toast';

interface GoogleAccount {
  id: string;
  email: string;
  mccCount: number;
  adsAccountCount: number;
  conversionActionsCount: number;
}

interface SubAccount {
  id: string;
  name: string;
  parentMcc: string;
  status: 'active' | 'pending' | 'suspended';
}

type TabType = 'accounts' | 'ads' | 'mcc' | 'subaccount' | 'conversion';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('accounts');
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
  const [newGmailEmail, setNewGmailEmail] = useState('');
  const [isAddingGmail, setIsAddingGmail] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  // Buscar contas Google ao montar componente
  useEffect(() => {
    fetchGoogleAccounts();
  }, []);

  const fetchGoogleAccounts = async () => {
    try {
      const response = await fetch('/api/settings/gmails');
      if (!response.ok) throw new Error('Erro ao buscar contas');
      const data = await response.json();
      setGoogleAccounts(data.data || []);
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao carregar contas Google');
    }
  };


  const handleSync = async () => {
    setIsSyncing(true);
    // Simular sincronização
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
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
    if (!newGmailEmail || isAddingGmail) return;
    
    setIsAddingGmail(true);
    try {
      const response = await fetch('/api/settings/gmails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newGmailEmail })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao adicionar conta');
      }
      
      showSuccess('Conta Google adicionada com sucesso');
      setNewGmailEmail('');
      fetchGoogleAccounts();
    } catch (error) {
      console.error('Erro:', error);
      showError(error instanceof Error ? error.message : 'Erro ao adicionar conta');
    } finally {
      setIsAddingGmail(false);
    }
  };

  const handleCreateSubAccount = async () => {
    if (!selectedGmail || !selectedMcc || !subAccountName) return;
    
    setIsLoading(true);
    // TODO: Implementar criação de subconta
    setTimeout(() => {
      setIsLoading(false);
      setSubAccountName('');
    }, 1500);
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
                    onClick={() => fetchGoogleAccounts()}
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
                <h3 className="text-body font-medium mb-3">Adicionar conta Gmail</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newGmailEmail}
                    onChange={(e) => setNewGmailEmail(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-body placeholder:text-muted-foreground focus:ring-1 focus:ring-ring outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoogleAccount()}
                  />
                  <button 
                    onClick={handleAddGoogleAccount}
                    disabled={!newGmailEmail || isAddingGmail}
                    className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingGmail ? 'Adicionando...' : 'Adicionar'}</span>
                  </button>
                </div>
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
                            <p className="text-label text-muted-foreground">
                              {account.mccCount} MCC, {account.adsAccountCount} contas Google Ads, {account.conversionActionsCount} ações de conversão
                            </p>
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
                    onChange={(e) => setSelectedGmail(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
                    required
                  >
                    <option value="">Selecione</option>
                    {googleAccounts.map((account) => (
                      <option key={account.id} value={account.email}>
                        {account.email}
                      </option>
                    ))}
                  </select>
                  {!googleAccounts.length && (
                    <a href="#" className="text-label text-primary hover:underline mt-1 inline-block">
                      + adicionar uma conta Google
                    </a>
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
                    disabled={!selectedGmail}
                  >
                    <option value="">Selecione</option>
                    <option value="mcc1">MCC Principal - 123-456-7890</option>
                    <option value="mcc2">MCC Secundária - 098-765-4321</option>
                  </select>
                  {selectedGmail && (
                    <p className="text-label text-muted-foreground mt-1">
                      minha MCC não está aparecendo
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
                    onChange={(e) => setSelectedGmail(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-body focus:ring-1 focus:ring-ring outline-none"
                    required
                  >
                    <option value="">Selecione</option>
                    {googleAccounts.map((account) => (
                      <option key={account.id} value={account.email}>
                        {account.email}
                      </option>
                    ))}
                  </select>
                  {!googleAccounts.length && (
                    <a href="#" className="text-label text-primary hover:underline mt-1 inline-block">
                      + adicionar uma conta Google
                    </a>
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
                        onChange={(e) => setAccountType('normal')}
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
                        onChange={(e) => setAccountType('mcc')}
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
                    disabled={!selectedGmail}
                  >
                    <option value="">Selecione</option>
                    {accountType === 'normal' ? (
                      <>
                        <option value="acc1">Conta Principal - 123-456-7890</option>
                        <option value="acc2">Conta Secundária - 098-765-4321</option>
                      </>
                    ) : (
                      <>
                        <option value="mcc1">MCC Principal - 123-456-7890</option>
                        <option value="mcc2">MCC Secundária - 098-765-4321</option>
                      </>
                    )}
                  </select>
                  {selectedGmail && (
                    <p className="text-label text-muted-foreground mt-1">
                      minha conta não está aparecendo
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