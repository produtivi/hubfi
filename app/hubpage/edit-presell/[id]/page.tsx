'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '../../../components/ui/toast';
import { useToast } from '../../../hooks/useToast';
import { TooltipHelp } from '../../../components/ui/tooltip-help';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import type { Key } from 'react-aria-components';

interface EditPresellProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPresell({ params }: EditPresellProps) {
  const router = useRouter();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [presellId, setPresellId] = useState<string>('');

  const [formData, setFormData] = useState({
    domain: '',
    pageName: '',
    affiliateLink: '',
    producerSalesPage: '',
    presellType: '',
    presellLanguage: ''
  });

  const [originalData, setOriginalData] = useState({
    producerSalesPage: ''
  });

  const domains = [
    { value: 'lojaonlineproducts.site', label: 'lojaonlineproducts.site' },
    { value: 'produtosdreams.site', label: 'produtosdreams.site' },
    { value: 'lojadosprodutostop.site', label: 'lojadosprodutostop.site' }
  ];

  const presellTypes = [
    { value: 'Cookies', label: 'Cookies' },
    { value: 'Idade Homem', label: 'Idade Homem' },
    { value: 'Idade Mulher', label: 'Idade Mulher' },
    { value: 'Sexo', label: 'Sexo' },
    { value: 'Maior de Idade', label: 'Maior de Idade' },
    { value: 'Assinar newsletter', label: 'Assinar newsletter' },
    { value: 'País', label: 'País' },
    { value: 'Teste de captcha', label: 'Teste de captcha' },
    { value: 'Player de vídeo', label: 'Player de vídeo' }
  ];

  const languages = [
    { value: 'Português', label: 'Português' },
    { value: 'Inglês', label: 'Inglês' },
    { value: 'Espanhol', label: 'Espanhol' }
  ];

  useEffect(() => {
    const loadPresell = async () => {
      try {
        const resolvedParams = await params;
        setPresellId(resolvedParams.id);

        const response = await fetch(`/api/presells/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          const data = result.data;

          // Salvar dados originais para comparação
          setOriginalData({
            producerSalesPage: data.producerSalesPage || ''
          });

          setFormData({
            domain: data.domain?.domainName || '',
            pageName: data.pageName || '',
            affiliateLink: data.affiliateLink || '',
            producerSalesPage: data.producerSalesPage || '',
            presellType: data.presellType || '',
            presellLanguage: data.language || ''
          });
        } else {
          showError('Erro ao carregar presell');
          setTimeout(() => router.back(), 2000);
        }
      } catch (error) {
        console.error('Erro ao carregar presell:', error);
        showError('Erro ao carregar presell');
        setTimeout(() => router.back(), 2000);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadPresell();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validações
      if (!formData.domain || !formData.pageName || !formData.affiliateLink ||
        !formData.producerSalesPage || !formData.presellType || !formData.presellLanguage) {
        throw new Error('Todos os campos são obrigatórios');
      }

      // Fazer a requisição para atualizar
      const response = await fetch(`/api/presells/${presellId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageName: formData.pageName,
          affiliateLink: formData.affiliateLink,
          producerSalesPage: formData.producerSalesPage,
          presellType: formData.presellType,
          presellLanguage: formData.presellLanguage
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar presell');
      }

      // Se mudou a URL da página do produtor, regenerar screenshot
      if (originalData.producerSalesPage !== formData.producerSalesPage) {
        try {
          await fetch(`/api/presells/${presellId}/regenerate-screenshot`, {
            method: 'POST'
          });
        } catch (error) {
        }
      }

      showSuccess(`Página "${formData.pageName}" atualizada com sucesso!`);

      // Aguardar um pouco para mostrar o toast antes de navegar
      setTimeout(() => {
        router.push('/hubpage');
      }, 1000);

    } catch (error) {
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
            <h1 className="text-headline">Editar Presell</h1>
            <p className="text-label text-muted-foreground">
              Atualize as informações da sua página de pré-venda
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
                  <TooltipHelp text="O domínio não pode ser alterado após a criação." />
                </span>
                <Select
                  placeholder="Selecione um domínio"
                  selectedKey={formData.domain || null}
                  onSelectionChange={() => {}}
                  items={domains.map((d) => ({ id: d.value, label: d.label }))}
                  isDisabled
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>

              {/* Nome da Página */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Nome da página <span className="text-destructive">*</span>
                  <TooltipHelp text="Este nome aparece na aba do navegador quando o visitante abre sua presell." />
                </span>
                <Input
                  value={formData.pageName}
                  onChange={(value) => setFormData({ ...formData, pageName: value })}
                  placeholder="Ex: Oferta Especial Black Friday"
                  isRequired
                />
              </div>

              {/* Link do Afiliado */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Link de Afiliado <span className="text-destructive">*</span>
                  <TooltipHelp text="Link para onde o visitante será redirecionado ao clicar no botão de compra." />
                </span>
                <Input
                  type="url"
                  value={formData.affiliateLink}
                  onChange={(value) => setFormData({ ...formData, affiliateLink: value })}
                  placeholder="https://exemplo.com/afiliado/..."
                  isRequired
                />
              </div>

              {/* Página de Vendas do Produtor */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Página de vendas do produtor <span className="text-destructive">*</span>
                  <TooltipHelp text="URL da página de vendas original. Usada para capturar screenshots e elementos visuais." />
                </span>
                <Input
                  type="url"
                  value={formData.producerSalesPage}
                  onChange={(value) => setFormData({ ...formData, producerSalesPage: value })}
                  placeholder="https://exemplo.com/produto"
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
                  items={presellTypes.map((t) => ({ id: t.value, label: t.label }))}
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
                  items={languages.map((l) => ({ id: l.value, label: l.label }))}
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
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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