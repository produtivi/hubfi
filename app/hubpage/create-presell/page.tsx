'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '../../components/ui/toast';
import { useToast } from '../../hooks/useToast';
import { TooltipHelp } from '../../components/ui/tooltip-help';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import type { Key } from 'react-aria-components';

export default function CreatePresell() {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [formData, setFormData] = useState({
    domain: '',
    pageName: '',
    affiliateLink: '',
    producerSalesPage: '',
    presellType: '',
    presellLanguage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [presellTypes, setPresellTypes] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Carregar domínios e tipos do banco
  useEffect(() => {
    loadDomainsAndTypes();
  }, []);

  const loadDomainsAndTypes = async () => {
    try {
      setIsLoadingData(true);

      // Carregar domínios
      const domainsResponse = await fetch('/api/domains');
      const domainsResult = await domainsResponse.json();

      if (domainsResult.success) {
        setDomains(domainsResult.data.map((domain: any) => domain.domainName));
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

  const waitForScreenshot = async (presellId: number): Promise<void> => {
    return new Promise((resolve) => {
      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/presells/${presellId}/screenshot-status`);
          const result = await response.json();

          if (result.success && !result.data.isProcessing) {
            resolve();
          } else {
            setTimeout(checkStatus, 3000); // Verificar a cada 3 segundos
          }
        } catch (error) {
          console.error('Erro ao verificar status do screenshot:', error);
          // Continuar mesmo com erro após 30 segundos
          setTimeout(() => resolve(), 30000);
        }
      };

      // Começar a verificar após 2 segundos (dar tempo do processo começar)
      setTimeout(checkStatus, 2000);
    });
  };

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
          // Temporário: usar primeiro usuário se não estiver logado
          userId = 2; // ID do jpteste@gmail.com
        }
      } catch {
        userId = 2; // Fallback
      }

      const response = await fetch('/api/presells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain: formData.domain,
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

      const presellId = result.data.id;

      // Aguardar screenshot ficar pronto
      await waitForScreenshot(presellId);

      // Mostrar toast de sucesso
      showSuccess(`Página "${formData.pageName}" criada com sucesso!`);

      // Redirecionar
      setTimeout(() => {
        router.push('/hubpage');
      }, 1000);

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
              {/* Domínio */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Domínio <span className="text-destructive">*</span>
                  <TooltipHelp text="Selecione o domínio onde sua presell será publicada." />
                </span>
                <Select
                  placeholder="Escolha o domínio"
                  selectedKey={formData.domain || null}
                  onSelectionChange={(key: Key | null) => setFormData({ ...formData, domain: key as string || '' })}
                  items={domains.map((domain) => ({ id: domain, label: domain }))}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
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
                  onChange={(value) => setFormData({ ...formData, affiliateLink: value })}
                  placeholder="Informe o link de afiliado"
                  isRequired
                />
              </div>

              {/* Página de vendas do produtor */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Página de vendas do produtor <span className="text-destructive">*</span>
                  <TooltipHelp text="URL da página de vendas original. Usada para capturar screenshots e elementos visuais." />
                </span>
                <Input
                  type="url"
                  value={formData.producerSalesPage}
                  onChange={(value) => setFormData({ ...formData, producerSalesPage: value })}
                  placeholder="Informe a página de vendas"
                  isRequired
                />
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
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                color="primary"
                size="lg"
                isDisabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? 'Criando...' : 'Criar Presell'}
              </Button>
            </div>
          </form>
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
