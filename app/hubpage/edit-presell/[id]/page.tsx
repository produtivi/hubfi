'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toast } from '../../../components/ui/toast';
import { useToast } from '../../../hooks/useToast';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Domínio <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.domain}
                    disabled
                    className="w-full px-4 py-3 pr-10 bg-accent border border-border rounded-md text-body appearance-none opacity-50 cursor-not-allowed"
                  >
                    <option value="">Selecione um domínio</option>
                    {domains.map(domain => (
                      <option key={domain.value} value={domain.value}>
                        {domain.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground">O domínio não pode ser alterado após a criação</p>
              </div>

              {/* Nome da Página */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Nome da Página <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pageName}
                  onChange={handleChange}
                  name="pageName"
                  placeholder="Ex: Oferta Especial Black Friday"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Link do Afiliado */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Link do Afiliado <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.affiliateLink}
                  onChange={handleChange}
                  name="affiliateLink"
                  placeholder="https://exemplo.com/afiliado/..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Página de Vendas do Produtor */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Página de Vendas do Produtor <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.producerSalesPage}
                  onChange={handleChange}
                  name="producerSalesPage"
                  placeholder="https://exemplo.com/produto"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-body focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Tipo de Presell */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Tipo de Presell <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.presellType}
                    onChange={handleChange}
                    name="presellType"
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {presellTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Idioma da Presell */}
              <div className="space-y-3">
                <label className="text-body font-medium">
                  Idioma da Presell <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.presellLanguage}
                    onChange={handleChange}
                    name="presellLanguage"
                    className="w-full px-4 py-3 pr-10 bg-background border border-border rounded-md text-body appearance-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    required
                  >
                    <option value="">Selecione o idioma</option>
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-between items-center pt-8 border-t border-border">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-border bg-background hover:bg-accent text-foreground rounded-md transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-md transition-colors font-medium bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {isLoading && (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
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