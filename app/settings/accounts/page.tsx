'use client';

import { useState, useEffect } from 'react';
import { Trash2, Building2, MonitorSmartphone, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSettingsToast } from '../toast-context';
import { Button } from '@/components/base/buttons/button';
import { TooltipHelp } from '@/components/ui/tooltip-help';

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface GoogleAccount {
  id: string;
  email: string;
  mccCount: number;
  adsAccountCount: number;
  conversionActionsCount: number;
  adsError?: string | null;
}

export default function ContasPage() {
  const router = useRouter();
  const { showSuccess, showError } = useSettingsToast();
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddingGmail, setIsAddingGmail] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'account_connected') {
      showSuccess('Conta Google conectada com sucesso!');
      window.history.replaceState({}, '', '/settings/accounts');
    } else if (error) {
      let errorMessage = 'Erro ao conectar conta Google';
      if (error === 'cancelled') {
        errorMessage = 'Autorização cancelada pelo usuário';
      } else if (error === 'oauth_failed') {
        errorMessage = 'Falha na autorização. Tente novamente.';
      }
      showError(errorMessage);
      window.history.replaceState({}, '', '/settings/accounts');
    }
  }, [showSuccess, showError]);

  const fetchGoogleAccounts = async (showLoadingState = true) => {
    if (showLoadingState) {
      setIsLoading(true);
    }

    try {
      const response = await fetch('/api/settings/gmails');

      if (response.status === 401) {
        router.push('/login');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar contas');
      }

      const data = await response.json();
      const accounts = data.data || [];

      // Primeiro mostra as contas sem os resumos
      setGoogleAccounts(accounts.map((account: any) => ({
        ...account,
        mccCount: 0,
        adsAccountCount: 0,
        conversionActionsCount: 0,
        adsError: null
      })));
      setIsLoading(false);

      if (accounts.length > 0) {
        setIsLoadingInfo(true);

        // Depois busca os resumos em background
        const accountsWithSummary = await Promise.all(
          accounts.map(async (account: any) => {
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
        setIsLoadingInfo(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao carregar contas Google');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleAccounts();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchGoogleAccounts(false);
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
      const response = await fetch('/api/auth/google/authorize');
      const { authUrl } = await response.json();

      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao iniciar autorização Google');
      setIsAddingGmail(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-title mb-2">Meus Gmails, contas e ações</h2>
          <p className="text-body-muted">
            Gerencie suas contas Google Ads e MCCs conectadas
          </p>
        </div>
      </div>

      {/* Formulário para adicionar novo Gmail */}
      <div className="mb-6 p-4 bg-accent/30 rounded-md border border-border">
        <h3 className="text-body font-medium mb-3">Conectar conta Google</h3>
        <p className="text-label text-muted-foreground mb-3">
          Conecte sua conta Google para gerenciar Google Ads e MCCs
        </p>
        <Button
          onPress={handleAddGoogleAccount}
          isDisabled={isAddingGmail}
          isLoading={isAddingGmail}
          color="primary"
          iconLeading={GoogleIcon}
        >
          {isAddingGmail ? 'Conectando...' : 'Conectar com Google'}
        </Button>
      </div>

      <div className="text-label text-muted-foreground mb-4 flex items-center gap-2">
        <span>Gmails {!isLoading && `(${googleAccounts.length})`}</span>
        {!isLoading && googleAccounts.length > 0 && (
          <TooltipHelp text={`MCC: Conta de gerenciamento que administra várias contas Google Ads.\n\nContas Google Ads: Contas onde você cria campanhas e anúncios.\n\nAções de conversão: Eventos rastreados (vendas, leads, etc) usados para medir resultados.`} />
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 bg-background border border-border rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-body text-muted-foreground">Carregando contas...</span>
            </div>
          </div>
        ) : googleAccounts.length === 0 ? (
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
              className="bg-background border border-border rounded-lg p-5 hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-foreground font-medium text-lg">
                    {account.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-body font-medium">{account.email}</p>
                    {account.adsError && (
                      <p className="text-label text-destructive mt-1">
                        {account.adsError.includes('DEVELOPER_TOKEN')
                          ? 'Developer Token nao configurado no servidor'
                          : account.adsError}
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

              {/* Métricas com ícones */}
              {!account.adsError && (
                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  {isLoadingInfo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span className="text-label text-muted-foreground">Carregando informações...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <div className='flex items-center gap-2'>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-label text-muted-foreground">{account.mccCount} MCC</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MonitorSmartphone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-label text-muted-foreground">{account.adsAccountCount} Contas Google Ads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-label text-muted-foreground">{account.conversionActionsCount} Ações de conversão</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
