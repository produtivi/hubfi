'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsToast } from '../toast-context';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import { TooltipHelp } from '@/components/ui/tooltip-help';
import type { Key } from 'react-aria-components';

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
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingAdsAccounts, setIsLoadingAdsAccounts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchGoogleAccounts();
  }, []);

  const fetchGoogleAccounts = async () => {
    setIsLoadingAccounts(true);
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
    } finally {
      setIsLoadingAccounts(false);
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
    try {
      const response = await fetch('/api/google-ads/conversion-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleAccountId: selectedGmail,
          customerId: selectedAccount,
          conversionName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess('Ação de conversão criada com sucesso!');
        setConversionName('');
        setSelectedAccount('');
      } else {
        showError(data.error || 'Erro ao criar ação de conversão');
      }
    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao criar ação de conversão');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAccounts = googleAdsAccounts.filter(
    acc => !acc.isTestAccount && (accountType === 'mcc' ? acc.isManager : !acc.isManager)
  );

  const canSubmit = selectedGmail && selectedAccount && conversionName.length >= 4;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-title mb-2">Criar ação de conversão Google Ads</h2>
        <p className="text-body-muted">
          Configure um pixel de conversão para rastrear vendas e resultados
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleCreateConversion(); }} className="space-y-6">
          {/* Linha 1 - Gmail e Nome da conversão */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gmail */}
            <div className="space-y-1">
              <span className="text-body font-medium flex items-center gap-2">
                Conta Google <span className="text-destructive">*</span>
                <TooltipHelp text="Selecione a conta Google conectada que possui acesso ao Google Ads." />
              </span>
              <Select
                placeholder={isLoadingAccounts ? 'Carregando...' : 'Selecione o email'}
                selectedKey={selectedGmail || null}
                onSelectionChange={(key: Key | null) => handleGmailSelect(key as string || '')}
                items={googleAccounts.map((account) => ({ id: account.id, label: account.email }))}
                isRequired
                isDisabled={isLoadingAccounts}
              >
                {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
              </Select>
              {googleAccounts.length === 0 && !isLoadingAccounts && (
                <p className="text-label text-muted-foreground">
                  Nenhuma conta conectada.{' '}
                  <a href="/settings/accounts" className="text-primary hover:underline">
                    Conectar conta
                  </a>
                </p>
              )}
            </div>

            {/* Nome da conversão */}
            <div className="space-y-1">
              <span className="text-body font-medium flex items-center gap-2">
                Nome da ação de conversão <span className="text-destructive">*</span>
                <TooltipHelp text="Nome para identificar a ação de conversão no Google Ads. Use apenas letras, números, espaços, hífens e sublinhados." />
              </span>
              <Input
                placeholder="Ex.: Compra_Produto_X"
                value={conversionName}
                onChange={(value) => setConversionName(value)}
                isRequired
              />
              <p className="text-label text-muted-foreground">
                {conversionName.length}/128 caracteres
              </p>
            </div>
          </div>

          {/* Linha 2 - Tipo de conta e Conta Google Ads (empilhados na esquerda) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              {/* Tipo de conta */}
              <div className="">
                <span className="text-body font-medium flex items-center gap-2">
                  Tipo de conta <span className="text-destructive">*</span>
                  <TooltipHelp text="Escolha se a ação de conversão será criada em uma conta normal ou MCC." />
                </span>
                <div className="flex gap-6 h-10 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="accountType"
                      value="normal"
                      checked={accountType === 'normal'}
                      onChange={() => { setAccountType('normal'); setSelectedAccount(''); }}
                      className="w-4 h-4 accent-primary"
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
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-body">Conta MCC</span>
                  </label>
                </div>
              </div>

              {/* Conta Google Ads */}
              <div className="space-y-1">
                <Select
                  placeholder={isLoadingAdsAccounts ? 'Carregando...' : 'Selecione a conta'}
                  selectedKey={selectedAccount || null}
                  onSelectionChange={(key: Key | null) => setSelectedAccount(key as string || '')}
                  items={filteredAccounts.map((account) => ({
                    id: account.customerId,
                    label: `${account.accountName} - ${account.customerId}`
                  }))}
                  isRequired
                  isDisabled={!selectedGmail || isLoadingAdsAccounts}
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {selectedGmail && !isLoadingAdsAccounts && filteredAccounts.length === 0 && (
                  <p className="text-label text-muted-foreground">
                    Nenhuma conta {accountType === 'mcc' ? 'MCC' : 'normal'} encontrada
                  </p>
                )}
              </div>
            </div>

            {/* Coluna direita vazia */}
            <div></div>
          </div>

          {/* Botão */}
          <div className="flex justify-start pt-4">
            <Button
              type="submit"
              color="primary"
              size="lg"
              isDisabled={!canSubmit || isLoading}
              isLoading={isLoading}
            >
              Criar ação de conversão
            </Button>
          </div>
        </form>
    </>
  );
}
