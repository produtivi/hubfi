'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHubPageToast } from '../toast-context';
import { TooltipHelp } from '../../components/ui/tooltip-help';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import { useUser } from '@/hooks/use-user';
import type { Key } from 'react-aria-components';

export default function CreatePresell() {
  const router = useRouter();
  const { showSuccess, showError } = useHubPageToast();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    customDomain: '',
    pageName: '',
    affiliateLink: '',
    producerSalesPage: '',
    presellType: '',
    presellLanguage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkErrors, setLinkErrors] = useState({
    affiliateLink: '',
    producerSalesPage: ''
  });
  const [customDomains, setCustomDomains] = useState<Array<{id: string, domain: string}>>([]);

  // Validação de URL
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Vazio é tratado pelo required
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Validar link e atualizar erro
  const validateLink = (field: 'affiliateLink' | 'producerSalesPage', value: string) => {
    if (value && !isValidUrl(value)) {
      setLinkErrors(prev => ({ ...prev, [field]: 'Insira um link válido (ex: https://exemplo.com)' }));
    } else {
      setLinkErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Verificar se todos os campos obrigatórios estão preenchidos
  const isFormComplete =
    formData.customDomain !== '' &&
    formData.pageName !== '' &&
    formData.affiliateLink !== '' &&
    formData.producerSalesPage !== '' &&
    formData.presellType !== '' &&
    formData.presellLanguage !== '';

  // Verificar se o formulário é válido (completo e sem erros de link)
  const isFormValid =
    isFormComplete &&
    isValidUrl(formData.affiliateLink) &&
    isValidUrl(formData.producerSalesPage);
  const [presellTypes, setPresellTypes] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Carregar domínios e tipos do banco
  useEffect(() => {
    if (user?.id) {
      loadDomainsAndTypes();
    }
  }, [user?.id]);

  const loadDomainsAndTypes = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingData(true);

      // Carregar domínios customizados
      const customDomainsResponse = await fetch(`/api/custom-domains?userId=${user.id}`);
      const customDomainsResult = await customDomainsResponse.json();

      if (customDomainsResult.domains) {
        // Mostrar domínios ativos e pendentes (SSL pode demorar)
        const availableDomains = customDomainsResult.domains
          .filter((d: any) => d.status === 'active' || d.status === 'pending')
          .map((d: any) => ({ id: d.id, domain: d.hostname }));
        setCustomDomains(availableDomains);
      }

      // Carregar tipos de presell
      const typesResponse = await fetch('/api/presell-templates');
      const typesResult = await typesResponse.json();

      if (typesResult.success) {
        setPresellTypes(typesResult.data.map((template: any) => template.name));
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showError('Erro ao carregar dados do formulário');
    } finally {
      setIsLoadingData(false);
    }
  };

  const languages = [
    'Português',
    'Inglês',
    'Espanhol'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Pegar userId do usuário logado
      let userId;
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.user.id;
        } else {
          userId = 2;
        }
      } catch {
        userId = 2;
      }

      const response = await fetch('/api/presells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          customDomain: formData.customDomain,
          pageName: formData.pageName,
          affiliateLink: formData.affiliateLink,
          producerSalesPage: formData.producerSalesPage,
          presellType: formData.presellType,
          presellLanguage: formData.presellLanguage
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar presell');
      }

      // Mostrar toast de sucesso
      showSuccess(`Página "${formData.pageName}" criada com sucesso! Prévias serão geradas em segundo plano.`);

      // Redirecionar imediatamente para a lista
      router.push('/hubpage');

    } catch (error) {
      console.error('Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Carregando dados...</span>
        </div>
      </div>
    );
  }

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
            <h1 className="text-headline">Criar Nova Presell</h1>
            <p className="text-label text-muted-foreground">
              Configure os detalhes da sua página de pré-venda
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

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Domínio Customizado */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Domínio <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione um dos seus domínios customizados ativos." />
                </span>
                <Select
                  placeholder="Escolha o domínio"
                  selectedKey={formData.customDomain || null}
                  onSelectionChange={(key: Key | null) => setFormData({ ...formData, customDomain: key as string || '' })}
                  items={customDomains.map((domain) => ({ id: domain.domain, label: domain.domain }))}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
                {customDomains.length === 0 && (
                  <p className="text-label text-muted-foreground mt-1">
                    Nenhum domínio customizado ativo. <a href="/hubpage/domains" className="text-primary underline">Adicionar domínio</a>
                  </p>
                )}
              </div>

              {/* Nome da página */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Nome da página <span className="text-destructive">*</span>
                  <TooltipHelp
                    text="Este nome aparece na aba do navegador quando o visitante abre sua presell."
                    imageSrc="/Captura de tela de 2026-01-20 14-33-05.png"
                    imageAlt="Exemplo de nome da página na aba do navegador"
                  />
                </span>
                <Input
                  value={formData.pageName}
                  onChange={(value) => setFormData({ ...formData, pageName: value })}
                  placeholder="Informe o nome da sua página"
                  isRequired
                />
              </div>

              {/* Link de Afiliado */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Link de Afiliado <span className="text-destructive">*</span>
                  <TooltipHelp text="Link para onde o visitante será redirecionado ao clicar no botão de compra." />
                </span>
                <Input
                  type="url"
                  value={formData.affiliateLink}
                  onChange={(value) => {
                    setFormData({ ...formData, affiliateLink: value });
                    validateLink('affiliateLink', value);
                  }}
                  placeholder="Informe o link de afiliado"
                  isRequired
                  isInvalid={!!linkErrors.affiliateLink}
                />
                {linkErrors.affiliateLink && (
                  <p className="text-label text-destructive">{linkErrors.affiliateLink}</p>
                )}
              </div>

              {/* Página de vendas do produtor */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Página de vendas do produtor <span className="text-destructive">*</span>
                  <TooltipHelp text="URL da página de vendas original. Usada para capturar elementos visuais e gerar prévias." />
                </span>
                <Input
                  type="url"
                  value={formData.producerSalesPage}
                  onChange={(value) => {
                    setFormData({ ...formData, producerSalesPage: value });
                    validateLink('producerSalesPage', value);
                  }}
                  placeholder="Informe a página de vendas"
                  isRequired
                  isInvalid={!!linkErrors.producerSalesPage}
                />
                {linkErrors.producerSalesPage && (
                  <p className="text-label text-destructive">{linkErrors.producerSalesPage}</p>
                )}
              </div>

              {/* Tipo de Presell */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Tipo de Presell <span className="text-destructive">*</span>
                  <TooltipHelp text="Escolha o formato da sua presell: quiz, artigo, VSL, entre outros." />
                </span>
                <Select
                  placeholder="Selecione o tipo"
                  selectedKey={formData.presellType || null}
                  onSelectionChange={(key: Key | null) => setFormData({ ...formData, presellType: key as string || '' })}
                  items={presellTypes.map((type) => ({ id: type, label: type }))}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>

              {/* Idioma da Presell */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Idioma <span className="text-destructive">*</span>
                  <TooltipHelp text="Define o idioma dos textos e botões da sua presell." />
                </span>
                <Select
                  placeholder="Selecione o idioma"
                  selectedKey={formData.presellLanguage || null}
                  onSelectionChange={(key: Key | null) => setFormData({ ...formData, presellLanguage: key as string || '' })}
                  items={languages.map((language) => ({ id: language, label: language }))}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>
            </div>


            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <Button
                type="button"
                color="secondary"
                size="lg"
                onClick={() => router.back()}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                color="primary"
                size="lg"
                isDisabled={isLoading || !isFormValid}
                isLoading={isLoading}
                showTextWhileLoading
              >
                {isLoading ? 'Criando Presell...' : 'Criar Presell'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
