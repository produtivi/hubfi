'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsToast } from '../toast-context';

interface GoogleAccount {
  id: string;
  email: string;
}

interface GoogleAdsAccount {
  customerId: string;
  accountName: string;
  currencyCode: string;
  timeZone: string;
  isTestAccount: boolean;
  isManager: boolean;
}

export default function CriarSubcontaPage() {
  const router = useRouter();
  const { showSuccess, showError } = useSettingsToast();

  const [selectedGmail, setSelectedGmail] = useState('');
  const [selectedMcc, setSelectedMcc] = useState('');
  const [subAccountName, setSubAccountName] = useState('');
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccount[]>([]);
  const [googleAdsAccounts, setGoogleAdsAccounts] = useState<GoogleAdsAccount[]>([]);
  const [isLoadingAdsAccounts, setIsLoadingAdsAccounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setGoogleAccounts(data.data || []);
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao carregar contas Google');
    }
  };

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

  const handleGmailSelect = (gmailId: string) => {
    setSelectedGmail(gmailId);
    setSelectedMcc('');
    if (gmailId) {
      fetchGoogleAdsAccounts(gmailId);
    } else {
      setGoogleAdsAccounts([]);
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
    } catch (error) {
      console.error('Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar subconta';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
              onClick={() => router.push('/settings/accounts')}
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
    </>
  );
}
