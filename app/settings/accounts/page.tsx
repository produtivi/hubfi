'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSettingsToast } from '../toast-context';

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

  useEffect(() => {
    fetchGoogleAccounts();
  }, []);

  const fetchGoogleAccounts = async () => {
    try {
      const response = await fetch('/api/settings/gmails');

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao buscar contas');
      }

      const data = await response.json();

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

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchGoogleAccounts();
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
    </>
  );
}
