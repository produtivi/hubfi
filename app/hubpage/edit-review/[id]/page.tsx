'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useHubPageToast } from '../../toast-context';
import { TooltipHelp } from '../../../components/ui/tooltip-help';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import { useUser } from '@/hooks/use-user';
import type { Key } from 'react-aria-components';

interface EditReviewProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditReview({ params }: EditReviewProps) {
  const router = useRouter();
  const { showSuccess, showError } = useHubPageToast();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [reviewId, setReviewId] = useState<string>('');

  const [formData, setFormData] = useState({
    domain: '',
    pageName: '',
    productName: '',
    affiliateLink: '',
    producerSalesPage: '',
    productType: '',
    niche: '',
    language: ''
  });

  const [originalData, setOriginalData] = useState({
    producerSalesPage: ''
  });

  const [customDomains, setCustomDomains] = useState<Array<{id: string, domain: string}>>([]);
  const [niches, setNiches] = useState<Array<{id: number, name: string}>>([]);
  const [productTypes, setProductTypes] = useState<Array<{id: number, name: string}>>([]);

  const languages = [
    'Português',
    'Inglês',
    'Espanhol'
  ];

  useEffect(() => {
    loadNichesAndTypes();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadDomains();
    }
  }, [user?.id]);

  useEffect(() => {
    const loadReview = async () => {
      try {
        const resolvedParams = await params;
        setReviewId(resolvedParams.id);

        const response = await fetch(`/api/reviews/${resolvedParams.id}`);
        const result = await response.json();

        if (result.success) {
          const data = result.data;

          setOriginalData({
            producerSalesPage: data.producerSalesPage || ''
          });

          setFormData({
            domain: data.domain?.domainName || '',
            pageName: data.pageName || '',
            productName: data.productName || '',
            affiliateLink: data.affiliateLink || '',
            producerSalesPage: data.producerSalesPage || '',
            productType: data.productType || '',
            niche: data.niche || '',
            language: data.language || ''
          });
        } else {
          showError('Erro ao carregar review');
          setTimeout(() => router.back(), 2000);
        }
      } catch (error) {
        console.error('Erro ao carregar review:', error);
        showError('Erro ao carregar review');
        setTimeout(() => router.back(), 2000);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadReview();
  }, [params]);

  const loadNichesAndTypes = async () => {
    try {
      const [nichesRes, productTypesRes] = await Promise.all([
        fetch('/api/niches'),
        fetch('/api/product-types')
      ]);

      const [nichesResult, productTypesResult] = await Promise.all([
        nichesRes.json(),
        productTypesRes.json()
      ]);

      if (nichesResult.success) {
        setNiches(nichesResult.data);
      }

      if (productTypesResult.success) {
        setProductTypes(productTypesResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar nichos e tipos:', error);
    }
  };

  const loadDomains = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/custom-domains?userId=${user.id}`);
      const result = await response.json();

      if (result.domains) {
        const availableDomains = result.domains
          .filter((d: any) => d.status === 'active' || d.status === 'pending')
          .map((d: any) => ({ id: d.id, domain: d.hostname }));
        setCustomDomains(availableDomains);
      }
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!formData.pageName || !formData.productName || !formData.affiliateLink ||
        !formData.producerSalesPage || !formData.productType || !formData.niche || !formData.language) {
        throw new Error('Todos os campos são obrigatórios');
      }

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageName: formData.pageName,
          productName: formData.productName,
          affiliateLink: formData.affiliateLink,
          producerSalesPage: formData.producerSalesPage,
          productType: formData.productType,
          niche: formData.niche,
          language: formData.language
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar review');
      }

      showSuccess(`Página "${formData.pageName}" atualizada com sucesso!`);

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
            <h1 className="text-headline">Editar Review</h1>
            <p className="text-label text-muted-foreground">
              Atualize as informações da sua página de review
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
              {/* Domínio (desabilitado) */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Domínio <span className="text-destructive">*</span>
                  <TooltipHelp text="O domínio não pode ser alterado após a criação." />
                </span>
                <Select
                  placeholder="Domínio"
                  selectedKey={formData.domain || null}
                  onSelectionChange={() => {}}
                  items={customDomains.map((domain) => ({ id: domain.domain, label: domain.domain }))}
                  isDisabled
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>

              {/* Nome da página */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Nome da página <span className="text-destructive">*</span>
                  <TooltipHelp text="Este nome aparece na aba do navegador quando o visitante abre sua review." />
                </span>
                <Input
                  value={formData.pageName}
                  onChange={(value) => setFormData({ ...formData, pageName: value })}
                  placeholder="Informe o nome da sua página"
                  isRequired
                />
              </div>

              {/* Nome do produto */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Nome do produto <span className="text-destructive">*</span>
                  <TooltipHelp text="Nome do produto que será apresentado na review." />
                </span>
                <Input
                  value={formData.productName}
                  onChange={(value) => setFormData({ ...formData, productName: value })}
                  placeholder="Informe o nome do produto"
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
                  <TooltipHelp text="URL da página de vendas original. Usada para capturar informações do produto." />
                </span>
                <Input
                  type="url"
                  value={formData.producerSalesPage}
                  onChange={(value) => setFormData({ ...formData, producerSalesPage: value })}
                  placeholder="Informe a página de vendas"
                  isRequired
                />
              </div>

              {/* Tipo de produto */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Tipo de produto <span className="text-destructive">*</span>
                  <TooltipHelp text="Categoria do produto que será apresentado." />
                </span>
                <Select
                  placeholder="Escolha a categoria"
                  selectedKey={formData.productType || null}
                  onSelectionChange={(key: Key | null) => setFormData({ ...formData, productType: key as string || '' })}
                  items={productTypes.map((type) => ({ id: type.name, label: type.name }))}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>

              {/* Nicho */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Nicho <span className="text-destructive">*</span>
                  <TooltipHelp text="Nicho de mercado do produto." />
                </span>
                <Select
                  placeholder="Escolha o nicho"
                  selectedKey={formData.niche || null}
                  onSelectionChange={(key: Key | null) => setFormData({ ...formData, niche: key as string || '' })}
                  items={niches.map((niche) => ({ id: niche.name, label: niche.name }))}
                  isRequired
                >
                  {(item) => <Select.Item key={item.id} id={item.id} label={item.label} />}
                </Select>
              </div>

              {/* Idioma */}
              <div className="space-y-1">
                <span className="text-body font-medium flex items-center gap-2">
                  Idioma <span className="text-destructive">*</span>
                  <TooltipHelp text="Define o idioma dos textos da sua review." />
                </span>
                <Select
                  placeholder="Selecione o idioma"
                  selectedKey={formData.language || null}
                  onSelectionChange={(key: Key | null) => setFormData({ ...formData, language: key as string || '' })}
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
                className='p-2'
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
