'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
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

export default function CriarConversaoPage() {
  const router = useRouter();
  const { showSuccess, showError } = useSettingsToast();

  const [selectedGmail, setSelectedGmail] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accountType, setAccountType] = useState<'normal' | 'mcc'>('normal');
  const [conversionName, setConversionName] = useState('');
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
    setSelectedAccount('');
    if (gmailId) {
      fetchGoogleAdsAccounts(gmailId);
    } else {
      setGoogleAdsAccounts([]);
    }
  };

  const handleCreateConversion = async () => {
    if (!selectedGmail || !selectedAccount || !conversionName) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setConversionName('');
    }, 1500);
  };

  return (
    <>
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
              onClick={() => router.push('/settings/accounts')}
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
    </>
  );
}
