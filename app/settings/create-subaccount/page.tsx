'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsToast } from '../toast-context';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
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
          googleAccountId: selectedGmail,
          mccId: selectedMcc,
          accountName: subAccountName,
          currencyCode: 'BRL',
          timeZone: 'America/Sao_Paulo'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar subconta');
      }

      showSuccess(`Subconta "${subAccountName}" criada! Finalize a configuração no Google Ads.`);
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
          Adicione uma nova conta Google Ads dentro de uma MCC existente
        </p>
      </div>

      {/* Aviso importante */}
      <div className="mb-6 p-4 bg-accent/30 border border-border rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-body font-medium mb-1">
            Importante
          </p>
          <p className="text-label text-muted-foreground">
            Após criar a subconta, você precisará acessar o{' '}
            <a
              href="https://ads.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Ads
            </a>
            {' '}para finalizar a configuração (aceitar termos, adicionar forma de pagamento, etc).
            Somente após a configuração completa a conta aparecerá disponível para uso.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleCreateSubAccount(); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-body font-medium">
              Gmail <span className="text-destructive">*</span>
            </span>
            <Select
              placeholder="Selecione um Gmail"
              selectedKey={selectedGmail || null}
              onSelectionChange={(key: Key | null) => handleGmailSelect(key as string || '')}
              items={googleAccounts.map((account) => ({ id: account.id, label: account.email }))}
              isRequired
            >
              {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
            </Select>
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

          <div className="space-y-1">
            <span className="text-body font-medium">
              MCC <span className="text-destructive">*</span>
            </span>
            <Select
              placeholder={isLoadingAdsAccounts ? 'Carregando...' : 'Selecione uma MCC'}
              selectedKey={selectedMcc || null}
              onSelectionChange={(key: Key | null) => setSelectedMcc(key as string || '')}
              items={googleAdsAccounts
                .filter(acc => acc.isManager && !acc.isTestAccount)
                .map((account) => ({ id: account.customerId, label: `${account.accountName} - ${account.customerId}` }))}
              isRequired
              isDisabled={!selectedGmail || isLoadingAdsAccounts}
            >
              {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
            </Select>
            {selectedGmail && !isLoadingAdsAccounts && googleAdsAccounts.filter(acc => acc.isManager && !acc.isTestAccount).length === 0 && (
              <p className="text-label text-muted-foreground mt-1">
                Nenhuma MCC encontrada nesta conta
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1 md:w-[calc(50%-12px)]">
          <span className="text-body font-medium">
            Nome da conta <span className="text-destructive">*</span>
          </span>
          <Input
            value={subAccountName}
            onChange={(value) => setSubAccountName(value)}
            placeholder="Ex.: subContaNova"
            isRequired
          />
          <p className="text-label text-muted-foreground mt-2">
            O nome deve ter entre 4 e 128 caracteres, usando apenas letras, números, espaços, hífens e sublinhados, sem acentos, cedilha ou caracteres especiais (como & e !).
          </p>
        </div>

        <Button
          type="submit"
          color="primary"
          size="md"
          isDisabled={isLoading || !selectedGmail || !selectedMcc || !subAccountName}
          isLoading={isLoading}
        >
          {isLoading ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
    </>
  );
}
